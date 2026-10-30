import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db} from '../../database';
export const dynamic='force-dynamic';
async function get(){const actor=(await currentUser())!,now=Date.now();const rows=await db.prepare('SELECT n.id,n.title,n.body,n.created_at AS createdAt,n.expires_at AS expiresAt,(r.notification_id IS NOT NULL) AS read FROM site_notifications n LEFT JOIN site_notification_reads r ON r.notification_id=n.id AND r.user_email=? WHERE n.roles @> ?::jsonb AND n.starts_at<=? AND (n.expires_at IS NULL OR n.expires_at>?) ORDER BY n.created_at DESC LIMIT 100').bind(actor.email,JSON.stringify([actor.role]),now,now).all();return Response.json(rows.results)}
async function post(req:Request){
 const actor=(await currentUser())!,input=await req.json().catch(()=>null);if(input?.action!=='read'||typeof input.id!=='string')return error('Ogiltig notisåtgärd.',400);
 const now=Date.now();
 // One atomic INSERT/SELECT: role, time window and existence are checked when recording the read.
 const result=await db.prepare('INSERT INTO site_notification_reads(notification_id,user_email,read_at) SELECT id,?,? FROM site_notifications WHERE id=? AND roles @> ?::jsonb AND starts_at<=? AND (expires_at IS NULL OR expires_at>?) ON CONFLICT(notification_id,user_email) DO UPDATE SET read_at=site_notification_reads.read_at').bind(actor.email,now,input.id,JSON.stringify([actor.role]),now,now).run();
 return result.meta.changes?Response.json({ok:true}):error('Notisen finns inte eller är inte längre synlig.',404);
}
const handled=(fn:(req:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch{return error('Notiserna kunde inte läsas eller sparas. Kontrollera databasuppdatering 0040.',503)}};
export const GET=secureApi('/api/notifications',handled(get));
export const POST=secureApi('/api/notifications',handled(post));
