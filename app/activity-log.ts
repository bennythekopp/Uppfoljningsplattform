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
 // Keep autosaving, but represent one continuous editing burst with one audit row.
 // Lock the assessment before its handler so overlapping requests cannot duplicate rows.
 const editScope=area==='Utkast'||area==='Individuell uppföljning'?'IU':area;
 const editKey=['KP','Examen','IU'].includes(editScope)&&typeof personId==='string'
   ?JSON.stringify([editScope,personId,input.kind||'']):null;
 if(editKey)await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('audit-edit:'+editKey).first();
 const person=typeof personId==='string'?await db.prepare('SELECT name FROM students WHERE id=? UNION SELECT name FROM personnel WHERE id=? LIMIT 1').bind(personId,personId).first<{name:string}>():null;
 let target=person?.name||'',qualifier='',accountChange='';
 if(area==='Användare'&&typeof input.username==='string'){const old=await db.prepare('SELECT name,role FROM users WHERE username=? FOR UPDATE').bind(input.username.toLowerCase()).first<{name:string,role:string}>();target=old?.name||'';if(method==='PUT'&&old&&typeof input.role==='string'&&old.role!==input.role)accountChange='Roll: '+old.role+' → '+input.role;if(method==='PUT'&&typeof input.password==='string'&&input.password)accountChange=[accountChange,'Lösenord återställt'].filter(Boolean).join(' · ')}
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
 if(area==='Examen'&&method==='PATCH'&&typeof input.studentId==='string'&&typeof input.logId==='string'){const old=await db.prepare('SELECT data FROM student_examinations WHERE student_id=?').bind(input.studentId).first<{data:{logs:{id:string,date:string,part:string}[]}}>();const log=old?.data.logs.find(item=>item.id===input.logId);qualifier=log?`${log.date} · ${log.part==='op'?'Operativ':'Simulator'}`:''}
 if(area==='Kommentarer'&&!target&&typeof input.id==='string'){const row=await db.prepare('SELECT s.name FROM comments c JOIN students s ON s.id=c.student_id WHERE c.id=?').bind(input.id).first<{name:string}>();target=row?.name||''}
 const recovery=method==='DELETE'?await captureAssessment(area,input):null;
 const response=await handler(req);if(!response.ok)throw response;
 const output=await response.clone().json().catch(()=>({}));
 const undo=await completeRecovery(recovery,output);
 let action=method==='DELETE'?'Borttaget':method==='POST'?(input.id?'Ändrat':'Skapat'):'Ändrat';
 if(area==='Användare')action=method==='DELETE'?'Användare borttagen':method==='POST'?'Användare skapad':accountChange.startsWith('Roll:')?'Behörighet ändrad':'Användare ändrad';
 if(area==='Bedömning'||area==='KP'||area==='Examen'||area==='Individuell uppföljning')action=method==='DELETE'?'Bedömning borttagen':method==='PUT'?'Pågående bedömning ändrad':'Bedömning sparad';
 if(area==='Examen'&&method==='PATCH')action='Genomförandelogg borttagen';
 if(area==='Bedömning')action=method==='DELETE'?'Bedömning borttagen':'Bedömning ändrad';
 if(area==='Kommentarer')action=method==='DELETE'?'Kommentar borttagen':'Kommentar tillagd';
 if(area==='Utkast')action=method==='DELETE'?'Pågående bedömning borttagen':'Pågående bedömning ändrad';
 if(area==='Personflytt')action='Person flyttad';
 if(area==='Utloggning')action='Utloggad';
 if(area==='Lösenord')action='Lösenord ändrat';
 if(area==='Elevhistorik')action='Arkiverad bedömning borttagen';
 if(area==='Årets IU')action='Årets IU nollställd';
 if(area==='Sortering av underlag')action='Ordning ändrad';
 if(area.includes('underlag')&&area!=='Sortering av underlag')action=method==='DELETE'?'Underlag borttaget':method==='POST'&&!input.id?'Underlag skapat':'Underlag ändrat';
 if(area==='Sortering av underlag')target=typeof input.scope==='string'?input.scope:'';
 const detail=[target||output.name||input.name||input.username||'',input.kind==='op'?'Operativ':input.kind==='simulator'?'Simulator':input.kind||input.category||'',input.title||'',qualifier,accountChange,area==='Personflytt'?(input.source==='students'?'Elever → Personal':'Personal → Elever'):'',typeof input.itemId==='number'?'Moment '+input.itemId:''].filter(Boolean).join(' · ');
 const now=Date.now(),auditTarget=String(detail||input.id||area).slice(0,1000);
 const autosave=!!editKey&&method==='PUT';
 const previous=autosave?await db.prepare('SELECT id FROM activity_log WHERE edit_key=? AND actor_email=? AND actor_role=? AND occurred_at>=? ORDER BY occurred_at DESC,id DESC LIMIT 1 FOR UPDATE').bind(editKey,actor.email,actor.role,now-30000).first<{id:string}>():null;
 if(previous){
   await db.prepare('UPDATE activity_log SET occurred_at=?,actor_name=?,target=? WHERE id=?').bind(now,actor.name,auditTarget,previous.id).run();
 }else{
   // A final save/deletion closes the burst, including when another user finalizes it.
   if(editKey&&!autosave)await db.prepare('UPDATE activity_log SET edit_key=NULL WHERE edit_key=?').bind(editKey).run();
   await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target,undo_payload,edit_key) VALUES(?,?,?,?,?,?,?,?,?::jsonb,?)').bind(crypto.randomUUID(),now,actor.email,actor.name,actor.role,action,area,auditTarget,undo?JSON.stringify(undo):null,autosave?editKey:null).run();
 }
 return response;
 });
 }catch(e){if(e instanceof Response)return e;return error('Ändringen kunde inte sparas tillsammans med aktivitetsloggen. Kontrollera att databasuppdateringarna till och med 0028 är körda.',503)}
}
