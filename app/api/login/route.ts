import { db } from '../../database';
import { cookies } from 'next/headers';
import { error,passwordHash,verifyPassword,needsPasswordUpgrade,randomToken,sha256 } from '../../auth';
import { reserveLogin,clearLoginAccount,cleanAuthState } from '../../login-security';
import { SESSION_LIFETIME_MS,IDLE_TIMEOUT_MS } from '../../session-policy';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const {username,password}=await req.json() as {username:unknown,password:unknown};
 if(typeof username!=='string'||typeof password!=='string'||username.length>80||password.length>200)return error('Fel användarnamn eller lösenord',401);
 const normalized=username.trim().toLowerCase();
 const limit=await reserveLogin(req,normalized);
 if(limit.retry)return Response.json({error:'För många försök. Försök igen om en stund.'},{status:429,headers:{'Retry-After':String(limit.retry)}});
 const row=await db.prepare('SELECT email,name,role,password_hash AS hash,password_salt AS salt FROM users WHERE username=? AND disabled_at IS NULL').bind(normalized).first<{email:string,name:string,role:string,hash:string|null,salt:string|null}>();
 const valid=row?.hash&&row.salt?await verifyPassword(password,row.salt,row.hash):false;
 if(!row?.hash||!row.salt){await passwordHash(password,'00000000000000000000000000000000')}
 if(!valid||!row)return error('Fel användarnamn eller lösenord',401);
 let verifiedHash=row.hash!;
 if(needsPasswordUpgrade(verifiedHash)){
  const salt=randomToken(),hash=await passwordHash(password,salt);
  // Do not overwrite a concurrent password change.
  const updated=await db.prepare('UPDATE users SET password_hash=?,password_salt=? WHERE email=? AND password_hash=? AND disabled_at IS NULL').bind(hash,salt,row.email,row.hash).run();
  if(!updated.meta.changes)return error('Logga in igen',401);
  verifiedHash=hash;
 }
 await clearLoginAccount(limit.accountKey);await cleanAuthState();
 const token=randomToken(),now=Date.now(),expiresAt=now+SESSION_LIFETIME_MS;
 // Recheck user/password to prevent a session being created after account revocation.
 const inserted=await db.prepare('INSERT INTO sessions(token_hash,user_email,expires_at,last_activity_at) SELECT ?,email,?,? FROM users WHERE email=? AND disabled_at IS NULL AND password_hash=?').bind(await sha256(token),expiresAt,now,row.email,verifiedHash).run();
 if(!inserted.meta.changes)return error('Logga in igen',401);
 (await cookies()).set('tc_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:SESSION_LIFETIME_MS/1000});
 return Response.json({name:row.name,role:row.role,idleExpiresAt:now+IDLE_TIMEOUT_MS,expiresAt});
 }catch{return error('Inloggningen kunde inte slutföras',503)}}
