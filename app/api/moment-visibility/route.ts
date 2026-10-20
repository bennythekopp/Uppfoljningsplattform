import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import base from '../../items.json';
export const dynamic='force-dynamic';
async function change(req:Request){try{
 const u=(await currentUser())!,{area,id,hidden,previousHidden}=await req.json();
 if(!['student','iu-op','iu-simulator','kp','exam'].includes(area)||typeof id!=='string'||!id||id.length>200||typeof hidden!=='boolean'||typeof previousHidden!=='boolean')return error('Ogiltigt moment',400);
 return await databaseTransaction(async()=>{
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('moment-visibility:'+area+':'+id).first();
  let found:unknown;
  if(area==='student'){const n=Number(id);if(!Number.isSafeInteger(n)||n<0||String(n)!==id)return error('Ogiltigt moment',400);found=n>=1000000?await db.prepare('SELECT id FROM custom_moments WHERE id=?').bind(n-1000000).first():base.some(m=>m.id===n)&&!await db.prepare('SELECT item_id FROM deleted_moments WHERE item_id=?').bind(n).first()}
  else if(area==='iu-op')found=await db.prepare("SELECT id FROM iu_moments WHERE id=? AND kind='op' AND deleted_at IS NULL").bind(id).first();
  else if(area==='iu-simulator')found=await db.prepare('SELECT id FROM iu_simulator_groups WHERE id=? AND deleted_at IS NULL').bind(id).first();
  else if(area==='kp')found=await db.prepare('SELECT id FROM kp_moments WHERE id=? AND deleted_at IS NULL').bind(id).first();
  else found=await db.prepare("SELECT id FROM exam_templates WHERE deleted_at IS NULL AND EXISTS (SELECT 1 FROM jsonb_array_elements(moments) AS m WHERE m->>'id'=?)").bind(id).first();
  if(!found)return error('Momentet finns inte',404);
  const old=await db.prepare('SELECT moment_id FROM hidden_moments WHERE area=? AND moment_id=?').bind(area,id).first();
  if(!!old!==previousHidden)return error('Synligheten har ändrats. Uppdatera underlaget och försök igen.',409);
  if(hidden)await db.prepare('INSERT INTO hidden_moments(area,moment_id,updated_at,updated_by) VALUES(?,?,?,?) ON CONFLICT(area,moment_id) DO UPDATE SET updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(area,id,Date.now(),u.email).run();
  else await db.prepare('DELETE FROM hidden_moments WHERE area=? AND moment_id=?').bind(area,id).run();
  if(hidden!==!!old)await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),u.email,u.name,u.role,hidden?'Moment dolt i bedömning':'Moment visas i bedömning','Bedömningsunderlag',area+' · '+id).run();
  return Response.json({hidden});
 });
 }catch{return error('Kunde inte ändra synligheten. Kontrollera databasuppdatering 0025.',503)}}
export const POST=secureApi('/api/moment-visibility',change);
