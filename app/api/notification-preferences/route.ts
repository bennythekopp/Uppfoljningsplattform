import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {PanelError,panelBody} from '../../panel-server';
import {notificationSettings,pushConfiguration} from '../../planning-notifications-server';
import {validPushEndpoint} from '../../../lib/planning-push';
export const dynamic='force-dynamic';
async function get(){const user=(await currentUser())!,pref=await db.prepare('SELECT web_enabled AS webEnabled FROM planning_notification_preferences WHERE user_email=?').bind(user.email).first<{webEnabled:boolean}>(),settings=await notificationSettings(),config=pushConfiguration();return Response.json({webEnabled:pref?.webEnabled!==false,systemEnabled:settings.enabled,horizon:settings.horizon,pushConfigured:config.configured,publicKey:config.configured?config.publicKey:''})}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,14000);
 if(b.channel==='web'&&typeof b.enabled==='boolean'){
  if(u.sessionScope==='planning')throw new PanelError('Ändra webbnotiser på hemsidan.',403);
  await db.prepare('INSERT INTO planning_notification_preferences(user_email,web_enabled) VALUES(?,?) ON CONFLICT(user_email) DO UPDATE SET web_enabled=EXCLUDED.web_enabled').bind(u.email,b.enabled).run();return Response.json({ok:true});
 }
 if(b.channel!=='push'||typeof b.enabled!=='boolean'||!validPushEndpoint(b.subscription?.endpoint))throw new PanelError('Kontrollera notisinställningen.');
 const s=b.subscription;
 if(!b.enabled){await databaseTransaction(async()=>{await db.prepare('UPDATE planning_push_subscriptions SET enabled=false,updated_at=? WHERE user_email=? AND endpoint=?').bind(Date.now(),u.email,s.endpoint).run();await db.prepare("UPDATE planning_push_outbox SET sent_at=?,last_error='Avaktiverat på enheten' WHERE sent_at IS NULL AND subscription_id IN (SELECT id FROM planning_push_subscriptions WHERE user_email=? AND endpoint=?)").bind(Date.now(),u.email,s.endpoint).run()});return Response.json({ok:true})}
 if(!pushConfiguration().configured)throw new PanelError('Telefonnotiser är inte konfigurerade ännu.',409);
 if(typeof s.keys?.p256dh!=='string'||!/^[-_A-Za-z0-9]{87}=?$/.test(s.keys.p256dh)||typeof s.keys?.auth!=='string'||!/^[-_A-Za-z0-9]{22}={0,2}$/.test(s.keys.auth))throw new PanelError('Telefonens notisprenumeration är ogiltig.');
 await databaseTransaction(async()=>{
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('push-subscriptions:'+u.email).first();
  const current=await db.prepare('SELECT user_email AS userEmail FROM planning_push_subscriptions WHERE endpoint=?').bind(s.endpoint).first<{userEmail:string}>();const count=Number((await db.prepare('SELECT count(*) AS count FROM planning_push_subscriptions WHERE user_email=? AND enabled=true').bind(u.email).first<{count:number}>())?.count||0);if(current?.userEmail!==u.email&&count>=20)throw new PanelError('Högst 20 telefoner kan ha notiser aktiverade. Avaktivera på en annan enhet först.',400);
  // Switching accounts on a shared phone never leaks the previous owner's schedule.
  await db.prepare("UPDATE planning_push_outbox SET sent_at=?,last_error='Enheten har bytt konto' WHERE sent_at IS NULL AND subscription_id IN (SELECT id FROM planning_push_subscriptions WHERE endpoint=? AND user_email<>?)").bind(Date.now(),s.endpoint,u.email).run();
  await db.prepare('INSERT INTO planning_push_subscriptions(id,user_email,endpoint,p256dh,auth,enabled,created_at,updated_at) VALUES(?,?,?,?,?,true,?,?) ON CONFLICT(endpoint) DO UPDATE SET user_email=EXCLUDED.user_email,p256dh=EXCLUDED.p256dh,auth=EXCLUDED.auth,enabled=true,updated_at=EXCLUDED.updated_at').bind(crypto.randomUUID(),u.email,s.endpoint,s.keys.p256dh,s.keys.auth,Date.now(),Date.now()).run();
 });return Response.json({ok:true});
}
async function check(req:Request){const user=(await currentUser())!,url=new URL(req.url),endpoint=url.searchParams.get('endpoint');if(!endpoint)return get();const sub=await db.prepare('SELECT enabled FROM planning_push_subscriptions WHERE endpoint=? AND user_email=?').bind(endpoint,user.email).first<{enabled:boolean}>();return Response.json({enabled:sub?.enabled===true})}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Notisinställningarna kunde inte läsas eller sparas. Kontrollera databasuppdatering 0045.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/notification-preferences',handle(check));export const POST=secureApi('/api/notification-preferences',handle(post));
