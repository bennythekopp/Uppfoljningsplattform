import 'server-only';
import {db} from './database';
import {PanelError,type PanelActor} from './panel-server';
import {stockholmToday} from './grundschema-types';
export function planningDate(v:unknown){if(typeof v!=='string'||!/^20\d\d-\d\d-\d\d$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)throw new PanelError('Ange ett giltigt datum.');return v}
export async function planningLog(u:PanelActor,action:string,detail:{day?:string,columnId?:string,columnName?:string,field?:string,previous?:string,next?:string}={}){await db.prepare('INSERT INTO planning_log(id,occurred_at,actor_email,actor_name,action,day,column_id,column_name,field,previous_value,new_value) VALUES(?,?,?,?,?,?::date,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),u.email,u.name,action,detail.day||null,detail.columnId||null,detail.columnName||'',detail.field||'',detail.previous||'',detail.next||'').run()}
/** Snapshot the dated base. Manual planning cells are never rewritten. Caller holds schedule lock. */
export async function recordPlanningPeriod(u:PanelActor,groupId:string,from=stockholmToday()){
 const day=planningDate(from),g=await db.prepare('SELECT id,name,config FROM schedule_groups WHERE id=?').bind(groupId).first<any>();if(!g)return;
 const assignments=(await db.prepare('SELECT user_email AS userEmail,row_number AS row FROM schedule_assignments WHERE group_id=? ORDER BY row_number').bind(groupId).all()).results;
 const previous=await db.prepare('SELECT group_id AS groupId,config,assignments FROM planning_schedule_periods WHERE start_date<?::date ORDER BY start_date DESC LIMIT 1').bind(day).first<any>();
 const old=await db.prepare('SELECT id,group_id AS groupId,config,assignments FROM planning_schedule_periods WHERE start_date=?::date').bind(day).first<any>();
 const compare=old||previous;if(compare?.groupId===g.id&&JSON.stringify(compare.config)===JSON.stringify(g.config)&&JSON.stringify(compare.assignments)===JSON.stringify(assignments))return;
 const listChange=!previous||previous.groupId!==g.id||JSON.stringify(previous.config)!==JSON.stringify(g.config);
 await db.prepare('INSERT INTO planning_schedule_periods(id,group_id,name,start_date,config,assignments,list_change,created_at,created_by) VALUES(?,?,?,?::date,?::jsonb,?::jsonb,?,?,?) ON CONFLICT(start_date) DO UPDATE SET group_id=EXCLUDED.group_id,name=EXCLUDED.name,config=EXCLUDED.config,assignments=EXCLUDED.assignments,list_change=EXCLUDED.list_change,created_at=EXCLUDED.created_at,created_by=EXCLUDED.created_by').bind(old?.id||crypto.randomUUID(),g.id,g.name,day,JSON.stringify(g.config),JSON.stringify(assignments),listChange,Date.now(),u.email).run();
 await planningLog(u,'Grundschema för planering uppdaterat',{day,next:g.name});
}
