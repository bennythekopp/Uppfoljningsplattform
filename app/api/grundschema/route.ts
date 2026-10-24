import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {panelBody,PanelError,panelLog,staffList,short} from '../../panel-server';
import {recordPlanningPeriod} from '../../planning-server';
import {stockholmToday,findTour,tourValue,tourKey} from '../../grundschema-types';
import type {ScheduleConfig} from '../../grundschema-types';
export const dynamic='force-dynamic';
function configInput(raw:any):ScheduleConfig{
 const fail=()=>{throw new PanelError('Kontrollera gruppens år, startdatum, turer och veckor.')};
 const validDate=(s:unknown,empty=false)=>typeof s==='string'&&(empty&&s===''||/^\d{4}-\d\d-\d\d$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s);
 if(!raw||!Number.isInteger(raw.year)||raw.year<2020||raw.year>2100||!validDate(raw.startDate)||new Date(raw.startDate+'T12:00:00Z').getUTCDay()!==1||!validDate(raw.validUntil,true)||raw.validUntil&&raw.validUntil<raw.startDate||!Array.isArray(raw.tours)||raw.tours.length>200||!Array.isArray(raw.pattern)||!raw.pattern.length||raw.pattern.length>52)fail();
 const time=(s:unknown)=>typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
 const codes=new Set<string>(),ids=new Set<string>();
 const tours:ScheduleConfig['tours']=raw.tours.map((t:any)=>{if(!t||typeof t.code!=='string'||!t.code.trim()||t.code.length>20||t.id!==undefined&&(typeof t.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(t.id)||ids.has(t.id))||!/^#[0-9a-f]{6}$/i.test(t.color)||!Array.isArray(t.passes)||t.passes.length>3)fail();codes.add(t.code.trim());const id=t.id||crypto.randomUUID();ids.add(id);return {id,code:t.code.trim(),color:t.color,meal:t.meal===true,passes:t.passes.map((p:any)=>{if(!p||!time(p.start)||!(time(p.end)||p.end==='24:00')||p.start===p.end||!short(p.type,50))fail();return {start:p.start,end:p.end,type:short(p.type,50)}})}});
 if(raw.pattern.some((row:any)=>!Array.isArray(row)||row.length!==7||row.some((code:any)=>typeof code!=='string'||code!==''&&!codes.has(code)&&!tours.some(t=>tourKey(t)===code||t.id===findTour({tours},code)?.id))))fail();
 if(!Array.isArray(raw.agreements)||raw.agreements.length>40||raw.agreements.some((a:any)=>!a||typeof a.label!=='string'||a.label.length>300||typeof a.value!=='string'||a.value.length>300))fail();
 return {year:raw.year,startDate:raw.startDate,validUntil:raw.validUntil,unit:short(raw.unit,300),reference:short(raw.reference,120),tours,pattern:raw.pattern.map((row:string[])=>row.map(value=>value?tourKey(findTour({tours},value)!):'')),agreements:raw.agreements.map((a:any)=>({label:a.label.trim(),value:a.value.trim()}))};
}
async function get(){const u=(await currentUser())!;const groups=(await db.prepare(`SELECT id,name,active,visible,wishes_open AS wishesOpen,revision,config FROM schedule_groups ${u.role==='Administratör'?'':'WHERE visible=TRUE'} ORDER BY active DESC,lower(name)`).all()).results;
 const ids=groups.map(g=>g.id);const [users,wishes,assignments]=await Promise.all([staffList(),db.prepare('SELECT group_id AS groupId,user_email AS userEmail,rows,revision FROM schedule_wishes WHERE group_id=ANY(?::text[])').bind(ids).all(),db.prepare('SELECT group_id AS groupId,row_number AS row,user_email AS userEmail,locked FROM schedule_assignments WHERE group_id=ANY(?::text[])').bind(ids).all()]);return Response.json({groups,users,wishes:wishes.results,assignments:assignments.results});}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,500000);return databaseTransaction(async()=>{
 // One short serialized transaction coordinates activation, assignment and wishes.
 await db.prepare('LOCK TABLE schedule_groups IN SHARE ROW EXCLUSIVE MODE').run();
 const admin=u.role==='Administratör',now=Date.now();
 if(b.action==='create'){
  if(!admin)throw new PanelError('Bara administratörer kan skapa grupper.',403);
  const name=short(b.name,120);if(!name)throw new PanelError('Ange gruppens namn');const config=configInput(b.config),id=crypto.randomUUID();
  await db.prepare('INSERT INTO schedule_groups(id,name,config,updated_at,updated_by) VALUES(?,?,?::jsonb,?,?)').bind(id,name,JSON.stringify(config),now,u.email).run();await panelLog(u,'Schemagrupp skapad',name);return Response.json({id});
 }
 const g=await db.prepare('SELECT * FROM schedule_groups WHERE id=? FOR UPDATE').bind(short(b.id)).first<any>();if(!g||!admin&&!g.visible)throw new PanelError('Schemat finns inte.',404);
 if(b.action==='wish'){
  if(g.active||!g.wishes_open)throw new PanelError('Det går inte att önska rad på det här schemat.',409);
  if(!Array.isArray(b.rows)||b.rows.length>g.config.pattern.length||b.rows.some((n:any)=>!Number.isInteger(n)||n<1||n>g.config.pattern.length)||new Set(b.rows).size!==b.rows.length)throw new PanelError('Ogiltiga önskemål.');
  const old=await db.prepare('SELECT revision FROM schedule_wishes WHERE group_id=? AND user_email=? FOR UPDATE').bind(g.id,u.email).first<any>();if((old?.revision||0)!==b.revision)throw new PanelError('Dina önskemål har ändrats i en annan flik. Läs in dem igen innan du sparar.',409);
  await db.prepare('INSERT INTO schedule_wishes(group_id,user_email,rows,updated_at) VALUES(?,?,?::jsonb,?) ON CONFLICT(group_id,user_email) DO UPDATE SET rows=EXCLUDED.rows,revision=schedule_wishes.revision+1,updated_at=EXCLUDED.updated_at').bind(g.id,u.email,JSON.stringify(b.rows),now).run();await panelLog(u,'Schemaönskemål sparade',g.name+' · '+(b.rows.length?b.rows.join(', '):'Inga önskemål'));return Response.json({ok:true});
 }
 if(!admin)throw new PanelError('Bara administratörer kan ändra schemat.',403);
 if(g.revision!==b.revision)throw new PanelError('Schemat har ändrats. Läs in det igen innan du sparar.',409);
 if(b.action==='delete'){await db.prepare('DELETE FROM schedule_groups WHERE id=?').bind(g.id).run();await panelLog(u,'Schemagrupp borttagen',g.name);return Response.json({ok:true})}
 if(b.action==='activate'){
  await db.prepare('UPDATE schedule_groups SET active=FALSE,revision=revision+1,updated_at=?,updated_by=? WHERE active=TRUE AND id<>?').bind(now,u.email,g.id).run();
  await db.prepare('UPDATE schedule_groups SET active=TRUE,visible=TRUE,wishes_open=FALSE,revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(now,u.email,g.id).run();await recordPlanningPeriod(u,g.id,g.config.startDate);await panelLog(u,'Aktivt schema valt',g.name);return Response.json({ok:true});
 }
 if(b.action==='assign'){
  if(!Number.isInteger(b.row)||b.row<1||b.row>g.config.pattern.length)throw new PanelError('Välj en giltig rad.');
  const old=await db.prepare('SELECT locked FROM schedule_assignments WHERE group_id=? AND row_number=?').bind(g.id,b.row).first<any>();
  if(b.unlock===true){if(!old)throw new PanelError('Raden är inte tilldelad.');await db.prepare('UPDATE schedule_assignments SET locked=FALSE,updated_at=?,updated_by=? WHERE group_id=? AND row_number=?').bind(now,u.email,g.id,b.row).run()}
  else{
   if(old?.locked)throw new PanelError('Lås upp raden innan du ändrar tilldelningen.',409);
   const email=short(b.userEmail);
   if(email){if(!(await staffList()).some((s:any)=>s.email===email))throw new PanelError('Välj en instruktör eller administratör.');const other=await db.prepare('SELECT row_number FROM schedule_assignments WHERE group_id=? AND user_email=? AND row_number<>?').bind(g.id,email,b.row).first();if(other)throw new PanelError('Personen är redan tilldelad en annan rad i gruppen.');
    await db.prepare('INSERT INTO schedule_assignments(group_id,row_number,user_email,locked,updated_at,updated_by) VALUES(?,?,?,TRUE,?,?) ON CONFLICT(group_id,row_number) DO UPDATE SET user_email=EXCLUDED.user_email,locked=TRUE,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(g.id,b.row,email,now,u.email).run();
   }else await db.prepare('DELETE FROM schedule_assignments WHERE group_id=? AND row_number=?').bind(g.id,b.row).run();
  }
  await db.prepare('UPDATE schedule_groups SET revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(now,u.email,g.id).run();if(g.active&&!b.unlock)await recordPlanningPeriod(u,g.id,b.effectiveDate||stockholmToday());await panelLog(u,b.unlock?'Schemarad upplåst':'Schemarad tilldelad',g.name+' · Rad '+b.row+(b.userEmail?' · '+(await staffList()).find((p:any)=>p.email===b.userEmail)?.name:''));return Response.json({ok:true});
 }
 if(b.action==='save'){
  const config=configInput(b.config),name=short(b.name,120);if(!name)throw new PanelError('Ange gruppens namn.');
  // Re-indexing a live cycle would silently invalidate saved wishes/assignments.
  if(config.pattern.length!==g.config.pattern.length){const used=await db.prepare('SELECT (SELECT COUNT(*) FROM schedule_wishes WHERE group_id=?) + (SELECT COUNT(*) FROM schedule_assignments WHERE group_id=?) AS count').bind(g.id,g.id).first<any>();if(Number(used?.count)>0)throw new PanelError('Antalet veckor kan inte ändras när gruppen har önskemål eller tilldelningar. Skapa en ny grupp för en annan rotation.');}
  const activate=b.active===true&&!g.active,active=g.active||activate;
  if(activate)await db.prepare('UPDATE schedule_groups SET active=FALSE,revision=revision+1,updated_at=?,updated_by=? WHERE active=TRUE AND id<>?').bind(now,u.email,g.id).run();
  const visible=active?true:b.visible===true,open=!active&&visible&&b.wishesOpen===true;
  await db.prepare('UPDATE schedule_groups SET name=?,config=?::jsonb,active=?,visible=?,wishes_open=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(name,JSON.stringify(config),active,visible,open,now,u.email,g.id).run();if(active)await recordPlanningPeriod(u,g.id,activate?config.startDate:stockholmToday());if(activate)await panelLog(u,'Aktivt schema valt',name);await panelLog(u,'Turlista och schemagrupp ändrad',name);return Response.json({ok:true});
 }
 throw new PanelError('Okänd åtgärd.');
});}
function handle(fn:(r:Request)=>Promise<Response>){return async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Grundschemat kunde inte läsas eller sparas. Kontrollera att 0027_grundschema.sql är tillämpad.',e instanceof PanelError?e.status:503)}}}
export const GET=secureApi('/api/grundschema',handle(get));
export const POST=secureApi('/api/grundschema',handle(post));
