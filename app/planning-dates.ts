import {addDays} from './grundschema-types';
export function planningYearRange(year:number){
 const first=year+'-01-01',last=year+'-12-31';
 const weekday=(day:string)=>(new Date(day+'T12:00:00Z').getUTCDay()+6)%7;
 return {start:addDays(first,-weekday(first)),end:addDays(last,7-weekday(last))};
}
export function planningDays(start:string,end:string){
 const days:string[]=[];for(let day=start;day<end;day=addDays(day,1))days.push(day);return days;
}
export function planningRange(year:number,compact:boolean,today:string){
 return compact?{start:today,end:addDays(today,367)}:planningYearRange(year);
}
