export type KPOutcome=''|'approved'|'requires_completion';
export type KPKind='KP1'|'KP2';
export type KPLevel=''|'green'|'yellow'|'red';
export type KPMoment={id:string,kind:KPKind,title:string,description:string,position:number,children:{id:string,title:string,position:number}[]};
export type KPAnswer={level:KPLevel,comment:string,checked:string[]};
export type KPData={outcome?:KPOutcome,date:string,assessor:string,examPercent:number|null,answers:Record<string,KPAnswer>};
export type KPSaved=KPData&{template:KPMoment[]};
export type KPRecord={data:KPData,savedData:KPSaved|null,isDraft:boolean,revision:number,updatedAt?:number,updatedByName?:string};
export type KPStatus='none'|'started'|'approved'|'remark'|'requires_completion';
export type KPStatusRow={studentId:string,kind:KPKind,status:KPStatus,savedStatus?:KPStatus};
export const kpLevels=[{value:'green' as const,label:'Utan anmärkning'},{value:'yellow' as const,label:'Anmärkning finns'},{value:'red' as const,label:'Komplettering krävs'}];
export const kpStatusLabel=(status:KPStatus)=>({none:'Ej bedömd',started:'Påbörjad',approved:'Godkänd',remark:'Anmärkning finns',requires_completion:'Komplettering krävs'}[status]);
export const kpStatusColor=(status:KPStatus)=>status==='approved'?'green':status==='remark'||status==='requires_completion'?'red':'neutral';
export function kpStatus(record:KPRecord|null):KPStatus{
 if(!record)return 'none';if(record.isDraft)return 'started';const saved=record.savedData;if(!saved)return 'none';
 if(saved.outcome!==undefined)return saved.outcome||'started';
 const levels=saved.template.map(m=>saved.answers[m.id]?.level||'');
 if(levels.includes('red'))return 'requires_completion';if(levels.includes('yellow'))return 'remark';
 return levels.length>0&&levels.every(level=>level==='green')?'approved':'started';
}

export function kpOutcomeLabel(protocol:KPSaved|undefined){if(!protocol)return 'Ej bedömd';if(protocol.outcome!==undefined)return protocol.outcome==='approved'?'Godkänd':protocol.outcome==='requires_completion'?'Komplettering krävs':'Ej beslutad';const status=kpStatus({data:protocol,savedData:protocol,isDraft:false,revision:0});return status==='approved'?'Godkänd':status==='remark'||status==='requires_completion'?'Komplettering krävs':'Ej beslutad'}
export const kpOutcomeClass=(protocol:KPSaved|undefined)=>kpOutcomeLabel(protocol)==='Godkänd'?'approved':kpOutcomeLabel(protocol)==='Komplettering krävs'?'requires_completion':'';
