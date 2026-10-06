import type {IUTemplate} from './iu-types';
type Answer={level?:string,comment?:string,score?:number|null};
export function validAnswers(kind:string,answers:unknown,template:IUTemplate):answers is Record<string,Answer>{
 const opIds=new Set([...template.op,...template.chef].map(x=>x.id));
 const simMax=new Map(template.simulator.flatMap(s=>s.rows).map(r=>[r.id,r.max]));
 if(!answers||typeof answers!=='object'||Array.isArray(answers))return false;
 const entries=Object.entries(answers as Record<string,unknown>);
 if(entries.length>1000)return false;
 for(const [id,value] of entries){
  if(kind==='op'?!opIds.has(id):!simMax.has(id))return false;
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const v=value as Answer;
  if(typeof v.comment!=='undefined'&&(typeof v.comment!=='string'||v.comment.length>3000))return false;
  if(kind==='op'&&typeof v.level!=='undefined'&&!['','Röd','Gul','Grön'].includes(v.level))return false;
  if(kind==='simulator'&&typeof v.score!=='undefined'&&v.score!==null&&(!Number.isInteger(v.score)||v.score<0||v.score>(simMax.get(id)??0)))return false;
 }
 return true;
}
