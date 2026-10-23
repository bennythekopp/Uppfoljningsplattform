import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {PanelError,panelBody,staffList,short} from '../../panel-server';
import {allowedModules} from '../../module-access';
import {planningDate,planningLog} from '../../planning-server';
import {baseTour,type PlanningPeriod} from '../../planning-types';
import {addDays,tourLogValue} from '../../grundschema-types';
import type {PlanningColumn} from '../../planning-types';
export const dynamic='force-dynamic';
async function settings(u:{role:string,email:string}){const s=(await db.prepare('SELECT editor_emails AS editorEmails,revision FROM planning_settings WHERE id=1').first<{editorEmails:string[],revision:number}>())!;return {...s,canEdit:u.role==='Administratör'||u.role==='Instruktör'&&s.editorEmails.includes(u.email)}}
async function get(req:Request){const u=(await currentUser())!,url=new URL(req.url),s=await settings(u);
 if(url.searchParams.has('log')){if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan se planeringsloggen.',403);const before=Number(url.searchParams.get('before')||Date.now()+1);return Response.json({log:(await db.prepare('SELECT id,occurred_at AS occurredAt,actor_name AS actorName,action,day::text AS day,column_name AS columnName,field,previous_value AS previousValue,new_value AS newValue FROM planning_log WHERE occurred_at<? ORDER BY occurred_at DESC,id LIMIT 200').bind(before).all()).results})}
 const year=Number(url.searchParams.get('year'));if(!Number.isInteger(year)||year<2020||year>2099)throw new PanelError('Välj ett år mellan 2020 och 2099.');
 const users=await staffList();
 // Stable account columns: names may change without affecting saved cells.
 await databaseTransaction(async()=>{for(const p of users)await db.prepare("INSERT INTO planning_columns(id,title,kind,user_email,position) VALUES(?,?,'person',?,?) ON CONFLICT(user_email) DO UPDATE SET title=EXCLUDED.title").bind('person:'+p.email,p.name,p.email,10+(['linnea','gustav','sarah','olle','elin','lisa'].indexOf(String(p.name).toLocaleLowerCase('sv').split(' ')[0])<0?100:['linnea','gustav','sarah','olle','elin','lisa'].indexOf(String(p.name).toLocaleLowerCase('sv').split(' ')[0]))).run()});
 const [columns,cells,periods]=await Promise.all([
 db.prepare('SELECT id,title,kind,user_email AS userEmail,position,revision FROM planning_columns WHERE deleted_at IS NULL ORDER BY position,lower(title),id').all(),
 db.prepare('SELECT day::text AS day,column_id AS columnId,field,value,revision,updated_at AS updatedAt,updated_by AS updatedBy FROM planning_cells WHERE day>=?::date AND day<?::date').bind(addDays(year+'-01-01',-1),(year+1)+'-01-01').all(),
 db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date').all()]);
 return Response.json({columns:columns.results,cells:cells.results,periods:periods.results,canEdit:s.canEdit,settingsRevision:s.revision,editorEmails:u.role==='Administratör'?s.editorEmails:[],users:u.role==='Administratör'?users:[]});}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,40000);return databaseTransaction(async()=>{
 const s=await settings(u);if(!s.canEdit)throw new PanelError('Du har läsbehörighet till planeringen.',403);
 if(b.action==='cell'){
  const day=planningDate(b.day),id=short(b.columnId,300),column=await db.prepare('SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE id=? AND deleted_at IS NULL').bind(id).first<PlanningColumn>();if(!column)throw new PanelError('Kolumnen finns inte längre.',404);
  if(!(column.kind==='shared'?b.field==='shared':['tour','task'].includes(b.field))||typeof b.value!=='string'||b.value.length>4000||!Number.isInteger(b.revision)||b.revision<0)throw new PanelError('Kontrollera rutans innehåll.');
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify([day,id,b.field])).first();
  const old=await db.prepare('SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field=? FOR UPDATE').bind(day,id,b.field).first<{value:string,revision:number}>();
  if((old?.value??null)===b.value)return Response.json({cell:{day,columnId:id,field:b.field,value:b.value,revision:old!.revision,updatedAt:Date.now(),updatedBy:u.name}});
  if((old?.revision||0)!==b.revision) return Response.json({error:'Rutan har ändrats. Din text finns kvar. Välj vilken version du vill behålla.',conflict:old||{value:'',revision:0}}, {status:409});
  const cell=await db.prepare('INSERT INTO planning_cells(day,column_id,field,value,updated_at,updated_by) VALUES(?::date,?,?,?,?,?) ON CONFLICT(day,column_id,field) DO UPDATE SET value=EXCLUDED.value,revision=planning_cells.revision+1,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by RETURNING day::text AS day,column_id AS columnId,field,value,revision,updated_at AS updatedAt,updated_by AS updatedBy').bind(day,id,b.field,b.value,Date.now(),u.name).first();
  const periods=b.field==='tour'?(await db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date').all<PlanningPeriod>()).results:[],config=periods.filter(p=>p.startDate<=day).at(-1)?.config||{tours:[]},previous=old?.value??(b.field==='tour'?baseTour(periods,column,day):'');
  await planningLog(u,'Ruta ändrad',{day,columnId:id,columnName:column.title,field:b.field,previous:b.field==='tour'?tourLogValue(config,previous):previous,next:b.field==='tour'?tourLogValue(config,b.value):b.value});return Response.json({cell});
 }
 if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ändra struktur och behörigheter.',403);
 if(b.action==='editors'){
  if(!Array.isArray(b.emails)||b.emails.length>1000||b.emails.some((v:unknown)=>typeof v!=='string')||new Set(b.emails).size!==b.emails.length)throw new PanelError('Välj användare.');
  const allowed=await staffList();for(const email of b.emails){const p=allowed.find(p=>p.email===email);if(!p||!(await allowedModules({email:String(p.email),name:String(p.name),role:'Instruktör'})).includes('planning'))throw new PanelError('Ge användaren synlighet till Planering innan du ger redigeringsbehörighet.')}
  const result=await db.prepare('UPDATE planning_settings SET editor_emails=?::jsonb,revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(b.emails),b.revision).first();if(!result)throw new PanelError('Behörigheterna har ändrats. Läs in dem igen.',409);await planningLog(u,'Redigeringsbehörighet ändrad',{previous:s.editorEmails.join(', '),next:b.emails.join(', ')});return Response.json({ok:true});
 }
 if(b.action==='column'){
  const title=short(b.title,80),id=short(b.id,300);if(!title)throw new PanelError('Ange ett namn.');
  if(id){const old=await db.prepare("SELECT title,revision FROM planning_columns WHERE id=? AND kind='shared' AND deleted_at IS NULL FOR UPDATE").bind(id).first<{title:string,revision:number}>();if(!old)throw new PanelError('Kolumnen finns inte.',404);if(old.revision!==b.revision)throw new PanelError('Kolumnen har ändrats. Läs in igen.',409);await db.prepare('UPDATE planning_columns SET title=?,revision=revision+1 WHERE id=?').bind(title,id).run();await planningLog(u,'Kolumn namnändrad',{columnId:id,columnName:title,previous:old.title,next:title})}
  else {const id=crypto.randomUUID();await db.prepare("INSERT INTO planning_columns(id,title,kind,position,created_at) SELECT ?,?,'shared',COALESCE(MAX(position),0)+1,? FROM planning_columns WHERE kind='shared'").bind(id,title,Date.now()).run();await planningLog(u,'Kolumn tillagd',{columnId:id,columnName:title,next:title})}return Response.json({ok:true});
 }
 if(b.action==='delete-column'){
  const column=await db.prepare("SELECT title FROM planning_columns WHERE id=? AND kind='shared' AND deleted_at IS NULL AND revision=? FOR UPDATE").bind(b.id,b.revision).first<{title:string}>();if(!column)throw new PanelError('Kolumnen har ändrats. Läs in igen.',409);await db.prepare('UPDATE planning_columns SET deleted_at=?,revision=revision+1 WHERE id=?').bind(Date.now(),b.id).run();await planningLog(u,'Kolumn borttagen',{columnId:b.id,columnName:column.title,previous:column.title});return Response.json({ok:true});
 }
 throw new PanelError('Okänd åtgärd.');
});}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Planeringen kunde inte läsas eller sparas. Kontrollera databasuppdatering 0030.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/planning',handle(get));export const POST=secureApi('/api/planning',handle(post));
