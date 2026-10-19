import {secureApi} from '../../../api-security';
import {auditMutation} from '../../../activity-log';
import { db,moveOperationalCategory } from '../../../database';
import { currentUser,error } from '../../../auth';
export const dynamic='force-dynamic';
const permitted=(role:string)=>['Administratör','Instruktör'].includes(role);
async function save(req:Request,editing:boolean){try{
 const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);
 const {id,title}=await req.json();
 if(editing&&(typeof id!=='string'||!id)||typeof title!=='string'||!title.trim()||title.length>180)return error('Ange ett kategorinamn, högst 180 tecken',400);
 const categoryId=editing?id:'op-category-'+crypto.randomUUID();
 if(editing){const result=await db.prepare('UPDATE iu_operational_categories SET title=?,updated_at=?,updated_by=? WHERE id=?').bind(title.trim(),Date.now(),user.email,id).run();if(!result.meta.changes)return error('Kategorin finns inte',404)}
 else await db.prepare('INSERT INTO iu_operational_categories(id,title,position,updated_at,updated_by) SELECT ?,?,COALESCE(MAX(position),0)+1,?,? FROM iu_operational_categories').bind(categoryId,title.trim(),Date.now(),user.email).run();
 return Response.json({id:categoryId,title:title.trim()});
 }catch(e){if((e as {code?:string}).code==='23505')return error('En kategori med samma namn finns redan',409);return error('Kunde inte spara kategorin',503)}}
async function POSTHandler(req:Request){return save(req,false)}
async function PUTHandler(req:Request){return save(req,true)}
async function DELETEHandler(req:Request){try{
 const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);
 const {id}=await req.json();if(typeof id!=='string'||!id)return error('Kategori saknas',400);
 // The foreign key moves the moments to "Utan kategori" in the same database statement.
 const result=await db.prepare('DELETE FROM iu_operational_categories WHERE id=?').bind(id).run();if(!result.meta.changes)return error('Kategorin finns inte',404);return Response.json({ok:true});
 }catch{return error('Kunde inte ta bort kategorin',503)}}
async function PATCHHandler(req:Request){try{
 const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);
 const {id,direction}=await req.json();if(typeof id!=='string'||!id||!['up','down'].includes(direction))return error('Ange kategori och riktning',400);
 if(!await moveOperationalCategory(id,direction,user.email))return error('Kategorin finns inte',404);
 return Response.json({ok:true});
 }catch{return error('Kunde inte flytta kategorin',503)}}

const POSTEndpoint=(req:Request)=>auditMutation(req,POSTHandler,'Operativa underlag');

const PUTEndpoint=(req:Request)=>auditMutation(req,PUTHandler,'Operativa underlag');

const DELETEEndpoint=(req:Request)=>auditMutation(req,DELETEHandler,'Operativa underlag');

const PATCHEndpoint=(req:Request)=>auditMutation(req,PATCHHandler,'Operativa underlag');

export const POST=secureApi('/api/personnel/operational-categories',POSTEndpoint);
export const PUT=secureApi('/api/personnel/operational-categories',PUTEndpoint);
export const DELETE=secureApi('/api/personnel/operational-categories',DELETEEndpoint);
export const PATCH=secureApi('/api/personnel/operational-categories',PATCHEndpoint);
