import {cookies} from 'next/headers';
import {secureApi} from '../../../../api-security';
import {currentUser,error} from '../../../../auth';
import {backupPool} from '../../../../../lib/backup/db';
import {startConnection,disconnectConnection} from '../../../../../lib/backup/oauth';
export const dynamic='force-dynamic';
async function post(req:Request){const u=(await currentUser())!;if(u.previewRole)return error('Avsluta förhandsvisningen innan du ändrar anslutning.',403);const b=await req.json().catch(()=>({}));if(!['connect','disconnect'].includes(b.action))return error('Okänd åtgärd.',400);const session=(await cookies()).get('tc_session')?.value;if(!session)return error('Logga in igen.',403);const c=await backupPool().connect();try{let url:string|undefined;if(b.action==='connect')url=await startConnection(c,u.email,session);else await disconnectConnection(c);await c.query('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),Date.now(),u.email,u.name,u.role,b.action==='connect'?'Google Drive-anslutning påbörjad':'Google Drive frånkopplad','Reservkopior','Privat Google Drive']);return Response.json({ok:true,url})}catch{return error('Google Drive-anslutningen kunde inte ändras. Kontrollera miljövariablerna och migrering 0038.',503)}finally{c.release()}}
export const POST=secureApi('/api/admin/backups/googledrive',post);
