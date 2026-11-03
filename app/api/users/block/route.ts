import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {PanelError} from '../../../panel-server';
export const dynamic='force-dynamic';
async function post(req:Request){try{
 const actor=await currentUser();if(actor?.role!=='Administratör')return error('Behörighet saknas',403);
 const {email,blocked}=await req.json();if(typeof email!=='string'||email.length>320||typeof blocked!=='boolean')return error('Ogiltig användare',400);
 if(email===actor.email)return error('Du kan inte spärra ditt eget konto.',400);
 return await databaseTransaction(async()=>{
 const user=await db.prepare('SELECT email,name,login_blocked_at AS blockedAt FROM users WHERE email=? AND disabled_at IS NULL FOR UPDATE').bind(email).first<{email:string,name:string,blockedAt:number|null}>();
 if(!user)throw new PanelError('Användaren finns inte',404);
 const blockedAt=blocked?(user.blockedAt||Date.now()):null;
 await db.prepare('UPDATE users SET login_blocked_at=? WHERE email=?').bind(blockedAt,email).run();
 if(blocked)await db.prepare('DELETE FROM sessions WHERE user_email=?').bind(email).run();
 await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),actor.email,actor.name,actor.role,blocked?'Användare spärrad':'Användare upplåst','Användare',user.name).run();
 return Response.json({email,blockedAt});
 });
 }catch(e){return error(e instanceof PanelError?e.message:'Kunde inte ändra kontospärren',e instanceof PanelError?e.status:503)}}
export const POST=secureApi('/api/users/block',post);
