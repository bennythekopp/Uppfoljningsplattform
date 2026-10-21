export type SchedulePass={start:string,end:string,type:string};
export type ScheduleTour={code:string,passes:SchedulePass[],meal:boolean,color:string};
export type ScheduleAgreement={label:string,value:string};
export type ScheduleConfig={year:number,startDate:string,unit:string,reference:string,validUntil:string,tours:ScheduleTour[],pattern:string[][],agreements:ScheduleAgreement[]};
export type ScheduleGroup={id:string,name:string,active:boolean,visible:boolean,wishesOpen:boolean,revision:number,config:ScheduleConfig};
export type ScheduleWish={groupId:string,userEmail:string,rows:number[],revision:number};
export type ScheduleAssignment={groupId:string,row:number,userEmail:string,locked:boolean};
export type ScheduleData={groups:ScheduleGroup[],users:{email:string,name:string}[],wishes:ScheduleWish[],assignments:ScheduleAssignment[]};
export const weekdays=['Mån','Tis','Ons','Tor','Fre','Lör','Sön'];
export const months=['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
export function initials(name:string){const p=name.trim().split(/\s+/).filter(Boolean);return (p.length>1?p[0][0]+p[p.length-1][0]:p[0]?.slice(0,2)||'?').toLocaleUpperCase('sv')}
export function dateKey(date:Date){return date.toISOString().slice(0,10)}
export function stockholmToday(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export function addDays(day:string,n:number){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return dateKey(d)}
export function scheduleTour(config:ScheduleConfig,row:number,day:string){const d=new Date(day+'T12:00:00Z'),anchor=new Date(config.startDate+'T12:00:00Z'),delta=Math.round((d.getTime()-anchor.getTime())/86400000),weeks=config.pattern.length;const week=((Math.floor(delta/7)+row-1)%weeks+weeks)%weeks;const weekday=((delta%7)+7)%7;return config.pattern[week]?.[weekday]||''}
export function yearDays(year:number){const out:string[]=[];for(let day=year+'-01-01';day.slice(0,4)===String(year);day=addDays(day,1))out.push(day);return out}
export function isoWeek(day:string){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));return Math.ceil((((d.getTime()-Date.UTC(d.getUTCFullYear(),0,1))/86400000)+1)/7)}
export function passMinutes(pass:SchedulePass){if(!pass.start||!pass.end)return 0;const m=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));return (m(pass.end)-m(pass.start)+1440)%1440}
export function duration(minutes:number){return Math.floor(minutes/60)+':'+String(minutes%60).padStart(2,'0')}
export function tourPeriod(tour:ScheduleTour){if(!tour.passes.length)return 0;let elapsed=0,last=-1;for(const p of tour.passes){if(!p.start||!p.end)continue;const start=Number(p.start.slice(0,2))*60+Number(p.start.slice(3));if(last>=0)elapsed+=(start-last+1440)%1440;elapsed+=passMinutes(p);last=Number(p.end.slice(0,2))*60+Number(p.end.slice(3))}return elapsed}
export function tourStyle(config:ScheduleConfig,code:string){const color=config.tours.find(t=>t.code===code)?.color||'#ffffff';const v=color.replace('#','');const brightness=parseInt(v.slice(0,2),16)*.299+parseInt(v.slice(2,4),16)*.587+parseInt(v.slice(4,6),16)*.114;return {backgroundColor:color,color:brightness<145?'#ffffff':code==='FP'?'#b00000':'#292929'}}
export function defaultScheduleConfig(year=2027):ScheduleConfig{
 const pass=(start:string,end:string,type:string)=>({start,end,type});
 const tour=(code:string,passes:SchedulePass[],color='#dedede',meal=true)=>({code,passes,color,meal});
 return {year,startDate:year+'-01-04',unit:'Nord – Tågtrafikledning och trafikinformation Boden',reference:'TRV 2024/3100',validUntil:'',tours:[
 tour('8630',[pass('06:30','14:15','Disptur')]),tour('8230',[pass('21:15','24:00','Disptur')]),tour('8231',[pass('00:00','06:45','Disptur'),pass('21:15','24:00','Disptur')]),tour('8232',[pass('00:00','06:45','Disptur')]),tour('8400',[pass('14:00','21:30','Disptur')]),tour('4400',[pass('12:00','14:00','Dispadm'),pass('14:00','21:30','Disptur')],'#f4ad56'),
 tour('INS',[pass('08:00','12:00','Admin'),pass('12:30','16:30','Admin')],'#b00000',false),tour('INSf',[pass('06:30','14:15','Admin')],'#b00000'),tour('INSe',[pass('14:00','21:30','Admin')],'#b00000'),tour('INSk',[pass('08:00','15:00','Admin')],'#b00000'),tour('INSm',[pass('07:30','12:00','Admin'),pass('12:30','16:30','Admin')],'#b00000',false),tour('INSko',[pass('08:00','12:30','Admin')],'#b00000'),tour('FP',[],'#ffffff',false)],
 pattern:[['INS','INSf','INSk','INSe','8400','8400','8630'],['INS','INS','INS','8630','FP','FP','FP'],['INS','4400','8400','8230','8232','FP','FP'],['INS','INS','INSe','INS','8630','FP','FP'],['INS','INSf','INS','8630','FP','FP','FP']],
 agreements:[{label:'Arbetstiden får vara max',value:'11:00'},{label:'Viloperioden ska vara minst',value:'09:00'},{label:'Fridagsperioden kan vara 24 + 12',value:'Ja'},{label:'Sjudagarsperioden börjar/slutar kl.',value:'14:00'},{label:'Mer än 11 nätter/person/4 veckor får förekomma',value:'Nej'},{label:'Begränsningsperioden är listans längd',value:'Ja'}]};
}
