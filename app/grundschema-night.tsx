import {findTour,tourLabel,tourStyle,type ScheduleConfig} from './grundschema-types';
import {nightFlags} from './planning-types';

export function scheduleNight(config:ScheduleConfig,code:string,previous:string,next:string,beforePrevious:string){
 const period={config} as Parameters<typeof nightFlags>[1];
 const isStart=(value:string)=>nightFlags(value,period).starts;
 const same=(a:string,b:string)=>{
  if(a===b)return true;
  const first=findTour(config,a),second=findTour(config,b);
  return !!first&&first===second;
 };
 const starts=isStart(code);
 const joinsBefore=starts&&isStart(previous)&&same(code,previous);
 const joinsAfter=starts&&isStart(next)&&same(code,next);
 const singleBefore=isStart(previous)&&!(isStart(beforePrevious)&&same(previous,beforePrevious));
 const incoming=joinsBefore||(!starts&&singleBefore);
 const outgoing=starts&&(!joinsBefore||joinsAfter);
 const label=tourLabel(config,code);
 const half=incoming&&!starts&&!!label&&!nightFlags(code,period).ends;
 return {incoming,outgoing,starts,half,label,style:tourStyle(config,starts?code:previous)};
}

export function patternNight(config:ScheduleConfig,row:number,day:number){
 const length=config.pattern.length*7,index=row*7+day;
 const at=(offset:number)=>{const slot=(index+offset+length)%length;return config.pattern[Math.floor(slot/7)]?.[slot%7]||''};
 return scheduleNight(config,at(0),at(-1),at(1),at(-2));
}

export function ScheduleNight({night}:{night:ReturnType<typeof scheduleNight>}){
 if(!night.starts&&!night.incoming)return null;
 return <span className={'gs-night '+(night.incoming?'gs-night-in ':'')+(night.outgoing?'gs-night-out ':'')+(night.half?'gs-night-half':'')} aria-hidden="true" style={night.style}>
  {night.starts&&!night.incoming&&<span className="gs-night-label">{night.label}</span>}
  <i>{night.incoming&&!night.outgoing&&<b/>}</i>
 </span>;
}
