'use client';
import {useLayoutEffect,useMemo,useRef,useState,type RefObject} from 'react';
/** Keep the whole year scrollable while mounting controls only around the
 * visible dates. Measured row heights retain wrapping and multi-line tasks. */
export function usePlanningWindow(days:string[],loaded:boolean,scroll:RefObject<HTMLDivElement|null>){
 const [heights,setHeights]=useState(()=>new Map<string,number>()),[viewport,setViewport]=useState({top:0,height:700}),focusedDay=useRef<string|null>(null);
 const offsets=useMemo(()=>{const result=[0];for(const day of days)result.push(result[result.length-1]+(heights.get(day)||35));return result},[days,heights]);
 const find=(offset:number)=>{let lo=0,hi=days.length;while(lo<hi){const mid=(lo+hi)>>1;if(offsets[mid+1]<=offset)lo=mid+1;else hi=mid}return Math.min(days.length-1,lo)};
 const start=find(Math.max(0,viewport.top-350)),end=Math.min(days.length,find(viewport.top+viewport.height+350)+1);
 const indexes=Array.from({length:Math.max(0,end-start)},(_,i)=>start+i),focused=focusedDay.current?days.indexOf(focusedDay.current):-1;
 if(focused>=0&&!indexes.includes(focused)){indexes.push(focused);indexes.sort((a,b)=>a-b)}
 const signature=indexes.join(',');
 useLayoutEffect(()=>{const el=scroll.current;if(!el||!loaded)return;let frame:number|null=null;const read=()=>{frame=null;setViewport(old=>old.top===el.scrollTop&&old.height===el.clientHeight?old:{top:el.scrollTop,height:el.clientHeight})};const update=()=>{if(frame===null)frame=requestAnimationFrame(read)};read();el.addEventListener('scroll',update,{passive:true});const resize=new ResizeObserver(update);resize.observe(el);return()=>{el.removeEventListener('scroll',update);resize.disconnect();if(frame!==null)cancelAnimationFrame(frame)}},[loaded,days,scroll]);
 useLayoutEffect(()=>{if(!loaded)return;const el=scroll.current;if(!el)return;const observer=new ResizeObserver(entries=>{const measured=entries.map(entry=>({day:(entry.target as HTMLElement).dataset.day,height:entry.borderBoxSize?.[0]?.blockSize||entry.target.getBoundingClientRect().height}));setHeights(old=>{let next=old;for(const {day,height} of measured)if(day&&height>0&&Math.abs((old.get(day)||35)-height)>.5){if(next===old)next=new Map(old);next.set(day,height)}return next})});el.querySelectorAll('[data-day]').forEach(row=>observer.observe(row));return()=>observer.disconnect()},[loaded,signature,scroll]);
 function scrollToDay(day:string,behavior:ScrollBehavior='instant'){const index=days.indexOf(day),el=scroll.current;if(index<0||!el)return;el.scrollTo({top:offsets[index],behavior});if(behavior!=='smooth')setViewport({top:offsets[index],height:el.clientHeight})}
 function setFocusedDay(day:string|null){const previous=focusedDay.current;focusedDay.current=day;if(previous&&previous!==day){const index=days.indexOf(previous);if(index<start||index>=end)setViewport(v=>({...v}))}}
 return {indexes,offsets,setFocusedDay,scrollToDay};
}
