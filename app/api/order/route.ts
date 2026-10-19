import {secureApi} from '../../api-security';
import {auditMutation} from '../../activity-log';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {loadStudentMoments} from '../../student-moments';
import {loadIUMoments,loadOperationalCategories,loadSimulatorGroups} from '../../iu-data';
import {loadKPTemplate} from '../../kp-data';
import {loadExamTemplate} from '../../exam-data';
export const dynamic='force-dynamic';
async function currentIds(scope:string):Promise<string[]|null>{
 let rows:{id:string|number}[];
 if(scope==='iu-categories')rows=await loadOperationalCategories();
 else if(scope==='iu-simulator-groups')rows=await loadSimulatorGroups();
 else if(scope==='exam-scenarios')rows=(await loadExamTemplate()).filter(g=>g.part==='simulator');
 else if(scope.startsWith('student-moments:')){const category=scope.slice(16);if(!['System E2','System M','Övrigt'].includes(category))return null;rows=(await loadStudentMoments()).filter(m=>m.category===category)}
 else if(scope.startsWith('kp-moments:')){const kind=scope.slice(11);if(kind!=='KP1'&&kind!=='KP2')return null;rows=await loadKPTemplate(kind)}
 else if(scope.startsWith('exam-moments:')){const group=(await loadExamTemplate()).find(g=>g.id===scope.slice(13));if(!group)return null;rows=group.moments}
 else if(scope.startsWith('iu-moments:')){const category=scope.slice(11),categories=await loadOperationalCategories();if(category!=='uncategorized'&&!categories.some(c=>c.id===category))return null;rows=(await loadIUMoments()).filter(m=>m.kind==='op'&&(m.operationalCategoryId||'uncategorized')===category)}
 else return null;
 return rows.map(r=>String(r.id));
}
async function reorder(req:Request){try{
 const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Behörighet saknas',403);
 const {scope,ids,previousIds}=await req.json();
 const valid=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=10000&&v.every(id=>typeof id==='string'&&id.length>0&&id.length<=200)&&new Set(v).size===v.length;
 if(typeof scope!=='string'||scope.length>240||!valid(ids)||!valid(previousIds))return error('Ogiltig ordning',400);
 return await databaseTransaction(async()=>{
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('display-order:'+scope).first();
  const current=await currentIds(scope);if(!current)return error('Underlaget finns inte',400);
  if(JSON.stringify(current)!==JSON.stringify(previousIds))return error('Underlaget har ändrats. Uppdatera listan och försök igen.',409);
  if(ids.length!==current.length||ids.some(id=>!current.includes(id)))return error('Ordningen måste innehålla samma moment som listan.',400);
  await db.prepare('INSERT INTO display_orders(scope,item_ids,updated_at,updated_by) VALUES(?,?::jsonb,?,?) ON CONFLICT(scope) DO UPDATE SET item_ids=EXCLUDED.item_ids,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(scope,JSON.stringify(ids),Date.now(),user.email).run();
  return Response.json({ok:true});
 });
}catch{return error('Ordningen kunde inte sparas. Kontrollera databasuppdatering 0021.',503)}}
export const POST=secureApi('/api/order',req=>auditMutation(req,reorder,'Sortering av underlag'));
