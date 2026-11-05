import type {PlanningColumn} from './planning-types';

export type PlanningColumnLayout={order:string[],widths:Record<string,number>};
export const emptyColumnLayout:PlanningColumnLayout={order:[],widths:{}};
export function parseColumnLayout(raw:string|null):PlanningColumnLayout{
 if(!raw)return emptyColumnLayout;
 try{
  const {order,widths}=JSON.parse(raw);
  return {
   order:Array.isArray(order)?order.filter((v:unknown)=>typeof v==='string'):[],
   widths:Object.fromEntries(Object.entries(widths||{}).filter((entry):entry is [string,number]=>{const v=entry[1];return typeof v==='number'&&Number.isFinite(v)&&v>=44&&v<=800})),
  };
 }catch{return emptyColumnLayout}
}
export function orderedPlanningColumns(columns:PlanningColumn[],layout:PlanningColumnLayout){
 const ranks=new Map(layout.order.map((id,index)=>[id,index]));
 return [...columns].sort((a,b)=>(ranks.get(a.id)??Infinity)-(ranks.get(b.id)??Infinity)||0);
}
export const tourWidthKey=(id:string)=>id+':tour';
export const taskWidthKey=(id:string)=>id+':task';
