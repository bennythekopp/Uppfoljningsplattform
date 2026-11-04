import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {PanelError,panelBody,panelLog} from '../../../panel-server';
import {notificationSettings,pushConfiguration} from '../../../planning-notifications-server';
import {notificationHorizons} from '../../../planning-notification-types';
export const dynamic='force-dynamic';
async function get(){const errors=(await db.prepare("SELECT count(*) AS count FROM planning_push_outbox WHERE sent_at IS NULL AND attempts>0").first<{count:number}>())?.count||0;return Response.json({...await notificationSettings(),pushConfigured:pushConfiguration().configured,retrying:Number(errors)})}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req);if(typeof b.enabled!=='boolean'||!Object.hasOwn(notificationHorizons,b.horizon)||!Number.isInteger(b.revision))throw new PanelError('Kontrollera notisinställningarna.');
 return databaseTransaction(async()=>{const row=await db.prepare('UPDATE planning_notification_settings SET enabled=?,horizon=?,revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(b.enabled,b.horizon,b.revision).first();if(!row)throw new PanelError('Inställningarna har ändrats. Läs in igen.',409);
 if(!b.enabled)await db.prepare("UPDATE planning_push_outbox SET sent_at=?,last_error='Avstängt av administratör' WHERE sent_at IS NULL").bind(Date.now()).run();
 await panelLog(u,'Notiser för schemaändringar ändrade',(b.enabled?'På':'Av')+' · '+b.horizon);return Response.json({ok:true});});
}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Notisinställningarna kunde inte sparas. Kontrollera databasuppdatering 0045.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/admin/planning-notifications',handle(get));export const POST=secureApi('/api/admin/planning-notifications',handle(post));
