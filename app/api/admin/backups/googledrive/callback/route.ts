import {randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {secureApi} from '../../../../../api-security';
import {currentUser,error} from '../../../../../auth';
import {backupPool} from '../../../../../../lib/backup/db';
import {finishConnection} from '../../../../../../lib/backup/oauth';
import {googleDriveConfig} from '../../../../../../lib/backup/googledrive';
export const dynamic='force-dynamic';
async function post(req:Request){const u=(await currentUser())!;if(u.previewRole)return error('Förhandsvisningen är skrivskyddad.',403);const session=(await cookies()).get('tc_session')?.value;if(!session)return error('Logga in igen och anslut GoogleDrive på nytt.',403);const cfg=googleDriveConfig();if(!cfg.configured)return error('Google Drive är inte konfigurerat.',503);const query=await req.formData();let status='failed';if(query.get('error')==='access_denied')status='cancelled';else{const c=await backupPool().connect();try{await finishConnection(c,u.email,session,String(query.get('state')||''),String(query.get('code')||''));await c.query('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),Date.now(),u.email,u.name,u.role,'Google Drive ansluten','Reservkopior','Google-konto']);status='connected'}catch{status='failed'}finally{c.release()}}return new Response(null,{status:303,headers:{Location:cfg.origin+'/?backupConnection='+status,'Referrer-Policy':'no-referrer'}});}
// A cross-site OAuth return does not carry the SameSite=Strict session.
// Render a same-origin document first, then submit to the protected POST.
// This GET neither reads protected data nor consumes the pending OAuth state.
async function get(req:Request){
 const query=new URL(req.url).searchParams;
 const state=query.get('state')||'',code=query.get('code')||'',oauthError=query.get('error')||'';
 if(!/^[a-f0-9]{64}$/.test(state)||code.length>20000||oauthError.length>200||(!code&&!oauthError))return error('Ogiltigt Google-svar. Starta anslutningen igen från Säkerhetskopiering.',400);
 const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 // no-referrer would turn the native form POST's Origin into null.
 // strict-origin preserves Origin without disclosing the callback query.
 const nonce=randomBytes(24).toString('base64');
 const html=`<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="referrer" content="strict-origin"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ansluter Google Drive – TC Boden</title><body><main><h1>Ansluter Google Drive</h1><p>Slutför anslutningen med ditt inloggade administratörskonto.</p><form id="google-return" method="post" action="/api/admin/backups/googledrive/callback"><input type="hidden" name="state" value="${escape(state)}"><input type="hidden" name="code" value="${escape(code)}"><input type="hidden" name="error" value="${escape(oauthError)}"><button type="submit">Fortsätt</button></form></main><script nonce="${nonce}">history.replaceState(null,'','/api/admin/backups/googledrive/callback');document.getElementById('google-return').submit();</script></body></html>`;
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'strict-origin','X-Frame-Options':'DENY','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`}});
}
export const GET=secureApi('/api/admin/backups/googledrive/callback',get);
export const POST=secureApi('/api/admin/backups/googledrive/callback',post);
