import { cookies } from 'next/headers';
import { db } from '../../database';
import { error,sha256 } from '../../auth';
import { IDLE_TIMEOUT_MS } from '../../session-policy';
export const dynamic='force-dynamic';
async function session(touch:boolean){
 const token=(await cookies()).get('tc_session')?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return error('Inloggningen har gått ut',401);
 const now=Date.now(),hash=await sha256(token);
 const row=touch?await db.prepare(`UPDATE sessions SET last_activity_at=? WHERE token_hash=? AND expires_at>? AND last_activity_at>? AND EXISTS(SELECT 1 FROM users WHERE users.email=sessions.user_email AND users.disabled_at IS NULL) RETURNING expires_at,last_activity_at`).bind(now,hash,now,now-IDLE_TIMEOUT_MS).first<{expires_at:number,last_activity_at:number}>():await db.prepare(`SELECT s.expires_at,s.last_activity_at FROM sessions s JOIN users u ON u.email=s.user_email WHERE s.token_hash=? AND s.expires_at>? AND s.last_activity_at>? AND u.disabled_at IS NULL`).bind(hash,now,now-IDLE_TIMEOUT_MS).first<{expires_at:number,last_activity_at:number}>();
 if(!row)return error('Inloggningen har gått ut',401);
 return Response.json({expiresAt:row.expires_at,idleExpiresAt:row.last_activity_at+IDLE_TIMEOUT_MS},{headers:{'Cache-Control':'no-store'}});
}
export async function GET(){try{return await session(false)}catch{return error('Kunde inte kontrollera inloggningen',503)}}
export async function POST(req:Request){try{
 // The activity heartbeat requires same-origin JSON requests.
 if(req.headers.get('sec-fetch-site')==='cross-site'||!req.headers.get('content-type')?.startsWith('application/json'))return error('Ogiltig begäran',403);
 return await session(true);
}catch{return error('Kunde inte förlänga inloggningen',503)}}
