import {auditMutation} from '../../../activity-log';
import {currentUser,error} from '../../../auth';
import {db,followupTransaction} from '../../../database';
import {archiveStudent} from '../../../student-archive-data';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const id=new URL(req.url).searchParams.get('personId');if(!id)return error('Personal saknas',400);
 return await followupTransaction('student-history',id,async connection=>{const person=await connection.prepare('SELECT id,name FROM personnel WHERE id=? AND moved_at IS NULL').bind(id).first<{id:string,name:string}>();if(!person)return error('Personen finns inte bland personalen',404);
 const old=await connection.prepare('SELECT moved_at AS movedAt FROM students WHERE id=? AND moved_at IS NOT NULL').bind(id).first<{movedAt:number}>();if(old)await archiveStudent(connection,id,person.name,u.email,old.movedAt);
 const {results}=await connection.prepare('SELECT a.id,a.kind,a.payload,a.created_at AS createdAt,a.event_at AS eventAt,COALESCE(u.name,a.created_by) AS authorName FROM personnel_student_archives a LEFT JOIN users u ON u.email=a.created_by WHERE a.personnel_id=? AND a.deleted_at IS NULL ORDER BY a.event_at DESC,a.kind').bind(id).all();return Response.json(results)});
 }catch{return error('Kunde inte läsa elevhistoriken',503)}}
async function DELETEHandler(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {personId,id}=await req.json();if(typeof personId!=='string'||typeof id!=='string'||!id)return error('Ogiltigt protokoll',400);if(!await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first())return error('Personen finns inte',404);const r=await db.prepare('UPDATE personnel_student_archives SET deleted_at=?,deleted_by=? WHERE id=? AND personnel_id=? AND deleted_at IS NULL').bind(Date.now(),u.email,id,personId).run();return r.meta.changes?Response.json({ok:true}):error('Protokollet finns inte',404)}catch{return error('Kunde inte ta bort protokollet',503)}}

export const DELETE=(req:Request)=>auditMutation(req,DELETEHandler,'Elevhistorik');
