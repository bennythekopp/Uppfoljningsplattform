import {db} from '../../../database';
import {currentUser,error} from '../../../auth';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{if((await currentUser())?.role!=='Administratör')return error('Behörighet saknas',403);const p=new URL(req.url).searchParams,q=(p.get('q')||'').slice(0,200),actor=p.get('actor')||'',action=p.get('action')||'',offset=Number(p.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)return error('Ogiltig sida',400);
 const where="WHERE (?='' OR actor_email=?) AND (?='' OR action=?) AND (?='' OR concat_ws(' ',actor_name,action,area,target) ILIKE ?)",args=[actor,actor,action,action,q,'%'+q+'%'];
 const {results:items}=await db.prepare('SELECT id,occurred_at AS occurredAt,actor_email AS actorEmail,actor_name AS actorName,actor_role AS actorRole,action,area,target,(undo_payload IS NOT NULL AND restored_at IS NULL) AS canRestore,restored_at AS restoredAt,restored_by_name AS restoredByName FROM activity_log '+where+' ORDER BY occurred_at DESC,id DESC LIMIT 100 OFFSET ?').bind(...args,offset).all();
 const total=await db.prepare('SELECT COUNT(*) AS total FROM activity_log '+where).bind(...args).first<{total:number}>();
 const {results:actors}=await db.prepare('SELECT actor_email AS email,MAX(actor_name) AS name FROM activity_log GROUP BY actor_email ORDER BY MAX(actor_name)').all();
 const {results:actions}=await db.prepare('SELECT DISTINCT action FROM activity_log ORDER BY action').all();
 return Response.json({items,total:Number(total?.total||0),actors,actions});
 }catch{return error('Kunde inte läsa aktivitetsloggen. Kontrollera databasuppdatering 0019.',503)}}
