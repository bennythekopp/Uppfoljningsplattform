 'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft} from 'lucide-react';
export default function MobileModuleBack({onBack,onError}:{onBack:()=>Promise<void>,onError:(s:string)=>void}){
 const marker=useRef<HTMLSpanElement>(null),[host,setHost]=useState<HTMLElement|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{const root=marker.current?.parentElement;if(!root)return;const find=()=>{const title=Array.from(root.querySelectorAll<HTMLElement>('h1')).find(h=>!h.closest('[contenteditable],.document-paper-area,.panel-module'))||null;setHost(title)};find();const o=new MutationObserver(find);o.observe(root,{childList:true,subtree:true});return()=>o.disconnect()},[]);
 const button=<button type="button" className="mobile-module-back" aria-label="Tillbaka till instruktörspanelen" disabled={busy} onClick={async()=>{setBusy(true);try{await onBack()}catch(e){onError((e as Error).message)}finally{setBusy(false)}}}><ArrowLeft size={23}/></button>;
 return <><span ref={marker} hidden/>{host?createPortal(button,host):<div className="mobile-module-back-fallback">{button}</div>}</>
}
