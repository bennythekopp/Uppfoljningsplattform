import {secureApi} from '../../../api-security';
import {currentUser,error,sha256} from '../../../auth';
import {PanelError,panelBody} from '../../../panel-server';
export const dynamic='force-dynamic';
const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
async function post(req:Request){
 try{
  const body=await panelBody(req,2048),email=typeof body?.recipientEmail==='string'?body.recipientEmail.trim():'';
  if(email.length>254||!/^\S+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||/[\r\n<>,;"\\]/.test(email))throw new PanelError('Ange en giltig mailadress för testutskicket.');
  if(typeof body.requestId!=='string'||!/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(body.requestId))throw new PanelError('Ladda om sidan och försök igen.');
  if(!process.env.RESEND_API_KEY||!process.env.PLANNING_MAIL_FROM)throw new PanelError('Mailtjänsten behöver konfigureras innan du kan testa utskick.',503);
  const origin=new URL(process.env.APP_ORIGIN||process.env.URL||'https://handledare.netlify.app');
  if(origin.protocol!=='https:'||origin.username||origin.password)throw new PanelError('Kontrollera APP_ORIGIN i Netlify.',503);
  const actor=(await currentUser())!,url=origin.origin+'/?view=planning';
  const text='Detta är ett testmail från TC Bodens planering.\n\nMailutskicket fungerar. Ordinarie utskick och sparade inställningar har inte ändrats.\n\nÖppna Planering: '+url;
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'planning-test-'+await sha256(actor.email+':'+body.requestId)},body:JSON.stringify({from:process.env.PLANNING_MAIL_FROM,to:[email],subject:'Testmail – TC Boden Planering',text,html:'<html lang="sv"><body style="font:16px Arial;color:#25292c"><h2>TC BODEN · Planering</h2><p>Detta är ett testmail från TC Bodens planering.</p><p>Mailutskicket fungerar. Ordinarie utskick och sparade inställningar har inte ändrats.</p><p><a href="'+escapeHtml(url)+'">Öppna Planering</a></p></body></html>'}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new PanelError('Mailtjänsten kunde inte skicka testmailet (status '+response.status+'). Kontrollera avsändaren och mailtjänstens inställningar.',502);
  const result=await response.json();if(typeof result.id!=='string'||!result.id)throw new PanelError('Mailtjänstens kvittens saknas. Kontrollera hos Resend innan du försöker igen.',502);
  return Response.json({ok:true,message:'Testmailet har skickats till '+email+'. Kontrollera även skräpposten.'});
 }catch(e){return error(e instanceof PanelError?e.message:'Testutskicket kunde inte bekräftas. Kontrollera hos Resend och försök igen.',e instanceof PanelError?e.status:502)}
}
export const POST=secureApi('/api/planning/test-mail',post);
