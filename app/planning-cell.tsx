'use client';
import {memo,useCallback,useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {Palette,X} from 'lucide-react';
import PlanningTourPicker from './planning-tour-picker';
import {addDays,tourLabel,findTour} from './grundschema-types';
import {baseTour,cellKey,nightFlags,personPeriodFor,planningTourStyle,pairedPlanningStyle,type PlanningCell,type PlanningColumn,type PlanningData} from './planning-types';
import {planningEntry,editPlanning,savePlanning,resolvePlanning,subscribePlanningCell,planningCellVersion,type planningSession} from './planning-client';

type Session=ReturnType<typeof planningSession>;
type CellProps={session:Session,day:string,column:PlanningColumn,data:PlanningData,cells:Map<string,PlanningCell>,canEdit:boolean};
function useCellVersion(session:Session,key:string){
 const subscribe=useCallback((notify:()=>void)=>subscribePlanningCell(session,key,notify),[session,key]);
 const snapshot=useCallback(()=>planningCellVersion(session,key),[session,key]);
 useSyncExternalStore(subscribe,snapshot,snapshot);
}
function entry(p:CellProps,field:PlanningCell['field'],day=p.day){return planningEntry(p.session,day,p.column.id,field,field==='tour'?baseTour(p.data.periods,p.column,day,p.data.memberships):'',p.cells.get(cellKey(day,p.column.id,field)))}

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
 if(!p.canEdit)return <span className="planning-read">{p.field==='tour'?tourLabel(personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships)?.config||{tours:[]},e.value):e.value}</span>;
 const attrs={className:e.error?'cell-error':'',value:p.field==='tour'?tourLabel(personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships)?.config||{tours:[]},e.value):e.value,maxLength:4000,'aria-label':p.column.title+' '+(p.field==='tour'?'tur':p.field==='task'?'uppgift':'')+' '+p.day,title:e.error||(p.field==='tour'?tourLabel(personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships)?.config||{tours:[]},e.value):e.value),
  onChange:(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>editPlanning(p.session,e,event.target.value),
  onBlur:()=>{void savePlanning(p.session,e).catch(()=>{})},
  onKeyDown:(event:React.KeyboardEvent<HTMLInputElement|HTMLTextAreaElement>)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.blur()}if(event.key==='Escape'){editPlanning(p.session,e,e.cell.value);event.currentTarget.blur()}}
 };
 return <>{p.field==='tour'?<PlanningTourPicker inputProps={attrs} selectedValue={e.value} tours={personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships)?.config.tours||[]} onSelect={value=>{editPlanning(p.session,e,value);void(async()=>{await savePlanning(p.session,e);const period=personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships);if(findTour(period?.config||{tours:[]},value)?.code.trim().toLocaleLowerCase('sv-SE')==='semester'){const color=entry(p,'color');if(color.value){editPlanning(p.session,color,'');await savePlanning(p.session,color)}}})().catch(()=>{})}}/>:<textarea {...attrs} ref={textarea} rows={1}/>}{e.saving&&<i className="cell-saving"/>}{e.error&&<div className="planning-cell-error" role="alert"><span>{e.error}</span>{e.conflict?<><button onMouseDown={event=>event.preventDefault()} onClick={()=>void resolvePlanning(p.session,e,true).catch(()=>{})}>Behåll min text</button><button onClick={()=>void resolvePlanning(p.session,e,false)}>Använd sparad text</button></>:<button onClick={()=>void savePlanning(p.session,e).catch(()=>{})}>Försök igen</button>}</div>}</>;
});

