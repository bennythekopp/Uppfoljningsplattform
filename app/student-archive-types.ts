import type {KPSaved,KPKind} from './kp-types';
export type ArchivedStudent={kind:'student',name:string,items:{id:number,title:string,category:string,assessment?:{level:string,updatedAt:number,updatedByName:string}|null}[],comments:{id:string,itemId:number,body:string,createdAt:number,authorName:string}[],kp:Partial<Record<KPKind,KPSaved>>};
export type StudentArchive={id:string,kind:'student'|KPKind,createdAt:number,eventAt:number,authorName:string,payload:ArchivedStudent|{kind:KPKind,name:string,protocol:KPSaved,isDraft:boolean}};
