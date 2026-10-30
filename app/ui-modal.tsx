'use client';
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {X} from 'lucide-react';
export default function Modal({title,onClose,children,className=''}:{title:string,onClose:()=>void,children:ReactNode,className?:string}){
 const ref=useRef<HTMLDialogElement>(null),id=useId(),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const dialog=ref.current!,active=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=overflow;active?.focus()}},[]);
 return <dialog ref={ref} className={'tc-modal '+className} aria-labelledby={id} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close.current()}}}><header><h2 id={id}>{title}</h2><button type="button" aria-label="Stäng" onClick={onClose}><X size={21}/></button></header>{children}</dialog>
}
