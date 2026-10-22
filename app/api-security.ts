import 'server-only';
import {currentUser,currentAccount,error,sha256,type Role} from './auth';
import {db} from './database';
import {loginIP} from './login-security';

type Actor={email:string,name:string,role:Role,previewRole?:Role|null,accountRole?:Role};
type Handler=(req:Request)=>Promise<Response>;
const all:Role[]=['Administratör','Instruktör','Handledare','Chef'];
const instructors:Role[]=['Administratör','Instruktör'];
const studentReaders:Role[]=['Administratör','Instruktör','Chef'];
const graders:Role[]=['Administratör','Instruktör','Handledare'];
// Explicit server policy for every exported API operation; missing rules deny access.
const policies:Record<string,Record<string,readonly Role[]|'public'>>={
 '/api/login':{POST:'public'},
 '/api/setup':{GET:'public',POST:'public'},
 '/api/session':{GET:'public',POST:'public'},
 '/api/logout':{POST:'public'},
 '/api/me':{GET:all},
 '/api/students':{GET:all,POST:instructors,PUT:instructors,DELETE:instructors},
 '/api/moments':{GET:all,POST:instructors,PUT:instructors,DELETE:instructors},
 '/api/assessments':{GET:all,PUT:graders,DELETE:instructors},
 '/api/comments':{GET:all,POST:graders,DELETE:instructors},
 '/api/overview':{GET:instructors},
 '/api/password':{PUT:all},
 '/api/order':{POST:instructors},
 '/api/moment-visibility':{POST:instructors},
 '/api/grundschema':{GET:instructors,POST:instructors},
 '/api/panel':{GET:instructors,POST:instructors},
 '/api/notifications':{GET:all,POST:all},
 '/api/documents':{GET:instructors,POST:instructors,PUT:instructors,PATCH:instructors},
 '/api/notes':{GET:instructors,PUT:instructors},
 '/api/admin/role-preview':{POST:['Administratör']},
 '/api/users':{GET:['Administratör'],POST:['Administratör'],PUT:['Administratör'],DELETE:['Administratör']},
 '/api/people/move':{POST:instructors},
 '/api/kp/assessments':{GET:studentReaders,PUT:instructors,POST:instructors,DELETE:instructors},
 '/api/kp/templates':{GET:studentReaders,POST:instructors,DELETE:instructors},
 '/api/exam/assessments':{GET:studentReaders,PUT:instructors,POST:instructors,PATCH:instructors,DELETE:instructors},
 '/api/exam/templates':{GET:studentReaders,POST:instructors,DELETE:instructors},
 '/api/personnel':{GET:instructors,POST:instructors,PUT:instructors,DELETE:instructors},
 '/api/personnel/followups':{GET:instructors,POST:instructors,DELETE:instructors},
 '/api/personnel/drafts':{GET:instructors,PUT:instructors,DELETE:instructors},
 '/api/personnel/moments':{GET:instructors,POST:instructors,PUT:instructors,DELETE:instructors},
 '/api/personnel/operational-categories':{POST:instructors,PUT:instructors,PATCH:instructors,DELETE:instructors},
 '/api/personnel/simulator-moments':{POST:instructors,PUT:instructors,DELETE:instructors},
 '/api/personnel/responsibles':{GET:instructors},
 '/api/personnel/student-history':{GET:instructors,DELETE:instructors},
 '/api/admin/activity':{GET:['Administratör']},
 '/api/admin/activity/restore':{POST:['Administratör']},
 '/api/admin/iu-reset':{POST:['Administratör']},
};
function privateResponse(response:Response){
 response.headers.set('Cache-Control','private, no-store, max-age=0');
 response.headers.set('Pragma','no-cache');
 response.headers.set('X-Content-Type-Options','nosniff');
 const vary=response.headers.get('Vary');response.headers.set('Vary',vary?vary+', Cookie':'Cookie');
 return response;
}
// Explicit public origins survive Netlify's internal request URL rewriting.
// Forwarded/Host headers are client-controlled and are not an origin allowlist.
function siteOrigin(value:string){
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)return null;return url.origin}catch{return null}
}
function foreignMutation(req:Request){
 if(['GET','HEAD','OPTIONS'].includes(req.method))return false;
 if(req.headers.get('sec-fetch-site')==='cross-site')return true;
 const value=req.headers.get('origin');
 if(!value)return false; // SameSite=Strict cookies and originless JSON clients remain supported.
 const origin=siteOrigin(value);if(!origin)return true;
 const allowed=new Set([new URL(req.url).origin]);
 const configured=[
  'https://handledare.netlify.app', // This application's published address.
  process.env.APP_ORIGIN,process.env.URL,process.env.DEPLOY_URL,process.env.DEPLOY_PRIME_URL
 ];
 for(const value of configured){if(!value)continue;for(const entry of value.split(',')){const candidate=siteOrigin(entry.trim());if(candidate)allowed.add(candidate)}}
 return !allowed.has(origin);
}
async function securityEvent(req:Request,route:string,actor:Actor|null,action:string,reason:string){
 const now=Date.now();
 // No request body, query, password, cookie, token, or raw IP is stored.
 // Identical events from one account/connection are grouped per minute to
 // bound unauthenticated log flooding. ON CONFLICT is atomic across functions.
 const id='security-'+await sha256(JSON.stringify([Math.floor(now/60000),actor?.email||'',actor?.previewRole||'',loginIP(req),req.method,route,action,reason]));
 await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING')
  .bind(id,now,actor?.email||'',actor?.name||'Ej inloggad',actor?.accountRole||actor?.role||'',action,'Säkerhet',(actor?.previewRole?'Förhandsvisning som '+actor.previewRole+' · ':'')+reason+' · '+req.method+' '+route).run();
}
export function secureApi(route:string,handler:Handler):Handler{
 return async(req:Request)=>{
  try{
   const policy=policies[route]?.[req.method];
   const actor=policy==='public'?null:route==='/api/admin/role-preview'?await currentAccount():await currentUser();
   if(foreignMutation(req)){
    await securityEvent(req,route,actor,'Åtkomst nekad','Begäran från annan webbplats');
    return privateResponse(error('Begäran måste göras från den här webbplatsen.',403));
   }
   if(!policy||policy!=='public'&&(!actor||!policy.includes(actor.role))){
    // Checking the login state is routine, not an attempted protected action.
    if(route!=='/api/me')await securityEvent(req,route,actor,'Åtkomst nekad',actor?'Rollen saknar behörighet':'Inloggning saknas eller har gått ut');
    return privateResponse(error('Behörighet saknas',403));
   }
   if(actor?.previewRole&&!['GET','HEAD','OPTIONS'].includes(req.method)&&!['/api/admin/role-preview','/api/session','/api/logout'].includes(route)){
    return privateResponse(error('Förhandsvisningen är skrivskyddad. Avsluta den för att göra ändringar.',403));
   }
   const response=await handler(req);
   if(route==='/api/login'&&(response.status===401||response.status===429)){
    await securityEvent(req,route,null,response.status===429?'Inloggning spärrad':'Misslyckad inloggning',response.status===429?'För många inloggningsförsök':'Felaktiga inloggningsuppgifter');
   }else if(response.status===403){
    await securityEvent(req,route,actor,'Åtkomst nekad','Begäran avvisades av behörighetskontrollen');
   }else if(route==='/api/setup'&&req.method==='POST'&&response.ok){
    await securityEvent(req,route,null,'Administratör skapad','Första administratörskontot skapades');
   }
   return privateResponse(response);
  }catch{
   // Never grant access or expose database errors when checks/logging fail.
   return privateResponse(error('Säkerhetskontrollen kunde inte slutföras. Försök igen.',503));
  }
 };
}
