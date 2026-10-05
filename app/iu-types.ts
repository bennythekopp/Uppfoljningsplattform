export type IUKind='op'|'simulator';
export type IUMoment={id:string,kind:IUKind,section:string,title:string,description:string,maxScore:number|null,position:number};
export type IUArea={id:string,title:string,description:string};
export type IUSimRow=IUArea&{max:number};
export type IUTemplate={op:IUArea[],chef:IUArea[],simulator:{title:string,rows:IUSimRow[]}[],passingScore:number};
export function buildIUTemplate(moments:IUMoment[]):IUTemplate {
 const result:IUTemplate={op:[],chef:[],simulator:[],passingScore:40};
 for(const moment of moments){
  const row={id:moment.id,title:moment.title,description:moment.description};
  if(moment.kind==='op')result[moment.section==='chef'?'chef':'op'].push(row);
  else {let section=result.simulator.find(s=>s.title===moment.section);if(!section){section={title:moment.section,rows:[]};result.simulator.push(section)}section.rows.push({...row,max:moment.maxScore??0})}
 }
 return result;
}
