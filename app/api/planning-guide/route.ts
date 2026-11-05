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
 const thumbnail = new URL(request.url).searchParams.get('preview') === '1';
 const bytes = await readFile(join(process.cwd(),'app/private-guides',thumbnail?'planning.png':'planning.pdf'));
 return new Response(new Uint8Array(bytes),{headers:{
  'Content-Type':thumbnail?'image/png':'application/pdf',
  'Content-Disposition':thumbnail?'inline':'inline; filename="Nya-planeringsarket.pdf"',
  'X-Content-Type-Options':'nosniff',
 }});
});
