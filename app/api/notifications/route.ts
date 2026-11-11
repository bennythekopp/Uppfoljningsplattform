import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db} from '../../database';
import {canReadPlanningNotice} from '../../planning-notifications-server';
export const dynamic='force-dynamic';
async function get(req:Request){
 const actor=(await currentUser())!,now=Date.now(),app=req.headers.get('x-tc-app')==='planning'||actor.sessionScope==='planning';const standard=(await db.prepare('SELECT n.id,n.title,n.body,n.created_at AS createdAt,n.expires_at AS expiresAt,(r.notification_id IS NOT NULL) AS read FROM site_notifications n LEFT JOIN site_notification_reads r ON r.notification_id=n.id AND r.user_email=? WHERE n.roles @> ?::jsonb AND n.starts_at<=? AND (n.expires_at IS NULL OR n.expires_at>?) ORDER BY n.created_at DESC LIMIT 100').bind(actor.email,JSON.stringify([actor.role]),now,now).all()).results;
 const rows=(await db.prepare("SELECT n.id,n.kind,n.day::text AS day,n.column_id AS columnId,n.suggestion_id AS suggestionId,n.payload,n.created_at AS createdAt,CASE WHEN n.kind='schedule' AND n.read_at IS NOT NULL THEN n.read_at+7200000 ELSE NULL END AS expiresAt,(n.read_at IS NOT NULL) AS read FROM planning_notifications n WHERE n.user_email=? AND (n.kind<>'schedule' OR n.read_at IS NULL OR n.read_at>?) AND (?=false OR n.kind<>'proposal') AND (n.kind<>'proposal' OR EXISTS(SELECT 1 FROM planning_suggestions s WHERE s.id=n.suggestion_id AND s.status='pending')) ORDER BY n.created_at DESC LIMIT 100").bind(actor.email,now-7200000,app).all<any>()).results;
 const planning=[];let canSchedule:boolean|undefined,canProposal:boolean|undefined;
 for(const n of rows){if(n.kind==='proposal'){if(app)continue;canProposal??=await canReadPlanningNotice(actor,n);if(!canProposal)continue}else{canSchedule??=await canReadPlanningNotice(actor,n);if(!canSchedule)continue}planning.push({...n,title:n.payload.title,body:n.payload.body})}
 return Response.json([...standard,...planning].sort((a:any,b:any)=>b.createdAt-a.createdAt).slice(0,100));
}
async function post(req:Request){
 const actor=(await currentUser())!,input=await req.json().catch(()=>null);if(input?.action!=='read'||typeof input.id!=='string')return error('Ogiltig notisåtgärd.',400);
 const row=await db.prepare('SELECT id,kind FROM planning_notifications WHERE id=? AND user_email=?').bind(input.id,actor.email).first<{id:string,kind:string}>();
 if(row){if(row.kind==='proposal'&&(req.headers.get('x-tc-app')==='planning'||actor.sessionScope==='planning'))return error('Notisen är inte tillgänglig i appen.',403);if(!await canReadPlanningNotice(actor,row))return error('Notisen är inte längre tillgänglig.',403);await db.prepare('UPDATE planning_notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_email=?').bind(Date.now(),row.id,actor.email).run();return Response.json({ok:true,expiresAt:row.kind==='schedule'?Number((await db.prepare('SELECT read_at FROM planning_notifications WHERE id=? AND user_email=?').bind(row.id,actor.email).first<{read_at:number}>())?.read_at)+7200000:null})}
 const now=Date.now();
 const result=await db.prepare('INSERT INTO site_notification_reads(notification_id,user_email,read_at) SELECT id,?,? FROM site_notifications WHERE id=? AND roles @> ?::jsonb AND starts_at<=? AND (expires_at IS NULL OR expires_at>?) ON CONFLICT(notification_id,user_email) DO UPDATE SET read_at=site_notification_reads.read_at').bind(actor.email,now,input.id,JSON.stringify([actor.role]),now,now).run();
 return result.meta.changes?Response.json({ok:true}):error('Notisen finns inte eller är inte längre synlig.',404);
}
const handled=(fn:(req:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch{return error('Notiserna kunde inte läsas eller sparas. Kontrollera databasuppdatering 0045.',503)}};
export const GET=secureApi('/api/notifications',handled(get));export const POST=secureApi('/api/notifications',handled(post));
