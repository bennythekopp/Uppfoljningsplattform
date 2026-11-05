'use client';
import {useEffect,useRef,type PointerEvent as ReactPointerEvent} from 'react';
import {tourWidthKey,taskWidthKey} from './planning-column-layout';
import type {PlanningColumn,PlanningData} from './planning-types';
export function usePlanningWidths(data:PlanningData,columns:PlanningColumn[],enabled:boolean,custom:Record<string,number>,save:(id:string,width:number)=>void){
 const active=useRef(false),cleanup=useRef<()=>void>(()=>{});
 useEffect(()=>()=>cleanup.current(),[]);
 useEffect(()=>{if(!enabled)cleanup.current()},[enabled]);
 const width=(id:string)=>custom[id]??(id.endsWith(':tour')?60:id.endsWith(':task')?data.taskWidth||130:data.columns.find(c=>c.id===id)?.width||90);
 const keys=columns.flatMap(c=>c.kind==='person'?[tourWidthKey(c.id),taskWidthKey(c.id)]:[c.id]);
 const total=(id?:string,value?:number)=>80+keys.reduce((sum,key)=>sum+(key===id?value!:width(key)),0);
 function start(event:ReactPointerEvent<HTMLButtonElement>,id:string){
  if(!enabled||event.button!==0)return;event.preventDefault();event.stopPropagation();
  const handle=event.currentTarget,table=handle.closest('table');if(!table)return;
  const from=event.clientX,original=width(id);let value=original,frame:number|null=null;
  const paint=(v:number)=>{for(const col of table.querySelectorAll<HTMLElement>('col[data-width-key]'))if(col.dataset.widthKey===id)col.style.width=v+'px';table.style.width=total(id,v)+'px';handle.setAttribute('aria-valuenow',String(v))};
  const move=(e:PointerEvent)=>{value=Math.max(44,Math.min(800,Math.round(original+e.clientX-from)));if(frame===null)frame=requestAnimationFrame(()=>{frame=null;paint(value)})};
  active.current=true;handle.setPointerCapture(event.pointerId);
  function stop(cancel:boolean){if(!active.current)return;active.current=false;if(frame!==null)cancelAnimationFrame(frame);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancelled);handle.removeEventListener('lostpointercapture',cancelled);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);paint(cancel?original:value);if(!cancel)save(id,value)}
  const up=()=>stop(false),cancelled=()=>stop(true);
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancelled);handle.addEventListener('lostpointercapture',cancelled);cleanup.current=cancelled;
 }
 function handle(id:string,label:string){return enabled?<button type="button" className="planning-resize" role="separator" aria-orientation="vertical" aria-label={'Ändra bredd på '+label} aria-valuemin={44} aria-valuemax={800} aria-valuenow={width(id)} onPointerDown={e=>start(e,id)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();save(id,Math.max(44,Math.min(800,width(id)+(e.key==='ArrowRight'?10:-10))))}}}/>:null}
 return {width,total:total(),handle};
}
