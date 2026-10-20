'use client';
import {useRef,type ButtonHTMLAttributes} from 'react';

/** Keep toolbar taps responsive after a captured touch drag. */
export function SortAction({onClick,disabled,...props}:Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'|'onPointerDown'|'onPointerUp'|'onPointerCancel'> & {onClick:()=>void}){
 const point=useRef<{x:number,y:number}|null>(null),ignoreClick=useRef(0);
 return <button type="button" {...props} disabled={disabled} onPointerDown={e=>{point.current={x:e.clientX,y:e.clientY}}} onPointerCancel={()=>{point.current=null}} onPointerUp={e=>{
  const start=point.current;point.current=null;
  if(!disabled&&e.pointerType==='touch'&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<8){ignoreClick.current=Date.now()+600;e.preventDefault();onClick()}
 }} onClick={e=>{if(!disabled&&(e.detail===0||Date.now()>ignoreClick.current))onClick()}}/>;
}
