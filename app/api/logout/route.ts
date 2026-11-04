import {currentUser} from '../../auth';
import {secureApi} from '../../api-security';
import {auditMutation} from '../../activity-log';
import { db } from '../../database';
import { cookies } from 'next/headers';
import { sha256,sessionCookieName,readSessionToken } from '../../auth';
export const dynamic='force-dynamic';
async function POSTHandler(req:Request){const user=await currentUser(),body=await req.json().catch(()=>null);if(user&&typeof body?.pushEndpoint==='string')await db.prepare('UPDATE planning_push_subscriptions SET enabled=false,updated_at=? WHERE user_email=? AND endpoint=?').bind(Date.now(),user.email,body.pushEndpoint).run();const c=await cookies(),token=await readSessionToken();if(token)await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();c.delete(await sessionCookieName());return Response.json({ok:true})}

const POSTEndpoint=(req:Request)=>auditMutation(req,()=>POSTHandler(req),'Utloggning');

export const POST=secureApi('/api/logout',POSTEndpoint);
