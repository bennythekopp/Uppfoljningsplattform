import { db } from '../../../database';
import { currentUser,error } from '../../../auth';
import { loadIUTemplate } from '../../../iu-data';
import type { IUTemplate } from '../../../iu-types';
import { percentageValue } from '../../../followup-values';
export const dynamic='force-dynamic';
const permitted=(role:string)=>role==='Administratör'||role==='Instruktör';
type Answer={level?:string,comment?:string,score?:number|null};
function validAnswers(kind:string,answers:unknown,template:IUTemplate):answers is Record<string,Answer>{
 const opIds=new Set([...template.op,...template.chef].map(x=>x.id));
 const simMax=new Map(template.simulator.flatMap(s=>s.rows).map(r=>[r.id,r.max]));
 if(!answers||typeof answers!=='object'||Array.isArray(answers))return false;
 const entries=Object.entries(answers as Record<string,unknown>);
 if(entries.length>1000)return false;
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
export async function GET(req:Request){try{const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);const personId=new URL(req.url).searchParams.get('personId');if(!personId)return error('Personal saknas',400);const exists=await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first();if(!exists)return error('Personal finns inte',404);const {results}=await db.prepare('SELECT f.id,f.personnel_id AS personnelId,f.kind,f.followup_date AS followupDate,f.responsible,f.detail,f.summary,f.news,f.completed,f.outcome,f.template_snapshot AS templateSnapshot,f.local_result AS localResult,f.central_result AS centralResult,f.answers,f.created_at AS createdAt,f.updated_at AS updatedAt,f.updated_by AS updatedBy,COALESCE(u.name,f.updated_by) AS updatedByName FROM personnel_followups f LEFT JOIN users u ON u.email=f.updated_by WHERE f.personnel_id=? ORDER BY f.followup_date DESC,f.created_at DESC').bind(personId).all();return Response.json(results)}catch{return error('Kunde inte läsa uppföljningar',503)}}
export async function POST(req:Request){try{const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);const {id,personId,kind,followupDate,responsible,detail,summary,news,localResult,centralResult,outcome,answers}=await req.json();if(typeof personId!=='string'||!personId||!['op','simulator'].includes(kind)||typeof followupDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(followupDate)||!Number.isFinite(Date.parse(followupDate))||typeof responsible!=='string'||!responsible.trim()||responsible.length>120||typeof detail!=='string'||detail.length>300||typeof summary!=='string'||summary.length>5000||typeof news!=='string'||news.length>5000||typeof localResult!=='string'||localResult.length>300||typeof centralResult!=='string'||centralResult.length>300||!['','approved','requires_completion'].includes(outcome))return error('Ogiltig uppföljning',400);
 const person=await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first();if(!person)return error('Personal finns inte',404);const previous=id?await db.prepare('SELECT responsible,local_result AS localResult,central_result AS centralResult,template_snapshot AS templateSnapshot FROM personnel_followups WHERE id=? AND personnel_id=? AND kind=?').bind(id,personId,kind).first<{responsible:string,localResult:string,centralResult:string,templateSnapshot:IUTemplate|null}>():null;
 if(id&&!previous)return error('Uppföljningen finns inte',404);
 const templateSnapshot=previous?.templateSnapshot||await loadIUTemplate();
 if(!validAnswers(kind,answers,templateSnapshot))return error('Ogiltiga bedömningar',400);
 const selectedResponsible=await db.prepare("SELECT name FROM users WHERE name=? AND disabled_at IS NULL AND role IN ('Administratör','Instruktör')").bind(responsible.trim()).first();
 if(!selectedResponsible&&previous?.responsible!==responsible.trim())return error('Välj en instruktör eller administratör som ansvarig',400);
 const localPercent=percentageValue(localResult),centralPercent=percentageValue(centralResult);
 if(localPercent===null&&previous?.localResult!==localResult||centralPercent===null&&previous?.centralResult!==centralResult)return error('Provresultat ska anges i procent mellan 0 och 100',400);
 const storedLocal=localPercent??localResult,storedCentral=centralPercent??centralResult;
 const completed=outcome==='approved';
 const now=Date.now(),recordId=typeof id==='string'&&id?id:crypto.randomUUID();
 if(id){const updated=await db.prepare('UPDATE personnel_followups SET followup_date=?,responsible=?,detail=?,summary=?,news=?,local_result=?,central_result=?,completed=?,outcome=?,answers=?::jsonb,template_snapshot=?::jsonb,updated_at=?,updated_by=? WHERE id=? AND personnel_id=? AND kind=?').bind(followupDate,responsible.trim(),detail.trim(),summary.trim(),news.trim(),storedLocal,storedCentral,completed,outcome,JSON.stringify(answers),JSON.stringify(templateSnapshot),now,u.email,id,personId,kind).run();if(!updated.meta.changes)return error('Uppföljningen finns inte',404)}
 else await db.prepare('INSERT INTO personnel_followups(id,personnel_id,kind,followup_date,responsible,detail,summary,news,local_result,central_result,completed,outcome,answers,template_snapshot,created_at,updated_at,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?::jsonb,?::jsonb,?,?,?)').bind(recordId,personId,kind,followupDate,responsible.trim(),detail.trim(),summary.trim(),news.trim(),storedLocal,storedCentral,completed,outcome,JSON.stringify(answers),JSON.stringify(templateSnapshot),now,now,u.email).run();
 return Response.json({id:recordId,personnelId:personId,kind,followupDate,responsible:responsible.trim(),detail:detail.trim(),summary:summary.trim(),news:news.trim(),localResult:storedLocal,centralResult:storedCentral,completed,outcome,answers,templateSnapshot,updatedAt:now,updatedBy:u.email,updatedByName:u.name})
 }catch{return error('Kunde inte spara uppföljningen',503)}}
