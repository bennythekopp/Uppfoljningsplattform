'use client';
import {useEffect,useState,type ReactNode} from 'react';
/** Keep closed content inert during its exit, then unmount large editors. */
export default function SmoothDisclosure({open,children,className=''}:{open:boolean,children:ReactNode,className?:string}){
 const [present,setPresent]=useState(open),[expanded,setExpanded]=useState(false);
 useEffect(()=>{let frame=0,timer:ReturnType<typeof setTimeout>|undefined;if(open){setPresent(true);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>setExpanded(true))})}else{setExpanded(false);timer=setTimeout(()=>setPresent(false),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:280)}return()=>{cancelAnimationFrame(frame);clearTimeout(timer)}},[open]);
 return <div className={'smooth-disclosure '+className+(expanded?' is-open':'')} aria-hidden={!open} inert={!open}><div className="smooth-disclosure-inner">{present?children:null}</div></div>;
}
