'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,RefreshCw} from 'lucide-react';
import Modal from './ui-modal';
import {panelDate} from './panel-types';
import {flushPlanning} from './planning-client';
import PlanningLogValue from './planning-log-value';
import type {PlanningLog} from './planning-types';
type LogPage={log:PlanningLog[],total:number,totalPages:number,page:number,pageSize:number,snapshot:number};
const fields:Record<string,string>={tour:'Tur',task:'Uppgift',shared:'Text',color:'Cellfärg'};
function target(row:PlanningLog){return [row.day&&row.day.split('-').reverse().join('/'),row.columnName,row.field&&(fields[row.field]||row.field)].filter(Boolean).join(' · ')}
function pageNumbers(page:number,last:number){return [...new Set([1,page-1,page,page+1,last])].filter(n=>n>=1&&n<=last).sort((a,b)=>a-b)}
export default function AdminPlanningLog(){
 const [request,setRequest]=useState({page:1,pageSize:5,snapshot:undefined as number|undefined,refresh:0}),[data,setData]=useState<LogPage|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[detail,setDetail]=useState<PlanningLog|null>(null);
 const host=useRef<HTMLElement>(null),focusAfterLoad=useRef(false);
 useEffect(()=>{
  let active=true;const controller=new AbortController();setLoading(true);setError('');
  void(async()=>{try{await flushPlanning();if(!active)return;const query=new URLSearchParams({log:'1',page:String(request.page),pageSize:String(request.pageSize)});if(request.snapshot!==undefined)query.set('snapshot',String(request.snapshot));const response=await fetch('/api/planning?'+query,{cache:'no-store',signal:controller.signal});const result=await response.json();if(!response.ok)throw Error(result.error||'Planeringsloggen kunde inte läsas.');if(active){setData(result);if(focusAfterLoad.current){host.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});focusAfterLoad.current=false}}}catch(e){if(active)setError((e as Error).message)}finally{if(active)setLoading(false)}})();
  return()=>{active=false;controller.abort()};
 },[request]);
 function go(page:number){if(!data||loading)return;focusAfterLoad.current=true;setRequest(old=>({...old,page,snapshot:data.snapshot}))}
 const page=data?.page||1,last=data?.totalPages||1,numbers=pageNumbers(page,last);
 return <section ref={host} className="admin-module admin-planning-module admin-planning-log" aria-busy={loading}><div className="sectionhead"><h2 tabIndex={-1}>Planeringslogg</h2><button type="button" className="secondary" disabled={loading} onClick={()=>setRequest(old=>({...old,page:1,snapshot:undefined,refresh:old.refresh+1}))}><RefreshCw size={16}/>Uppdatera</button></div>
 {error&&<div role="alert" className="formerror"><p>{error}</p><button type="button" className="secondary" onClick={()=>setRequest(old=>({...old,refresh:old.refresh+1}))}>Försök igen</button></div>}
 {loading&&<p role="status">Läser in loggen…</p>}
 {data&&<><div className="admin-log-table-wrap"><table className="admin-log-table"><thead><tr><th>Datum och tid</th><th>Användare</th><th>Ändring</th><th>Gäller</th><th><span className="sr-only">Detaljer</span></th></tr></thead><tbody>{data.log.map(l=><tr key={l.id}><td data-label="Datum och tid">{panelDate(l.occurredAt)}</td><td data-label="Användare">{l.actorName}</td><td data-label="Ändring"><strong>{l.action}</strong><div className="admin-log-values"><PlanningLogValue row={l} value={l.previousValue}/><span aria-hidden="true"> → </span><PlanningLogValue row={l} value={l.newValue}/></div></td><td data-label="Gäller">{target(l)||'Planering'}</td><td><button type="button" className="secondary" onClick={()=>setDetail(l)} aria-label={'Visa detaljer för '+l.action+' av '+l.actorName}>Visa detaljer</button></td></tr>)}</tbody></table></div>{!data.log.length&&<p>Inga ändringar ännu.</p>}
 <div className="admin-log-pagination"><label>Poster per sida<select aria-label="Poster per sida i planeringsloggen" value={request.pageSize} disabled={loading} onChange={e=>{focusAfterLoad.current=true;setRequest(old=>({...old,page:1,pageSize:Number(e.target.value),snapshot:data.snapshot}))}}>{[5,10,25].map(n=><option key={n} value={n}>{n}</option>)}</select></label><p role="status" aria-live="polite">{data.total?`Visar ${(page-1)*data.pageSize+1}–${Math.min(page*data.pageSize,data.total)} av ${data.total}`:'0 poster'}<small>Sida {page} av {last}</small></p><nav aria-label="Sidor i planeringsloggen"><button type="button" className="secondary" disabled={loading||page<=1} onClick={()=>go(page-1)}><ChevronLeft size={16}/>Föregående</button>{numbers.map((n,i)=><span className="admin-log-page" key={n}>{i>0&&n>numbers[i-1]+1&&<span aria-hidden="true">…</span>}<button type="button" className={n===page?'primary':'secondary'} disabled={loading} aria-label={'Sida '+n} aria-current={n===page?'page':undefined} onClick={()=>go(n)}>{n}</button></span>)}<button type="button" className="secondary" disabled={loading||page>=last} onClick={()=>go(page+1)}>Nästa<ChevronRight size={16}/></button></nav></div><small className="admin-log-cutoff">Visar loggen vid {panelDate(data.snapshot)}. Välj Uppdatera för att läsa in nya ändringar.</small></>}
 {detail&&<Modal title="Ändring i planeringen" onClose={()=>setDetail(null)} className="admin-log-detail"><p><strong>{detail.actorName}</strong> · {panelDate(detail.occurredAt)}</p><h3>{detail.action}</h3><p>{target(detail)||'Planering'}</p><h3>Tidigare värde</h3><PlanningLogValue row={detail} value={detail.previousValue}/><h3>{detail.action.startsWith('Ändringsförslag')?'Föreslaget värde':'Nytt värde'}</h3><PlanningLogValue row={detail} value={detail.newValue}/><div className="modalactions"><button type="button" className="secondary" onClick={()=>setDetail(null)}>Stäng</button></div></Modal>}
 </section>;
}
