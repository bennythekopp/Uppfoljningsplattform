import type {KPAnswer,KPOutcome} from './kp-types';
export type ExamCategory={id:string,title:string};
export type ExamMoment={categoryId?:string|null,hidden?:boolean,id:string,kind:string,title:string,description:string,position:number,children:{id:string,title:string,position:number}[]};
export type ExamGroup={id:string,part:'op'|'simulator',title:string,moments:ExamMoment[],categories?:ExamCategory[]};
export type ExamSession={id:string,date:string,part:'op'|'simulator',route:string,scenarioId:string,scenarioTitle:string,assessor:string,coAssessor:string};
export type ExamDraftSession={date:string,route:string,scenarioId:string,assessor:string,coAssessor:string};
export type ExamData={outcome:KPOutcome,comment?:string,answers:Record<string,KPAnswer>,logs:ExamSession[],session:ExamDraftSession};
export type ExamSaved=ExamData&{template:ExamGroup[]};
export type ExamRecord={data:ExamData,savedData:ExamSaved|null,isDraft:boolean,revision:number,updatedAt?:number,updatedByName?:string};
export function examMomentGroups(group:ExamGroup){if(group.part!=='op'||!group.categories?.length)return [{id:'all',title:'',moments:group.moments}];const ids=new Set(group.categories.map(c=>c.id));return [...group.categories.map(c=>({...c,moments:group.moments.filter(m=>m.categoryId===c.id)})),{id:'uncategorized',title:'Utan kategori',moments:group.moments.filter(m=>!m.categoryId||!ids.has(m.categoryId))}].filter(c=>c.moments.length)}
export const examOutcomeLabel=(p?:{outcome?:KPOutcome})=>!p?'Ej bedömd':p.outcome==='approved'?'Godkänd':p.outcome==='requires_completion'?'Komplettering krävs':'Ej beslutad';
