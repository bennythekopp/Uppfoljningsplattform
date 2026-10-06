export type FollowupKind='op'|'simulator';
export type FollowupStatus='approved'|'requires_completion'|'started'|'none';
export type PersonnelStatusPerson={id:string,name:string,completed?:boolean,opOutcome?:string|null,simulatorOutcome?:string|null,statusYear?:string,opDraftYear?:string,simulatorDraftYear?:string};
type DraftStatusStore={forms:Record<string,{dirty:boolean,year?:string,form:{personId:string,kind:FollowupKind}}>,active:Record<string,string>};
export const stockholmYear=(date=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric'}).format(date);
export function partStatus(person:PersonnelStatusPerson,kind:FollowupKind,drafts:DraftStatusStore,year:string):FollowupStatus{
 const key=drafts.active[JSON.stringify([person.id,kind])],draft=key?drafts.forms[key]:undefined;
 if((kind==='op'?person.opDraftYear:person.simulatorDraftYear)===year||draft?.dirty&&draft.year===year)return 'started';
 const outcome=kind==='op'?person.opOutcome:person.simulatorOutcome;
 // Required completions carry over; annual approvals and starts do not.
 if(outcome==='requires_completion')return 'requires_completion';
 if(person.statusYear&&person.statusYear!==year)return 'none';
 return outcome==='approved'?'approved':outcome===''?'started':'none';
}
export const statusLabel=(status:FollowupStatus)=>status==='approved'?'Godkänd':status==='requires_completion'?'Komplettering krävs':status==='started'?'Påbörjad':'Ej påbörjad';
export const personCompleted=(person:PersonnelStatusPerson,drafts:DraftStatusStore,year:string)=>partStatus(person,'op',drafts,year)==='approved'&&partStatus(person,'simulator',drafts,year)==='approved';
