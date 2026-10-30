import {secureApi} from '../../../api-security';
import {currentUser,error,type Role} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {panelLog} from '../../../panel-server';
export const dynamic='force-dynamic';
const roles:Role[]=['Administratör','Instruktör','Handledare','Chef'];
async function get(req:Request){
 const id=new URL(req.url).searchParams.get('readers');
 if(id){
  const notice=await db.prepare('SELECT id FROM site_notifications WHERE id=?').bind(id).first();if(!notice)return error('Notisen finns inte.',404);
  const {results}=await db.prepare('SELECT r.user_email AS userEmail,COALESCE(u.name,r.user_email) AS name,r.read_at AS readAt FROM site_notification_reads r LEFT JOIN users u ON u.email=r.user_email WHERE r.notification_id=? ORDER BY r.read_at DESC,r.user_email').bind(id).all();
  return Response.json({readers:results});
 }
 const {results}=await db.prepare('SELECT n.id,n.title,n.body,n.roles,n.created_at AS createdAt,n.starts_at AS startsAt,n.expires_at AS expiresAt,n.revision,(SELECT count(*) FROM site_notification_reads r WHERE r.notification_id=n.id) AS readCount FROM site_notifications n ORDER BY n.created_at DESC,n.id DESC').all();return Response.json({notices:results});
}
async function post(req:Request){
 const actor=(await currentUser())!,b=await req.json().catch(()=>null);if(!b||!['publish','update','delete'].includes(b.action))return error('Okänd notisåtgärd.',400);
 if(b.action!=='publish'&&(typeof b.id!=='string'||!b.id||b.id.length>120||!Number.isSafeInteger(b.revision)||b.revision<1))return error('Välj en giltig notis.',400);
 const title=typeof b.title==='string'?b.title.trim():'',body=typeof b.body==='string'?b.body.trim():'',selected=b.roles;
 if(b.action!=='delete'){
  if(title.length>160||!body||body.length>4000||!Array.isArray(selected)||!selected.length||selected.length>roles.length||new Set(selected).size!==selected.length||selected.some((r:unknown)=>!roles.includes(r as Role)))return error('Ange meddelande och välj mottagarnas roller.',400);
  if(!Number.isSafeInteger(b.startsAt)||b.startsAt<0||b.startsAt>8640000000000000||b.expiresAt!==null&&(!Number.isSafeInteger(b.expiresAt)||b.expiresAt<=b.startsAt||b.expiresAt>8640000000000000))return error('Ange en giltig synlighetsperiod. Sluttiden måste ligga efter starttiden.',400);
 }
 return databaseTransaction(async()=>{
  if(b.action==='publish'){
   const id=crypto.randomUUID();await db.prepare('INSERT INTO site_notifications(id,title,body,roles,created_at,created_by,starts_at,expires_at) VALUES(?,?,?,?::jsonb,?,?,?,?)').bind(id,title,body,JSON.stringify(selected),Date.now(),actor.email,b.startsAt,b.expiresAt).run();await panelLog(actor,'Notis publicerad',title||body.slice(0,100));return Response.json({id});
  }
  const old=await db.prepare('SELECT title,body,roles,revision FROM site_notifications WHERE id=? FOR UPDATE').bind(b.id).first<{title:string,body:string,roles:Role[],revision:number}>();
  if(!old)return error('Notisen finns inte längre.',404);if(old.revision!==b.revision)return error('Notisen har ändrats av någon annan. Läs in listan igen.',409);
  if(b.action==='delete'){await db.prepare('DELETE FROM site_notifications WHERE id=?').bind(b.id).run();await panelLog(actor,'Notis borttagen',old.title||old.body.slice(0,100));}
  else{
   await db.prepare('UPDATE site_notifications SET title=?,body=?,roles=?::jsonb,starts_at=?,expires_at=?,revision=revision+1 WHERE id=?').bind(title,body,JSON.stringify(selected),b.startsAt,b.expiresAt,b.id).run();
   // Read receipts refer to the content that was actually read. Date-only edits retain them.
   if(title!==old.title||body!==old.body||JSON.stringify([...selected].sort())!==JSON.stringify([...old.roles].sort()))await db.prepare('DELETE FROM site_notification_reads WHERE notification_id=?').bind(b.id).run();
   await panelLog(actor,'Notis ändrad',title||body.slice(0,100));
  }
  return Response.json({ok:true});
 });
}
const handled=(fn:(req:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch{return error('Notisen kunde inte hanteras. Kontrollera databasuppdatering 0040.',503)}};
export const GET=secureApi('/api/admin/notifications',handled(get));
export const POST=secureApi('/api/admin/notifications',handled(post));
