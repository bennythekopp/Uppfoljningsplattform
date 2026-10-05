'use client';
import { useEffect,useRef,useState,type ReactNode } from 'react';
import { Menu,X } from 'lucide-react';
export default function WorkspaceNavigation({children,account}:{children:ReactNode,account:ReactNode}){
 const [open,setOpen]=useState(false);const drawer=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  drawer.current?.querySelector<HTMLButtonElement>('.drawerclose')?.focus();
  const keys=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();setOpen(false)}
   if(e.key==='Tab'){
    const buttons=Array.from(drawer.current?.querySelectorAll<HTMLElement>('button,[href],input,[tabindex="0"]')||[]).filter(el=>el.getClientRects().length);
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
   }
  };
  const resize=()=>{if(window.innerWidth>900)setOpen(false)};
  window.addEventListener('keydown',keys);window.addEventListener('resize',resize);
  return()=>{document.body.style.overflow=oldOverflow;window.removeEventListener('keydown',keys);window.removeEventListener('resize',resize);trigger.current?.focus()};
 },[open]);
 return <><header className="mobileheader"><button ref={trigger} type="button" className="menutrigger" aria-label="Öppna meny" aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(true)}><Menu size={26}/></button><img src="/logo.png" alt="" width={34} height={34}/><div><strong>Bedömningsstöd</strong><small>TC BODEN</small></div></header>{open&&<button type="button" className="draweroverlay" aria-label="Stäng meny" tabIndex={-1} onClick={()=>setOpen(false)}/>}
 <aside ref={drawer} id="workspace-navigation" className={'sidebar workspace-sidebar '+(open?'draweropen':'')} role={open?'dialog':undefined} aria-modal={open||undefined} aria-label="Sidomeny"><div className="brand"><span className="brandmark"><img src="/logo.png" alt="TC Boden" width={38} height={38}/></span><span>Bedömningsstöd<small>TC BODEN</small></span><button type="button" className="drawerclose" aria-label="Stäng meny" onClick={()=>setOpen(false)}><X size={24}/></button></div><div className="navigation-scroll" onClick={e=>{if((e.target as HTMLElement).closest('[data-nav-target]'))setOpen(false)}}>{children}</div><div className="sidebottom">{account}</div></aside><div className="mobileaccount sidebottom">{account}</div></>;
}
