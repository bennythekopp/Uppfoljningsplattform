import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {allowedModules,moduleAccessRules} from '../../module-access';
import {moduleNames,type ModuleKind} from '../../panel-types';
import {planningLog} from '../../planning-server';
import {PanelError,panelBody,panelLog,short} from '../../panel-server';
export const dynamic='force-dynamic';
async function get(){const u=(await currentUser())!;const allowed=await allowedModules(u);if(u.role!=='Administratör')return Response.json({allowed});return Response.json({allowed,rules:await moduleAccessRules(),users:(await db.prepare("SELECT email,name,role FROM users WHERE disabled_at IS NULL AND role IN ('Administratör','Instruktör','Chef') ORDER BY lower(name)").all()).results})}
async function post(req:Request){const u=(await currentUser())!;if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ändra synlighet.',403);const b=await panelBody(req),kind=short(b.kind) as ModuleKind;if(!Object.hasOwn(moduleNames,kind)||typeof b.restricted!=='boolean'||!Array.isArray(b.userEmails)||b.userEmails.length>1000||b.userEmails.some((v:unknown)=>typeof v!=='string')||new Set(b.userEmails).size!==b.userEmails.length)throw new PanelError('Kontrollera modul och användare.');
 const users=(await db.prepare("SELECT email,role FROM users WHERE disabled_at IS NULL AND role IN ('Instruktör','Chef')").all<{email:string,role:string}>()).results;
 if(b.userEmails.some((email:string)=>!users.some(v=>v.email===email&&(v.role==='Instruktör'||kind==='planning'))))throw new PanelError('Välj giltiga användare.');
 return databaseTransaction(async()=>{await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('module-access:'+kind).first();const old=await db.prepare('SELECT revision FROM panel_module_access WHERE kind=?').bind(kind).first<{revision:number}>();if((old?.revision||0)!==b.revision)throw new PanelError('Synligheten har ändrats. Läs in den igen.',409);
 await db.prepare('INSERT INTO panel_module_access(kind,restricted,user_emails,updated_at,updated_by) VALUES(?,?,?::jsonb,?,?) ON CONFLICT(kind) DO UPDATE SET restricted=EXCLUDED.restricted,user_emails=EXCLUDED.user_emails,revision=panel_module_access.revision+1,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(kind,b.restricted,JSON.stringify(b.userEmails),Date.now(),u.email).run();if(kind==='planning')await planningLog(u,'Synlighet ändrad',{next:b.restricted?b.userEmails.join(', '):'Alla behöriga användare'});await panelLog(u,'Modulsynlighet ändrad',moduleNames[kind]+' · '+(b.restricted?b.userEmails.join(', '):'Alla behöriga användare'));return Response.json({ok:true})});}
const handle=(fn:(req:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch(e){return error(e instanceof PanelError?e.message:'Modulåtkomsten kunde inte läsas. Kontrollera databasuppdatering 0030.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/module-access',handle(get));
export const POST=secureApi('/api/module-access',handle(post));
