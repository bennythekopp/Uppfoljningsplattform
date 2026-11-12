'use client';
import * as Y from 'yjs';
import {bytes64,from64} from './document-client';
// Account-scoped recovery data. Never store credentials or overwrite another account's draft.
export function draftKey(user:string,id:string){return 'tc-document-draft-v21:'+encodeURIComponent(user)+':'+encodeURIComponent(id)}
export function readDraft(key:string):{update:string,state?:string,epoch?:number}|null{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null}catch{return null}}
export function writeDraft(key:string,pending:Uint8Array[],epoch?:number,doc?:Y.Doc){try{if(pending.length)localStorage.setItem(key,JSON.stringify({update:bytes64(Y.mergeUpdates(pending)),epoch,...(doc?{state:bytes64(Y.encodeStateAsUpdate(doc))}:{})}));else localStorage.removeItem(key);return true}catch{return false}}
export function recoverDraft(key:string,doc:Y.Doc,pending:Uint8Array[],epoch?:number){const saved=readDraft(key);if(!saved)return false;if(saved.epoch!==epoch)return true;const update=from64(saved.update);Y.applyUpdate(doc,update,'remote');pending.push(update);return false}
const deadlines=new WeakMap<object,number>();
export function scheduleSave(s:{timer:ReturnType<typeof setTimeout>|null},save:()=>Promise<void>){const now=Date.now(),deadline=deadlines.get(s)||now+30000;deadlines.set(s,deadline);if(s.timer)clearTimeout(s.timer);s.timer=setTimeout(()=>{s.timer=null;deadlines.delete(s);void save().catch(()=>{})},Math.min(2000,Math.max(0,deadline-now)))}
