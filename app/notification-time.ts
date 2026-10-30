const clock=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function noticeLocalTime(value:number){const parts=clock.formatToParts(value),get=(key:string)=>parts.find(p=>p.type===key)!.value;return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`}
/** Datetime inputs are interpreted in Sweden even when the browser is in another timezone. */
export function noticeTimestamp(value:string){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error('Ange datum och klockslag.');
 const wall=Date.parse(value+'Z');for(const offset of [120,60]){const candidate=wall-offset*60000;if(Number.isFinite(candidate)&&noticeLocalTime(candidate)===value)return candidate}
 throw Error('Klockslaget finns inte i svensk tid. Välj en annan tid.');
}
