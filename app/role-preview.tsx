'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
export type PreviewRole='Administratör'|'Handledare'|'Instruktör'|'Chef';
export function RolePreviewBar({role,busy,onChange,embedded=false,users=[],name=''}:{role:PreviewRole|null,busy:boolean,onChange:(userEmail:string|null)=>void,embedded?:boolean,users?:{email:string,name:string,role:string,blockedAt?:number|null}[],name?:string}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState('');
 const choices=users.filter(u=>!u.blockedAt&&(u.name+' '+u.role).toLocaleLowerCase('sv').includes(query.toLocaleLowerCase('sv'))).sort((a,b)=>a.name.localeCompare(b.name,'sv'));
 if(!embedded)return <div className="rolepreviewbar previewactive"><div><strong>Förhandsvisning · {name||role}</strong><small>Skrivskyddad vy. Du är fortfarande inloggad som administratör.</small></div><button type="button" disabled={busy} onClick={()=>onChange(null)}>Avsluta förhandsvisning</button></div>;
 return <div className="rolepreviewbar rolepreviewlauncher user-preview-launcher"><div><strong>Förhandsgranska gränssnitt</strong><small>Välj en användare för att förhandsgranska personens gränssnitt.</small></div><label>Sök användare<input type="search" placeholder="Sök användare" value={query} onChange={e=>{setQuery(e.target.value);setSelected('')}} disabled={busy}/></label><label>Användare<select aria-label="Förhandsgranska som användare" disabled={busy} value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Välj användare</option>{choices.map(u=><option key={u.email} value={u.email}>{u.name} · {u.role}</option>)}</select></label><button type="button" className="primary" disabled={busy||!choices.some(u=>u.email===selected)} onClick={()=>onChange(selected)}>Förhandsgranska</button><small className="user-preview-hint">Visar användarens menyer och behörigheter. Förhandsvisningen är skrivskyddad.</small></div>;
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
