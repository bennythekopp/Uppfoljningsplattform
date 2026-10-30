import {cookies} from 'next/headers';
import {secureApi} from '../../../../../api-security';
import {currentUser,error} from '../../../../../auth';
import {backupPool} from '../../../../../../lib/backup/db';
import {finishConnection} from '../../../../../../lib/backup/oauth';
import {googleDriveConfig} from '../../../../../../lib/backup/googledrive';
export const dynamic='force-dynamic';
async function get(req:Request){const u=(await currentUser())!;if(u.previewRole)return error('Förhandsvisningen är skrivskyddad.',403);const session=(await cookies()).get('tc_session')?.value;if(!session)return error('Logga in igen och anslut GoogleDrive på nytt.',403);const cfg=googleDriveConfig();if(!cfg.configured)return error('Google Drive är inte konfigurerat.',503);const query=new URL(req.url).searchParams;let status='failed';if(query.get('error')==='access_denied')status='cancelled';else{const c=await backupPool().connect();try{await finishConnection(c,u.email,session,query.get('state')||'',query.get('code')||'');await c.query('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),Date.now(),u.email,u.name,u.role,'Google Drive ansluten','Reservkopior','Google-konto']);status='connected'}catch{status='failed'}finally{c.release()}}return new Response(null,{status:303,headers:{Location:cfg.origin+'/?backupConnection='+status,'Referrer-Policy':'no-referrer'}});}
export const GET=secureApi('/api/admin/backups/googledrive/callback',get);
