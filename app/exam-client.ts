import {kpRequest,kpBody} from './kp-client';
import type {ExamRecord,ExamData,ExamGroup} from './exam-types';
export type ExamEntry={record:ExamRecord,template:ExamGroup[],assessors:{name:string}[]};
export type ExamStore={entries:Record<string,ExamEntry>,jobs:Record<string,{studentId:string,data:ExamData}>,pending?:Promise<void>,error?:string,conflict?:boolean};
export const createExamStore=():ExamStore=>({entries:{},jobs:{}});
export function queueExam(store:ExamStore,job:{studentId:string,data:ExamData},onError:(s:string)=>void){store.jobs[job.studentId]=job;if(store.pending||store.error)return;store.pending=(async()=>{while(Object.keys(store.jobs).length){const id=Object.keys(store.jobs)[0],job=store.jobs[id];delete store.jobs[id];try{const revision=store.entries[id].record.revision,result=await kpRequest('/api/exam/assessments',{...kpBody('PUT',{...job,revision}),keepalive:true});
 // Use the entry created by the latest edit, not the one that existed before
 // the request. Otherwise our next autosave reuses an obsolete revision.
 const current=store.entries[id];current.record={...result,data:current.record.data,isDraft:store.jobs[id]?true:result.isDraft}}catch(e){if(!store.jobs[id])store.jobs[id]=job;store.error=(e as Error).message;store.conflict=(e as Error&{status?:number}).status===409;onError('Examen kunde inte sparas automatiskt. '+store.error);break}}})().finally(()=>{store.pending=undefined})}
export async function flushExam(store:ExamStore){while(store.pending)await store.pending;if(store.error||Object.keys(store.jobs).length)throw Error(store.error||'Examen har inte sparats.')}
