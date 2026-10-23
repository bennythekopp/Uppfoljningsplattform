'use client';
import {useEffect,useRef,useState,type PointerEvent,type ReactNode} from 'react';
import {createPortal} from 'react-dom';

/** Pointer sorting works with a mouse and touch, without HTML drag events. */
export function useLiveSort(onMove:(group:string,from:string,to:string)=>void,horizontal=false){
 const move=useRef(onMove);move.current=onMove;
 const scrollFrame=useRef(0),pointer=useRef({x:0,y:0});
 useEffect(()=>()=>cancelAnimationFrame(scrollFrame.current),[]);
 const gesture=useRef<{id:string,group:string,root:HTMLElement,x:number,y:number,dx:number,dy:number,width:number,height:number,preview:ReactNode,active:boolean}|null>(null);
 const [ghost,setGhost]=useState<{id:string,group:string,x:number,y:number,width:number,height:number,preview:ReactNode}|null>(null);
 function finish(){cancelAnimationFrame(scrollFrame.current);scrollFrame.current=0;gesture.current=null;setGhost(null)}
 function handlers(id:string,group:string,preview:ReactNode){return {
  onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{
   if(e.button!==0)return;
   const row=e.currentTarget.closest<HTMLElement>('[data-live-sort-id]'),root=row?.closest<HTMLElement>('[data-live-sort-list]');if(!row||!root)return;
   if(e.pointerType!=='touch')e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);
   const r=row.getBoundingClientRect();gesture.current={id,group,root,x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,width:r.width,height:r.height,preview,active:false};
  },
  onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{
   const g=gesture.current;if(!g)return;if(e.pointerType!=='touch')e.preventDefault();
   if(!g.active&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<5)return;g.active=true;pointer.current={x:e.clientX,y:e.clientY};
   if(!scrollFrame.current){const tick=()=>{const a=gesture.current;if(!a)return;const {x,y}=pointer.current,b=a.root.getBoundingClientRect();if(horizontal){if(x>b.right-45)a.root.scrollLeft+=12;else if(x<b.left+45)a.root.scrollLeft-=12}else{if(y>b.bottom-45)a.root.scrollTop+=12;else if(y<b.top+45)a.root.scrollTop-=12;if(y>window.innerHeight-75)window.scrollBy(0,Math.min(20,(y-window.innerHeight+75)/4));else if(y<75)window.scrollBy(0,-Math.min(20,(75-y)/4))}scrollFrame.current=requestAnimationFrame(tick)};scrollFrame.current=requestAnimationFrame(tick)}
   setGhost({id:g.id,group:g.group,x:e.clientX-g.dx,y:e.clientY-g.dy,width:g.width,height:g.height,preview:g.preview});
   const target=document.elementsFromPoint(e.clientX,e.clientY).map(el=>el.closest<HTMLElement>('[data-live-sort-id]')).find(el=>el&&el.dataset.liveSortGroup===g.group&&g.root.contains(el)&&el.dataset.liveSortId!==g.id);
   if(target){
    const rows=[...g.root.querySelectorAll<HTMLElement>('[data-live-sort-id]')].filter(row=>row.dataset.liveSortGroup===g.group),from=rows.findIndex(row=>row.dataset.liveSortId===g.id),to=rows.indexOf(target),r=target.getBoundingClientRect(),point=horizontal?e.clientX:e.clientY,mid=horizontal?r.left+r.width/2:r.top+r.height/2;
    if(from>=0&&to>=0&&(from<to?point>=mid:point<=mid)){
     const positions=new Map(rows.map(row=>[row.dataset.liveSortId!,row.getBoundingClientRect()]));
     move.current(g.group,g.id,target.dataset.liveSortId!);
     requestAnimationFrame(()=>{for(const row of rows){const before=positions.get(row.dataset.liveSortId!),after=row.getBoundingClientRect();if(before&&(before.top!==after.top||before.left!==after.left)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){row.getAnimations().forEach(a=>a.cancel());row.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'translate(0,0)'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'})}}});
    }
   }
   const bounds=g.root.getBoundingClientRect();
   if(horizontal){if(e.clientX>bounds.right-35)g.root.scrollLeft+=16;else if(e.clientX<bounds.left+35)g.root.scrollLeft-=16}
   else{if(e.clientY>bounds.bottom-35)g.root.scrollTop+=16;else if(e.clientY<bounds.top+35)g.root.scrollTop-=16;if(e.clientY>window.innerHeight-35)window.scrollBy(0,14);else if(e.clientY<35)window.scrollBy(0,-14)}
  },
  onPointerUp:finish,onPointerCancel:finish,onLostPointerCapture:finish,
 } }
 const overlay=ghost&&typeof document!=='undefined'?createPortal(<div aria-hidden="true" className="live-sort-ghost instructor-hub" style={{left:ghost.x,top:ghost.y,width:ghost.width,maxHeight:Math.min(ghost.height,180)}}>{ghost.preview}</div>,document.body):null;
 return {handlers,overlay,finish,isDragging:(group:string,id:string)=>ghost?.group===group&&ghost.id===id};
}
