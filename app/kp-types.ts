export type KPKind='KP1'|'KP2';
export type KPLevel=''|'green'|'yellow'|'red';
export type KPMoment={id:string,kind:KPKind,title:string,description:string,position:number,children:{id:string,title:string,position:number}[]};
export type KPAnswer={level:KPLevel,comment:string,checked:string[]};
export type KPData={date:string,assessor:string,examPercent:number|null,answers:Record<string,KPAnswer>};
export type KPSaved=KPData&{template:KPMoment[]};
export type KPRecord={data:KPData,savedData:KPSaved|null,isDraft:boolean,revision:number,updatedAt?:number,updatedByName?:string};
export type KPStatus='none'|'started'|'approved'|'remark'|'requires_completion';
export type KPStatusRow={studentId:string,kind:KPKind,status:KPStatus};
export const kpLevels=[{value:'green' as const,label:'Utan anmärkning'},{value:'yellow' as const,label:'Anmärkning finns'},{value:'red' as const,label:'Komplettering krävs'}];
export const kpStatusLabel=(status:KPStatus)=>({none:'Ej bedömd',started:'Påbörjad',approved:'Utan anmärkning',remark:'Anmärkning finns',requires_completion:'Komplettering krävs'}[status]);
export const kpStatusColor=(status:KPStatus)=>status==='approved'?'green':status==='remark'||status==='requires_completion'?'red':'neutral';
export function kpStatus(record:KPRecord|null):KPStatus{
 if(!record)return 'none';if(record.isDraft)return 'started';const saved=record.savedData;if(!saved)return 'none';
 const levels=saved.template.map(m=>saved.answers[m.id]?.level||'');
 if(levels.includes('red'))return 'requires_completion';if(levels.includes('yellow'))return 'remark';
 return levels.length>0&&levels.every(level=>level==='green')?'approved':'started';
}
