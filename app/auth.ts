import { cookies } from 'next/headers';
import { db } from './database';
export type Role='Administratör'|'Instruktör'|'Handledare';
const enc=new TextEncoder();
const hex=(bytes:Uint8Array)=>Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function sha256(input:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(input))))}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:180000,hash:'SHA-256'},key,256);return hex(new Uint8Array(bits))}
export function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)))}
export async function currentUser(){
 const token=(await cookies()).get('tc_session')?.value;
 if(token&&/^[a-f0-9]{64}$/.test(token)){
  const row=await db.prepare('SELECT u.email,u.name,u.role FROM sessions s JOIN users u ON u.email=s.user_email WHERE s.token_hash=? AND s.expires_at>?').bind(await sha256(token),Date.now()).first<{email:string,name:string,role:Role}>();
  if(row&&['Administratör','Instruktör','Handledare'].includes(row.role))return row;
 }
 return null;
}
export const error=(message:string,status:number)=>Response.json({error:message},{status});
