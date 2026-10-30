import {db,databaseTransaction} from '../../database';
import {currentUser,error} from '../../auth';
import {secureApi} from '../../api-security';
import {validAssignmentDate} from '../../supervisor-types';
export const dynamic='force-dynamic';
async function read(){
 const user=await currentUser();if(!user)return error('Behörighet saknas',403);
 const events=await db.prepare('SELECT id,student_id AS studentId,supervisor_email AS supervisorEmail,supervisor_name AS supervisorName,effective_from AS "from" FROM student_supervisor_events ORDER BY effective_from').all();
 const revisions=await db.prepare('SELECT student_id AS studentId,revision FROM student_supervisor_revisions').all<{studentId:string,revision:number}>();
 const supervisors=['Administratör','Instruktör'].includes(user.role)?(await db.prepare("SELECT email,name FROM users WHERE role='Handledare' AND disabled_at IS NULL ORDER BY name COLLATE NOCASE").all()).results:[];
 return Response.json({events:events.results,revisions:Object.fromEntries(revisions.results.map(r=>[r.studentId,r.revision])),supervisors});
}
async function write(req:Request){
 const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Behörighet saknas',403);
 const body=await req.json().catch(()=>null);if(!body||typeof body.studentId!=='string'||!Number.isInteger(body.revision)||body.revision<0||!validAssignmentDate(body.from)||!(body.supervisorEmail===null||typeof body.supervisorEmail==='string'))return error('Välj elev, handledare och ett giltigt datum.',400);
 return databaseTransaction(async()=>{
  const student=await db.prepare('SELECT id,name FROM students WHERE id=? AND moved_at IS NULL FOR UPDATE').bind(body.studentId).first<{id:string,name:string}>();if(!student)return error('Eleven finns inte.',404);
  await db.prepare('INSERT INTO student_supervisor_revisions(student_id) VALUES(?) ON CONFLICT DO NOTHING').bind(body.studentId).run();
  const state=await db.prepare('SELECT revision FROM student_supervisor_revisions WHERE student_id=? FOR UPDATE').bind(body.studentId).first<{revision:number}>();
  if(state?.revision!==body.revision)return error('Tilldelningen har ändrats av någon annan. Stäng och öppna igen.',409);
  const supervisor=body.supervisorEmail===null?null:await db.prepare("SELECT email,name FROM users WHERE email=? AND role='Handledare' AND disabled_at IS NULL FOR SHARE").bind(body.supervisorEmail).first<{email:string,name:string}>();
  if(body.supervisorEmail!==null&&!supervisor)return error('Välj en befintlig handledare.',400);
  await db.prepare('INSERT INTO student_supervisor_events(id,student_id,supervisor_email,supervisor_name,effective_from,created_at,created_by) VALUES(?,?,?,?,?,?,?) ON CONFLICT(student_id,effective_from) DO UPDATE SET supervisor_email=EXCLUDED.supervisor_email,supervisor_name=EXCLUDED.supervisor_name,created_at=EXCLUDED.created_at,created_by=EXCLUDED.created_by').bind(crypto.randomUUID(),student.id,supervisor?.email||null,supervisor?.name||'',body.from,Date.now(),user.email).run();
  await db.prepare('UPDATE student_supervisor_revisions SET revision=revision+1 WHERE student_id=?').bind(student.id).run();
  await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),Date.now(),user.email,user.name,user.role,supervisor?'Handledare tilldelad':'Handledare borttagen','Elever',student.name+' · '+(supervisor?.name||'Ingen handledare')+' · från '+body.from).run();
  return read();
 });
}
const safe=(fn:(req:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch{return error('Kunde inte läsa eller spara handledare. Kontrollera databasuppdatering 0039.',503)}};
export const GET=secureApi('/api/student-supervisors',safe(read));
export const POST=secureApi('/api/student-supervisors',safe(write));
