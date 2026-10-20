import * as Y from 'yjs';
import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {panelBody,panelLog,PanelError} from '../../panel-server';

export const dynamic='force-dynamic';
type NoteRow={state:string,revision:number,updated_at:number};
function key(scope:string,email:string){
 if(scope==='shared')return {id:'shared',owner:null};
 if(scope==='private')return {id:'private:'+email,owner:email};
 throw new PanelError('Ogiltig anteckningsvy');
}
function decode(value:string){
 if(typeof value!=='string'||value.length>3500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw new PanelError('Anteckningen är för stor eller ogiltig',413);
 const doc=new Y.Doc();try{Y.applyUpdate(doc,Buffer.from(value,'base64'));return doc}catch{doc.destroy();throw new PanelError('Ogiltigt anteckningsinnehåll')}
}
async function read(req:Request){
 const actor=(await currentUser())!,scope=new URL(req.url).searchParams.get('scope')||'',note=key(scope,actor.email);
 const row=await db.prepare('SELECT state,revision,updated_at FROM panel_notes WHERE id=? AND owner_email IS NOT DISTINCT FROM ?').bind(note.id,note.owner).first<NoteRow>();
 const doc=row?decode(row.state):new Y.Doc();
 try{
  let state:Uint8Array;const vector=new URL(req.url).searchParams.get('vector');
  if(vector){if(vector.length>20000||!/^[A-Za-z0-9+/]*={0,2}$/.test(vector))throw new PanelError('Ogiltig synkroniseringsnyckel');try{state=Y.encodeStateAsUpdate(doc,Buffer.from(vector,'base64'))}catch{throw new PanelError('Ogiltig synkroniseringsnyckel')}}else state=Y.encodeStateAsUpdate(doc);
  return Response.json({state:Buffer.from(state).toString('base64'),revision:row?.revision||0,updatedAt:row?.updated_at||0});
 }finally{doc.destroy()}
}
async function write(req:Request){
 const actor=(await currentUser())!,body=await panelBody(req,3600000),note=key(body.scope,actor.email);
 if(typeof body.update!=='string'||!body.update)throw new PanelError('Ändringen saknas');
 const incoming=decode(body.update);
 try{return await databaseTransaction(async()=>{
  // Creating the row first also serializes two simultaneous first edits.
  const empty=new Y.Doc(),initial=Buffer.from(Y.encodeStateAsUpdate(empty)).toString('base64');empty.destroy();
  await db.prepare('INSERT INTO panel_notes(id,owner_email,state,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(note.id,note.owner,initial,Date.now(),actor.email).run();
  const row=await db.prepare('SELECT state,revision,updated_at FROM panel_notes WHERE id=? AND owner_email IS NOT DISTINCT FROM ? FOR UPDATE').bind(note.id,note.owner).first<NoteRow>();
  if(!row)throw new PanelError('Anteckningen kunde inte öppnas',404);
  const doc=decode(row.state);
  try{
   Y.applyUpdate(doc,Y.encodeStateAsUpdate(incoming));
   // Only the designated fragment is used by the editor. Limit saved image and text size.
   const state=Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');
   if(state.length>3500000)throw new PanelError('Anteckningen är för stor',413);
   if(state!==row.state){await db.prepare('UPDATE panel_notes SET state=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND owner_email IS NOT DISTINCT FROM ?').bind(state,Date.now(),actor.email,note.id,note.owner).run();
    await panelLog(actor,note.owner?'Privat anteckning ändrad':'Gemensam anteckning ändrad',note.owner?'Privata anteckningar':'Gemensamma anteckningar','notes-'+note.id+'-'+actor.email+'-'+Math.floor(Date.now()/60000));}
   return Response.json({ok:true});
  }finally{doc.destroy()}
 })}finally{incoming.destroy()}
}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch(e){return error(e instanceof PanelError?e.message:'Anteckningarna kunde inte läsas eller sparas. Kontrollera databasuppdatering 0023.',e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/notes',handle(read));
export const PUT=secureApi('/api/notes',handle(write));
