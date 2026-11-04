import { cookies,headers } from 'next/headers';
import { db } from './database';
export type Role='Administratör'|'Instruktör'|'Handledare'|'Chef';
export { passwordHash,verifyPassword,needsPasswordUpgrade } from './password-security';
export async function sessionCookieName(){return (await headers()).get('x-tc-app')==='planning'?'tc_planning_session':'tc_session'}
export async function readSessionToken(){const c=await cookies(),name=await sessionCookieName();return c.get(name)?.value||(name==='tc_planning_session'?c.get('tc_session')?.value:undefined)}
const enc=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function sha256(input:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(input))))}
export function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)))}
export async function currentAccount(sessionToken?:string){
 const token=sessionToken===undefined?await readSessionToken():sessionToken;
 if(token&&/^[a-f0-9]{64}$/.test(token)){
  const row=await db.prepare('SELECT u.email,u.name,u.role,s.preview_role AS previewRole,s.preview_user_email AS previewUserEmail,s.session_scope AS sessionScope FROM sessions s JOIN users u ON u.email=s.user_email WHERE s.token_hash=? AND s.expires_at>? AND u.disabled_at IS NULL AND u.login_blocked_at IS NULL').bind(await sha256(token),Date.now()).first<{email:string,name:string,role:Role,previewRole:Role|null,previewUserEmail:string|null,sessionScope:string}>();
  if(row?.sessionScope==='planning'&&(await headers()).get('x-tc-app')!=='planning')return null;
  if(row&&['Administratör','Instruktör','Handledare','Chef'].includes(row.role))return row;
 }
 return null;
}
export async function currentUser(sessionToken?:string){
 const account=await currentAccount(sessionToken);if(!account)return null;
 if(account.role==='Administratör'&&account.previewUserEmail){
  const target=await db.prepare('SELECT email,name,role FROM users WHERE email=? AND disabled_at IS NULL AND login_blocked_at IS NULL').bind(account.previewUserEmail).first<{email:string,name:string,role:Role}>();
  // Never fall back to administrator privileges if a preview target becomes unavailable.
  if(!target)return null;
  return {...account,...target,accountRole:account.role,accountEmail:account.email,accountName:account.name,previewRole:target.role,previewUserEmail:target.email};
 }
 const previewRole=account.role==='Administratör'&&['Instruktör','Handledare','Chef'].includes(account.previewRole||'')?account.previewRole:null;
 return {...account,accountRole:account.role,accountEmail:account.email,accountName:account.name,role:previewRole||account.role,previewRole};
}

export const error=(message:string,status:number)=>Response.json({error:message},{status});
