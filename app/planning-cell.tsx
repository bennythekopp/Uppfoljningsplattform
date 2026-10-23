'use client';
import {memo,useCallback,useLayoutEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import PlanningTourPicker from './planning-tour-picker';
import {addDays,tourStyle} from './grundschema-types';
import {baseTour,cellKey,nightFlags,periodFor,type PlanningCell,type PlanningColumn,type PlanningData} from './planning-types';
import {planningEntry,editPlanning,savePlanning,resolvePlanning,subscribePlanningCell,planningCellVersion,type planningSession} from './planning-client';

type Session=ReturnType<typeof planningSession>;
type CellProps={session:Session,day:string,column:PlanningColumn,data:PlanningData,cells:Map<string,PlanningCell>,canEdit:boolean};
function useCellVersion(session:Session,key:string){
 const subscribe=useCallback((notify:()=>void)=>subscribePlanningCell(session,key,notify),[session,key]);
 const snapshot=useCallback(()=>planningCellVersion(session,key),[session,key]);
 useSyncExternalStore(subscribe,snapshot,snapshot);
}
function entry(p:CellProps,field:PlanningCell['field'],day=p.day){return planningEntry(p.session,day,p.column.id,field,field==='tour'?baseTour(p.data.periods,p.column,day):'',p.cells.get(cellKey(day,p.column.id,field)))}

// Resize a whole batch in write/read/write phases. Reading each textarea's
// scrollHeight immediately after changing its height forces thousands of layouts.
const resizeQueue=new Set<HTMLTextAreaElement>();let resizeFrame:number|null=null;
function resizeTextarea(el:HTMLTextAreaElement){resizeQueue.add(el);if(resizeFrame!==null)return;resizeFrame=requestAnimationFrame(()=>{
 resizeFrame=null;const els=[...resizeQueue].filter(el=>el.isConnected);resizeQueue.clear();
 for(const el of els)el.style.height='auto';
 const heights=els.map(el=>Math.max(33,el.scrollHeight));
 els.forEach((el,i)=>{el.style.height=heights[i]+'px'});
})}

export const PlanningInput=memo(function PlanningInput(p:CellProps&{field:PlanningCell['field']}){
 const key=cellKey(p.day,p.column.id,p.field);useCellVersion(p.session,key);
 const e=entry(p,p.field),textarea=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{const el=textarea.current;if(el)resizeTextarea(el);return()=>{if(el)resizeQueue.delete(el)}},[e.value,p.canEdit]);
 if(!p.canEdit)return <span className="planning-read">{e.value}</span>;
 const attrs={className:e.error?'cell-error':'',value:e.value,maxLength:4000,'aria-label':p.column.title+' '+(p.field==='tour'?'tur':p.field==='task'?'uppgift':'')+' '+p.day,title:e.error||e.value,
  onChange:(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>editPlanning(p.session,e,event.target.value),
  onBlur:()=>{void savePlanning(p.session,e).catch(()=>{})},
  onKeyDown:(event:React.KeyboardEvent<HTMLInputElement|HTMLTextAreaElement>)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.blur()}if(event.key==='Escape'){editPlanning(p.session,e,e.cell.value);event.currentTarget.blur()}}
 };
 return <>{p.field==='tour'?<PlanningTourPicker inputProps={attrs} tours={periodFor(p.data.periods,p.day)?.config.tours||[]} onSelect={value=>{editPlanning(p.session,e,value);void savePlanning(p.session,e).catch(()=>{})}}/>:<textarea {...attrs} ref={textarea} rows={1}/>}{e.saving&&<i className="cell-saving"/>}{e.error&&<div className="planning-cell-error" role="alert"><span>{e.error}</span>{e.conflict?<><button onMouseDown={event=>event.preventDefault()} onClick={()=>void resolvePlanning(p.session,e,true).catch(()=>{})}>Behåll min text</button><button onClick={()=>void resolvePlanning(p.session,e,false)}>Använd sparad text</button></>:<button onClick={()=>void savePlanning(p.session,e).catch(()=>{})}>Försök igen</button>}</div>}</>;
});

export const PlanningTourCell=memo(function PlanningTourCell(p:CellProps){
 const previous=addDays(p.day,-1);
 useCellVersion(p.session,cellKey(p.day,p.column.id,'tour'));
 useCellVersion(p.session,cellKey(previous,p.column.id,'tour'));
 const [focused,setFocused]=useState(false),code=entry(p,'tour').value,prevCode=entry(p,'tour',previous).value,period=periodFor(p.data.periods,p.day),flags=nightFlags(code,period),starts=flags.starts,continues=nightFlags(prevCode,periodFor(p.data.periods,previous)).starts,half=continues&&!starts&&!!code&&!flags.ends;
 const style=period&&code&&period.config.tours.some(t=>t.code===code)?tourStyle(period.config,code):undefined;
 return <td style={style as CSSProperties} data-neutral={style?.backgroundColor==='#ffffff'||style?.backgroundColor==='#dedede'?code==='FP'?'free':'neutral':undefined} className={'planning-tour '+(starts?'night-start ':'')+(continues?'night-through ':'')+(half?'night-half ':'')+(focused?'is-focused':'')} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false)}}>
  {(starts||continues)&&!focused&&<div className="night-visual" aria-hidden="true">{starts&&!continues&&<span>Natt</span>}{continues&&<i className={starts?'':'night-arrow-end'}/>}</div>}
  <PlanningInput {...p} field="tour"/>
 </td>;
});
