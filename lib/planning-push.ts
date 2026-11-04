import webpush from 'web-push';
import type {NotificationHorizon} from '../app/planning-notification-types';
export interface PushResult{first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<unknown>}
export interface PushStatement extends PushResult{bind(...values:unknown[]):PushResult}
export interface PushDatabase{prepare(sql:string):PushStatement}
export function pushConfiguration(){const publicKey=process.env.PLANNING_PUSH_PUBLIC_KEY||'',privateKey=process.env.PLANNING_PUSH_PRIVATE_KEY||'',subject=process.env.PLANNING_PUSH_SUBJECT||'';return {publicKey,privateKey,subject,configured:/^[A-Za-z0-9_-]{87}$/.test(publicKey)&&/^[A-Za-z0-9_-]{43}$/.test(privateKey)&&/^(mailto:|https:\/\/)/.test(subject)}}
import {notificationRange} from '../app/planning-notification-types';
export function validPushEndpoint(value:unknown){
 if(typeof value!=='string'||value.length>4096)return false;
 try{const u=new URL(value),h=u.hostname.toLowerCase();return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&(h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h.endsWith('.push.services.mozilla.com')||h==='web.push.apple.com'||h.endsWith('.push.apple.com')||h.endsWith('.notify.windows.com'))}catch{return false}
}
/** Bounded, leased outbox; only explicitly subscribed devices are contacted. */
export async function runPlanningPush(db:PushDatabase){
 const config=pushConfiguration();if(!config.configured)return null;

  const lock=await db.prepare("SELECT pg_try_advisory_xact_lock(hashtextextended('planning-push-delivery',0)) AS locked").first<{locked:boolean}>();if(!lock?.locked)return Date.now()+60000;
  const settings=(await db.prepare('SELECT enabled,horizon FROM planning_notification_settings WHERE id=1').first<{enabled:boolean,horizon:NotificationHorizon}>())!,range=notificationRange(settings.horizon);const rules=await db.prepare("SELECT restricted,user_emails AS userEmails FROM panel_module_access WHERE kind='planning'").first<{restricted:boolean,userEmails:string[]}>();const eligible=new Set((await db.prepare("SELECT email,role FROM users WHERE disabled_at IS NULL AND login_blocked_at IS NULL AND role IN ('Administratör','Instruktör','Chef')").all<{email:string,role:string}>()).results.filter(u=>u.role==='Administratör'||rules&&(!rules.restricted||rules.userEmails.includes(u.email))).map(u=>u.email));
  const rows=(await db.prepare('SELECT o.id,o.event_key AS eventKey,o.payload,o.attempts,o.created_at AS createdAt,s.id AS subscriptionId,s.user_email AS userEmail,s.endpoint,s.p256dh,s.auth,s.enabled FROM planning_push_outbox o JOIN planning_push_subscriptions s ON s.id=o.subscription_id WHERE o.sent_at IS NULL AND o.available_at<=? ORDER BY o.created_at,o.id LIMIT 3 FOR UPDATE OF o SKIP LOCKED').bind(Date.now()).all<any>()).results;
  for(const row of rows){
   const now=Date.now();
   if(!settings.enabled||!row.enabled||!eligible.has(row.userEmail)||row.payload.day<range.start||row.payload.day>=range.end||now-row.createdAt>86400000||!validPushEndpoint(row.endpoint)){
    await db.prepare("UPDATE planning_push_outbox SET sent_at=?,last_error='Ej längre aktuellt' WHERE id=?").bind(now,row.id).run();continue;
   }
   try{
    const notification={title:row.payload.title,body:row.payload.day+'\n'+row.payload.body,tag:row.eventKey,day:row.payload.day,columnId:row.payload.columnId,owner:row.userEmail};while(Buffer.byteLength(JSON.stringify(notification),'utf8')>3800&&notification.body.length>20)notification.body=notification.body.slice(0,-40);
    // No credentials, session tokens or arbitrary target URLs in the payload.
    await webpush.sendNotification({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}},JSON.stringify(notification),{vapidDetails:{subject:config.subject,publicKey:config.publicKey,privateKey:config.privateKey},TTL:86400,timeout:5000,urgency:'normal'});
    await db.prepare("UPDATE planning_push_outbox SET sent_at=?,attempts=attempts+1,last_error='' WHERE id=?").bind(now,row.id).run();
   }catch(e){const code=Number((e as {statusCode?:number}).statusCode||0),terminal=code===404||code===410||row.attempts>=4;
    if(code===404||code===410)await db.prepare('UPDATE planning_push_subscriptions SET enabled=false,updated_at=? WHERE id=?').bind(now,row.subscriptionId).run();
    await db.prepare('UPDATE planning_push_outbox SET attempts=attempts+1,available_at=?,sent_at=?,last_error=? WHERE id=?').bind(now+Math.min(3600000,60000*2**row.attempts),terminal?now:null,code?'Push svarade '+code:'Leverans misslyckades',row.id).run();
   }
  }
  return (await db.prepare('SELECT min(available_at) AS next FROM planning_push_outbox WHERE sent_at IS NULL').first<{next:number|null}>())?.next??null;

}
