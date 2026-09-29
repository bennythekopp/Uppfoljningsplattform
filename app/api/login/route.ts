import { db } from '../../database';
import { cookies } from 'next/headers';
import { error,passwordHash,randomToken,sha256 } from '../../auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const {username,password}=await req.json() as {username:unknown,password:unknown};if(typeof username!=='string'||typeof password!=='string'||username.length>80||password.length>200)return error('Fel användarnamn eller lösenord',401);
 const normalized=username.trim().toLowerCase();const row=await db.prepare('SELECT email,name,role,password_hash AS hash,password_salt AS salt FROM users WHERE username=? AND disabled_at IS NULL').bind(normalized).first<{email:string,name:string,role:string,hash:string|null,salt:string|null}>();
 const attempts=await db.prepare('SELECT count,until FROM login_attempts WHERE username=?').bind(normalized).first<{count:number,until:number}>();if(attempts&&attempts.count>=7&&attempts.until>Date.now())return error('För många försök. Försök igen senare.',429);
 const hash=await passwordHash(password,row?.salt||'00000000000000000000000000000000');if(!row?.hash||!row.salt||hash!==row.hash){const count=(attempts?.until||0)>Date.now()?(attempts!.count+1):1;await db.prepare('INSERT INTO login_attempts(username,count,until) VALUES(?,?,?) ON CONFLICT(username) DO UPDATE SET count=excluded.count,until=excluded.until').bind(normalized,count,Date.now()+15*60*1000).run();return error('Fel användarnamn eller lösenord',401)}
 await db.prepare('DELETE FROM login_attempts WHERE username=?').bind(normalized).run();const token=randomToken();await db.prepare('INSERT INTO sessions(token_hash,user_email,expires_at) VALUES(?,?,?)').bind(await sha256(token),row.email,Date.now()+7*86400000).run();(await cookies()).set('tc_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:7*86400});return Response.json({name:row.name,role:row.role});
 }catch{return error('Inloggningen kunde inte slutföras',503)}}
