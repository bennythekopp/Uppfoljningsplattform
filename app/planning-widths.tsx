'use client';
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {panelRequest} from './panel-types';
import type {PlanningColumn,PlanningData} from './planning-types';
type Width={value:number,revision:number};
export function usePlanningWidths(data:PlanningData,columns:PlanningColumn[],enabled:boolean,onSaved:()=>Promise<void>,onError:(message:string)=>void){
 const initial=():Record<string,Width>=>Object.fromEntries([['task',{value:data.taskWidth||130,revision:data.taskWidthRevision||1}],...data.columns.filter(c=>c.kind==='shared').map(c=>[c.id,{value:c.width||90,revision:c.widthRevision||1}])]);
 const [widths,setWidths]=useState(initial),[saving,setSaving]=useState(false),active=useRef(false),cleanup=useRef<()=>void>(()=>{}),widthsRef=useRef(widths);
 widthsRef.current=widths;
 useEffect(()=>{if(!active.current&&!saving)setWidths(initial())},[data,saving]);
 useEffect(()=>()=>cleanup.current(),[]);
 useEffect(()=>{if(!saving)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[saving]);
 useEffect(()=>{if(!enabled)cleanup.current()},[enabled]);
 const width=(id:string)=>widths[id]?.value||(id==='task'?130:90);
 const total=(values:Record<string,Width>)=>80+columns.reduce((sum,c)=>sum+(c.kind==='person'?60+(values.task?.value||130):(values[c.id]?.value||90)),0);
 async function commit(id:string,value:number){
  const previous=widthsRef.current[id]||{value:width(id),revision:1};if(value===previous.value)return;
  setWidths(old=>({...old,[id]:{...previous,value}}));setSaving(true);
  try{const saved=await panelRequest('/api/planning','POST',{action:'width',columnId:id,width:value,revision:previous.revision});setWidths(old=>({...old,[id]:{value,revision:saved.revision}}));await onSaved()}
  catch(e){setWidths(old=>({...old,[id]:previous}));await onSaved().catch(()=>{});onError((e as Error).message)}
  finally{setSaving(false)}
 }
 function start(event:ReactPointerEvent<HTMLButtonElement>,id:string){
  if(!enabled||saving||event.button!==0)return;event.preventDefault();event.stopPropagation();
  const handle=event.currentTarget,table=handle.closest('table');if(!table)return;
  const from=event.clientX,original=width(id);let value=original,frame:number|null=null;
  const paint=(v:number)=>{for(const col of table.querySelectorAll<HTMLElement>('col[data-width-key]'))if(col.dataset.widthKey===id)col.style.width=v+'px';table.style.width=total({...widthsRef.current,[id]:{value:v,revision:0}})+'px';handle.setAttribute('aria-valuenow',String(v))};
  const move=(e:PointerEvent)=>{value=Math.max(70,Math.min(800,Math.round(original+e.clientX-from)));if(frame===null)frame=requestAnimationFrame(()=>{frame=null;paint(value)})};
  active.current=true;handle.setPointerCapture(event.pointerId);
  function stop(cancel:boolean){if(!active.current)return;active.current=false;if(frame!==null)cancelAnimationFrame(frame);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancelled);handle.removeEventListener('lostpointercapture',cancelled);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);paint(cancel?original:value);if(!cancel)void commit(id,value)}
  const up=()=>stop(false),cancelled=()=>stop(true);
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancelled);handle.addEventListener('lostpointercapture',cancelled);cleanup.current=cancelled;
 }
 function handle(id:string,label:string){return enabled?<button type="button" className="planning-resize" role="separator" aria-orientation="vertical" aria-label={'Ändra bredd på '+label} aria-valuemin={70} aria-valuemax={800} aria-valuenow={width(id)} disabled={saving} onPointerDown={e=>start(e,id)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();void commit(id,Math.max(70,Math.min(800,width(id)+(e.key==='ArrowRight'?10:-10))))}}}/>:null}
 return {width,total:total(widths),handle};
}
