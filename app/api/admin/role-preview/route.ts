import {cookies} from 'next/headers';
import {currentAccount,currentUser,error,sha256} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {peopleVisibility} from '../../../people-visibility';
import {secureApi} from '../../../api-security';
export const dynamic='force-dynamic';
async function preview(req:Request){try{
 const actor=await currentAccount();if(actor?.role!=='Administratör')return error('Endast administratörer kan förhandsgranska användare.',403);
 const body=await req.json(),hasUser=Object.hasOwn(body,'userEmail');
 const userEmail=hasUser?body.userEmail:null,role=hasUser?null:body.role;
 if(hasUser?(userEmail!==null&&(typeof userEmail!=='string'||!userEmail||userEmail.length>320)):(role!==null&&!['Handledare','Instruktör','Chef'].includes(role)))return error('Välj en användare att förhandsgranska.',400);
 const token=(await cookies()).get('tc_session')?.value;if(!token)return error('Inloggningen har gått ut.',401);
 const result=await databaseTransaction(async()=>{
  const target=userEmail?await db.prepare('SELECT email,name,role FROM users WHERE email=? AND disabled_at IS NULL AND login_blocked_at IS NULL FOR SHARE').bind(userEmail).first<{email:string,name:string,role:string}>():null;
  if(userEmail&&!target)return 'missing';
  const changed=await db.prepare("UPDATE sessions SET preview_role=?,preview_user_email=? WHERE token_hash=? AND user_email=? AND EXISTS(SELECT 1 FROM users WHERE email=? AND role='Administratör' AND disabled_at IS NULL AND login_blocked_at IS NULL)").bind(role,userEmail,await sha256(token),actor.email,actor.email).run();
  if(!changed.meta.changes)return 'expired';
  await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),actor.email,actor.name,actor.role,userEmail||role?'Förhandsvisning startad':'Förhandsvisning avslutad','Förhandsvisning',target?target.name+' · '+target.email:role||'Administratör').run();return 'ok';
 });
 if(result==='missing')return error('Användaren saknas eller är spärrad.',404);
 if(result!=='ok')return error('Inloggningen har gått ut.',401);
 const user=await currentUser();return user?Response.json({...user,peopleVisibility:await peopleVisibility(user)}):error('Förhandsvisningen kunde inte öppnas.',409);
}catch{return error('Förhandsvisningen kunde inte ändras. Kontrollera databasuppdatering 0046.',503)}}
export const POST=secureApi('/api/admin/role-preview',preview);
