'use client';
import {useEffect,useRef} from 'react';
/** Animate the current view without remounting forms or losing edits/selection. */
export function useSmoothView(key:string){
 const positions=useRef(new Map<string,number>());
 useEffect(()=>{let frame=requestAnimationFrame(()=>{const saved=positions.current.get(key);if(saved!==undefined)window.scrollTo({top:saved,behavior:'instant'});const target=document.querySelector<HTMLElement>('.main .content');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)target?.animate([{opacity:.75},{opacity:1}],{duration:180,easing:'ease-out'})});const remember=()=>positions.current.set(key,window.scrollY);window.addEventListener('scroll',remember,{passive:true});return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',remember)}},[key]);
}
