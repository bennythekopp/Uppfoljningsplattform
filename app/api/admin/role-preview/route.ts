import {cookies} from 'next/headers';
import {currentAccount,currentUser,error,sha256} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {secureApi} from '../../../api-security';
export const dynamic='force-dynamic';
async function preview(req:Request){try{
 const actor=await currentAccount();if(actor?.role!=='Administratör')return error('Endast administratörer kan förhandsgranska roller.',403);
 const {role}=await req.json();if(role!==null&&!['Handledare','Instruktör','Chef'].includes(role))return error('Välj en roll att förhandsgranska.',400);
 const token=(await cookies()).get('tc_session')?.value;if(!token)return error('Inloggningen har gått ut.',401);
 const updated=await databaseTransaction(async()=>{
  const result=await db.prepare("UPDATE sessions SET preview_role=? WHERE token_hash=? AND user_email=? AND EXISTS(SELECT 1 FROM users WHERE email=? AND role='Administratör' AND disabled_at IS NULL)").bind(role,await sha256(token),actor.email,actor.email).run();
  if(!result.meta.changes)return false;
  await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),actor.email,actor.name,actor.role,role?'Rollförhandsvisning startad':'Rollförhandsvisning avslutad','Rollförhandsvisning',role||'Administratör').run();return true;
 });
 if(!updated)return error('Inloggningen har gått ut.',401);
 return Response.json(await currentUser());
}catch{return error('Förhandsvisningen kunde inte ändras. Kontrollera databasuppdatering 0021.',503)}}
export const POST=secureApi('/api/admin/role-preview',preview);
