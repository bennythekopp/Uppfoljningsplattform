import 'server-only';
import {db} from './database';
import type {KPKind,KPMoment,KPData} from './kp-types';
export const canReadKP=(role:string)=>['Administratör','Instruktör','Chef'].includes(role);
export const canEditKP=(role:string)=>['Administratör','Instruktör'].includes(role);
export const validKPKind=(kind:unknown):kind is KPKind=>kind==='KP1'||kind==='KP2';
export async function loadKPTemplate(kind:KPKind,connection=db):Promise<KPMoment[]>{
 const {results:moments}=await connection.prepare('SELECT id,kind,title,description,position FROM kp_moments WHERE kind=? AND deleted_at IS NULL ORDER BY position,id').bind(kind).all<Omit<KPMoment,'children'>>();
 const {results:children}=await connection.prepare('SELECT s.id,s.moment_id AS momentId,s.title,s.position FROM kp_submoments s JOIN kp_moments m ON m.id=s.moment_id WHERE m.kind=? AND m.deleted_at IS NULL AND s.deleted_at IS NULL ORDER BY s.position,s.id').bind(kind).all<{id:string,momentId:string,title:string,position:number}>();
 return moments.map(m=>({...m,children:children.filter(c=>c.momentId===m.id).map(({id,title,position})=>({id,title,position}))}));
}
export function validKPData(data:unknown,template:KPMoment[]):data is KPData{
 if(!data||typeof data!=='object'||Array.isArray(data))return false;const d=data as KPData;
 if(d.outcome!==undefined&&!['','approved','requires_completion'].includes(d.outcome))return false;
 if(typeof d.date!=='string'||d.date.length>10||d.date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Number.isFinite(Date.parse(d.date)))||typeof d.assessor!=='string'||d.assessor.length>120||d.examPercent!==null&&(typeof d.examPercent!=='number'||!Number.isFinite(d.examPercent)||d.examPercent<0||d.examPercent>100)||!d.answers||typeof d.answers!=='object'||Array.isArray(d.answers)||Object.keys(d.answers).length>1000)return false;
 for(const [id,a] of Object.entries(d.answers)){const m=template.find(m=>m.id===id);if(!m||!a||typeof a!=='object'||Array.isArray(a)||!['','green','yellow','red'].includes(a.level)||typeof a.comment!=='string'||a.comment.length>3000||!Array.isArray(a.checked)||new Set(a.checked).size!==a.checked.length||a.checked.some(id=>typeof id!=='string'||!m.children.some(c=>c.id===id)))return false}return true;
}
export function cleanKPData(data:KPData,template:KPMoment[]):KPData{return {...data,answers:Object.fromEntries(template.filter(m=>data.answers[m.id]).map(m=>[m.id,{...data.answers[m.id],checked:data.answers[m.id].checked.filter(id=>m.children.some(c=>c.id===id))}]))}}
