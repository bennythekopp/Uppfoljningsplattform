import {auditMutation} from '../../../activity-log';
import {currentUser,error} from '../../../auth';
import {followupTransaction} from '../../../database';
import {canReadKP,canEditKP,validKPKind,loadKPTemplate} from '../../../kp-data';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const u=await currentUser();if(!u||!canReadKP(u.role))return error('Behörighet saknas',403);const kind=new URL(req.url).searchParams.get('kind');if(!validKPKind(kind))return error('Välj KP1 eller KP2',400);return Response.json(await loadKPTemplate(kind))}catch{return error('Kunde inte läsa underlaget',503)}}
async function POSTHandler(req:Request){return mutate(req,false)}
async function DELETEHandler(req:Request){return mutate(req,true)}
async function mutate(req:Request,remove:boolean){try{const u=await currentUser();if(!u||!canEditKP(u.role))return error('Behörighet saknas',403);const input=await req.json(),{id,kind}=input;if(!validKPKind(kind)||id!==undefined&&(typeof id!=='string'||!id))return error('Ogiltigt moment',400);
 return await followupTransaction('kp-template',kind,async connection=>{const template=await loadKPTemplate(kind,connection),old=id?template.find(m=>m.id===id):null;if(id&&!old)return error('Momentet finns inte',404);const now=Date.now();
 if(remove){if(!old)return error('Moment saknas',400);await connection.prepare('UPDATE kp_moments SET deleted_at=?,updated_at=?,updated_by=? WHERE id=?').bind(now,now,u.email,id).run();await connection.prepare('UPDATE kp_submoments SET deleted_at=? WHERE moment_id=? AND deleted_at IS NULL').bind(now,id).run();return Response.json({ok:true})}
 const {title,description,children}=input;if(typeof title!=='string'||!title.trim()||title.length>300||typeof description!=='string'||description.length>5000||!Array.isArray(children)||children.length<1||children.length>200)return error('Ange namn och minst ett delmoment',400);
 const seen=new Set<string>();for(const c of children){if(!c||typeof c!=='object'||typeof c.title!=='string'||!c.title.trim()||c.title.length>2000||c.id!==undefined&&(typeof c.id!=='string'||!old?.children.some(child=>child.id===c.id)||seen.has(c.id)))return error('Ogiltigt delmoment',400);if(c.id)seen.add(c.id)}
 const momentId=id||'kp-'+crypto.randomUUID();if(old)await connection.prepare('UPDATE kp_moments SET title=?,description=?,updated_at=?,updated_by=? WHERE id=?').bind(title.trim(),description.trim(),now,u.email,momentId).run();else await connection.prepare('INSERT INTO kp_moments(id,kind,title,description,position,updated_at,updated_by) SELECT ?,?,?,?,COALESCE(MAX(position),0)+1,?,? FROM kp_moments WHERE kind=?').bind(momentId,kind,title.trim(),description.trim(),now,u.email,kind).run();
 const kept:string[]=[];for(const [index,c] of children.entries()){const childId=c.id||'kp-sub-'+crypto.randomUUID();kept.push(childId);if(c.id)await connection.prepare('UPDATE kp_submoments SET title=?,position=? WHERE id=? AND moment_id=?').bind(c.title.trim(),index+1,childId,momentId).run();else await connection.prepare('INSERT INTO kp_submoments(id,moment_id,title,position) VALUES(?,?,?,?)').bind(childId,momentId,c.title.trim(),index+1).run()}
 await connection.prepare('UPDATE kp_submoments SET deleted_at=? WHERE moment_id=? AND deleted_at IS NULL AND NOT(id=ANY(?::text[]))').bind(now,momentId,kept).run();return Response.json({id:momentId});
 });}catch{return error('Kunde inte spara underlaget',503)}}

export const POST=(req:Request)=>auditMutation(req,POSTHandler,'KP-underlag');

export const DELETE=(req:Request)=>auditMutation(req,DELETEHandler,'KP-underlag');
