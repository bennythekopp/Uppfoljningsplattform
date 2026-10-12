import type {ExamSaved} from './exam-types';
import type {KPSaved,KPKind} from './kp-types';
export type ArchivedStudent={kind:'student',name:string,items:{id:number,title:string,category:string,assessment?:{level:string,updatedAt:number,updatedByName:string}|null}[],comments:{id:string,itemId:number,body:string,createdAt:number,authorName:string}[],exam?:ExamSaved,kp:Partial<Record<KPKind,KPSaved>>};
export type StudentArchive={id:string,kind:'student'|KPKind|'Examen',createdAt:number,eventAt:number,authorName:string,payload:ArchivedStudent|{kind:KPKind,name:string,protocol:KPSaved,isDraft:boolean}|{kind:'Examen',name:string,protocol:ExamSaved,isDraft:boolean}};
