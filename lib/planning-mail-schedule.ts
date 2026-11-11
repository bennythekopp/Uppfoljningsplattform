// Calendar-based rules in Swedish local dates; no elapsed-24h arithmetic across DST.
export function mailDayDue(s:any,day:string){
 if(s.cadence==='weekly')return (new Date(day+'T12:00Z').getUTCDay()||7)===Number(s.week_day||1);
 if(s.cadence==='custom'){
  const start=String(s.start_date||'').slice(0,10),count=Number(s.interval_count||1)*(s.interval_unit==='weeks'?7:1);
  const days=(Date.parse(day+'T12:00Z')-Date.parse(start+'T12:00Z'))/86400000;
  return Number.isFinite(days)&&days>=0&&days%count===0;
 }
 return true;
}
export function nextMailDay(s:any,day:string){
 const plus=(d:string,n:number)=>new Date(Date.parse(d+'T12:00Z')+n*86400000).toISOString().slice(0,10);
 if(s.cadence==='weekly')return plus(day,(Number(s.week_day||1)-(new Date(day+'T12:00Z').getUTCDay()||7)+7)%7);
 if(s.cadence==='custom'){
  const start=String(s.start_date).slice(0,10),step=Number(s.interval_count||1)*(s.interval_unit==='weeks'?7:1);
  if(day<=start)return start;
  const delta=(Date.parse(day+'T12:00Z')-Date.parse(start+'T12:00Z'))/86400000;
  return plus(start,Math.ceil(delta/step)*step);
 }
 return day;
}
