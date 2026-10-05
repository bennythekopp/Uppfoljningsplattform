import { db } from '../../../database';
import { currentUser,error } from '../../../auth';
import { loadIUMoments } from '../../../iu-data';
import { buildIUTemplate } from '../../../iu-types';
export const dynamic='force-dynamic';
const permitted=(role:string)=>['Administratör','Instruktör'].includes(role);
export async function GET(){try{const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);const moments=await loadIUMoments();return Response.json({moments,template:buildIUTemplate(moments)})}catch{return error('Kunde inte läsa IU-moment',503)}}
async function save(req:Request,editing:boolean){try{
 const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);
 const {id,kind,section,title,description,maxScore}=await req.json();
 if(editing&&(typeof id!=='string'||!id)||!['op','simulator'].includes(kind)||typeof section!=='string'||!section.trim()||section.length>180||kind==='op'&&!['op','chef'].includes(section)||typeof title!=='string'||!title.trim()||title.length>180||typeof description!=='string'||description.length>10000||kind==='simulator'&&(!Number.isInteger(maxScore)||maxScore<0||maxScore>1000))return error('Kontrollera rubrik, område och maxpoäng',400);
 const momentId=editing?id:'iu-'+crypto.randomUUID();
 if(editing){const result=await db.prepare('UPDATE iu_moments SET kind=?,section=?,title=?,description=?,max_score=?,updated_at=?,updated_by=? WHERE id=? AND deleted_at IS NULL').bind(kind,section.trim(),title.trim(),description.trim(),kind==='simulator'?maxScore:null,Date.now(),user.email,id).run();if(!result.meta.changes)return error('Momentet finns inte',404)}
 else await db.prepare('INSERT INTO iu_moments(id,kind,section,title,description,max_score,position,updated_at,updated_by) SELECT ?,?,?,?,?,?,COALESCE(MAX(position),0)+1,?,? FROM iu_moments').bind(momentId,kind,section.trim(),title.trim(),description.trim(),kind==='simulator'?maxScore:null,Date.now(),user.email).run();
 return Response.json({id:momentId,kind,section:section.trim(),title:title.trim(),description:description.trim(),maxScore:kind==='simulator'?maxScore:null});
}catch{return error('Kunde inte spara IU-momentet',503)}}
export async function POST(req:Request){return save(req,false)}
export async function PUT(req:Request){return save(req,true)}
export async function DELETE(req:Request){try{const user=await currentUser();if(!user||!permitted(user.role))return error('Behörighet saknas',403);const {id}=await req.json();if(typeof id!=='string'||!id)return error('Moment saknas',400);const result=await db.prepare('UPDATE iu_moments SET deleted_at=?,updated_at=?,updated_by=? WHERE id=? AND deleted_at IS NULL').bind(Date.now(),Date.now(),user.email,id).run();if(!result.meta.changes)return error('Momentet finns inte',404);return Response.json({ok:true})}catch{return error('Kunde inte ta bort IU-momentet',503)}}
