'use client';
import {useLayoutEffect,useRef,type TextareaHTMLAttributes} from 'react';
/** The mirror sizes the row. The real input uses the rendered TD dimensions,
 * including changes caused by other cells, text sizing or column dragging. */
export default function FullCellTextEditor(props:TextareaHTMLAttributes<HTMLTextAreaElement>){
 const ref=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{const input=ref.current,cell=input?.closest('td');if(!input||!cell)return;
  const fit=()=>{if(!cell.isConnected)return;input.style.setProperty('height',cell.clientHeight+'px','important');input.style.setProperty('width',cell.clientWidth+'px','important')};
  fit();const observer=new ResizeObserver(fit);observer.observe(cell);const row=cell.parentElement;if(row)observer.observe(row);
  const focus=(event:PointerEvent)=>{if(props.disabled||event.target!==cell)return;input.focus()};cell.addEventListener('pointerdown',focus);window.addEventListener('resize',fit);
  return()=>{observer.disconnect();cell.removeEventListener('pointerdown',focus);window.removeEventListener('resize',fit)};
 },[props.disabled]);
 return <div className="planning-full-cell"><span className="planning-cell-measure" aria-hidden="true">{String(props.value??'')+'\n'}</span><textarea {...props} ref={ref} rows={1}/></div>;
}
