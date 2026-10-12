import 'server-only';
import {db} from './database';
import base from './items.json';
type Row=Record<string,any>;
export type AssessmentRecovery={version:1,type:'student'|'kp'|'exam'|'iu'|'archive',personId:string,kind?:string,row?:Row|null,draft?:Row|null,assessments?:Row[],comments?:Row[],expectedRevision?:number,restoreDraft?:boolean,id?:string,expectedDeletedAt?:number};
export async function assessmentIds(input:Row){if(input.itemId!==undefined)return [input.itemId];const edits=(await db.prepare('SELECT item_id AS id,category FROM moment_edits').all<{id:number,category:string}>()).results,custom=(await db.prepare('SELECT id,category FROM custom_moments').all<{id:number,category:string}>()).results;return [...base.filter(i=>(edits.find(e=>e.id===i.id)?.category||'System E2')===input.category).map(i=>i.id),...custom.filter(i=>i.category===input.category).map(i=>i.id+1000000)]}
async function lock(a:string,b:string){await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify([a,b])).all()}
export async function captureAssessment(area:string,input:Row):Promise<AssessmentRecovery|null>{
 const personId=input.studentId||input.personId;if(typeof personId!=='string')return null;
 if(area==='KP'||area==='Examen'){
  if(area==='KP'&&!['KP1','KP2'].includes(input.kind))return null;
  await lock(area==='KP'?'kp-template':'exam',area==='KP'?input.kind:'template');
  await db.prepare('SELECT id FROM students WHERE id=? FOR UPDATE').bind(personId).first();
  const row=area==='KP'?await db.prepare('SELECT * FROM student_kp_assessments WHERE student_id=? AND kind=? FOR UPDATE').bind(personId,input.kind).first<Row>():await db.prepare('SELECT * FROM student_examinations WHERE student_id=? FOR UPDATE').bind(personId).first<Row>();
  return row&&(row.saved_data||row.is_draft)?{version:1,type:area==='KP'?'kp':'exam',personId,kind:input.kind,row}:null;
 }
 if(area==='Bedömning'){
  if(input.itemId===undefined&&!['System E2','System M','Övrigt'].includes(input.category))return null;
  await db.prepare('SELECT id FROM students WHERE id=? FOR UPDATE').bind(personId).first();
  const ids=await assessmentIds(input),assessments=(await db.prepare('SELECT * FROM assessments WHERE student_id=? AND item_id=ANY(?::integer[]) FOR UPDATE').bind(personId,ids).all<Row>()).results,comments=(await db.prepare('SELECT * FROM comments WHERE student_id=? AND item_id=ANY(?::integer[]) AND deleted_at IS NULL FOR UPDATE').bind(personId,ids).all<Row>()).results;
  return assessments.length||comments.length?{version:1,type:'student',personId,assessments,comments}:null;
 }
 if(area==='Individuell uppföljning'||area==='Utkast'){
  if(!['op','simulator'].includes(input.kind))return null;await lock(personId,input.kind);
  const draft=await db.prepare('SELECT * FROM personnel_followup_drafts WHERE personnel_id=? AND kind=? FOR UPDATE').bind(personId,input.kind).first<Row>();
  const row=typeof input.id==='string'?await db.prepare('SELECT * FROM personnel_followups WHERE id=? AND personnel_id=? AND kind=? FOR UPDATE').bind(input.id,personId,input.kind).first<Row>():null;
  return row||draft?.form?{version:1,type:'iu',personId,kind:input.kind,row,draft}:null;
 }
 if(area==='Elevhistorik'&&typeof input.id==='string'){
  const row=await db.prepare('SELECT id FROM personnel_student_archives WHERE id=? AND personnel_id=? AND deleted_at IS NULL FOR UPDATE').bind(input.id,personId).first();
  return row?{version:1,type:'archive',personId,id:input.id}:null;
 }
 return null;
}
export async function completeRecovery(copy:AssessmentRecovery|null,result:Row){if(!copy)return null;
 if(copy.type==='kp'||copy.type==='exam'||copy.type==='iu'){copy.expectedRevision=result.revision;copy.restoreDraft=copy.type==='iu'?(result.clearedDraft??true):undefined}
 if(copy.type==='archive'){const row=await db.prepare('SELECT deleted_at FROM personnel_student_archives WHERE id=?').bind(copy.id).first<Row>();copy.expectedDeletedAt=Number(row?.deleted_at)}
 if(copy.type==='student')for(const c of copy.comments||[]){const row=await db.prepare('SELECT deleted_at FROM comments WHERE id=?').bind(c.id).first<Row>();c.expectedDeletedAt=Number(row?.deleted_at)}
 return copy;
}
export class RecoveryError extends Error{constructor(message:string,public status=409){super(message)}}
const conflict=()=>new RecoveryError('Nyare uppgifter finns. Återställningen avbröts för att inte skriva över dem.');
export async function restoreAssessment(copy:AssessmentRecovery){
 if(!copy||copy.version!==1||!['student','kp','exam','iu','archive'].includes(copy.type)||typeof copy.personId!=='string')throw new RecoveryError('Återställningskopia saknas.',400);
 if(copy.type==='kp'||copy.type==='exam')await lock(copy.type==='kp'?'kp-template':'exam',copy.type==='kp'?copy.kind!:'template');
 if(copy.type==='iu')await lock(copy.personId,copy.kind!);
 const table=copy.type==='iu'||copy.type==='archive'?'personnel':'students';
 if(!await db.prepare('SELECT id FROM '+table+' WHERE id=? AND moved_at IS NULL FOR UPDATE').bind(copy.personId).first())throw new RecoveryError('Personen är borttagen eller har flyttats till en annan grupp. Återställning kan inte göras här.',409);
 if(copy.type==='student'){
  const ids=[...(copy.assessments||[]).map(r=>r.item_id),...(copy.comments||[]).map(r=>r.item_id)];
  for(const id of new Set(ids)){const exists=id>=1000000?await db.prepare('SELECT id FROM custom_moments WHERE id=?').bind(id-1000000).first():base.some(m=>m.id===id)&&!await db.prepare('SELECT item_id FROM deleted_moments WHERE item_id=?').bind(id).first();if(!exists)throw new RecoveryError('Ett bedömningsmoment har tagits bort. Återställningen avbröts.')}
  for(const r of copy.assessments||[])if(await db.prepare('SELECT item_id FROM assessments WHERE student_id=? AND item_id=?').bind(copy.personId,r.item_id).first())throw conflict();
  for(const r of copy.comments||[]){const current=await db.prepare('SELECT deleted_at FROM comments WHERE id=? AND student_id=? FOR UPDATE').bind(r.id,copy.personId).first<Row>();if(!current||Number(current.deleted_at)!==r.expectedDeletedAt)throw conflict()}
  for(const r of copy.assessments||[])await db.prepare('INSERT INTO assessments(student_id,item_id,level,comment,updated_at,updated_by) VALUES(?,?,?,?,?,?)').bind(copy.personId,r.item_id,r.level,r.comment,r.updated_at,r.updated_by).run();
  for(const r of copy.comments||[])await db.prepare('UPDATE comments SET body=?,item_id=?,created_at=?,author_email=?,deleted_at=NULL,deleted_by=NULL WHERE id=? AND student_id=?').bind(r.body,r.item_id,r.created_at,r.author_email,r.id,copy.personId).run();
 }else if(copy.type==='kp'||copy.type==='exam'){
  await lock(copy.type==='kp'?'kp-template':'exam',copy.type==='kp'?copy.kind!:'template');
  const current=copy.type==='kp'?await db.prepare('SELECT revision FROM student_kp_assessments WHERE student_id=? AND kind=? FOR UPDATE').bind(copy.personId,copy.kind).first<Row>():await db.prepare('SELECT revision FROM student_examinations WHERE student_id=? FOR UPDATE').bind(copy.personId).first<Row>();
  if(!current||Number(current.revision)!==copy.expectedRevision)throw conflict();const r=copy.row!;
  const sql=copy.type==='kp'?'UPDATE student_kp_assessments SET data=?::jsonb,saved_data=?::jsonb,is_draft=?,revision=?,updated_at=?,updated_by=? WHERE student_id=? AND kind=?':'UPDATE student_examinations SET data=?::jsonb,saved_data=?::jsonb,is_draft=?,revision=?,updated_at=?,updated_by=? WHERE student_id=?';
  const args=[JSON.stringify(r.data),r.saved_data?JSON.stringify(r.saved_data):null,r.is_draft,Number(current.revision)+1,r.updated_at,r.updated_by,copy.personId];if(copy.type==='kp')args.push(copy.kind);await db.prepare(sql).bind(...args).run();
 }else if(copy.type==='iu'){
  await lock(copy.personId,copy.kind!);
  const current=await db.prepare('SELECT revision FROM personnel_followup_drafts WHERE personnel_id=? AND kind=? FOR UPDATE').bind(copy.personId,copy.kind).first<Row>();if(copy.restoreDraft&&Number(current?.revision||0)!==copy.expectedRevision)throw conflict();
  const r=copy.row;if(r){if(await db.prepare('SELECT id FROM personnel_followups WHERE id=?').bind(r.id).first())throw conflict();await db.prepare('INSERT INTO personnel_followups(id,personnel_id,kind,followup_date,responsible,detail,summary,news,local_result,central_result,completed,outcome,answers,template_snapshot,created_at,updated_at,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?::jsonb,?::jsonb,?,?,?)').bind(r.id,copy.personId,copy.kind,r.followup_date,r.responsible,r.detail,r.summary,r.news,r.local_result,r.central_result,r.completed,r.outcome,JSON.stringify(r.answers),r.template_snapshot?JSON.stringify(r.template_snapshot):null,r.created_at,r.updated_at,r.updated_by).run()}
  if(copy.restoreDraft){const d=copy.draft;await db.prepare('UPDATE personnel_followup_drafts SET form=?::jsonb,draft_year=?,revision=?,updated_at=?,updated_by=? WHERE personnel_id=? AND kind=?').bind(d?.form?JSON.stringify(d.form):null,d?.draft_year||String(new Date().getFullYear()),Number(current?.revision||0)+1,d?.updated_at||Date.now(),d?.updated_by||r?.updated_by||'',copy.personId,copy.kind).run()}
 }else{
  const row=await db.prepare('SELECT deleted_at FROM personnel_student_archives WHERE id=? AND personnel_id=? FOR UPDATE').bind(copy.id,copy.personId).first<Row>();if(!row||Number(row.deleted_at)!==copy.expectedDeletedAt)throw conflict();await db.prepare('UPDATE personnel_student_archives SET deleted_at=NULL,deleted_by=NULL WHERE id=? AND personnel_id=?').bind(copy.id,copy.personId).run();
 }
}
