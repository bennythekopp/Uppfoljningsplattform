'use client';
import {useEffect,useRef} from 'react';
type Entry<T>={owner:string,index:number,value:T,url:string};
/** Preserve Next's own history fields. Only internal navigation adds entries. */
export function useNavigationHistory<T>(owner:string,ready:boolean,value:T,restore:(value:T)=>void,guard:()=>Promise<void>,onError:(message:string)=>void){
 const latest=useRef({restore,guard,onError,value});latest.current={restore,guard,onError,value};
 const current=useRef<Entry<T>|null>(null),suppress=useRef(false),reverting=useRef(false),generation=useRef(0);
 const serialized=JSON.stringify(value);
 useEffect(()=>{
  if(!ready||!owner){current.current=null;return}
  if(suppress.current){suppress.current=false;return}
  const previous=current.current;
  const url=new URL(location.href),view=value as any;
  if(view.docLocation){for(const key of ['document','documentTab']){const text=view.tab==='instructor'&&view.hubView==='documents'?view.docLocation[key]:'';if(text)url.searchParams.set(key,text);else url.searchParams.delete(key)}}
  const entry:Entry<T>={owner,index:previous?.owner===owner?previous.index+1:0,value,url:url.href};
  if(previous?.owner===owner&&JSON.stringify(previous.value)===serialized)return;
  const state={...history.state,tcNavigation:entry};
  if(previous?.owner===owner){history.replaceState({...history.state,tcNavigation:previous},'',previous.url);history.pushState(state,'',entry.url)}else history.replaceState(state,'',entry.url);
  current.current=entry;
 },[owner,ready,serialized]);
 useEffect(()=>{
  if(!owner||!ready)return;
  const pop=async(e:PopStateEvent)=>{
   if(reverting.current){reverting.current=false;return}
   const target=e.state?.tcNavigation as Entry<T>|undefined,previous=current.current;
   if(!target||target.owner!==owner||!previous)return; // normal navigation out of the site remains available
   const ticket=++generation.current;
   try{await latest.current.guard();if(ticket!==generation.current)return;current.current=target;suppress.current=true;latest.current.restore(target.value)}
   catch(error){if(ticket!==generation.current)return;reverting.current=true;history.go(previous.index-target.index);latest.current.onError('Navigeringen avbröts eftersom ändringarna inte kunde sparas. '+(error as Error).message)}
  };
  window.addEventListener('popstate',pop);return()=>{generation.current++;window.removeEventListener('popstate',pop)};
 },[owner,ready]);
}
export function documentLocationChanged(){window.dispatchEvent(new Event('tc-document-location'))}
