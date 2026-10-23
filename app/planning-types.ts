import {addDays,scheduleTour,tourStyle,findTour,type ScheduleConfig} from './grundschema-types';
export type PlanningColumn={id:string,title:string,kind:'shared'|'person',userEmail:string|null,position:number,revision:number};
export type PlanningCell={day:string,columnId:string,field:'tour'|'task'|'shared',value:string,revision:number,updatedAt:number,updatedBy:string};
export type PlanningPeriod={id:string,groupId:string,name:string,startDate:string,listChange:boolean,config:ScheduleConfig,assignments:{userEmail:string,row:number}[]};
export type PlanningData={columns:PlanningColumn[],cells:PlanningCell[],periods:PlanningPeriod[],canEdit:boolean,settingsRevision:number,editorEmails:string[],users:{email:string,name:string}[]};
export type PlanningLog={id:string,occurredAt:number,actorName:string,action:string,day:string|null,columnName:string,field:string,previousValue:string,newValue:string};
export const cellKey=(day:string,id:string,field:string)=>JSON.stringify([day,id,field]);
export function periodFor(periods:PlanningPeriod[],day:string){return [...periods].reverse().find(p=>p.startDate<=day)}
export function baseTour(periods:PlanningPeriod[],column:PlanningColumn,day:string){const p=periodFor(periods,day),a=p?.assignments.find(a=>a.userEmail===column.userEmail);return p&&a?scheduleTour(p.config,a.row,day):''}
/** The saved tour colour is also used for its overnight continuation. */
export function planningTourStyle(code:string,period?:PlanningPeriod){return period&&findTour(period.config,code)?tourStyle(period.config,code):undefined;}
/** Night starts/finishes come from the saved tour times, with free-text Natt supported. */
export function nightFlags(code:string,period?:PlanningPeriod){
 const tour=period?findTour(period.config,code):undefined,label=tour?.code||code,minutes=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3));
 const textual=/^(natt|night)(?:\b|$)/i.test(label),endOnly=/\bav\b/i.test(label);
 return {starts:textual&&!endOnly||!!tour?.passes.some(p=>minutes(p.start)>=18*60&&(p.end==='24:00'||minutes(p.end)<minutes(p.start))),ends:textual||!!tour?.passes.some(p=>minutes(p.start)<6*60&&minutes(p.end)<=12*60&&minutes(p.end)>minutes(p.start))};
}
export function nightSegments(days:string[],get:(day:string)=>string,periods:PlanningPeriod[]){
 const out:{start:number,end:number,continuesBefore:boolean,halfEnd:boolean}[]=[];
 for(let i=0;i<days.length;i++){
  const previous=nightFlags(get(addDays(days[i],-1)),periodFor(periods,addDays(days[i],-1))).starts;
  if(!nightFlags(get(days[i]),periodFor(periods,days[i])).starts&&!previous)continue;
  const start=i;let end=i;while(end<days.length&&nightFlags(get(days[end]),periodFor(periods,days[end])).starts)end++;
  const halfEnd=end<days.length;out.push({start,end:Math.min(end,days.length-1),continuesBefore:previous,halfEnd});i=Math.min(end,days.length-1);
 }
 return out;
}
