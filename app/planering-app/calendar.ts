import {addDays} from '../grundschema-types';
export function weekStart(day:string){return addDays(day,-(new Date(day+'T12:00:00Z').getUTCDay()+6)%7)}
export function monthStart(day:string){return day.slice(0,7)+'-01'}
export function shiftMonth(day:string,amount:number){const d=new Date(monthStart(day)+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+amount);return d.toISOString().slice(0,10)}
export function calendarDays(day:string){const start=weekStart(monthStart(day));return Array.from({length:42},(_,i)=>addDays(start,i))}
export function pullDistance(dy:number){return Math.min(100,Math.max(0,dy*.45))}
export const pullThreshold=64;
