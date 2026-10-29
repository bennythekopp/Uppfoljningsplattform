import 'server-only';
import {db} from './database';
import {PanelError,type PanelActor} from './panel-server';
import {stockholmToday,addDays} from './grundschema-types';
export function planningDate(v:unknown){if(typeof v!=='string'||!/^2[01]\d\d-\d\d-\d\d$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)throw new PanelError('Ange ett giltigt datum.');return v}
export async function planningLog(u:PanelActor,action:string,detail:{day?:string,columnId?:string,columnName?:string,field?:string,previous?:string,next?:string}={}){await db.prepare('INSERT INTO planning_log(id,occurred_at,actor_email,actor_name,action,day,column_id,column_name,field,previous_value,new_value) VALUES(?,?,?,?,?,?::date,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),u.email,u.name,action,detail.day||null,detail.columnId||null,detail.columnName||'',detail.field||'',detail.previous||'',detail.next||'').run()}
/** Snapshot the dated base. Manual planning cells are never rewritten. Caller holds schedule lock. */
export async function recordPlanningPeriod(u:PanelActor,groupId:string,from=stockholmToday()){
 const day=planningDate(from),g=await db.prepare('SELECT id,name,config FROM schedule_groups WHERE id=?').bind(groupId).first<any>();if(!g)return;
 const assignments=(await db.prepare('SELECT user_email AS userEmail,row_number AS row FROM schedule_assignments WHERE group_id=? ORDER BY row_number').bind(groupId).all()).results;
 const previous=await db.prepare('SELECT group_id AS groupId,config,assignments FROM planning_schedule_periods WHERE group_id=? AND start_date<?::date ORDER BY start_date DESC LIMIT 1').bind(g.id,day).first<any>();
 const old=await db.prepare('SELECT id,group_id AS groupId,config,assignments FROM planning_schedule_periods WHERE group_id=? AND start_date=?::date').bind(g.id,day).first<any>();
 const compare=old||previous;if(compare?.groupId===g.id&&JSON.stringify(compare.config)===JSON.stringify(g.config)&&JSON.stringify(compare.assignments)===JSON.stringify(assignments))return;
 const listChange=!previous||previous.groupId!==g.id||JSON.stringify(previous.config)!==JSON.stringify(g.config);
 await db.prepare('INSERT INTO planning_schedule_periods(id,group_id,name,start_date,config,assignments,list_change,created_at,created_by) VALUES(?,?,?,?::date,?::jsonb,?::jsonb,?,?,?) ON CONFLICT(group_id,start_date) DO UPDATE SET group_id=EXCLUDED.group_id,name=EXCLUDED.name,config=EXCLUDED.config,assignments=EXCLUDED.assignments,list_change=EXCLUDED.list_change,created_at=EXCLUDED.created_at,created_by=EXCLUDED.created_by').bind(old?.id||crypto.randomUUID(),g.id,g.name,day,JSON.stringify(g.config),JSON.stringify(assignments),listChange,Date.now(),u.email).run();
 await planningLog(u,'Grundschema för planering uppdaterat',{day,next:g.name});
}

/** Caller holds schedule_groups lock. Insert a dated event without changing other
 * people, historical dates or pre-existing later events for this person. */
export async function setScheduleMembership(u:PanelActor,groupId:string,email:string,row:number,from:string,validUntil=''){
 const day=planningDate(from);const next=await db.prepare('SELECT start_date::text AS day FROM schedule_memberships WHERE user_email=? AND start_date>?::date ORDER BY start_date LIMIT 1').bind(email,day).first<{day:string}>();
 let end=next?.day||null;if(validUntil){const until=addDays(planningDate(validUntil),1);end=end&&end<until?end:until}if(end&&end<=day)throw new PanelError('Schemat har redan slutat gälla.');
 await db.prepare('UPDATE schedule_memberships SET end_date=?::date WHERE user_email=? AND start_date<?::date AND (end_date IS NULL OR end_date>?::date)').bind(day,email,day,day).run();
 const same=await db.prepare('SELECT id FROM schedule_memberships WHERE user_email=? AND start_date=?::date').bind(email,day).first<{id:string}>();
 await db.prepare('INSERT INTO schedule_memberships(id,user_email,group_id,row_number,start_date,end_date,created_at,created_by) VALUES(?,?,?,?,?::date,?::date,?,?) ON CONFLICT(user_email,start_date) DO UPDATE SET group_id=EXCLUDED.group_id,row_number=EXCLUDED.row_number,end_date=EXCLUDED.end_date,created_at=EXCLUDED.created_at,created_by=EXCLUDED.created_by').bind(same?.id||crypto.randomUUID(),email,groupId,row,day,end,Date.now(),u.email).run();
}
export async function endScheduleMembership(groupId:string,email:string,from:string){const day=planningDate(from);await db.prepare('DELETE FROM schedule_memberships WHERE group_id=? AND user_email=? AND start_date>=?::date').bind(groupId,email,day).run();await db.prepare('UPDATE schedule_memberships SET end_date=?::date WHERE group_id=? AND user_email=? AND start_date<?::date AND (end_date IS NULL OR end_date>?::date)').bind(day,groupId,email,day,day).run()}
export async function publishScheduleMemberships(u:PanelActor,groupId:string){const g=await db.prepare('SELECT config FROM schedule_groups WHERE id=?').bind(groupId).first<any>();if(!g)return;const rows=(await db.prepare('SELECT user_email AS email,row_number AS row FROM schedule_assignments WHERE group_id=?').bind(groupId).all<{email:string,row:number}>()).results;for(const a of rows)await setScheduleMembership(u,groupId,a.email,a.row,g.config.startDate,g.config.validUntil)}
