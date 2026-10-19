'use client';
import {useEffect,useRef,type ReactNode} from 'react';
export type PreviewRole='Handledare'|'Instruktör'|'Chef';
export function RolePreviewBar({role,busy,onChange,embedded=false}:{role:PreviewRole|null,busy:boolean,onChange:(role:PreviewRole|null)=>void,embedded?:boolean}){
 return <div className={'rolepreviewbar '+(role?'previewactive':'')+(embedded?' rolepreviewlauncher':'')}><div><strong>{role?'Förhandsvisning · '+role:'Förhandsgranska gränssnitt'}</strong><small>{role?'Skrivskyddad vy. Du är fortfarande inloggad som administratör.':'Välj en roll för att se dess menyer och funktioner.'}</small></div><label><span className="sr-only">Förhandsgranska som roll</span><select aria-label="Förhandsgranska som roll" disabled={busy} value={role||''} onChange={e=>onChange((e.target.value||null) as PreviewRole|null)}><option value="">Administratör</option><option>Handledare</option><option>Instruktör</option><option>Chef</option></select></label>{role&&<button type="button" disabled={busy} onClick={()=>onChange(null)}>Avsluta</button>}</div>;
}
// Keep navigation and expand/collapse available while disabling editing controls.
// The server independently applies the preview role and rejects all writes.
export function PreviewShield({active,children}:{active:boolean,children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!active||!root.current)return;const previous=new Map<HTMLInputElement|HTMLButtonElement|HTMLSelectElement|HTMLTextAreaElement,boolean>();
  const apply=()=>{const controls=root.current!.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement|HTMLTextAreaElement>('.details textarea,form input,form textarea,form select,form button:not([aria-expanded]):not([role="tab"]),.editicon,.primary,.textaction,.level,.personnellevel,.assessmentdelete,.personnelmenu button,.commenthead button,.examgroupactions button,.iucategorytoolbar button,[data-mutation]');for(const el of controls){if(!previous.has(el))previous.set(el,el.disabled);if(!el.disabled)el.disabled=true}};
  apply();const observer=new MutationObserver(apply);observer.observe(root.current,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});return()=>{observer.disconnect();for(const [el,disabled]of previous)el.disabled=disabled};
 },[active]);
 return <div ref={root} className="previewshield" onSubmitCapture={active?e=>{e.preventDefault();e.stopPropagation()}:undefined}>{children}</div>;
}
