import {partStatus,statusLabel,type PersonnelStatusPerson} from './followup-status';
import type {FollowupDraftStore} from './personnel';
export default function PersonnelStatusBadges({person,drafts,year}:{person:PersonnelStatusPerson,drafts:FollowupDraftStore,year:string}){
 return <span className="personnelstatuses" aria-label="Uppföljningsstatus">{(['op','simulator'] as const).map(kind=>{const status=partStatus(person,kind,drafts,year);return <span className="personnelpartstatus" key={kind}><small>{kind==='op'?'Operativ':'Simulator'}</small><span className={'personnelstatusbadge '+status}>{statusLabel(status)}</span></span>})}</span>;
}
