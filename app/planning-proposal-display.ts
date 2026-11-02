import {findTour,tourStyle,type ScheduleTour} from './grundschema-types';
import {colorStyle,pairedPlanningStyle,personPeriodFor,type PlanningData,type PlanningSuggestion} from './planning-types';
/** Resolve saved values to the same cell colours/labels used by Planning.
 * Legacy audit labels contain a colour suffix; task/free text is never parsed. */
export function proposalCellDisplay(s:PlanningSuggestion,side:'previous'|'proposed',data?:PlanningData){
 const value=side==='previous'?s.previousValue:s.proposedValue,label=side==='previous'?s.previousLabel:s.proposedLabel;
 const column=data?.columns.find(c=>c.id===s.columnId),period=column&&data?personPeriodFor(data.periods,column,s.day,data.memberships):undefined;
 const cell=(field:string)=>data?.cells.find(c=>c.day===s.day&&c.columnId===s.columnId&&c.field===field)?.value;
 const previousColor=s.previousColor??s.currentColor??cell('color')??'',manual=side==='proposed'?(s.proposedColor??previousColor):previousColor;
 if(s.field==='tour'){
  const snapshot=findTour({tours:[]},value),logged=label!==value?label?.match(/^(.*) · (#[0-9a-f]{6})$/i):null;
  const tour:ScheduleTour|undefined=logged?{code:logged[1],color:logged[2],passes:snapshot?.passes||[],meal:snapshot?.meal||false}:snapshot||findTour(period?.config||{tours:[]},value);
  const code=tour?.code||label||value,semester=side==='proposed'&&code.trim().toLocaleLowerCase('sv-SE')==='semester';
  const paired=semester?undefined:colorStyle(manual),style=paired||(tour?tourStyle({tours:[tour]},tour.code):undefined);
  return {value:code,style,paired:!!paired,neutral:!paired&&['#ffffff','#dedede'].includes(style?.backgroundColor.toLowerCase()||'')?(code==='FP'?'free':'neutral'):undefined};
 }
 const style=pairedPlanningStyle(manual,s.currentTour??cell('tour')??'',period);
 return {value,style,paired:!!style,neutral:undefined};
}
