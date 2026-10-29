import {addDays,findTour,tourValue} from './grundschema-types';
import {baseTour,personPeriodFor,cellKey,nightFlags,type PlanningData,type PlanningColumn} from './planning-types';
export type OperationalConfig={tourKeys:string[],nightPolicy:'dates'|'continuous'};
export type OperationalSource=PlanningData&{operational:{config:OperationalConfig|null,revision:number}};
export function operationalKey(code:string,period:ReturnType<typeof personPeriodFor>){const tour=period?findTour(period.config,code):undefined;return tour?(tour.id?'id:'+tour.id:'tour:'+tourValue(tour)):'text:'+code.trim().toLocaleLowerCase('sv-SE')}
export function monthKey(year:number,month:number){const d=new Date(Date.UTC(year,month,1));return d.toISOString().slice(0,7)}
export function operationalRows(data:OperationalSource,year:number,today:string){
 if(!data.operational.config)return [];const cfg=data.operational.config,keys=new Set(cfg.tourKeys),cells=new Map(data.cells.filter(c=>c.field==='tour').map(c=>[cellKey(c.day,c.columnId,'tour'),c.value]));
 return data.columns.filter(c=>c.kind==='person').map(column=>{const counts=new Map<string,number>();let day=monthKey(year,-5)+'-01';const get=(d:string)=>cells.get(cellKey(d,column.id,'tour'))??baseTour(data.periods,column,d,data.memberships);
 for(;day<(year+1)+'-01-01';day=addDays(day,1)){const code=get(day),period=personPeriodFor(data.periods,column,day,data.memberships);if(!code||!keys.has(operationalKey(code,period)))continue;
 if(cfg.nightPolicy==='continuous'){const previous=addDays(day,-1),prev=get(previous),pp=personPeriodFor(data.periods,column,previous,data.memberships);if(nightFlags(prev,pp).starts&&keys.has(operationalKey(prev,pp))&&(nightFlags(code,period).starts||nightFlags(code,period).ends))continue}
 const month=day.slice(0,7);counts.set(month,(counts.get(month)||0)+1)}
 const months=Array.from({length:12},(_,i)=>{const previous=Array.from({length:5},(_,n)=>counts.get(monthKey(year,i-5+n))||0).reduce((a,b)=>a+b,0),count=counts.get(monthKey(year,i))||0,total=previous+count,needed=Math.max(0,30-previous),missing=Math.max(0,needed-count),key=monthKey(year,i),past=key<today.slice(0,7);return {count,total,needed,missing,key,past,risk:missing>0&&!past,missed:missing>0&&past}});
 const completed=months.filter(m=>m.past).at(-1),future=months.find(m=>m.risk);return {column,months,total:completed?.total??null,missing:completed?.missing??0,risk:!!future};
 });
}
