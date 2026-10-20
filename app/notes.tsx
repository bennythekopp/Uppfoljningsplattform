'use client';
import {useEffect,useState} from 'react';
import {yXmlFragmentToProsemirrorJSON} from '@tiptap/y-tiptap';
import {EditorContent,useEditor} from '@tiptap/react';
import {documentExtensions} from './document-extensions';
import {RichDocument} from './document-editor';
import {openNote,refreshNote,saveNote,type NoteScope,type NoteSession} from './notes-client';

export function NoteLinks({scope,onChange,label='Välj anteckningar',disabled=false}:{scope:NoteScope,onChange:(scope:NoteScope)=>void,label?:string,disabled?:boolean}){
 return <span className="note-links" aria-label={label}><button type="button" disabled={disabled} className={scope==='shared'?'active':''} aria-current={scope==='shared'?'page':undefined} onClick={()=>onChange('shared')}>Gemensamt</button><span aria-hidden="true">|</span><button type="button" disabled={disabled} className={scope==='private'?'active':''} aria-current={scope==='private'?'page':undefined} onClick={()=>onChange('private')}>Privat</button></span>
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
function FormattedNote({session}:{session:NoteSession}){
 const editor=useEditor({extensions:documentExtensions(),immediatelyRender:false,shouldRerenderOnTransaction:true,editable:false,editorProps:{attributes:{class:'document-prose',lang:'sv',spellcheck:'false','aria-label':'Förhandsvisning av anteckningar'}}},[session]);
 useEffect(()=>{if(!editor||editor.isDestroyed)return;const update=()=>{if(!editor.isDestroyed)editor.commands.setContent(yXmlFragmentToProsemirrorJSON(session.doc.getXmlFragment('notes')),{emitUpdate:false})};update();session.doc.on('update',update);return()=>session.doc.off('update',update)},[editor,session]);
 if(!editor)return <span>Läser anteckningar…</span>;
 return editor.isEmpty?<span className="notes-placeholder">Inga anteckningar ännu. Klicka här för att börja skriva.</span>:<div className="notes-preview-document" inert><EditorContent editor={editor}/></div>
}
type PreviewProps={scope:NoteScope,user:string,readonly:boolean,onOpen:()=>void};
export function NotesPreview(props:PreviewProps){return <ScopedNotesPreview key={JSON.stringify([props.user,props.scope,props.readonly])} {...props}/>}
function ScopedNotesPreview({scope,user,readonly,onOpen}:PreviewProps){
 const {session,loading,error}=useNote(scope,user,readonly);
 return <div role="button" tabIndex={0} className="notes-preview" onClick={onOpen} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onOpen()}}} aria-label={'Öppna '+(scope==='private'?'privata':'gemensamma')+' anteckningar'}>{loading?'Läser anteckningar…':error?<span role="alert">{error}</span>:session?<FormattedNote session={session}/>:null}</div>
}
type EditorProps={scope:NoteScope,onScope:(scope:NoteScope)=>void,user:string,readonly:boolean,onBack:()=>void};
export function NotesEditor(props:EditorProps){return <ScopedNotesEditor key={JSON.stringify([props.user,props.scope,props.readonly])} {...props}/>}
function ScopedNotesEditor({scope,onScope,user,readonly,onBack}:EditorProps){
 const {session,loading,error}=useNote(scope,user,readonly);
 return <div className="notes-workspace"><button className="back" onClick={()=>{if(session)void saveNote(session).then(onBack).catch(()=>{});else onBack()}}>← Tillbaka till instruktörspanelen</button><div className="notes-heading"><h1>Anteckningar</h1><NoteLinks scope={scope} onChange={onScope}/><span className={'notes-save '+(session?.error?'bad':'')} role="status">{session?.error?'Kunde inte spara':session?.saving?'Sparar…':session?.pending.length?'Ändringar väntar på sparning':loading?'Läser…':'● Sparas automatiskt'}</span></div>{(error||session?.error)&&<div className="formerror" role="alert">{error||session?.error}{session?.error&&<button onClick={()=>void saveNote(session).catch(()=>{})}>Försök igen</button>}</div>}{session?<div className="notes-editor"><RichDocument key={scope} session={session} tabId="notes" disabled={readonly} search={false} noteMode onEditor={()=>{}} onSelection={()=>{}}/></div>:loading?<p>Läser anteckningar…</p>:null}</div>
}
