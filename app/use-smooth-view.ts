'use client';
import {useLayoutEffect,useRef} from 'react';
import {animateView} from './view-motion';
/** Animate the current view without remounting forms or losing edits/selection. */
export function useSmoothView(key:string,{ready=true,scroll=false}:{ready?:boolean,scroll?:boolean}={}){
 const ref=useRef<HTMLDivElement>(null);
 const positions=useRef(new Map<string,number>());
 useLayoutEffect(()=>{
  if(!ready||!ref.current)return;
  const saved=positions.current.get(key);
  if(scroll&&saved!==undefined)window.scrollTo({top:saved,behavior:'instant'});
  const animation=animateView(ref.current,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const remember=()=>{positions.current.delete(key);positions.current.set(key,window.scrollY);while(positions.current.size>100)positions.current.delete(positions.current.keys().next().value!)};
  if(scroll)window.addEventListener('scroll',remember,{passive:true});
  return()=>{animation?.cancel();if(scroll){remember();window.removeEventListener('scroll',remember)}};
 },[key,ready,scroll]);
 return ref;
}
