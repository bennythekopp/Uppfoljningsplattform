'use client';
import {cellKey,type PlanningCell} from './planning-types';
import {panelRequest} from './panel-types';
type Entry={key?:string,proposal?:boolean,sourceValue?:string,sourceRevision?:number,cell:PlanningCell,baseValue:string,value:string,error:string,conflict?:{value:string,revision:number},saving:Promise<void>|null};
type Session={user:string,entries:Map<string,Entry>,listeners:Set<()=>void>,cellListeners:Map<string,Set<()=>void>>,versions:Map<string,number>};
const sessions=new Map<string,Session>();let active='';
// Notify only the changed cell. A night cell also subscribes to the previous day's tour.
const signal=(s:Session,e:Entry)=>{const key=e.key||cellKey(e.cell.day,e.cell.columnId,e.cell.field);s.versions.set(key,(s.versions.get(key)||0)+1);s.cellListeners.get(key)?.forEach(f=>f());s.listeners.forEach(f=>f())};
export function subscribePlanningCell(s:Session,key:string,listener:()=>void){let listeners=s.cellListeners.get(key);if(!listeners){listeners=new Set();s.cellListeners.set(key,listeners)}listeners.add(listener);return()=>{listeners!.delete(listener);if(!listeners!.size)s.cellListeners.delete(key)}}
export function planningCellVersion(s:Session,key:string){return s.versions.get(key)||0}
export function planningSession(user:string){active=user;let s=sessions.get(user);if(!s){s={user,entries:new Map(),listeners:new Set(),cellListeners:new Map(),versions:new Map()};sessions.set(user,s)}return s}
export function planningEntry(s:Session,day:string,columnId:string,field:PlanningCell['field'],baseValue:string,cell?:PlanningCell){const key=cellKey(day,columnId,field);let e=s.entries.get(key);if(!e){e={cell:cell||{day,columnId,field,value:baseValue,revision:0,updatedAt:0,updatedBy:''},value:cell?.value??baseValue,baseValue,error:'',saving:null};s.entries.set(key,e)}else if(!cell&&e.cell.revision===0&&!e.saving&&e.value===e.cell.value){e.baseValue=baseValue;e.cell.value=baseValue;e.value=baseValue}else if(cell&&cell.revision>e.cell.revision&&!e.saving&&e.value===e.cell.value){e.cell=cell;e.value=cell.value}return e}
export function editPlanning(s:Session,e:Entry,value:string){e.value=value;e.error='';signal(s,e)}
export async function savePlanning(s:Session,e:Entry):Promise<void>{
 if(s.user!==active)throw Error('Logga in på kontot som gjorde ändringen.');
 if(e.saving){await e.saving;return savePlanning(s,e)}if(e.value===e.cell.value)return;if(e.conflict)throw Error('Välj vilken version av rutan som ska behållas.');
 const value=e.value,revision=e.cell.revision;
 e.saving=(async()=>{try{const r=await fetch('/api/planning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:e.proposal?'propose':'cell',previousValue:e.sourceValue,day:e.cell.day,columnId:e.cell.columnId,field:e.cell.field,value,revision:e.proposal?e.sourceRevision:revision,baseValue:e.baseValue})});const v=await r.json();if(!r.ok){if(v.conflict)e.conflict=v.conflict;throw Error(v.error||'Rutan kunde inte sparas.')}e.cell=e.proposal?{...e.cell,value}:v.cell;if(e.proposal)window.dispatchEvent(new Event('tc-planning-suggestions'));for(const cell of v.linkedCells||[]){const linked=planningEntry(s,cell.day,cell.columnId,cell.field,'');const dirty=linked.value!==linked.cell.value;linked.cell=cell;if(!dirty)linked.value=cell.value;signal(s,linked)}e.error=''}catch(error){e.error=(error as Error).message;throw error}finally{e.saving=null;signal(s,e)}})();signal(s,e);await e.saving;
}
export async function flushPlanning(){const s=sessions.get(active);if(s)for(const e of s.entries.values())while(e.saving||e.value!==e.cell.value)await savePlanning(s,e)}
export function planningPending(){const s=sessions.get(active);return !!s&&[...s.entries.values()].some(e=>e.saving||e.value!==e.cell.value)}
export function forgetPlanning(){sessions.clear();active=''}
export async function resolvePlanning(s:Session,e:Entry,own:boolean){if(!e.conflict)return;e.cell={...e.cell,...e.conflict};e.conflict=undefined;e.error='';if(own)await savePlanning(s,e);else{e.value=e.cell.value;signal(s,e)}}

/** Separate draft entries: suggestions never change the visible live tour,
 * colours, night arrows or the approved cell's revision. Drafts survive navigation. */
export function planningProposalEntry(s:Session,source:Entry,proposal?:{proposedValue:string}){
 const key='proposal:'+cellKey(source.cell.day,source.cell.columnId,source.cell.field);let e=s.entries.get(key);
 if(!e){const value=proposal?.proposedValue??source.cell.value;e={key,proposal:true,sourceValue:source.cell.value,sourceRevision:source.cell.revision,cell:{...source.cell,value},value,baseValue:source.baseValue,error:'',saving:null};s.entries.set(key,e)}
 else if(!e.saving&&e.value===e.cell.value){const value=proposal?.proposedValue??source.cell.value;e.cell={...source.cell,value};e.value=value;e.sourceValue=source.cell.value;e.sourceRevision=source.cell.revision}
 return e;
}
export function applyPlanningResult(s:Session,result:{cell?:PlanningCell,linkedCells?:PlanningCell[]}){for(const cell of[result.cell,...result.linkedCells||[]]){if(!cell)continue;const e=planningEntry(s,cell.day,cell.columnId,cell.field,'');const dirty=e.value!==e.cell.value;e.cell=cell;if(!dirty)e.value=cell.value;signal(s,e)}}
