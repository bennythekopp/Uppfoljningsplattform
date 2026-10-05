import { db } from '../../../database';
import { currentUser,error } from '../../../auth';
import template from '../../../personnel-template.json';
export const dynamic='force-dynamic';
const permitted=(role:string)=>role==='Administratör'||role==='Instruktör';
type Answer={level?:string,comment?:string,score?:number|null};
const opIds=new Set([...template.op,...template.chef].map(x=>x.id));
const simRows=template.simulator.flatMap(s=>s.rows);
const simMax=new Map(simRows.map(r=>[r.id,r.max]));
function validAnswers(kind:string,answers:unknown):answers is Record<string,Answer>{
 if(!answers||typeof answers!=='object'||Array.isArray(answers))return false;
 const entries=Object.entries(answers as Record<string,unknown>);
 if(entries.length>100)return false;
 for(const [id,value] of entries){
  if(kind==='op'?!opIds.has(id):!simMax.has(id))return false;
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const v=value as Answer;
  if(typeof v.comment!=='undefined'&&(typeof v.comment!=='string'||v.comment.length>3000))return false;
  if(kind==='op'&&typeof v.level!=='undefined'&&!['','Röd','Gul','Grön'].includes(v.level))return false;
  if(kind==='simulator'&&typeof v.score!=='undefined'&&v.score!==null&&(!Number.isInteger(v.score)||v.score<0||v.score>(simMax.get(id)??0)))return false;
 }
 return true;
}
export async function GET(req:Request){try{const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);const personId=new URL(req.url).searchParams.get('personId');if(!personId)return error('Personal saknas',400);const exists=await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first();if(!exists)return error('Personal finns inte',404);const {results}=await db.prepare('SELECT f.id,f.personnel_id AS personnelId,f.kind,f.followup_date AS followupDate,f.responsible,f.detail,f.summary,f.news,f.completed,f.local_result AS localResult,f.central_result AS centralResult,f.answers,f.created_at AS createdAt,f.updated_at AS updatedAt,f.updated_by AS updatedBy,COALESCE(u.name,f.updated_by) AS updatedByName FROM personnel_followups f LEFT JOIN users u ON u.email=f.updated_by WHERE f.personnel_id=? ORDER BY f.followup_date DESC,f.created_at DESC').bind(personId).all();return Response.json(results)}catch{return error('Kunde inte läsa uppföljningar',503)}}
export async function POST(req:Request){try{const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);const {id,personId,kind,followupDate,responsible,detail,summary,news,localResult,centralResult,completed,answers}=await req.json();if(typeof personId!=='string'||!personId||!['op','simulator'].includes(kind)||typeof followupDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(followupDate)||!Number.isFinite(Date.parse(followupDate))||typeof responsible!=='string'||!responsible.trim()||responsible.length>120||typeof detail!=='string'||detail.length>300||typeof summary!=='string'||summary.length>5000||typeof news!=='string'||news.length>5000||typeof localResult!=='string'||localResult.length>300||typeof centralResult!=='string'||centralResult.length>300||typeof completed!=='boolean'||!validAnswers(kind,answers))return error('Ogiltig uppföljning',400);
 const person=await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first();if(!person)return error('Personal finns inte',404);const now=Date.now(),recordId=typeof id==='string'&&id?id:crypto.randomUUID();
 if(id){const updated=await db.prepare('UPDATE personnel_followups SET followup_date=?,responsible=?,detail=?,summary=?,news=?,local_result=?,central_result=?,completed=?,answers=?::jsonb,updated_at=?,updated_by=? WHERE id=? AND personnel_id=? AND kind=?').bind(followupDate,responsible.trim(),detail.trim(),summary.trim(),news.trim(),localResult.trim(),centralResult.trim(),completed,JSON.stringify(answers),now,u.email,id,personId,kind).run();if(!updated.meta.changes)return error('Uppföljningen finns inte',404)}
 else await db.prepare('INSERT INTO personnel_followups(id,personnel_id,kind,followup_date,responsible,detail,summary,news,local_result,central_result,completed,answers,created_at,updated_at,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?::jsonb,?,?,?)').bind(recordId,personId,kind,followupDate,responsible.trim(),detail.trim(),summary.trim(),news.trim(),localResult.trim(),centralResult.trim(),completed,JSON.stringify(answers),now,now,u.email).run();
 return Response.json({id:recordId,personnelId:personId,kind,followupDate,responsible:responsible.trim(),detail:detail.trim(),summary:summary.trim(),news:news.trim(),localResult:localResult.trim(),centralResult:centralResult.trim(),completed,answers,updatedAt:now,updatedBy:u.email,updatedByName:u.name})
 }catch{return error('Kunde inte spara uppföljningen',503)}}
