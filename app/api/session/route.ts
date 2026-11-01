import {secureApi} from '../../api-security';
import { cookies } from 'next/headers';
import { db } from '../../database';
import { error,sha256,readSessionToken } from '../../auth';

export const dynamic='force-dynamic';
async function session(touch:boolean){
 const token=await readSessionToken();
 if(!token||!/^[a-f0-9]{64}$/.test(token))return error('Inloggningen har gått ut',401);
 const now=Date.now(),hash=await sha256(token);
 const row=await db.prepare(`SELECT s.expires_at FROM sessions s JOIN users u ON u.email=s.user_email WHERE s.token_hash=? AND s.expires_at>? AND u.disabled_at IS NULL`).bind(hash,now).first<{expires_at:number}>();
 if(!row)return error('Inloggningen har gått ut',401);
 return Response.json({expiresAt:row.expires_at,idleExpiresAt:row.expires_at},{headers:{'Cache-Control':'no-store'}});
}
async function GETEndpoint(){try{return await session(false)}catch{return error('Kunde inte kontrollera inloggningen',503)}}
async function POSTEndpoint(req:Request){try{
 // The activity heartbeat requires same-origin JSON requests.
 if(req.headers.get('sec-fetch-site')==='cross-site'||!req.headers.get('content-type')?.startsWith('application/json'))return error('Ogiltig begäran',403);
 return await session(true);
}catch{return error('Kunde inte förlänga inloggningen',503)}}

export const GET=secureApi('/api/session',GETEndpoint);
export const POST=secureApi('/api/session',POSTEndpoint);
