import {addDays,scheduleTour,tourStyle,findTour,membershipFor,type ScheduleMembership,type ScheduleConfig} from './grundschema-types';
export type PlanningColumn={id:string,title:string,kind:'shared'|'person',userEmail:string|null,position:number,revision:number,width?:number,widthRevision?:number};
export type PlanningCell={day:string,columnId:string,field:'tour'|'task'|'shared'|'color',value:string,revision:number,updatedAt:number,updatedBy:string};
export type PlanningPeriod={id:string,groupId:string,name:string,startDate:string,listChange:boolean,config:ScheduleConfig,assignments:{userEmail:string,row:number}[]};
export type PlanningSuggestion={id:string,seq:number,day:string,columnId:string,columnName:string,field:"tour"|"task"|"shared",previousValue:string,proposedValue:string,previousLabel:string,proposedLabel:string,baseRevision:number,authorEmail:string,authorName:string,createdAt:number,status:string};
export type PlanningMailSettings={enabled:boolean,recipientEmail:string,recipientUser:string,cadence:"daily"|"workday",sendTime:string,revision:number,lastSentAt:number|null,lastError:string,configured:boolean,needsReview:boolean};
export type PlanningData={permissionUsers?:{email:string,name:string,role:string}[],suggesterEmails?:string[],taskWidth?:number,taskWidthRevision?:number,suggestions?:PlanningSuggestion[],canSuggest?:boolean,mailSettings?:PlanningMailSettings,memberships?:ScheduleMembership[],columns:PlanningColumn[],cells:PlanningCell[],periods:PlanningPeriod[],canEdit:boolean,settingsRevision:number,editorEmails:string[],users:{email:string,name:string}[]};
export type PlanningLog={id:string,occurredAt:number,actorName:string,action:string,day:string|null,columnName:string,field:string,previousValue:string,newValue:string};
export const cellKey=(day:string,id:string,field:string)=>JSON.stringify([day,id,field]);
export function periodFor(periods:PlanningPeriod[],day:string){return [...periods].reverse().find(p=>p.startDate<=day)}
export function personPeriodFor(periods:PlanningPeriod[],column:PlanningColumn,day:string,memberships?:ScheduleMembership[]){
 if(memberships===undefined)return periodFor(periods,day);
 const membership=membershipFor(memberships,column.userEmail||'',day);return membership?[...periods].reverse().find(p=>p.groupId===membership.groupId&&p.startDate<=day):undefined;
}
export function baseTour(periods:PlanningPeriod[],column:PlanningColumn,day:string,memberships?:ScheduleMembership[]){const p=personPeriodFor(periods,column,day,memberships),a=memberships===undefined?p?.assignments.find(a=>a.userEmail===column.userEmail):membershipFor(memberships,column.userEmail||'',day);return p&&a&&(!p.config.validUntil||day<=p.config.validUntil)?scheduleTour(p.config,a.row,day):''}
export function colorStyle(value:string){if(!/^#[0-9a-f]{6}$/i.test(value))return;const channels=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4),luminance=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;return {'--planning-color':value,backgroundColor:value,color:luminance>.179?'#171b1c':'#ffffff'}}
export function pairedPlanningStyle(manual:string,code:string,period?:PlanningPeriod){const explicit=colorStyle(manual);if(explicit)return explicit;const tour=period?findTour(period.config,code):undefined;return tour?.code.trim().toLocaleLowerCase('sv-SE')==='semester'?colorStyle(tour.color):undefined}

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
