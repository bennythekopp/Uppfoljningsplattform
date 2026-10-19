import * as Y from 'yjs';
import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {panelBody,panelLog,PanelError,short,type PanelActor} from '../../panel-server';
export const dynamic='force-dynamic';
type Row={id:string,title:string,state:string,epoch:number,revision:number,created_at:number,updated_at:number};
function decode(state:string){if(typeof state!=='string'||state.length>3500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(state))throw new PanelError('Dokumentet är för stort eller ogiltigt',413);const doc=new Y.Doc();try{Y.applyUpdate(doc,Buffer.from(state,'base64'));return doc}catch{doc.destroy();throw new PanelError('Ogiltigt dokumentinnehåll')}}
async function document(id:string,lock=false){const row=await db.prepare('SELECT * FROM panel_documents WHERE id=? AND deleted_at IS NULL'+(lock?' FOR UPDATE':'')).bind(id).first<Row>();if(!row)throw new PanelError('Dokumentet finns inte',404);return row}
async function version(row:Row,u:PanelActor,label:string){await db.prepare('INSERT INTO panel_document_versions(id,document_id,state,title,created_at,created_by,creator_name,label) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),row.id,row.state,row.title,Date.now(),u.email,u.name,label).run();await db.prepare('DELETE FROM panel_document_versions WHERE document_id=? AND id NOT IN(SELECT id FROM panel_document_versions WHERE document_id=? ORDER BY created_at DESC,id DESC LIMIT 200)').bind(row.id,row.id).run()}
async function get(req:Request){const url=new URL(req.url),id=short(url.searchParams.get('id'));const row=await document(id);
 if(url.searchParams.get('versions'))return Response.json((await db.prepare('SELECT id,title,created_at AS createdAt,creator_name AS creatorName,label FROM panel_document_versions WHERE document_id=? ORDER BY created_at DESC LIMIT 200').bind(id).all()).results);
 if(url.searchParams.get('version')){const v=await db.prepare('SELECT state,title FROM panel_document_versions WHERE id=? AND document_id=?').bind(url.searchParams.get('version'),id).first();if(!v)throw new PanelError('Versionen finns inte',404);return Response.json(v)}
 const comments=(await db.prepare('SELECT id,tab_id AS tabId,body,quote,suggestion,status,created_at AS createdAt,created_by AS createdBy,creator_name AS creatorName,revision FROM panel_document_comments WHERE document_id=? ORDER BY created_at').bind(id).all()).results;
 const presence=(await db.prepare('SELECT name,user_email AS email FROM panel_document_presence WHERE document_id=? AND seen_at>?').bind(id,Date.now()-45000).all()).results;
 let state=row.state;const vector=url.searchParams.get('vector');if(vector){if(vector.length>20000||!/^[A-Za-z0-9+/]*={0,2}$/.test(vector))throw new PanelError('Ogiltig synkroniseringsnyckel');const doc=decode(row.state);try{state=Buffer.from(Y.encodeStateAsUpdate(doc,Buffer.from(vector,'base64'))).toString('base64')}catch{throw new PanelError('Ogiltig synkroniseringsnyckel')}finally{doc.destroy()}}
 return Response.json({id,title:row.title,epoch:row.epoch,revision:row.revision,state,comments,presence});}
async function create(req:Request){const u=(await currentUser())!,b=await panelBody(req),id=crypto.randomUUID();return databaseTransaction(async()=>{
 let state='';if(b.templateId){const template=await db.prepare("SELECT data FROM panel_items WHERE id=? AND kind='document-template'").bind(short(b.templateId)).first<{data:{state?:string}}>();if(!template)throw new PanelError('Mallen finns inte',404);state=template.data.state||''}
 if(b.copyId)state=(await document(short(b.copyId))).state;
 const doc=state?decode(state):new Y.Doc(),title=short(b.title)||'Nytt dokument';doc.getMap('meta').set('title',title);
 if(!doc.getArray('tabs').length)doc.getArray('tabs').push([{id:crypto.randomUUID(),title:'Översikt'},{id:crypto.randomUUID(),title:'Mål'},{id:crypto.randomUUID(),title:'Att göra'},{id:crypto.randomUUID(),title:'Anteckningar'}]);
 const encoded=Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');doc.destroy();const now=Date.now();await db.prepare('INSERT INTO panel_documents(id,title,state,created_at,created_by,updated_at,updated_by) VALUES(?,?,?,?,?,?,?)').bind(id,title,encoded,now,u.email,now,u.email).run();await version({id,title,state:encoded,epoch:1,revision:1,created_at:now,updated_at:now},u,'Skapat');await panelLog(u,'Dokument skapat',title);return Response.json({id,title});});}
async function sync(req:Request){const u=(await currentUser())!,b=await panelBody(req,3600000);return databaseTransaction(async()=>{
 const row=await document(short(b.id),true);if(b.epoch!==row.epoch)throw new PanelError('Dokumentet har återställts av en annan användare. Dina lokala ändringar behålls här. Exportera dem innan du öppnar den återställda versionen.',409);
 if(b.update){const doc=decode(row.state),incoming=decode(b.update);try{Y.applyUpdate(doc,Y.encodeStateAsUpdate(incoming));const state=Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');if(state.length>3500000)throw new PanelError('Dokumentet är för stort. Använd mindre bilder eller dela upp det.',413);
 const tabs=doc.getArray<any>('tabs').toArray();if(tabs.length>30||tabs.some(t=>!t||typeof t.id!=='string'||typeof t.title!=='string'))throw new PanelError('Högst 30 dokumentflikar stöds');
 const title=short(doc.getMap('meta').get('title'))||'Namnlöst dokument';
 if(state!==row.state){
 const last=await db.prepare('SELECT created_at AS at FROM panel_document_versions WHERE document_id=? ORDER BY created_at DESC LIMIT 1').bind(row.id).first<{at:number}>();if(!last||Date.now()-last.at>300000)await version(row,u,'Automatisk version');
 await db.prepare('UPDATE panel_documents SET state=?,title=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(state,title,Date.now(),u.email,row.id).run();
 await panelLog(u,'Dokument ändrat',title,'document-'+row.id+'-'+u.email+'-'+Math.floor(Date.now()/60000));
 }
 }finally{doc.destroy();incoming.destroy()}}
 await db.prepare('INSERT INTO panel_document_presence(document_id,user_email,name,seen_at) VALUES(?,?,?,?) ON CONFLICT(document_id,user_email) DO UPDATE SET name=EXCLUDED.name,seen_at=EXCLUDED.seen_at').bind(row.id,u.email,u.name,Date.now()).run();
 await db.prepare('DELETE FROM panel_document_presence WHERE seen_at<?').bind(Date.now()-86400000).run();return Response.json({ok:true});});}
async function patch(req:Request){const u=(await currentUser())!,b=await panelBody(req);return databaseTransaction(async()=>{
 const row=await document(short(b.id),true);
 if(b.action==='version'){await version(row,u,short(b.label)||'Manuellt sparad version');await panelLog(u,'Dokumentversion sparad',row.title)}
 else if(b.action==='restore'){
 if(b.epoch!==row.epoch||b.revision!==row.revision)throw new PanelError('Dokumentet har ändrats. Läs in senaste versionen och försök igen.',409);
 const active=await db.prepare('SELECT user_email FROM panel_document_presence WHERE document_id=? AND user_email<>? AND seen_at>?').bind(row.id,u.email,Date.now()-45000).first();if(active)throw new PanelError('Andra användare har dokumentet öppet. Be dem stänga det innan du återställer.',409);
 const v=await db.prepare('SELECT state,title FROM panel_document_versions WHERE id=? AND document_id=?').bind(short(b.versionId),row.id).first<{state:string,title:string}>();if(!v)throw new PanelError('Versionen finns inte',404);await version(row,u,'Före återställning');await db.prepare('UPDATE panel_documents SET state=?,title=?,epoch=epoch+1,revision=revision+1,updated_at=?,updated_by=? WHERE id=?').bind(v.state,v.title,Date.now(),u.email,row.id).run();await panelLog(u,'Dokumentversion återställd',row.title);
 }
 else if(b.action==='delete'){if(b.revision!==row.revision)throw new PanelError('Dokumentet har ändrats. Uppdatera innan du tar bort det.',409);await version(row,u,'Före borttagning');await db.prepare('UPDATE panel_documents SET deleted_at=?,epoch=epoch+1 WHERE id=?').bind(Date.now(),row.id).run();await panelLog(u,'Dokument borttaget',row.title)}
 else if(b.action==='comment'){
 const body=short(b.body,10000),tabId=short(b.tabId),quote=short(b.quote,5000),suggestion=typeof b.suggestion==='string'?short(b.suggestion,10000):null;if(!body)throw new PanelError('Skriv en kommentar');if(suggestion!==null&&!quote)throw new PanelError('Markera text för ett ändringsförslag');const doc=decode(row.state);const exists=doc.getArray<any>('tabs').toArray().some(t=>t.id===tabId);doc.destroy();if(!exists)throw new PanelError('Dokumentfliken finns inte',404);
 await db.prepare('INSERT INTO panel_document_comments(id,document_id,tab_id,body,quote,suggestion,created_at,created_by,creator_name) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),row.id,tabId,body,quote,suggestion,Date.now(),u.email,u.name).run();await panelLog(u,suggestion===null?'Dokumentkommentar tillagd':'Ändringsförslag tillagt',row.title);
 }
 else if(b.action==='comment-status'){
 if(!['resolved','open','accepted','rejected'].includes(b.status))throw new PanelError('Ogiltig status');const result=await db.prepare('UPDATE panel_document_comments SET status=?,revision=revision+1 WHERE id=? AND document_id=? AND revision=?').bind(b.status,short(b.commentId),row.id,b.commentRevision).run();if(!result.meta.changes)throw new PanelError('Kommentaren har ändrats. Uppdatera och försök igen.',409);await panelLog(u,'Dokumentkommentar hanterad',row.title);
 }else throw new PanelError('Okänd åtgärd');return Response.json({ok:true});});}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(r:Request)=>{try{return await fn(r)}catch(e){return error(e instanceof PanelError?e.message:'Dokumentet kunde inte läsas eller sparas. Kontrollera databasuppdatering 0022.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/documents',handle(get));
export const POST=secureApi('/api/documents',handle(create));
export const PUT=secureApi('/api/documents',handle(sync));
export const PATCH=secureApi('/api/documents',handle(patch));
