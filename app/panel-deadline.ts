/** Interpret saved local deadlines in Swedish time, independently of device timezone. */
export function deadlineTime(value:string){
 const m=/^(\d{4}-\d\d-\d\d)(?:T(\d\d:\d\d))?$/.exec(value);if(!m)return NaN;
 const local=m[1]+'T'+(m[2]||'23:59')+':00',guess=Date.parse(local+'Z');
 const format=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(const offset of [2,1]){const t=guess-offset*3600000;if(format.format(new Date(t)).replace(' ','T')===local)return t}
 return NaN;
}
export function itemIsOverdue(data:{due?:string,done?:boolean,completedAt?:number|null},now=Date.now(),legacyCompletedAt?:number){
 const due=deadlineTime(data.due||'');const at=data.done?(data.completedAt??legacyCompletedAt):now;
 return Number.isFinite(due)&&typeof at==='number'&&at>due;
}
