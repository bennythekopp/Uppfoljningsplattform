'use client';
import * as Y from 'yjs';
import {panelRequest} from './panel-types';
import {bytes64,from64} from './document-client';

export type NoteScope='private'|'shared';
export type NoteSession={doc:Y.Doc,scope:NoteScope,user:string,pending:Uint8Array[],saving:Promise<void>|null,error:string,listeners:Set<()=>void>,timer:ReturnType<typeof setTimeout>|null,readonly:boolean};
const sessions=new Map<string,NoteSession>();
let activeUser='';
const signal=(s:NoteSession)=>s.listeners.forEach(fn=>fn());
export function activateNotes(user:string){activeUser=user;for(const session of sessions.values())if(session.user!==user&&session.timer){clearTimeout(session.timer);session.timer=null}}
export async function openNote(scope:NoteScope,user:string,readonly=false){
 const key=user+':'+scope,old=sessions.get(key);if(old){old.readonly=readonly;return old}
 const data=await panelRequest('/api/notes?scope='+scope),doc=new Y.Doc();Y.applyUpdate(doc,from64(data.state),'remote');
 const s:NoteSession={doc,scope,user,pending:[],saving:null,error:'',listeners:new Set(),timer:null,readonly};
 doc.on('update',(update:Uint8Array,origin:unknown)=>{if(origin==='remote'||s.readonly)return;s.pending.push(update);signal(s);if(s.timer)clearTimeout(s.timer);s.timer=setTimeout(()=>void saveNote(s).catch(()=>{}),650)});
 sessions.set(key,s);return s;
}
export async function saveNote(s:NoteSession):Promise<void>{
 if(s.readonly)return;if(s.user!==activeUser){if(s.pending.length)throw Error('Logga in på kontot som äger anteckningen för att spara den.');return}
 if(s.saving){await s.saving;if(s.pending.length)return saveNote(s);return}if(!s.pending.length)return;
 const count=s.pending.length,updates=s.pending.slice(0,count);
 s.saving=(async()=>{try{await panelRequest('/api/notes','PUT',{scope:s.scope,update:bytes64(Y.mergeUpdates(updates))});s.pending.splice(0,count);s.error=''}catch(e){s.error=(e as Error).message;throw e}finally{s.saving=null;signal(s)}})();signal(s);await s.saving;if(s.pending.length)await saveNote(s)
}
export async function refreshNote(s:NoteSession){
 if(s.user!==activeUser)return;
 try{const data=await panelRequest('/api/notes?scope='+s.scope+'&vector='+encodeURIComponent(bytes64(Y.encodeStateVector(s.doc))));Y.applyUpdate(s.doc,from64(data.state),'remote');if(!s.pending.length)s.error='';signal(s)}catch(e){s.error=(e as Error).message;signal(s)}
}
export async function flushNotes(){for(const s of sessions.values())if(s.user===activeUser&&(s.pending.length||s.saving))await saveNote(s)}
export function notesPending(){return [...sessions.values()].some(s=>s.user===activeUser&&(s.pending.length||s.saving))}
export function forgetNotes(){for(const s of sessions.values()){if(s.timer)clearTimeout(s.timer);s.doc.destroy()}sessions.clear();activeUser=''}
