'use client';
import {cellKey,type PlanningCell} from './planning-types';
import {panelRequest} from './panel-types';
type Entry={cell:PlanningCell,baseValue:string,value:string,error:string,conflict?:{value:string,revision:number},saving:Promise<void>|null};
type Session={user:string,entries:Map<string,Entry>,listeners:Set<()=>void>};
const sessions=new Map<string,Session>();let active='';
const signal=(s:Session)=>s.listeners.forEach(f=>f());
export function planningSession(user:string){active=user;let s=sessions.get(user);if(!s){s={user,entries:new Map(),listeners:new Set()};sessions.set(user,s)}return s}
export function planningEntry(s:Session,day:string,columnId:string,field:PlanningCell['field'],baseValue:string,cell?:PlanningCell){const key=cellKey(day,columnId,field);let e=s.entries.get(key);if(!e){e={cell:cell||{day,columnId,field,value:baseValue,revision:0,updatedAt:0,updatedBy:''},value:cell?.value??baseValue,baseValue,error:'',saving:null};s.entries.set(key,e)}else if(!cell&&e.cell.revision===0&&!e.saving&&e.value===e.cell.value){e.baseValue=baseValue;e.cell.value=baseValue;e.value=baseValue}else if(cell&&cell.revision>e.cell.revision&&!e.saving&&e.value===e.cell.value){e.cell=cell;e.value=cell.value}return e}
export function editPlanning(s:Session,e:Entry,value:string){e.value=value;e.error='';signal(s)}
export async function savePlanning(s:Session,e:Entry):Promise<void>{
 if(s.user!==active)throw Error('Logga in på kontot som gjorde ändringen.');
 if(e.saving){await e.saving;return savePlanning(s,e)}if(e.value===e.cell.value)return;if(e.conflict)throw Error('Välj vilken version av rutan som ska behållas.');
 const value=e.value,revision=e.cell.revision;
 e.saving=(async()=>{try{const r=await fetch('/api/planning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cell',day:e.cell.day,columnId:e.cell.columnId,field:e.cell.field,value,revision,baseValue:e.baseValue})});const v=await r.json();if(!r.ok){if(v.conflict)e.conflict=v.conflict;throw Error(v.error||'Rutan kunde inte sparas.')}e.cell=v.cell;e.error=''}catch(error){e.error=(error as Error).message;throw error}finally{e.saving=null;signal(s)}})();signal(s);await e.saving;
}
export async function flushPlanning(){const s=sessions.get(active);if(s)for(const e of s.entries.values())while(e.saving||e.value!==e.cell.value)await savePlanning(s,e)}
export function planningPending(){const s=sessions.get(active);return !!s&&[...s.entries.values()].some(e=>e.saving||e.value!==e.cell.value)}
export function forgetPlanning(){sessions.clear();active=''}
export async function resolvePlanning(s:Session,e:Entry,own:boolean){if(!e.conflict)return;e.cell={...e.cell,...e.conflict};e.conflict=undefined;e.error='';if(own)await savePlanning(s,e);else{e.value=e.cell.value;signal(s)}}
