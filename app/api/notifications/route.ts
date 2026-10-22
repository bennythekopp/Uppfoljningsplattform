import {secureApi} from '../../api-security';
import {currentUser,error,type Role} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {panelLog} from '../../panel-server';
export const dynamic='force-dynamic';
const roles:Role[]=['Administratör','Instruktör','Handledare','Chef'];
async function visible(id:string,role:Role){return db.prepare('SELECT id FROM site_notifications WHERE id=? AND roles @> ?::jsonb').bind(id,JSON.stringify([role])).first()}
async function get(){const actor=(await currentUser())!;const rows=await db.prepare('SELECT n.id,n.body,n.created_at AS createdAt,(r.notification_id IS NOT NULL) AS read FROM site_notifications n LEFT JOIN site_notification_reads r ON r.notification_id=n.id AND r.user_email=? WHERE n.roles @> ?::jsonb ORDER BY n.created_at DESC LIMIT 100').bind(actor.email,JSON.stringify([actor.role])).all();return Response.json(rows.results)}
async function post(req:Request){const actor=(await currentUser())!;const input=await req.json().catch(()=>null);if(!input||typeof input!=='object')return error('Ogiltigt meddelande',400);
 if(input.action==='read'){if(typeof input.id!=='string'||!await visible(input.id,actor.role))return error('Notisen finns inte',404);await db.prepare('INSERT INTO site_notification_reads(notification_id,user_email,read_at) VALUES(?,?,?) ON CONFLICT DO NOTHING').bind(input.id,actor.email,Date.now()).run();return Response.json({ok:true})}
 if(input.action!=='publish'||actor.role!=='Administratör')return error('Behörighet saknas',403);
 const body=typeof input.body==='string'?input.body.trim():'';const selected=Array.isArray(input.roles)?input.roles:[];
 if(!body||body.length>4000||!selected.length||selected.length>roles.length||selected.some((r:unknown)=>!roles.includes(r as Role))||new Set(selected).size!==selected.length)return error('Ange text och välj mottagarnas roller',400);
 return databaseTransaction(async()=>{const id=crypto.randomUUID(),now=Date.now();await db.prepare('INSERT INTO site_notifications(id,body,roles,created_at,created_by) VALUES(?,?,?::jsonb,?,?)').bind(id,body,JSON.stringify(selected),now,actor.email).run();await panelLog(actor,'Notis publicerad',selected.join(', '));return Response.json({id})});
}
function handled(fn:(req:Request)=>Promise<Response>){return async(req:Request)=>{try{return await fn(req)}catch{return error('Notiserna kunde inte läsas eller sparas. Kör databasuppdatering 0029.',503)}}}
export const GET=secureApi('/api/notifications',handled(get));
export const POST=secureApi('/api/notifications',handled(post));
