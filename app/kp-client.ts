import type {KPKind,KPData,KPRecord,KPMoment,KPStatusRow} from './kp-types';
export type KPEntry={record:KPRecord,template:KPMoment[],assessors:{name:string}[]};
export type KPStore={entries:Record<string,KPEntry>,jobs:Record<string,{studentId:string,kind:KPKind,data:KPData}>,pending?:Promise<void>,error?:string,conflict?:boolean};
export const createKPStore=():KPStore=>({entries:{},jobs:{}});
export const kpKey=(id:string,kind:KPKind)=>JSON.stringify([id,kind]);
export async function kpRequest(url:string,init?:RequestInit){const r=await fetch(url,init),v=await r.json();if(!r.ok)throw Object.assign(Error(v.error||'Ett fel uppstod'),{status:r.status});return v}
export const kpBody=(method:string,value:unknown):RequestInit=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
export function queueKP(store:KPStore,job:{studentId:string,kind:KPKind,data:KPData},onStatus:(row:KPStatusRow)=>void,onError:(message:string)=>void){
 store.jobs[kpKey(job.studentId,job.kind)]=job;if(store.pending||store.error)return;
 store.pending=(async()=>{while(Object.keys(store.jobs).length){const key=Object.keys(store.jobs)[0],job=store.jobs[key];delete store.jobs[key];try{const entry=store.entries[key],result=await kpRequest('/api/kp/assessments',{...kpBody('PUT',{...job,revision:entry.record.revision}),keepalive:true});entry.record={...result,data:entry.record.data};onStatus({studentId:job.studentId,kind:job.kind,status:result.status})}catch(e){if(!store.jobs[key])store.jobs[key]=job;store.error=(e as Error).message;store.conflict=(e as Error&{status?:number}).status===409;onError('Pågående KP-bedömning kunde inte sparas. '+store.error);break}}})().finally(()=>{store.pending=undefined});
}
export async function flushKP(store:KPStore){while(store.pending)await store.pending;if(store.error||Object.keys(store.jobs).length)throw Error(store.error||'KP-bedömningen har inte sparats.');}
