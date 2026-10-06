type SavedFollowup={id:string,kind:'op'|'simulator',followupDate:string,createdAt?:number,updatedAt:number};
/** New forms compare with the latest saved protocol; history compares with its predecessor. */
export function previousFollowup<T extends SavedFollowup>(records:T[],kind:SavedFollowup['kind'],currentId?:string):T|null{
 const ordered=records.filter(record=>record.kind===kind).sort((a,b)=>b.followupDate.localeCompare(a.followupDate)||(b.createdAt??b.updatedAt)-(a.createdAt??a.updatedAt)||b.id.localeCompare(a.id));
 if(!currentId)return ordered[0]||null;
 const index=ordered.findIndex(record=>record.id===currentId);
 return index>=0?ordered[index+1]||null:null;
}

/** Print the latest saved simulator outcome dated in the current Stockholm year. */
export function currentYearSimulatorFollowup<T extends SavedFollowup>(records:T[],year:string):T|null{
 return records.filter(record=>record.kind==='simulator'&&record.followupDate.startsWith(year+'-')).sort((a,b)=>b.followupDate.localeCompare(a.followupDate)||(b.createdAt??b.updatedAt)-(a.createdAt??a.updatedAt)||b.id.localeCompare(a.id))[0]||null;
}
