import { isIP } from 'node:net';
import { db } from './database';
import { sha256 } from './auth';
const WINDOW_MS=15*60*1000;
export function loginIP(req:Request){
 // Netlify overwrites this connection header. Never trust X-Forwarded-For.
 const ip=(process.env.NETLIFY==='true'||!!process.env.NETLIFY_DB_URL||!!process.env.SITE_ID)?req.headers.get('x-nf-client-connection-ip'):null;
 return ip&&isIP(ip)?ip:'unknown';
}
async function reserve(key:string,limit:number,now:number){
 const row=await db.prepare(`INSERT INTO auth_rate_limits(key,count,reset_at) VALUES(?,1,?)
 ON CONFLICT(key) DO UPDATE SET
 count=CASE WHEN auth_rate_limits.reset_at<=? THEN 1 ELSE LEAST(auth_rate_limits.count+1,1000000) END,
 reset_at=CASE WHEN auth_rate_limits.reset_at<=? THEN excluded.reset_at ELSE auth_rate_limits.reset_at END
 RETURNING count,reset_at`).bind(key,now+WINDOW_MS,now,now).first<{count:number,reset_at:number}>();
 return row&&row.count<=limit?0:Math.max(1,Math.ceil(((row?.reset_at||now+WINDOW_MS)-now)/1000));
}
export async function reserveLogin(req:Request,username:string){
 const now=Date.now();
 await db.prepare('DELETE FROM auth_rate_limits WHERE reset_at<=?').bind(now).run();
 const accountKey='account:'+await sha256(username),ipKey='ip:'+await sha256(loginIP(req));
 // Count every attempt before password hashing, atomically even across functions.
 const ipRetry=await reserve(ipKey,60,now);
 if(ipRetry)return {retry:ipRetry,accountKey};
 const accountRetry=await reserve(accountKey,7,now);
 return {retry:accountRetry,accountKey};
}
export async function clearLoginAccount(key:string){await db.prepare('DELETE FROM auth_rate_limits WHERE key=?').bind(key).run()}
export async function cleanAuthState(){const now=Date.now();await db.prepare('DELETE FROM auth_rate_limits WHERE reset_at<=?').bind(now).run();await db.prepare('DELETE FROM sessions WHERE expires_at<=? OR last_activity_at<=?').bind(now,now-30*60*1000).run()}