export const PlanningTourCell=memo(function PlanningTourCell(p:CellProps){
 const previous=addDays(p.day,-1);useCellVersion(p.session,cellKey(p.day,p.column.id,'color'));
 useCellVersion(p.session,cellKey(p.day,p.column.id,'tour'));
 useCellVersion(p.session,cellKey(previous,p.column.id,'tour'));
 const [focused,setFocused]=useState(false),code=entry(p,'tour').value,prevCode=entry(p,'tour',previous).value,period=personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships),flags=nightFlags(code,period),starts=flags.starts,continues=nightFlags(prevCode,personPeriodFor(p.data.periods,p.column,previous,p.data.memberships)).starts,half=continues&&!starts&&!!code&&!flags.ends;
 const paired=pairedPlanningStyle(entry(p,'color').value,code,period),style=paired||planningTourStyle(code,period),nightStyle=paired||(starts?style:planningTourStyle(prevCode,personPeriodFor(p.data.periods,p.column,previous,p.data.memberships)));
 return <td style={style as CSSProperties} data-colored={paired?true:undefined} data-neutral={paired?undefined:(style?.backgroundColor==='#ffffff'||style?.backgroundColor==='#dedede'?tourLabel(period?.config||{tours:[]},code)==='FP'?'free':'neutral':undefined)} className={'planning-tour '+(starts?'night-start ':'')+(continues?'night-through ':'')+(half?'night-half ':'')+(focused?'is-focused':'')} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false)}}>
  {(starts||continues)&&!focused&&<div className="night-visual" aria-hidden="true" style={nightStyle||{backgroundColor:'var(--planning-bg)',color:'var(--planning-text)'}}>{starts&&!continues&&<span>Natt</span>}{continues&&<i className={starts?'':'night-arrow-end'}/>}</div>}
  <PlanningInput {...p} field="tour"/>
 </td>;
});

export const PlanningTextCell=memo(function PlanningTextCell(p:CellProps&{field:'task'|'shared'}){
 useCellVersion(p.session,cellKey(p.day,p.column.id,'color'));useCellVersion(p.session,cellKey(p.day,p.column.id,'tour'));
 const color=entry(p,'color'),code=p.column.kind==='person'?entry(p,'tour').value:'',period=personPeriodFor(p.data.periods,p.column,p.day,p.data.memberships),style=pairedPlanningStyle(color.value,code,period);
 return <td className={'planning-'+p.field} data-colored={style?true:undefined} style={style}><PlanningInput {...p}/>{p.canEdit&&<CellColor {...p} color={color}/>}</td>;
});
function CellColor(p:CellProps&{color:ReturnType<typeof planningEntry>}){
 const [open,setOpen]=useState(false),[custom,setCustom]=useState('#327b76'),[position,setPosition]=useState({left:0,top:0}),button=useRef<HTMLButtonElement>(null),popup=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{if(!open||!button.current)return;const r=button.current.getBoundingClientRect();setPosition({left:Math.max(8,Math.min(window.innerWidth-258,r.right-250)),top:r.bottom+240>window.innerHeight?Math.max(8,r.top-238):r.bottom+5})},[open]);
 useEffect(()=>{if(!open)return;const close=(e:Event)=>{if(!popup.current?.contains(e.target as Node)&&!button.current?.contains(e.target as Node))setOpen(false)},escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);button.current?.focus()}};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);window.addEventListener('resize',close);window.addEventListener('scroll',close,true);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true)}},[open]);
 function choose(value:string){editPlanning(p.session,p.color,value);setOpen(false);void savePlanning(p.session,p.color).catch(()=>{})}
 const swatches=[['Grå','#6d7880'],['Röd','#a84242'],['Gul','#b28627'],['Grön','#34754a'],['Blå','#315f9a'],['Lila','#70519e']];
 return <><button ref={button} className="planning-color-trigger" aria-label={'Färgmarkera '+p.column.title+' '+p.day} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Palette size={14}/></button>{open&&createPortal(<div ref={popup} className="planning-color-popup" role="dialog" aria-label="Cellfärg" style={position}><header><strong>Cellfärg</strong><button aria-label="Stäng färgväljare" onClick={()=>setOpen(false)}><X size={15}/></button></header><div className="planning-color-swatches">{swatches.map(([name,value])=><button key={value} aria-label={name} title={name} aria-pressed={p.color.value===value} style={{backgroundColor:value}} onClick={()=>choose(value)}/>)}</div><div className="planning-custom-color"><label>Egen färg<input type="color" aria-label="Egen färg" value={custom} onChange={e=>setCustom(e.target.value)}/></label><button onClick={()=>choose(custom)}>Använd</button></div><button className="planning-clear-color" onClick={()=>choose('')}>Ingen färg</button></div>,document.body)}{p.color.error&&<div className="planning-cell-error" role="alert">{p.color.error}{p.color.conflict?<><button onClick={()=>void resolvePlanning(p.session,p.color,true).catch(()=>{})}>Behåll min färg</button><button onClick={()=>void resolvePlanning(p.session,p.color,false)}>Använd sparad färg</button></>:<button onClick={()=>void savePlanning(p.session,p.color).catch(()=>{})}>Försök igen</button>}</div>}</>;
}
