import 'server-only';
import {db} from './database';
import type {Role} from './auth';
export type PanelActor={email:string,name:string,role:Role};
export async function panelLog(actor:PanelActor,action:string,target:string,id=crypto.randomUUID()){
 await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,Date.now(),actor.email,actor.name,actor.role,action,'Instruktörspanel',target.slice(0,1000)).run();
}
export class PanelError extends Error{constructor(message:string,public status=400){super(message)}}
export async function panelBody(req:Request,limit=300000){if(Number(req.headers.get('content-length')||0)>limit)throw new PanelError('Innehållet är för stort',413);const text=await req.text();if(text.length>limit)throw new PanelError('Innehållet är för stort',413);try{return JSON.parse(text)}catch{throw new PanelError('Ogiltig begäran')}}
export function short(value:unknown,max=300){return typeof value==='string'?value.trim().slice(0,max):''}
export async function staffList(){return (await db.prepare("SELECT email,name FROM users WHERE role IN ('Administratör','Instruktör') AND disabled_at IS NULL ORDER BY lower(name)").all()).results}
