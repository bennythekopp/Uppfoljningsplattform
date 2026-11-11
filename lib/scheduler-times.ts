import {nextMailDay} from './planning-mail-schedule';
import {backupDue} from './backup/options';
const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function localMinute(stamp:number){const parts=formatter.formatToParts(stamp),get=(k:string)=>parts.find(p=>p.type===k)!.value;return {day:get('year')+'-'+get('month')+'-'+get('day'),time:get('hour')+':'+get('minute')}}
export function nextMailCheck(s:any,now=Date.now(),allowToday=true):number|null{
 if(!s?.enabled||!process.env.RESEND_API_KEY||!process.env.PLANNING_MAIL_FROM)return null;
 const today=localMinute(now).day,plus=(d:string)=>new Date(Date.parse(d+'T12:00Z')+86400000).toISOString().slice(0,10);
 let day=nextMailDay(s,allowToday?today:plus(today));
 for(let tries=0;tries<3;tries++){
  if(day!==String(s.sent_day||'')){
   const midnight=Date.parse(day+'T00:00Z');
   for(let t=Math.max(Math.ceil(now/60000)*60000,midnight-3*3600000);t<=midnight+27*3600000;t+=60000){const c=localMinute(t);if(c.day===day&&c.time>=s.send_time)return t}
  }
  day=nextMailDay(s,plus(day));
 }
 throw Error('Nästa mailtid kunde inte beräknas.');
}
export function nextBackupCheck(s:any,now=Date.now()):number|null{
 if(!s?.enabled)return null;
 for(let t=Math.ceil(now/60000)*60000;t<=now+8*86400000;t+=60000)if(backupDue(s,t))return t;
 throw Error('Nästa backuptid kunde inte beräknas.');
}
