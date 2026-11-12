import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {currentUser} from '../../auth';
import {requireModule} from '../../module-access';
import {secureApi} from '../../api-security';

export const dynamic = 'force-dynamic';

export const GET = secureApi('/api/planning-guide', async request => {
 const user = await currentUser();
 if (!user) return new Response(null,{status:403});
 try { await requireModule(user,'planning'); }
 catch (error) {
  if ((error as {status?:number}).status === 403) return new Response(null,{status:403});
  throw error;
 }
 const params=new URL(request.url).searchParams;if(params.has('manifest'))return Response.json(JSON.parse(await readFile(join(process.cwd(),'app/private-guides/pages/manifest.json'),'utf8')));if(params.has('page')){const manifest=JSON.parse(await readFile(join(process.cwd(),'app/private-guides/pages/manifest.json'),'utf8')),page=Number(params.get('page'));if(!Number.isInteger(page)||page<1||page>manifest.pages)return new Response(null,{status:404});return new Response(new Uint8Array(await readFile(join(process.cwd(),'app/private-guides/pages/page-'+String(page).padStart(String(manifest.pages).length,'0')+'.jpg'))),{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=300'}})}
 const thumbnail = new URL(request.url).searchParams.get('preview') === '1';
 const bytes = await readFile(join(process.cwd(),'app/private-guides',thumbnail?'planning.png':'planning.pdf'));
 return new Response(new Uint8Array(bytes),{headers:{
  'Content-Type':thumbnail?'image/png':'application/pdf',
  'Content-Disposition':thumbnail?'inline':(params.has('download')?'attachment':'inline')+'; filename="Nya-planeringsarket.pdf"',
  'X-Content-Type-Options':'nosniff',
 }});
});
