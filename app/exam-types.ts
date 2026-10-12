import type {KPAnswer,KPOutcome} from './kp-types';
export type ExamMoment={id:string,kind:string,title:string,description:string,position:number,children:{id:string,title:string,position:number}[]};
export type ExamGroup={id:string,part:'op'|'simulator',title:string,moments:ExamMoment[]};
export type ExamSession={id:string,date:string,part:'op'|'simulator',route:string,scenarioId:string,scenarioTitle:string,assessor:string,coAssessor:string};
export type ExamDraftSession={date:string,route:string,scenarioId:string,assessor:string,coAssessor:string};
export type ExamData={outcome:KPOutcome,answers:Record<string,KPAnswer>,logs:ExamSession[],session:ExamDraftSession};
export type ExamSaved=ExamData&{template:ExamGroup[]};
export type ExamRecord={data:ExamData,savedData:ExamSaved|null,isDraft:boolean,revision:number,updatedAt?:number,updatedByName?:string};
export const examOutcomeLabel=(p?:{outcome?:KPOutcome})=>!p?'Ej bedömd':p.outcome==='approved'?'Godkänd':p.outcome==='requires_completion'?'Komplettering krävs':'Ej beslutad';
