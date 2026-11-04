import {addDays} from './grundschema-types';
export type NotificationHorizon='week'|'7days'|'14days'|'month';
export const notificationHorizons:Record<NotificationHorizon,string>={week:'Innevarande vecka','7days':'Kommande 7 dagar','14days':'Kommande 14 dagar',month:'Innevarande månad'};
export function notificationRange(horizon:NotificationHorizon,now=Date.now()){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 if(horizon==='week'){const weekday=(new Date(today+'T12:00:00Z').getUTCDay()+6)%7,start=addDays(today,-weekday);return {start,end:addDays(start,7)}}
 if(horizon==='month'){const start=today.slice(0,7)+'-01',date=new Date(start+'T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+1);return {start,end:date.toISOString().slice(0,10)}}
 return {start:today,end:addDays(today,horizon==='14days'?14:7)};
}
export type NotificationValue={text:string,color:string};
export type PlanningNoticePayload={title:string,body:string,columnName:string,field?:string,authorName?:string,changes:{field:string,before:NotificationValue,after:NotificationValue}[]};
export type PlanningNotice={id:string,kind:'schedule'|'proposal',title:string,body:string,day:string,columnId:string,suggestionId:string|null,payload:PlanningNoticePayload,createdAt:number,read:boolean};
