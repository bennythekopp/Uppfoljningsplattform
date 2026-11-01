import 'server-only';
import {db} from './database';
import {PanelError} from './panel-server';
import type {PlanningLog} from './planning-types';
const select='SELECT id,occurred_at AS occurredAt,actor_name AS actorName,action,day::text AS day,column_name AS columnName,field,previous_value AS previousValue,new_value AS newValue FROM planning_log';
export async function readPlanningLog(params:URLSearchParams){
 // Retain the old response for already-open clients. The new admin UI always requests a numbered page.
 if(!params.has('page')&&!params.has('pageSize')){
  const before=Number(params.get('before')||Date.now()+1);if(!Number.isSafeInteger(before)||before<0)throw new PanelError('Ogiltig loggtid.');
  return {log:(await db.prepare(select+' WHERE occurred_at<? ORDER BY occurred_at DESC,id LIMIT 200').bind(before).all<PlanningLog>()).results};
 }
 const requested=Number(params.get('page')||1),pageSize=Number(params.get('pageSize')||5),now=Date.now(),snapshot=Number(params.get('snapshot')??now);
 if(!Number.isSafeInteger(requested)||requested<1||requested>1000000||![5,10,25].includes(pageSize))throw new PanelError('Välj en giltig sida och 5, 10 eller 25 poster per sida.');
 if(!Number.isSafeInteger(snapshot)||snapshot<0||snapshot>now)throw new PanelError('Ogiltig tid för loggvisningen.');
 // A fixed cutoff keeps newly logged changes from shifting earlier pages. The id breaks timestamp ties.
 const count=await db.prepare('SELECT count(*) AS total FROM planning_log WHERE occurred_at<?').bind(snapshot).first<{total:number}>();
 const total=Number(count?.total||0),totalPages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(requested,totalPages);
 const {results:log}=await db.prepare(select+' WHERE occurred_at<? ORDER BY occurred_at DESC,id ASC LIMIT ? OFFSET ?').bind(snapshot,pageSize,(page-1)*pageSize).all<PlanningLog>();
 return {log,total,totalPages,page,pageSize,snapshot};
}
