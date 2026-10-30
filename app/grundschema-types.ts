export type SchedulePass={start:string,end:string,type:string};
export type ScheduleTour={id?:string,code:string,passes:SchedulePass[],meal:boolean,color:string};
export type ScheduleAgreement={label:string,value:string};
export type ScheduleConfig={year:number,startDate:string,unit:string,reference:string,validUntil:string,tours:ScheduleTour[],pattern:string[][],agreements:ScheduleAgreement[]};
export type ScheduleGroup={id:string,name:string,active:boolean,visible:boolean,wishesOpen:boolean,revision:number,config:ScheduleConfig};
export type ScheduleWish={groupId:string,userEmail:string,rows:number[],revision:number};
export type ScheduleAssignment={groupId:string,row:number,userEmail:string,locked:boolean};
export type ScheduleMembership={id:string,userEmail:string,groupId:string,row:number,startDate:string,endDate:string|null};
export type ScheduleData={memberships?:ScheduleMembership[],groups:ScheduleGroup[],users:{email:string,name:string}[],wishes:ScheduleWish[],assignments:ScheduleAssignment[]};
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
// Names are labels. Stable IDs distinguish variants with the same label; the
// reference also keeps a safe snapshot for historical/deleted tour variants.
const tourPrefix='@tour:';
export function tourKey(tour:ScheduleTour){return tour.id?'@tour-id:'+tour.id:tourValue(tour)}
export function tourValue(tour:ScheduleTour){return tourPrefix+JSON.stringify({id:tour.id||'',code:tour.code,color:tour.color,passes:tour.passes,meal:tour.meal})}
function referenceTour(value:string):ScheduleTour|undefined{if(!value.startsWith(tourPrefix))return;try{const t=JSON.parse(value.slice(tourPrefix.length));if(!t||typeof t.code!=='string'||!t.code.trim()||t.code.length>20||!/^#[0-9a-f]{6}$/i.test(t.color)||typeof t.id!=='string'||t.id.length>100||!Array.isArray(t.passes)||t.passes.length>3)return;if(t.passes.some((p:any)=>!p||typeof p.start!=='string'||!/^\d\d:\d\d$/.test(p.start)||typeof p.end!=='string'||!/^\d\d:\d\d$/.test(p.end)||typeof p.type!=='string'||p.type.length>50))return;return {...t,id:t.id||undefined,meal:t.meal===true}}catch{return}}
export function findTour(config:Pick<ScheduleConfig,'tours'>,value:string):ScheduleTour|undefined{if(value.startsWith('@tour-id:'))return config.tours.find(t=>t.id===value.slice(9))||config.tours.find(t=>t.code===value);const snapshot=referenceTour(value);if(snapshot){const identified=snapshot.id?config.tours.find(t=>t.id===snapshot.id):undefined;return identified||(!snapshot.id?config.tours.find(t=>t.code===snapshot.code&&t.color.toLowerCase()===snapshot.color.toLowerCase()&&JSON.stringify(t.passes)===JSON.stringify(snapshot.passes)):undefined)||snapshot}const key=value.trim().toLocaleLowerCase('sv-SE');return config.tours.find(t=>t.code===value)||config.tours.find(t=>t.code.trim().toLocaleLowerCase('sv-SE')===key)}
export function tourLabel(config:Pick<ScheduleConfig,'tours'>,value:string){return findTour(config,value)?.code||value}
export function tourLogValue(config:Pick<ScheduleConfig,'tours'>,value:string){const tour=findTour(config,value);return tour?tour.code+' · '+tour.color:value}
export function normalizeScheduleConfig(config:ScheduleConfig):ScheduleConfig{const tours=config.tours.map(t=>({...t,id:t.id||crypto.randomUUID()})),lookup={tours};return {...config,tours,pattern:config.pattern.map(row=>row.map(value=>{const tour=findTour(lookup,value);return tour?tourKey(tours.find(t=>t.id===tour.id)||tours.find(t=>t.code===tour.code&&t.color===tour.color)||tour):value}))}}
export function copyScheduleTours(source:ScheduleConfig,target:ScheduleConfig){const same=(a:ScheduleTour,b:ScheduleTour)=>a.code===b.code&&a.color===b.color&&a.meal===b.meal&&JSON.stringify(a.passes)===JSON.stringify(b.passes);const copied=source.tours.map(t=>({...structuredClone(t),id:target.tours.find(v=>same(t,v))?.id||t.id||crypto.randomUUID()})),referenced=new Set(target.pattern.flat().map(v=>findTour(target,v)?.id));return [...copied,...target.tours.filter(t=>referenced.has(t.id)&&!copied.some(v=>v.id===t.id))]}
export function tourStyle(config:Pick<ScheduleConfig,'tours'>,value:string){const tour=findTour(config,value),color=tour?.color||'#ffffff';const v=color.slice(1),brightness=parseInt(v.slice(0,2),16)*.299+parseInt(v.slice(2,4),16)*.587+parseInt(v.slice(4,6),16)*.114;return {'--planning-color':color,backgroundColor:color,color:brightness<145?'#ffffff':(tour?.code||value)==='FP'?'#b00000':'#292929'}}

export function defaultScheduleConfig(year=2027):ScheduleConfig{
 const pass=(start:string,end:string,type:string)=>({start,end,type});
 const tour=(code:string,passes:SchedulePass[],color='#dedede',meal=true)=>({code,passes,color,meal});
 return {year,startDate:year+'-01-04',unit:'Nord – Tågtrafikledning och trafikinformation Boden',reference:'TRV 2024/3100',validUntil:'',tours:[
 tour('8630',[pass('06:30','14:15','Disptur')]),tour('8230',[pass('21:15','24:00','Disptur')]),tour('8231',[pass('00:00','06:45','Disptur'),pass('21:15','24:00','Disptur')]),tour('8232',[pass('00:00','06:45','Disptur')]),tour('8400',[pass('14:00','21:30','Disptur')]),tour('4400',[pass('12:00','14:00','Dispadm'),pass('14:00','21:30','Disptur')],'#f4ad56'),
 tour('INS',[pass('08:00','12:00','Admin'),pass('12:30','16:30','Admin')],'#b00000',false),tour('INSf',[pass('06:30','14:15','Admin')],'#b00000'),tour('INSe',[pass('14:00','21:30','Admin')],'#b00000'),tour('INSk',[pass('08:00','15:00','Admin')],'#b00000'),tour('INSm',[pass('07:30','12:00','Admin'),pass('12:30','16:30','Admin')],'#b00000',false),tour('INSko',[pass('08:00','12:30','Admin')],'#b00000'),tour('FP',[],'#ffffff',false)],
 pattern:[['INS','INSf','INSk','INSe','8400','8400','8630'],['INS','INS','INS','8630','FP','FP','FP'],['INS','4400','8400','8230','8232','FP','FP'],['INS','INS','INSe','INS','8630','FP','FP'],['INS','INSf','INS','8630','FP','FP','FP']],
 agreements:[{label:'Arbetstiden får vara max',value:'11:00'},{label:'Viloperioden ska vara minst',value:'09:00'},{label:'Fridagsperioden kan vara 24 + 12',value:'Ja'},{label:'Sjudagarsperioden börjar/slutar kl.',value:'14:00'},{label:'Mer än 11 nätter/person/4 veckor får förekomma',value:'Nej'},{label:'Begränsningsperioden är listans längd',value:'Ja'}]};
}

export function scheduleGroupsForView(groups:ScheduleGroup[],view:"current"|"proposals"){return groups.filter(g=>view==="current"?g.active:!g.active&&g.visible)}

export function membershipFor(memberships:ScheduleMembership[],email:string,day:string){return memberships.find(m=>m.userEmail===email&&m.startDate<=day&&(!m.endDate||day<m.endDate))}

/** IDs, not tour names, determine order so equal-named colour variants stay distinct. */
export function moveScheduleTours(tours:ScheduleTour[],from:string,to:string){const a=tours.findIndex(t=>t.id===from),b=tours.findIndex(t=>t.id===to);if(a<0||b<0||a===b)return tours;const next=[...tours],[moved]=next.splice(a,1);next.splice(b,0,moved);return next}
