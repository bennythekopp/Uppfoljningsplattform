import {planningPermissions} from '../../planning-permissions';
import {planningYearRange} from '../../planning-dates';
import {operationalSettings,saveOperational,saveOperationalCount} from '../../planning-operational-server';
import {savePlanningCell} from '../../planning-cell-server';
import {suggestionAction,readSuggestions,mailSettings} from '../../planning-suggestions-server';
import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {PanelError,panelBody,staffList,short,type PanelActor} from '../../panel-server';
import {allowedModules} from '../../module-access';
import {planningDate,planningLog} from '../../planning-server';
import {baseTour,personPeriodFor,type PlanningPeriod} from '../../planning-types';
import {addDays,tourLogValue,findTour} from '../../grundschema-types';
import type {PlanningColumn} from '../../planning-types';
export const dynamic='force-dynamic';
async function settings(u:{role:string,email:string},lock:'share'|'update'|false=false){const s=(await db.prepare('SELECT editor_emails AS editorEmails,suggester_emails AS suggesterEmails,task_width AS taskWidth,task_width_revision AS taskWidthRevision,revision FROM planning_settings WHERE id=1'+(lock==='update'?' FOR UPDATE':lock?' FOR SHARE':'')).first<{editorEmails:string[],suggesterEmails:string[],taskWidth:number,taskWidthRevision:number,revision:number}>())!;return {...s,...planningPermissions(u,s)}}
async function get(req:Request){const u=(await currentUser())!,url=new URL(req.url),s=await settings(u);
 if(url.searchParams.has('log')){if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan se planeringsloggen.',403);const before=Number(url.searchParams.get('before')||Date.now()+1);return Response.json({log:(await db.prepare('SELECT id,occurred_at AS occurredAt,actor_name AS actorName,action,day::text AS day,column_name AS columnName,field,previous_value AS previousValue,new_value AS newValue FROM planning_log WHERE occurred_at<? ORDER BY occurred_at DESC,id LIMIT 200').bind(before).all()).results})}
 const year=Number(url.searchParams.get('year'));if(!Number.isInteger(year)||year<2020||year>2099)throw new PanelError('Välj ett år mellan 2020 och 2099.');
 const op=url.searchParams.has('operational');
 let range=planningYearRange(year);
 if(url.searchParams.has('from')||url.searchParams.has('to')){
  range={start:planningDate(url.searchParams.get('from')),end:planningDate(url.searchParams.get('to'))};
  const length=(Date.parse(range.end)-Date.parse(range.start))/86400000;
  if(length<=0||length>740)throw new PanelError('Välj ett giltigt datumintervall.');
 }
 const start=op?addDays((year-1)+'-08-01',-1):addDays(range.start,-1),end=op?(year+1)+'-01-01':range.end;
 const users=await staffList();
 // Stable account columns: names may change without affecting saved cells.
 await databaseTransaction(async()=>{for(const p of users)await db.prepare("INSERT INTO planning_columns(id,title,kind,user_email,position) VALUES(?,?,'person',?,?) ON CONFLICT(user_email) DO UPDATE SET title=EXCLUDED.title").bind('person:'+p.email,p.name,p.email,10+(['linnea','gustav','sarah','olle','elin','lisa'].indexOf(String(p.name).toLocaleLowerCase('sv').split(' ')[0])<0?100:['linnea','gustav','sarah','olle','elin','lisa'].indexOf(String(p.name).toLocaleLowerCase('sv').split(' ')[0]))).run()});
 const [columns,cells,periods,memberships]=await Promise.all([
 db.prepare('SELECT id,title,kind,user_email AS userEmail,position,revision,width,width_revision AS widthRevision FROM planning_columns WHERE deleted_at IS NULL ORDER BY position,lower(title),id').all(),
 db.prepare('SELECT day::text AS day,column_id AS columnId,field,value,revision,updated_at AS updatedAt,updated_by AS updatedBy FROM planning_cells WHERE day>=?::date AND day<?::date').bind(start,end).all(),
 db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date,created_at,id').all(),
 db.prepare('SELECT id,user_email AS userEmail,group_id AS groupId,row_number AS row,start_date::text AS startDate,end_date::text AS endDate FROM schedule_memberships ORDER BY start_date').all()]);
 return Response.json({operationalOverrides:op?(await db.prepare('SELECT column_id AS columnId,month,count,revision FROM planning_operational_overrides WHERE month>=? AND month<?').bind((year-1)+'-08',(year+1)+'-01').all()).results:undefined,operational:op?await operationalSettings():undefined,suggestions:s.canEdit||s.canSuggest?await readSuggestions(range.start,range.end):[],canSuggest:s.canSuggest,mailSettings:u.role==='Administratör'?await mailSettings():undefined,columns:columns.results,cells:cells.results,periods:periods.results,memberships:memberships.results,canEdit:s.canEdit,settingsRevision:s.revision,editorEmails:u.role==='Administratör'?s.editorEmails:[],suggesterEmails:u.role==='Administratör'?s.suggesterEmails:[],taskWidth:s.taskWidth,taskWidthRevision:s.taskWidthRevision,permissionUsers:u.role==='Administratör'?(await db.prepare("SELECT email,name,role FROM users WHERE role IN ('Instruktör','Chef') AND disabled_at IS NULL ORDER BY lower(name)").all()).results:[],users:u.role==='Administratör'?users:[]});}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,40000);return databaseTransaction(async()=>{
 const s=await settings(u,['editors','width'].includes(b.action)?'update':'share');if(b.action==='operational-count')return saveOperationalCount(u,b);if(b.action==='operational-settings')return saveOperational(u,b);if(['propose','review','mail-settings','mail-resolve'].includes(b.action))return suggestionAction(u,b,s.canEdit,s.canSuggest);if(!s.canEdit)throw new PanelError('Du har läsbehörighet till planeringen.',403);
 if(b.action==='cell')return savePlanningCell(u,b);
 if(b.action==='width'){
  if(!Number.isInteger(b.width)||b.width<70||b.width>800||!Number.isInteger(b.revision))throw new PanelError('Kolumnbredden måste vara mellan 70 och 800.');
  let result;
  if(b.columnId==='task')result=await db.prepare('UPDATE planning_settings SET task_width=?,task_width_revision=task_width_revision+1 WHERE id=1 AND task_width_revision=? RETURNING task_width_revision AS revision').bind(b.width,b.revision).first();
  else result=await db.prepare("UPDATE planning_columns SET width=?,width_revision=width_revision+1 WHERE id=? AND kind='shared' AND deleted_at IS NULL AND width_revision=? RETURNING width_revision AS revision").bind(b.width,b.columnId,b.revision).first();
  if(!result)throw new PanelError('Kolumnbredden har ändrats. Läs in igen.',409);
  await planningLog(u,'Kolumnbredd ändrad',{columnId:b.columnId,columnName:b.columnId==='task'?'Uppgift':b.columnId,next:String(b.width)});return Response.json({ok:true,...result});
 }
 if(b.action==='editors'){
  if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ändra behörigheter.',403);
  const lists=[b.emails,b.suggesterEmails];
  if(lists.some(list=>!Array.isArray(list)||list.length>1000||list.some((v:unknown)=>typeof v!=='string')||new Set(list).size!==list.length)||!Number.isInteger(b.revision))throw new PanelError('Välj användare.');
  const allowed=(await db.prepare("SELECT email,name,role FROM users WHERE role IN ('Instruktör','Chef') AND disabled_at IS NULL").all<{email:string,name:string,role:PanelActor['role']}>()).results;
  for(const [emails,editable] of [[b.emails,true],[b.suggesterEmails,false]] as [string[],boolean][]){for(const email of emails){
   const p=allowed.find(p=>p.email===email);if(!p||editable&&p.role!=='Instruktör')throw new PanelError('Välj en giltig roll för behörigheten.');
   // Existing assignments may remain for temporarily hidden modules; granting a new one requires visibility.
   if(!(editable?s.editorEmails:s.suggesterEmails).includes(email)&&!(await allowedModules(p)).includes('planning'))throw new PanelError('Ge användaren synlighet till Planering innan du tilldelar behörighet.');
  }}
  if(b.emails.some((email:string)=>b.suggesterEmails.includes(email)))throw new PanelError('Välj antingen Redigera eller Föreslå ändringar för samma person.');
  const result=await db.prepare('UPDATE planning_settings SET editor_emails=?::jsonb,suggester_emails=?::jsonb,revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(b.emails),JSON.stringify(b.suggesterEmails),b.revision).first();if(!result)throw new PanelError('Behörigheterna har ändrats. Läs in dem igen.',409);
  await planningLog(u,'Planeringsbehörigheter ändrade',{previous:JSON.stringify({redigera:s.editorEmails,föreslå:s.suggesterEmails}),next:JSON.stringify({redigera:b.emails,föreslå:b.suggesterEmails})});return Response.json({ok:true});
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
const handle=(fn:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Planeringen kunde inte läsas eller sparas. Kontrollera databasuppdatering 0035.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/planning',handle(get));export const POST=secureApi('/api/planning',handle(post));
