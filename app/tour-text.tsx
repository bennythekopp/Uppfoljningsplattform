'use client';
import {useLayoutEffect,useRef,type RefObject,type HTMLAttributes,type InputHTMLAttributes} from 'react';

// One observer and one batched read/write pass for all visible tour labels.
// This avoids a resize observer/layout loop for every cell in a yearly grid.
const elements=new Map<HTMLElement,string>(),widths=new WeakMap<HTMLElement,number>(),pending=new Set<HTMLElement>(),measurements=new Map<string,number>();
let observer:ResizeObserver|undefined,attributes:MutationObserver|undefined,frame:number|null=null,context:CanvasRenderingContext2D|null=null;
function schedule(el?:HTMLElement){if(el)pending.add(el);else for(const node of elements.keys())pending.add(node);if(frame===null)frame=requestAnimationFrame(fit)}
function fit(){frame=null;const nodes=[...pending].filter(el=>el.isConnected&&elements.has(el));pending.clear();
 for(const el of nodes)el.style.removeProperty('font-size');
 if(!context)context=document.createElement('canvas').getContext('2d');if(!context)return;
 const sizes=nodes.map(el=>{const css=getComputedStyle(el),available=el.clientWidth-parseFloat(css.paddingLeft||'0')-parseFloat(css.paddingRight||'0')-1,base=parseFloat(css.fontSize),text=elements.get(el)||'';if(available<=0||!base||!text)return {el,size:base};const font=`${css.fontStyle} ${css.fontWeight} ${base}px ${css.fontFamily}`,spacing=parseFloat(css.letterSpacing)||0,key=font+'|'+spacing+'|'+text;let measured=measurements.get(key);if(measured===undefined){context!.font=font;measured=context!.measureText(text).width+Math.max(0,text.length-1)*spacing;measurements.set(key,measured);if(measurements.size>2048)measurements.delete(measurements.keys().next().value!)}return {el,size:measured>available?Math.max(.5,Math.floor(base*available/measured*10)/10):base}});
 for(const {el,size}of sizes)if(size)el.style.setProperty('font-size',size+'px','important');
}
function observe(el:HTMLElement,text:string){elements.set(el,text);pending.add(el);
 if(!observer){observer=new ResizeObserver(entries=>{for(const entry of entries){const node=entry.target as HTMLElement,width=entry.contentRect.width;if(widths.get(node)!==width){widths.set(node,width);schedule(node)}}});attributes=new MutationObserver(()=>schedule());attributes.observe(document.documentElement,{attributes:true,attributeFilter:['data-text-size','class','style']});document.fonts?.addEventListener('loadingdone',fontsChanged)}
 observer.observe(el);schedule(el);void document.fonts?.ready.then(()=>{if(elements.has(el))schedule(el)});
 return()=>{elements.delete(el);pending.delete(el);observer?.unobserve(el);widths.delete(el);if(!elements.size){observer?.disconnect();observer=undefined;attributes?.disconnect();attributes=undefined;document.fonts?.removeEventListener('loadingdone',fontsChanged);if(frame!==null)cancelAnimationFrame(frame);frame=null}};
}
function fontsChanged(){schedule()}
export function useTourTextFit(ref:RefObject<HTMLElement|null>,text:string){useLayoutEffect(()=>{if(ref.current)return observe(ref.current,text)},[ref,text])}
export function TourText({children,className='',...props}:Omit<HTMLAttributes<HTMLSpanElement>,'children'>&{children:string}){const ref=useRef<HTMLSpanElement>(null);useTourTextFit(ref,children);return <span {...props} ref={ref} className={'tour-fit-text '+className} title={props.title||children}>{children}</span>}
export function TourNameInput(props:InputHTMLAttributes<HTMLInputElement>){const ref=useRef<HTMLInputElement>(null);useTourTextFit(ref,String(props.value??''));return <input {...props} ref={ref}/>}
