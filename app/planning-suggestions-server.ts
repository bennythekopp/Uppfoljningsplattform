import 'server-only';
import {db} from './database';
import {PanelError,short,staffList,type PanelActor} from './panel-server';
import {planningDate,planningLog} from './planning-server';
import {baseTour,personPeriodFor,type PlanningColumn,type PlanningPeriod} from './planning-types';
import {tourLogValue} from './grundschema-types';
import {savePlanningCell} from './planning-cell-server';
import {allowedModules} from './module-access';
export const suggestionSelect=`SELECT s.id,s.seq,s.day::text AS day,s.column_id AS columnId,s.field,s.previous_value AS previousValue,s.proposed_value AS proposedValue,s.previous_label AS previousLabel,s.proposed_label AS proposedLabel,s.base_revision AS baseRevision,s.previous_color AS previousColor,s.proposed_color AS proposedColor,s.color_revision AS colorRevision,s.author_email AS authorEmail,s.author_name AS authorName,s.created_at AS createdAt,s.status,c.title AS columnName FROM planning_suggestions s JOIN planning_columns c ON c.id=s.column_id`;
export async function readSuggestions(start:string,end:string){return (await db.prepare(suggestionSelect+" WHERE s.status='pending' AND c.deleted_at IS NULL AND s.day>=?::date AND s.day<?::date ORDER BY s.seq").bind(start,end).all()).results}
export async function mailSettings(){const value=await db.prepare('SELECT enabled,recipient_email AS recipientEmail,recipient_user AS recipientUser,cadence,send_time AS sendTime,revision,last_sent_at AS lastSentAt,last_error AS lastError FROM planning_mail_settings WHERE id=1').first();return {...value,configured:!!process.env.RESEND_API_KEY&&!!process.env.PLANNING_MAIL_FROM,needsReview:!!await db.prepare('SELECT id FROM planning_mail_outbox WHERE sent_at IS NULL AND review_required=true').first()}}
async function context(column:PlanningColumn,day:string){const periods=(await db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date,created_at,id').all<PlanningPeriod>()).results,memberships=(await db.prepare('SELECT id,user_email AS userEmail,group_id AS groupId,row_number AS row,start_date::text AS startDate,end_date::text AS endDate FROM schedule_memberships ORDER BY start_date').all<any>()).results;return {config:personPeriodFor(periods,column,day,memberships)?.config||{tours:[]},base:baseTour(periods,column,day,memberships)}}
export async function suggestionAction(u:PanelActor,b:any,canEdit:boolean,canSuggest=false){
 if(b.action==='propose'){
  if(!canSuggest)throw new PanelError('Du saknar behörighet att föreslå ändringar.',403);
  const day=planningDate(b.day),id=short(b.columnId,300),column=await db.prepare('SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE id=? AND deleted_at IS NULL').bind(id).first<PlanningColumn>();
  if(!column)throw new PanelError('Kolumnen finns inte längre.',404);
  if(!(column.kind==='shared'?b.field==='shared':['tour','task'].includes(b.field))||typeof b.value!=='string'||b.value.length>4000||!Number.isInteger(b.revision)||b.revision<0)throw new PanelError('Kontrollera förslaget.');
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify([day,id])).first();
  const old=await db.prepare('SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field=? FOR UPDATE').bind(day,id,b.field).first<{value:string,revision:number}>(),ctx=await context(column,day),previous=old?.value??(b.field==='tour'?ctx.base:'');
  if((old?.revision||0)!==b.revision||b.previousValue!==previous)throw new PanelError('Rutan har ändrats. Ditt förslag finns kvar. Läs in planeringen och jämför innan du försöker igen.',409);
  const hasColor=b.color!==undefined;
  if(hasColor&&(b.field!=='task'||typeof b.color!=='string'||b.color!==''&&!/^#[0-9a-f]{6}$/i.test(b.color)||typeof b.previousColor!=='string'||!Number.isInteger(b.colorRevision)||b.colorRevision<0))throw new PanelError('Kontrollera uppgiftens färg.');
  const color=hasColor?await db.prepare("SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field='color' FOR UPDATE").bind(day,id).first<{value:string,revision:number}>():null;
  if(hasColor&&((color?.revision||0)!==b.colorRevision||(color?.value||'')!==b.previousColor))throw new PanelError('Uppgiftens färg har ändrats. Läs in igen innan du skickar förslaget.',409);
  const own=await db.prepare("SELECT proposed_value AS value,proposed_color AS color FROM planning_suggestions WHERE day=?::date AND column_id=? AND field=? AND author_email=? AND status='pending'").bind(day,id,b.field,u.email).first<{value:string,color:string|null}>();
  if(own&&own.value===b.value&&(own.color??null)===(hasColor?b.color:null))return Response.json({ok:true});
  await db.prepare("UPDATE planning_suggestions SET status='superseded',resolved_at=?,resolved_by=? WHERE day=?::date AND column_id=? AND field=? AND author_email=? AND status='pending'").bind(Date.now(),u.email,day,id,b.field,u.email).run();
  if(b.value===previous&&(!hasColor||b.color===(color?.value||'')))return Response.json({ok:true});
  await db.prepare('INSERT INTO planning_suggestions(id,day,column_id,field,previous_value,proposed_value,previous_label,proposed_label,base_revision,author_email,author_name,created_at,previous_color,proposed_color,color_revision) VALUES(?,?::date,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),day,id,b.field,previous,b.value,b.field==='tour'?tourLogValue(ctx.config,previous):previous,b.field==='tour'?tourLogValue(ctx.config,b.value):b.value,b.revision,u.email,u.name,Date.now(),hasColor?b.previousColor:null,hasColor?b.color:null,hasColor?b.colorRevision:null).run();
  await planningLog(u,'Ändringsförslag lämnat',{day,columnId:id,columnName:column.title,field:b.field,previous:b.field==='tour'?tourLogValue(ctx.config,previous):previous,next:b.field==='tour'?tourLogValue(ctx.config,b.value):b.value});return Response.json({ok:true});
 }
 if(b.action==='review'){
  if(!canEdit)throw new PanelError('Redigeringsbehörighet krävs för att granska förslag.',403);
  if(!['approve','reject'].includes(b.decision))throw new PanelError('Välj godkänn eller slopa.');
  const initial=await db.prepare('SELECT day::text AS day,column_id AS columnId FROM planning_suggestions WHERE id=?').bind(b.id).first<any>();if(!initial)throw new PanelError('Förslaget finns inte.',404);
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify([initial.day,initial.columnId])).first();
  const suggestion=await db.prepare(suggestionSelect+' WHERE s.id=? AND c.deleted_at IS NULL FOR UPDATE OF s').bind(b.id).first<any>();if(!suggestion)throw new PanelError('Rutan finns inte längre.',404);if(suggestion.status!=='pending')throw new PanelError('Förslaget har redan hanterats. Läs in igen.',409);
  let result:any={};
  if(b.decision==='approve'){
   const old=await db.prepare('SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field=?').bind(suggestion.day,suggestion.columnId,suggestion.field).first<any>();
   const column=await db.prepare('SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE id=?').bind(suggestion.columnId).first<PlanningColumn>();const ctx=await context(column!,suggestion.day),value=old?.value??(suggestion.field==='tour'?ctx.base:'');
   if((old?.revision||0)!==suggestion.baseRevision||value!==suggestion.previousValue)throw new PanelError('Rutan har ändrats sedan förslaget lämnades. Förslaget är kvar. Kopiera texten och gör vid behov ändringen manuellt, eller slopa förslaget.',409);
   if(suggestion.proposedColor!==null){
    const color=await db.prepare("SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field='color' FOR UPDATE").bind(suggestion.day,suggestion.columnId).first<any>();
    if((color?.revision||0)!==suggestion.colorRevision||(color?.value||'')!==suggestion.previousColor)throw new PanelError('Uppgiftens färg har ändrats sedan förslaget lämnades. Läs in och jämför.',409);
   }
   const response=await savePlanningCell(u,{day:suggestion.day,columnId:suggestion.columnId,field:suggestion.field,value:suggestion.proposedValue,revision:suggestion.baseRevision});result=await response.json();if(!response.ok)throw new PanelError(result.error,409);
   if(suggestion.proposedColor!==null){const colorResponse=await savePlanningCell(u,{day:suggestion.day,columnId:suggestion.columnId,field:'color',value:suggestion.proposedColor,revision:suggestion.colorRevision});const colorResult=await colorResponse.json();if(!colorResponse.ok)throw new PanelError(colorResult.error,409);result.linkedCells=[...(result.linkedCells||[]),colorResult.cell]}

  }
  await db.prepare('UPDATE planning_suggestions SET status=?,resolved_at=?,resolved_by=? WHERE id=?').bind(b.decision==='approve'?'approved':'rejected',Date.now(),u.email,suggestion.id).run();
  await planningLog(u,b.decision==='approve'?'Ändringsförslag godkänt':'Ändringsförslag slopat',{day:suggestion.day,columnId:suggestion.columnId,columnName:suggestion.columnName,field:suggestion.field,previous:suggestion.previousLabel,next:suggestion.proposedLabel});return Response.json({ok:true,...result});
 }
 if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ändra mailinställningarna.',403);
 if(b.action==='mail-resolve'){
  if(!['sent','retry'].includes(b.decision))throw new PanelError('Välj hur utskicket ska hanteras.');
  await db.prepare("SELECT pg_advisory_xact_lock(hashtextextended('planning-mail-worker',0))").first();
  const out=await db.prepare('SELECT id,suggestion_seqs AS seqs,send_day::text AS day FROM planning_mail_outbox WHERE sent_at IS NULL AND review_required=true FOR UPDATE').first<any>();if(!out)throw new PanelError('Inget utskick behöver kontrolleras.',409);
  if(b.decision==='sent'){for(const seq of out.seqs)await db.prepare('INSERT INTO planning_mailed_suggestions(suggestion_seq,outbox_id) VALUES(?,?) ON CONFLICT DO NOTHING').bind(seq,out.id).run();await db.prepare('UPDATE planning_mail_outbox SET sent_at=?,last_error=? WHERE id=?').bind(Date.now(),'Manuellt bekräftat av '+u.name,out.id).run();await db.prepare("UPDATE planning_mail_settings SET last_sent_at=?,last_sent_day=?::date,last_error='' WHERE id=1").bind(Date.now(),out.day).run()}
  else {await db.prepare('DELETE FROM planning_mail_outbox WHERE id=?').bind(out.id).run();await db.prepare("UPDATE planning_mail_settings SET last_error='' WHERE id=1").run()}
  await planningLog(u,'Mailkö kontrollerad',{next:b.decision+' · '+out.id});return Response.json({ok:true});
 }
 const email=short(b.recipientEmail,254),recipient=short(b.recipientUser,254);
 if(typeof b.enabled!=='boolean'||!['daily','workday'].includes(b.cadence)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.sendTime)||!Number.isInteger(b.revision))throw new PanelError('Kontrollera mailinställningarna.');
 if(b.enabled||email||recipient){
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw new PanelError('Ange en giltig mailadress.');
  const person=(await staffList()).find(p=>p.email===recipient);if(!person||!(await allowedModules({email:recipient,name:String(person.name),role:'Instruktör'})).includes('planning'))throw new PanelError('Välj en mottagare som har tillgång till Planering.');
 }
 if(b.enabled&&(!process.env.RESEND_API_KEY||!process.env.PLANNING_MAIL_FROM))throw new PanelError('Mailtjänsten behöver konfigureras i Netlify först. Se uppdateringsinstruktionen.');
 const saved=await db.prepare('UPDATE planning_mail_settings SET enabled=?,recipient_email=?,recipient_user=?,cadence=?,send_time=?,enabled_at=CASE WHEN ? AND NOT enabled THEN ? ELSE enabled_at END,revision=revision+1 WHERE id=1 AND revision=? RETURNING id').bind(b.enabled,email,recipient,b.cadence,b.sendTime,b.enabled,Date.now(),b.revision).first();if(!saved)throw new PanelError('Mailinställningarna har ändrats. Läs in igen.',409);
 await planningLog(u,'Mailinställningar ändrade',{next:(b.enabled?'På':'Av')+' · '+b.cadence+' · '+b.sendTime+' · '+email});return Response.json({ok:true});
}
