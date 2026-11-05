import {addDays,findTour,type ScheduleTour} from './grundschema-types';
import {baseTour,cellKey,colorStyle,personPeriodFor,type PlanningData} from './planning-types';
export type ExportRow={day:string,columnId:string,name:string,tour:string,task:string,tourColor:string,taskColor:string,passes:ScheduleTour['passes'],shared:boolean};
export function exportRows(data:PlanningData,from:string,to:string,email:string,scope:'mine'|'all'){
 const cells=new Map(data.cells.map(c=>[cellKey(c.day,c.columnId,c.field),c.value])),rows:ExportRow[]=[];
 const columns=data.columns.filter(c=>scope==='all'||c.userEmail===email);
 for(let day=from;day<=to;day=addDays(day,1))for(const c of columns){
  const shared=c.kind==='shared',period=personPeriodFor(data.periods,c,day,data.memberships),code=cells.get(cellKey(day,c.id,'tour'))??baseTour(data.periods,c,day,data.memberships),tour=findTour(period?.config||{tours:[]},code),manual=cells.get(cellKey(day,c.id,'color'))||'';
  const paired=colorStyle(manual)?manual:tour?.code.trim().toLocaleLowerCase('sv-SE')==='semester'?tour.color:'';
  rows.push({day,columnId:c.id,name:c.title,shared,tour:shared?'':tour?.code||code,task:cells.get(cellKey(day,c.id,shared?'shared':'task'))||'',tourColor:paired||tour?.color||'',taskColor:paired,passes:shared?[]:tour?.passes||[]});
 }
 return rows;
}
function escapeICS(v:string){return v.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,')}
function fold(line:string){let out='',part='';for(const c of line){if(new TextEncoder().encode(part+c).length>75){out+=part+'\r\n';part=' '+c}else part+=c}return out+part}
const minutes=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3,5));
const localTime=(day:string,n:number)=>addDays(day,Math.floor(n/1440)).replace(/-/g,'')+'T'+String(Math.floor(n%1440/60)).padStart(2,'0')+String(n%60).padStart(2,'0')+'00';
export function calendarExport(rows:ExportRow[],stamp=new Date()){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TC Boden//Planering//SV','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:TC Boden Planering','X-WR-TIMEZONE:Europe/Stockholm',
 'BEGIN:VTIMEZONE','TZID:Europe/Stockholm','BEGIN:DAYLIGHT','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','END:DAYLIGHT','BEGIN:STANDARD','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','END:STANDARD','END:VTIMEZONE'];
 for(const r of rows){if(!r.tour&&!r.task)continue;
 const passes=r.passes.filter(p=>/^\d\d:\d\d$/.test(p.start)&&/^\d\d:\d\d$/.test(p.end));let offset=0,lastEnd=-1;
 for(let i=0;i<Math.max(1,passes.length);i++){
 const pass=passes[i];lines.push('BEGIN:VEVENT','UID:'+encodeURIComponent(r.day+'|'+r.columnId+'|'+i)+'@tcboden.se','DTSTAMP:'+stamp.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''));
 if(pass){let start=minutes(pass.start)+offset;while(start<lastEnd){offset+=1440;start+=1440}let end=minutes(pass.end)+offset;if(end<=start)end+=1440;lastEnd=end;lines.push('DTSTART;TZID=Europe/Stockholm:'+localTime(r.day,start),'DTEND;TZID=Europe/Stockholm:'+localTime(r.day,end))}
 else lines.push('DTSTART;VALUE=DATE:'+r.day.replace(/-/g,''),'DTEND;VALUE=DATE:'+addDays(r.day,1).replace(/-/g,''));
 lines.push('SUMMARY:'+escapeICS([r.name,r.tour||r.task].filter(Boolean).join(' · ')),'DESCRIPTION:'+escapeICS([r.task,pass?.type, !passes.length&&r.tour?'Turen saknar sparade arbetstider och visas som heldag.':''].filter(Boolean).join('\n')),'END:VEVENT');
 }}lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
