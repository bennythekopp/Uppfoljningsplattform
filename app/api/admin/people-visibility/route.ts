import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {db,databaseTransaction} from '../../../database';
import {panelBody,PanelError,panelLog} from '../../../panel-server';
export const dynamic='force-dynamic';
async function get(){return Response.json({users:(await db.prepare("SELECT u.email,u.name,u.role,COALESCE(v.students,true) AS students,COALESCE(v.personnel,true) AS personnel,COALESCE(v.revision,0) AS revision FROM users u LEFT JOIN people_visibility v ON v.user_email=u.email WHERE u.disabled_at IS NULL ORDER BY lower(u.name),u.email").all()).results})}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,300000);
 if(!Array.isArray(b.users)||b.users.length>1000||new Set(b.users.map((v:any)=>v?.email)).size!==b.users.length||b.users.some((v:any)=>typeof v?.email!=='string'||typeof v.students!=='boolean'||typeof v.personnel!=='boolean'||!Number.isInteger(v.revision)||v.revision<0))throw new PanelError('Kontrollera personernas synlighet.');
 return databaseTransaction(async()=>{
  for(const v of [...b.users].sort((a:any,b:any)=>a.email.localeCompare(b.email))){
   await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('people-visibility:'+v.email).first();
   const person=await db.prepare('SELECT role FROM users WHERE email=? AND disabled_at IS NULL').bind(v.email).first<{role:string}>();if(!person)throw new PanelError('En användare finns inte längre.',409);
   if(person.role==='Administratör'&&(!v.students||!v.personnel))throw new PanelError('Administratörer behåller åtkomst.',400);
   const old=await db.prepare('SELECT revision FROM people_visibility WHERE user_email=? FOR UPDATE').bind(v.email).first<{revision:number}>();if((old?.revision||0)!==v.revision)throw new PanelError('Synligheten har ändrats. Läs in igen.',409);
   await db.prepare('INSERT INTO people_visibility(user_email,students,personnel,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(user_email) DO UPDATE SET students=EXCLUDED.students,personnel=EXCLUDED.personnel,revision=people_visibility.revision+1,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(v.email,v.students,v.personnel,Date.now(),u.email).run();
  }
  await panelLog(u,'Synlighet för Elever och Personal ändrad',b.users.map((v:any)=>v.email+' · Elever '+v.students+' · Personal '+v.personnel).join('; '));return Response.json({ok:true});
 });
}
const handle=(f:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await f(r)}catch(e){return error(e instanceof PanelError?e.message:'Synligheten kunde inte sparas. Kontrollera databasuppdatering 0045.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/admin/people-visibility',handle(get));export const POST=secureApi('/api/admin/people-visibility',handle(post));
