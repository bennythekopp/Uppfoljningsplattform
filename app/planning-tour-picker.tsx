'use client';
import {useEffect,useId,useLayoutEffect,useRef,useState,type InputHTMLAttributes} from 'react';
import {createPortal} from 'react-dom';
import './planning.css';
import {findTour,tourValue,type ScheduleTour} from './grundschema-types';

type Props={inputProps:InputHTMLAttributes<HTMLInputElement>,selectedValue?:string,allowEmpty?:boolean,tours:ScheduleTour[],onSelect:(value:string)=>void};
/** One popup for the focused cell. Unlike a native datalist it never filters
 * by the existing value, renders colour swatches, or scans every year input. */
export default function PlanningTourPicker({inputProps,selectedValue,allowEmpty=false,tours,onSelect}:Props){
 const input=useRef<HTMLInputElement>(null),popup=useRef<HTMLDivElement>(null),wrap=useRef<HTMLDivElement>(null),id=useId();
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[position,setPosition]=useState({left:0,top:0,width:170,maxHeight:264});
 const value=selectedValue??String(inputProps.value??''),selected=findTour({tours},value),selectedIndex=tours.indexOf(selected!);
 function show(){if(inputProps.disabled)return;setActive(selectedIndex);setOpen(true)}
 function choose(code:string){if(inputProps.disabled)return;onSelect(code);setOpen(false);input.current?.blur()}
 useLayoutEffect(()=>{if(!open)return;let frame:number|null=null;
  const place=()=>{const rect=input.current?.getBoundingClientRect();if(!rect)return;const viewport=window.visualViewport,vw=viewport?.width||window.innerWidth,vh=(viewport?.height||window.innerHeight)+(viewport?.offsetTop||0),width=Math.min(210,Math.max(150,rect.width)),below=vh-rect.bottom-8,above=rect.top-(viewport?.offsetTop||0)-8,up=below<150&&above>below,maxHeight=Math.max(36,Math.min(264,up?above:below)),height=Math.min(maxHeight,(tours.length+(allowEmpty?1:0))*36+8||36);if(rect.bottom<0||rect.top>vh||rect.right<0||rect.left>vw){setOpen(false);return}setPosition({left:Math.max(8,Math.min(rect.left,vw-width-8)),top:up?rect.top-height-4:rect.bottom+4,width,maxHeight})};
  const update=()=>{if(frame===null)frame=requestAnimationFrame(()=>{frame=null;place()})};place();
  const scroll=(event:Event)=>{if(!popup.current?.contains(event.target as Node))update()};
  window.addEventListener('scroll',scroll,true);window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);
  return()=>{if(frame!==null)cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update);window.visualViewport?.removeEventListener('scroll',update)};
 },[open,tours.length,allowEmpty]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!wrap.current?.contains(e.target as Node)&&!popup.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
 useEffect(()=>{if(open&&active>=0)popup.current?.children[active]?.scrollIntoView({block:'nearest'})},[open,active]);
 return <div className="planning-tour-editor" ref={wrap}><input {...inputProps} ref={input} role="combobox" aria-autocomplete="none" aria-expanded={open} aria-controls={open?id:undefined} aria-activedescendant={open&&active>=0?id+'-'+active:undefined} autoComplete="off" autoCorrect="off" spellCheck={false}
 onFocus={event=>{inputProps.onFocus?.(event);show()}} onClick={show}
 onChange={event=>{inputProps.onChange?.(event);setActive(-1);setOpen(true)}}
 onBlur={event=>{setOpen(false);inputProps.onBlur?.(event)}}
 onKeyDown={event=>{if(allowEmpty&&(event.key==='Delete'||event.key==='Backspace')){event.preventDefault();choose('');return}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!open){show();return}setActive(index=>tours.length?(index+(event.key==='ArrowDown'?1:-1)+tours.length)%tours.length:-1);return}if(event.key==='Escape'&&open){event.preventDefault();setOpen(false);return}if(event.key==='Enter'&&open&&active>=0){event.preventDefault();choose(tourValue(tours[active]));return}inputProps.onKeyDown?.(event)}}/>
 {open&&createPortal(<div id={id} ref={popup} className="planning-tour-options" role="listbox" aria-label="Samtliga turer" style={position}>{tours.map((tour,index)=><button type="button" role="option" id={id+'-'+index} key={tour.id||index} tabIndex={-1} aria-selected={index===selectedIndex} aria-description={'Färg '+tour.color} className={index===active?'is-active':''} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(tourValue(tour))}><span className="planning-tour-swatch" style={{backgroundColor:tour.color}} aria-hidden="true"/><span>{tour.code}</span></button>)}{allowEmpty&&<button type="button" role="option" tabIndex={-1} aria-label="Töm rutan" aria-selected={!value} onMouseDown={event=>event.preventDefault()} onClick={()=>choose('')}>–</button>}{!tours.length&&<span className="planning-no-tours">Inga turer i turlistan</span>}</div>,document.body)}
 </div>;
}
