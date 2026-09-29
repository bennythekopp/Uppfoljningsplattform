import { cookies } from 'next/headers';
import { db } from '../../database';
import { currentUser,error,passwordHash,randomToken,sha256 } from '../../auth';
export const dynamic='force-dynamic';

export async function PUT(req:Request){try{
  const user=await currentUser();
  if(!user)return error('Du behöver logga in',401);
  const {currentPassword,newPassword}=await req.json() as {currentPassword:unknown,newPassword:unknown};
  if(typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<12||newPassword.length>200||currentPassword.length>200)return error('Det nya lösenordet måste vara 12–200 tecken',400);
  const row=await db.prepare('SELECT password_hash AS hash,password_salt AS salt FROM users WHERE email=? AND disabled_at IS NULL').bind(user.email).first<{hash:string,salt:string}>();
  if(!row?.hash||!row.salt||await passwordHash(currentPassword,row.salt)!==row.hash)return error('Nuvarande lösenord är fel',403);
  const salt=randomToken(),hash=await passwordHash(newPassword,salt);
  await db.prepare('UPDATE users SET password_hash=?,password_salt=? WHERE email=? AND disabled_at IS NULL').bind(hash,salt,user.email).run();
  const token=(await cookies()).get('tc_session')?.value;
  if(token)await db.prepare('DELETE FROM sessions WHERE user_email=? AND token_hash<>?').bind(user.email,await sha256(token)).run();
  return Response.json({ok:true});
}catch{return error('Kunde inte ändra lösenordet',503)}}
