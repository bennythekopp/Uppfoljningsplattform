import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {panelBody,panelLog,PanelError,short,staffList} from '../../panel-server';
export const dynamic='force-dynamic';
async function get(){const u=(await currentUser())!;const [items,documents,prefs,reads,users]=await Promise.all([
 db.prepare('SELECT id,kind,owner_email AS ownerEmail,data,revision,updated_at AS updatedAt,updated_by AS updatedBy FROM panel_items WHERE owner_email IS NULL OR owner_email=? ORDER BY updated_at DESC').bind(u.email).all(),
 db.prepare('SELECT id,title,epoch,revision,updated_at AS updatedAt,updated_by AS updatedBy FROM panel_documents WHERE deleted_at IS NULL ORDER BY updated_at DESC').all(),
 db.prepare('SELECT data,revision FROM panel_preferences WHERE user_email=?').bind(u.email).first<{data:unknown,revision:number}>(),
 db.prepare('SELECT notice_id AS noticeId,user_email AS userEmail FROM panel_notice_reads').all(),staffList()]);
 return Response.json({items:items.results,documents:documents.results,preferences:prefs?.data||{},preferenceRevision:prefs?.revision||0,reads:reads.results,users});}
async function mutate(req:Request){const u=(await currentUser())!,b=await panelBody(req,4000000);return databaseTransaction(async()=>{
 if(b.action==='preference'){
  if(!['layout','favorites','shortcuts','introduction'].includes(b.key))throw new PanelError('Ogiltig inställning');
  if(b.key==='layout'&&(!Array.isArray(b.value)||b.value.length>40||b.value.some((m:any)=>!m||typeof m.id!=='string'||!['notices','documents','tasks','templates','introduction','reminders','favorites','shortcuts'].includes(m.kind)||!['x','y','w','h'].every(k=>Number.isInteger(m[k]))||m.x<0||m.y<0||m.y>1000||m.w<2||m.w>12||m.x+m.w>12||m.h<3||m.h>20)||new Set(b.value.map((m:any)=>m.id)).size!==b.value.length))throw new PanelError('Ogiltig layout');
  if(b.key==='favorites'&&(!Array.isArray(b.value)||b.value.length>100||b.value.some((f:any)=>!f||typeof f.id!=='string'||typeof f.title!=='string'||f.title.length>300||f.documentId&&typeof f.documentId!=='string'||f.view&&!['overview','documents','tasks','templates','notices','introduction','reminders'].includes(f.view))))throw new PanelError('Ogiltiga favoriter');
  if(b.key==='shortcuts'&&(!Array.isArray(b.value)||b.value.length>10||b.value.some((v:any)=>!['new-document','new-notice','new-task','new-reminder','people','assessments'].includes(v))))throw new PanelError('Ogiltiga snabbåtgärder');
  if(b.key==='introduction'&&(!b.value||Array.isArray(b.value)||typeof b.value!=='object'||Object.keys(b.value).length>1000||Object.values(b.value).some(v=>typeof v!=='boolean')))throw new PanelError('Ogiltiga framsteg');
  await db.prepare('INSERT INTO panel_preferences(user_email,data,revision) VALUES(?,?::jsonb,1) ON CONFLICT(user_email) DO NOTHING').bind(u.email,'{}').run();
  const old=await db.prepare('SELECT revision FROM panel_preferences WHERE user_email=? FOR UPDATE').bind(u.email).first<{revision:number}>();
  if(old!.revision!==(b.revision||1))throw new PanelError('Dina inställningar har ändrats på en annan flik. Uppdatera och försök igen.',409);
  await db.prepare('UPDATE panel_preferences SET data=data || ?::jsonb,revision=revision+1 WHERE user_email=?').bind(JSON.stringify({[b.key]:b.value}),u.email).run();
  await panelLog(u,'Personlig panel ändrad',b.key);return Response.json({ok:true});
 }
 if(b.action==='read'){
  const found=await db.prepare("SELECT id FROM panel_items WHERE id=? AND kind='notice'").bind(short(b.id)).first();if(!found)throw new PanelError('Anslaget finns inte',404);
  await db.prepare('INSERT INTO panel_notice_reads(notice_id,user_email,read_at) VALUES(?,?,?) ON CONFLICT(notice_id,user_email) DO NOTHING').bind(b.id,u.email,Date.now()).run();return Response.json({ok:true});
 }
 let old:any=null;if(b.id){old=await db.prepare('SELECT * FROM panel_items WHERE id=? AND (owner_email IS NULL OR owner_email=?) FOR UPDATE').bind(short(b.id),u.email).first();if(!old)throw new PanelError('Innehållet finns inte',404);if(old.revision!==b.revision)throw new PanelError('Innehållet har ändrats. Uppdatera och försök igen.',409)}
 if(b.action==='delete'){if(!old)throw new PanelError('Välj innehåll');await db.prepare('DELETE FROM panel_items WHERE id=?').bind(old.id).run();await panelLog(u,'Modulinnehåll borttaget',old.kind==='reminder'?'Personlig påminnelse':old.data.title);return Response.json({ok:true})}
 if(b.action!=='save')throw new PanelError('Okänd åtgärd');
 const kind=old?.kind||b.kind;if(!['task','notice','introduction','reminder','document-template','email-template'].includes(kind))throw new PanelError('Ogiltig modul');
 const raw=b.data||{},title=short(raw.title);if(!title)throw new PanelError('Ange en rubrik');
 const data:any={title,body:short(raw.body,30000)};
 if(['task','reminder'].includes(kind)){data.due=short(raw.due,30);if(data.due&&!/^\d{4}-\d\d-\d\d(T\d\d:\d\d)?$/.test(data.due))throw new PanelError('Ogiltigt datum');data.done=raw.done===true;data.assignee=short(raw.assignee);if(data.assignee&&!(await staffList()).some((s:any)=>s.email===data.assignee))throw new PanelError('Ansvarig måste vara instruktör eller administratör');data.priority=['normal','high'].includes(raw.priority)?raw.priority:'normal'}
 if(kind==='notice')data.important=raw.important===true;
 if(typeof raw.documentId==='string'&&raw.documentId){const doc=await db.prepare('SELECT id FROM panel_documents WHERE id=? AND deleted_at IS NULL').bind(raw.documentId).first();if(!doc)throw new PanelError('Dokumentet finns inte');data.documentId=raw.documentId}
 if(kind==='email-template'){data.to=short(raw.to,1000).replace(/[\r\n]/g,'');data.subject=short(raw.subject,1000).replace(/[\r\n]/g,'')}
 if(kind==='document-template'){
  if(raw.sourceDocumentId){const doc=await db.prepare('SELECT state FROM panel_documents WHERE id=? AND deleted_at IS NULL').bind(short(raw.sourceDocumentId)).first<{state:string}>();if(!doc)throw new PanelError('Välj ett dokument att använda som mall');data.state=doc.state}
  else if(old?.data.state)data.state=old.data.state;
 }
 const id=old?.id||crypto.randomUUID(),now=Date.now();
 if(old)await db.prepare('UPDATE panel_items SET data=?::jsonb,revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(JSON.stringify(data),now,u.email,id).run();
 else await db.prepare('INSERT INTO panel_items(id,kind,owner_email,data,created_at,updated_at,updated_by) VALUES(?,?,?,?::jsonb,?,?,?)').bind(id,kind,kind==='reminder'?u.email:null,JSON.stringify(data),now,now,u.email).run();
 await panelLog(u,old?'Modulinnehåll ändrat':'Modulinnehåll skapat',kind==='reminder'?'Personlig påminnelse':title);return Response.json({id});
});}
function handle(fn:(r:Request)=>Promise<Response>){return async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Panelen kunde inte läsas eller sparas. Kontrollera databasuppdatering 0022.',e instanceof PanelError?e.status:503)}}}
export const GET=secureApi('/api/panel',handle(get));
export const POST=secureApi('/api/panel',handle(mutate));
