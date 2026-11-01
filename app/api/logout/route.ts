import {secureApi} from '../../api-security';
import {auditMutation} from '../../activity-log';
import { db } from '../../database';
import { cookies } from 'next/headers';
import { sha256,sessionCookieName,readSessionToken } from '../../auth';
export const dynamic='force-dynamic';
async function POSTHandler(){const c=await cookies(),token=await readSessionToken();if(token)await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();c.delete(await sessionCookieName());return Response.json({ok:true})}

const POSTEndpoint=(req:Request)=>auditMutation(req,POSTHandler,'Utloggning');

export const POST=secureApi('/api/logout',POSTEndpoint);
