'use client';
import {useEffect,useState} from 'react';
import {yXmlFragmentToProsemirrorJSON} from '@tiptap/y-tiptap';
import {RichDocument} from './document-editor';
import {openNote,refreshNote,saveNote,type NoteScope,type NoteSession} from './notes-client';

export function NoteLinks({scope,onChange}:{scope:NoteScope,onChange:(scope:NoteScope)=>void}){
 return <span className="note-links" aria-label="Välj anteckningar"><button type="button" className={scope==='shared'?'active':''} aria-current={scope==='shared'?'page':undefined} onClick={()=>onChange('shared')}>Gemensamt</button><span aria-hidden="true">|</span><button type="button" className={scope==='private'?'active':''} aria-current={scope==='private'?'page':undefined} onClick={()=>onChange('private')}>Privat</button></span>
}
function useNote(scope:NoteScope,user:string,readonly:boolean){
 const [session,setSession]=useState<NoteSession|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[,refresh]=useState(0);
 useEffect(()=>{let alive=true;setSession(null);setLoading(true);setError('');let current:NoteSession|null=null;
  void openNote(scope,user,readonly).then(s=>{if(!alive)return;current=s;setSession(s);setLoading(false);s.listeners.add(changed);void refreshNote(s);}).catch(e=>{if(alive){setLoading(false);setError((e as Error).message)}});
  function changed(){refresh(n=>n+1)}
  const interval=setInterval(()=>{if(current)void refreshNote(current)},2500);
  return()=>{alive=false;clearInterval(interval);if(current){current.listeners.delete(changed);void saveNote(current).catch(()=>{})}}
 },[scope,user,readonly]);return {session,loading,error};
}
function previewText(s:NoteSession){
 try{const json=yXmlFragmentToProsemirrorJSON(s.doc.getXmlFragment('notes'));
  const parts:string[]=[];
  function walk(node:any){if(node.type==='text'&&node.text)parts.push(node.text);else{if(node.type==='taskItem')parts.push(node.attrs?.checked?'☑ ':'☐ ');for(const child of node.content||[])walk(child);if(['heading','paragraph','taskItem','listItem'].includes(node.type))parts.push('\n')}}
  walk(json);return parts.join('').trim()
 }catch{return ''}
}
export function NotesPreview({scope,user,readonly,onOpen}:{scope:NoteScope,user:string,readonly:boolean,onOpen:()=>void}){
 const {session,loading,error}=useNote(scope,user,readonly),text=session?previewText(session):'';
 return <button type="button" className="notes-preview" onClick={onOpen} aria-label={'Öppna '+(scope==='private'?'privata':'gemensamma')+' anteckningar'}>{loading?'Läser anteckningar…':error?<span role="alert">{error}</span>:text?<span className="notes-preview-text">{text}</span>:<span className="notes-placeholder">Inga anteckningar ännu. Klicka här för att börja skriva.</span>}</button>
}
export function NotesEditor({scope,onScope,user,readonly,onBack}:{scope:NoteScope,onScope:(scope:NoteScope)=>void,user:string,readonly:boolean,onBack:()=>void}){
 const {session,loading,error}=useNote(scope,user,readonly);
 return <div className="notes-workspace"><button className="back" onClick={()=>{if(session)void saveNote(session).then(onBack).catch(()=>{});else onBack()}}>← Tillbaka till instruktörspanelen</button><div className="notes-heading"><h1>Anteckningar</h1><NoteLinks scope={scope} onChange={onScope}/><span className={'notes-save '+(session?.error?'bad':'')} role="status">{session?.error?'Kunde inte spara':session?.saving?'Sparar…':session?.pending.length?'Ändringar väntar på sparning':loading?'Läser…':'● Sparas automatiskt'}</span></div>{(error||session?.error)&&<div className="formerror" role="alert">{error||session?.error}{session?.error&&<button onClick={()=>void saveNote(session).catch(()=>{})}>Försök igen</button>}</div>}{session?<div className="notes-editor"><RichDocument key={scope} session={session} tabId="notes" disabled={readonly} search={false} noteMode onEditor={()=>{}} onSelection={()=>{}}/></div>:loading?<p>Läser anteckningar…</p>:null}</div>
}
