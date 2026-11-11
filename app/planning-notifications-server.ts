import 'server-only';
import {currentUser} from './auth';
import {db,databaseTransaction} from './database';
import {notificationRange,type NotificationHorizon,type PlanningNoticePayload,type NotificationValue} from './planning-notification-types';
import {baseTour,personPeriodFor,type PlanningColumn,type PlanningPeriod} from './planning-types';
import {findTour,addDays} from './grundschema-types';
import {planningPermissions} from './planning-permissions';
import {allowedModules} from './module-access';
import type {PanelActor} from './panel-server';
export async function notificationSettings(){return (await db.prepare('SELECT enabled,horizon,revision,notify_tours AS "notifyTours",notify_tasks AS "notifyTasks" FROM planning_notification_settings WHERE id=1').first<{enabled:boolean,horizon:NotificationHorizon,revision:number,notifyTours:boolean,notifyTasks:boolean}>())!}
export {pushConfiguration} from '../lib/planning-push';
export async function planningRecipients(){
 const users=(await db.prepare("SELECT email,name,role FROM users WHERE disabled_at IS NULL AND login_blocked_at IS NULL AND role IN ('Administratör','Instruktör','Chef')").all<PanelActor>()).results;
 const rules=(await db.prepare("SELECT restricted,user_emails AS userEmails FROM panel_module_access WHERE kind='planning'").first<{restricted:boolean,userEmails:string[]}>())||{restricted:true,userEmails:[]};
 return users.filter(u=>u.role==='Administratör'||!rules.restricted||rules.userEmails.includes(u.email));
}
async function addWebNotice(eventKey:string,email:string,kind:'schedule'|'proposal',day:string,columnId:string,suggestionId:string|null,payload:PlanningNoticePayload){
 await db.prepare('INSERT INTO planning_notifications(id,event_key,user_email,kind,day,column_id,suggestion_id,payload,created_at) VALUES(?,?,?,?,?::date,?,?,?::jsonb,?) ON CONFLICT(event_key,user_email) DO NOTHING').bind(crypto.randomUUID(),eventKey,email,kind,day,columnId,suggestionId,JSON.stringify(payload),Date.now()).run();
}
export async function notifyNewProposal(id:string){
 const s=await db.prepare("SELECT s.day::text AS day,s.column_id AS columnId,s.field,s.previous_label AS previousLabel,s.proposed_label AS proposedLabel,s.previous_value AS previousValue,s.proposed_value AS proposedValue,s.previous_color AS previousColor,s.proposed_color AS proposedColor,s.author_name AS authorName,c.title AS columnName FROM planning_suggestions s JOIN LATERAL tc_planning_columns_for_year(EXTRACT(YEAR FROM s.day)::integer) c ON c.id=s.column_id WHERE s.id=? AND s.status='pending'").bind(id).first<any>();if(!s)return;
 const permissions=(await db.prepare('SELECT editor_emails AS editorEmails,suggester_emails AS suggesterEmails FROM planning_settings WHERE id=1').first<any>())!;
 const value=(label:string,raw:string,color:string):NotificationValue=>{const match=s.field==='tour'?label.match(/^(.*) · (#[0-9a-f]{6})$/i):null;return {text:match?.[1]||raw,color:color||match?.[2]||''}};
 const payload:PlanningNoticePayload={title:'Nytt ändringsförslag',body:s.authorName+' har lämnat ett ändringsförslag.',columnName:s.columnName,field:s.field,authorName:s.authorName,changes:[{field:s.field,before:value(s.previousLabel,s.previousValue,s.previousColor||''),after:value(s.proposedLabel,s.proposedValue,s.proposedColor??s.previousColor??'')}]};
 for(const u of await planningRecipients())if(planningPermissions(u,permissions).canEdit)await addWebNotice('proposal:'+id,u.email,'proposal',s.day,s.columnId,id,payload);
}
type Snapshot={day:string,columnId:string,email:string,columnName:string,tour:NotificationValue,task:NotificationValue};
export async function scheduleSnapshot(target?:{day:string,columnId:string}):Promise<Snapshot[]>{
 const settings=await notificationSettings();if(!settings.enabled)return [];
 const range=notificationRange(settings.horizon);if(target&&(target.day<range.start||target.day>=range.end))return [];
 const recipients=new Set((await planningRecipients()).map(u=>u.email));
 const columns=(await (target?db.prepare("SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE id=? AND kind='person' AND deleted_at IS NULL").bind(target.columnId):db.prepare("SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE kind='person' AND deleted_at IS NULL")).all<PlanningColumn>()).results.filter(c=>c.userEmail&&recipients.has(c.userEmail));
 if(!columns.length)return [];
 const start=target?.day||range.start,end=target?addDays(target.day,1):range.end;
 const periods=(await db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date,created_at,id').all<PlanningPeriod>()).results;
 const memberships=(await db.prepare('SELECT id,user_email AS userEmail,group_id AS groupId,row_number AS row,start_date::text AS startDate,end_date::text AS endDate FROM schedule_memberships ORDER BY start_date').all<any>()).results;
 const cells=(await db.prepare('SELECT day::text AS day,column_id AS columnId,field,value FROM planning_cells WHERE day>=?::date AND day<?::date AND column_id=ANY(?::text[])').bind(start,end,columns.map(c=>c.id)).all<any>()).results;
 const map=new Map(cells.map(v=>[JSON.stringify([v.day,v.columnId,v.field]),v.value]));const out:Snapshot[]=[];
 for(let day=start;day<end;day=addDays(day,1))for(const c of columns){
  const config=personPeriodFor(periods,c,day,memberships)?.config||{tours:[]},raw=map.get(JSON.stringify([day,c.id,'tour']))??baseTour(periods,c,day,memberships),tour=findTour(config,raw),manual=map.get(JSON.stringify([day,c.id,'color']))||'';
  out.push({day,columnId:c.id,email:c.userEmail!,columnName:c.title,tour:{text:tour?.code||raw,color:manual||tour?.color||''},task:{text:map.get(JSON.stringify([day,c.id,'task']))||'',color:manual}});
 }
 return out;
}
export async function notifyScheduleChanges(before:Snapshot[],target?:{day:string,columnId:string}){
 if(!before.length)return;
 const actor=await currentUser(),settings=await notificationSettings();
 const after=await scheduleSnapshot(target),oldMap=new Map(before.map(v=>[JSON.stringify([v.day,v.columnId]),v]));
 // Suppress both web notices and push queue entries for the person making the change.
 for(const next of after){if(next.email===actor?.email)continue;const old=oldMap.get(JSON.stringify([next.day,next.columnId]));if(!old)continue;
  const changes=(['tour','task'] as const).filter(f=>(f==='tour'?settings.notifyTours:settings.notifyTasks)!==false).filter(f=>JSON.stringify(old[f])!==JSON.stringify(next[f])).map(field=>({field,before:old[field],after:next[field]}));if(!changes.length)continue;
  const eventKey='schedule:'+crypto.randomUUID(),payload:PlanningNoticePayload={title:'Ditt schema har ändrats',body:changes.map(v=>(v.field==='tour'?'Tur':'Uppgift')+': '+(v.before.text===v.after.text?'Färgen har ändrats':(v.before.text||'Tomt')+' → '+(v.after.text||'Tomt'))).join('\n'),columnName:next.columnName,changes};
  const pref=await db.prepare('SELECT web_enabled AS webEnabled FROM planning_notification_preferences WHERE user_email=?').bind(next.email).first<{webEnabled:boolean}>();
  if(pref?.webEnabled!==false)await addWebNotice(eventKey,next.email,'schedule',next.day,next.columnId,null,payload);
  const subscriptions=(await db.prepare('SELECT id FROM planning_push_subscriptions WHERE user_email=? AND enabled=true').bind(next.email).all<{id:string}>()).results;
  for(const sub of subscriptions)await db.prepare('INSERT INTO planning_push_outbox(id,event_key,subscription_id,payload,created_at,available_at) VALUES(?,?,?,?::jsonb,?,?) ON CONFLICT(event_key,subscription_id) DO NOTHING').bind(crypto.randomUUID(),eventKey,sub.id,JSON.stringify({...payload,day:next.day,columnId:next.columnId,eventKey}),Date.now(),Date.now()).run();
 }
}
export async function canReadPlanningNotice(actor:PanelActor,row:{kind:string}){
 if(!(await allowedModules(actor)).includes('planning'))return false;
 if(row.kind!=='proposal')return true;
 const s=(await db.prepare('SELECT editor_emails AS editorEmails,suggester_emails AS suggesterEmails FROM planning_settings WHERE id=1').first<any>())!;return planningPermissions(actor,s).canEdit;
}
/** Keeps mutation and generated notices atomic. Push is delivered only after commit. */
export async function withPlanningNotifications(work:()=>Promise<Response>,target?:{day:string,columnId:string}){
 return databaseTransaction(async()=>{if(target){await db.prepare("SELECT pg_advisory_xact_lock_shared(hashtextextended('planning-notification-mutations',0))").first();await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('planning-column:'+target.columnId).first()}else await db.prepare("SELECT pg_advisory_xact_lock(hashtextextended('planning-notification-mutations',0))").first();const before=await scheduleSnapshot(target),response=await work();if(response.ok)await notifyScheduleChanges(before,target);return response});
}
