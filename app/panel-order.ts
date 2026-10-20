export function sortPanelRows<T extends {id:string}>(rows:T[],saved:string[]|undefined):T[]{
 if(!saved?.length)return rows;
 const rank=new Map(saved.map((id,index)=>[id,index]));
 return [...rows].sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity));
}
export function swapPanelIds(ids:string[],from:string,to:string){
 const a=ids.indexOf(from),b=ids.indexOf(to);
 if(a<0||b<0||a===b)return ids;
 const next=[...ids];[next[a],next[b]]=[next[b],next[a]];return next;
}

export function movePanelIds(ids:string[],from:string,to:string){
 const a=ids.indexOf(from),b=ids.indexOf(to);
 if(a<0||b<0||a===b)return ids;
 const next=[...ids],[moved]=next.splice(a,1);next.splice(b,0,moved);return next;
}
