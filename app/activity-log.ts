import 'server-only';
import {captureAssessment,completeRecovery} from './assessment-recovery';
import base from './items.json';
import {db,databaseTransaction} from './database';
import {currentUser,error} from './auth';
export async function auditMutation(req:Request,handler:(req:Request)=>Promise<Response>,area:string){
 try{
 const actor=await currentUser();if(!actor)return handler(req);
 const input=await req.clone().json().catch(()=>({})),method=req.method;
 return await databaseTransaction(async()=>{
 const personId=input.studentId||input.personId||(area==='Elever'||area==='Personal'||area==='Personflytt'?input.id:null);
 const person=typeof personId==='string'?await db.prepare('SELECT name FROM students WHERE id=? UNION SELECT name FROM personnel WHERE id=? LIMIT 1').bind(personId,personId).first<{name:string}>():null;
 let target=person?.name||'',qualifier='';
 if(area==='Användare'&&typeof input.username==='string'){const old=await db.prepare('SELECT name FROM users WHERE username=?').bind(input.username.toLowerCase()).first<{name:string}>();target=old?.name||''}
 if(area.includes('underlag')&&input.id!==undefined){
 let old:{title:string}|null=null;
 if(area==='Elevunderlag'){old=input.id>=1000000?await db.prepare('SELECT title FROM custom_moments WHERE id=?').bind(input.id-1000000).first<{title:string}>():await db.prepare('SELECT title FROM moment_edits WHERE item_id=?').bind(input.id).first<{title:string}>();target=old?.title||base.find(i=>i.id===input.id)?.title||''}
 else if(area==='KP-underlag')old=await db.prepare('SELECT title FROM kp_moments WHERE id=?').bind(input.id).first<{title:string}>();
 else if(area==='Examensunderlag'){if(input.type==='scenario')old=await db.prepare('SELECT title FROM exam_templates WHERE id=?').bind(input.id).first<{title:string}>();else{const group=await db.prepare('SELECT moments FROM exam_templates WHERE id=?').bind(input.kind).first<{moments:{id:string,title:string}[]}>();old=group?.moments.find(m=>m.id===input.id)||null}}
 else if(area==='Operativa underlag')old=await db.prepare('SELECT title FROM iu_operational_categories WHERE id=?').bind(input.id).first<{title:string}>();
 else if(area==='Simulatorunderlag')old=await db.prepare('SELECT title FROM iu_simulator_groups WHERE id=?').bind(input.id).first<{title:string}>();
 else if(area==='IU-underlag')old=await db.prepare('SELECT title FROM iu_moments WHERE id=?').bind(input.id).first<{title:string}>();
 if(old)target=old.title;
 }
 if(area==='Elevhistorik'&&typeof input.id==='string'){const old=await db.prepare('SELECT kind FROM personnel_student_archives WHERE id=?').bind(input.id).first<{kind:string}>();qualifier=old?.kind==='student'?'Elevbedömning':old?.kind||''}
 if(area==='Individuell uppföljning'&&typeof input.id==='string'){const old=await db.prepare('SELECT followup_date AS date FROM personnel_followups WHERE id=?').bind(input.id).first<{date:string}>();qualifier=old?.date||''}
 if(area==='Kommentarer'&&!target&&typeof input.id==='string'){const row=await db.prepare('SELECT s.name FROM comments c JOIN students s ON s.id=c.student_id WHERE c.id=?').bind(input.id).first<{name:string}>();target=row?.name||''}
 const recovery=method==='DELETE'?await captureAssessment(area,input):null;
 const response=await handler(req);if(!response.ok)throw response;
 const output=await response.clone().json().catch(()=>({}));
 const undo=await completeRecovery(recovery,output);
 let action=method==='DELETE'?'Borttaget':method==='POST'?(input.id?'Ändrat':'Skapat'):'Ändrat';
 if(area==='Användare')action=method==='DELETE'?'Användare borttagen':method==='POST'?'Användare skapad':'Användare ändrad';
 if(area==='Bedömning'||area==='KP'||area==='Examen'||area==='Individuell uppföljning')action=method==='DELETE'?'Bedömning borttagen':method==='PUT'?'Pågående bedömning ändrad':'Bedömning sparad';
 if(area==='Bedömning')action=method==='DELETE'?'Bedömning borttagen':'Bedömning ändrad';
 if(area==='Kommentarer')action=method==='DELETE'?'Kommentar borttagen':'Kommentar tillagd';
 if(area==='Utkast')action=method==='DELETE'?'Pågående bedömning borttagen':'Pågående bedömning ändrad';
 if(area==='Personflytt')action='Person flyttad';
 if(area==='Utloggning')action='Utloggad';
 if(area==='Lösenord')action='Lösenord ändrat';
 if(area==='Elevhistorik')action='Arkiverad bedömning borttagen';
 if(area.includes('underlag'))action=method==='DELETE'?'Underlag borttaget':method==='POST'&&!input.id?'Underlag skapat':'Underlag ändrat';
 const detail=[target||output.name||input.name||input.username||'',input.kind==='op'?'Operativ':input.kind==='simulator'?'Simulator':input.kind||input.category||'',input.title||'',qualifier,area==='Personflytt'?(input.source==='students'?'Elever → Personal':'Personal → Elever'):'',typeof input.itemId==='number'?'Moment '+input.itemId:''].filter(Boolean).join(' · ');
 await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target,undo_payload) VALUES(?,?,?,?,?,?,?,?,?::jsonb)').bind(crypto.randomUUID(),Date.now(),actor.email,actor.name,actor.role,action,area,String(detail||input.id||area).slice(0,1000),undo?JSON.stringify(undo):null).run();
 return response;
 });
 }catch(e){if(e instanceof Response)return e;return error('Ändringen kunde inte sparas tillsammans med aktivitetsloggen. Kontrollera att databasuppdateringarna till och med 0019 är körda.',503)}
}
