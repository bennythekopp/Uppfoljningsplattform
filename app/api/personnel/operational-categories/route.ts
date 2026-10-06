import { db } from '../../../database';
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
export async function POST(req:Request){return save(req,false)}
export async function PUT(req:Request){return save(req,true)}
export async function DELETE(req:Request){try{
 const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);
 const {id}=await req.json();if(typeof id!=='string'||!id)return error('Kategori saknas',400);
 // The foreign key moves the moments to "Utan kategori" in the same database statement.
 const result=await db.prepare('DELETE FROM iu_operational_categories WHERE id=?').bind(id).run();if(!result.meta.changes)return error('Kategorin finns inte',404);return Response.json({ok:true});
 }catch{return error('Kunde inte ta bort kategorin',503)}}
