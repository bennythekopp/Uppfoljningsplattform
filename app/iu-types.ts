export type IUKind='op'|'simulator';
export type IUMoment={hidden?:boolean,id:string,kind:IUKind,section:string,title:string,description:string,maxScore:number|null,position:number,simulatorGroupId?:string|null,operationalCategoryId?:string|null};
export type IUSimulatorGroup={hidden?:boolean,id:string,title:string,description:string,position:number,children:IUMoment[]};
export type IUOperationalCategory={id:string,title:string,position:number};
export type IUArea={id:string,title:string,description:string,categoryId?:string|null};
export type IUSimRow=IUArea&{max:number};
export type IUTemplate={hiddenMomentIds?:string[],hiddenSimulatorGroupIds?:string[],op:IUArea[],chef:IUArea[],simulator:{id?:string,title:string,description?:string,rows:IUSimRow[]}[],passingScore:number,operationalCategories?:IUOperationalCategory[]};
export function buildIUTemplate(moments:IUMoment[],groups?:IUSimulatorGroup[],categories?:IUOperationalCategory[]):IUTemplate {
 const result:IUTemplate={op:[],chef:[],simulator:[],passingScore:40,operationalCategories:categories||[],hiddenMomentIds:moments.filter(m=>m.hidden).map(m=>m.id),hiddenSimulatorGroupIds:groups?.filter(g=>g.hidden).map(g=>g.id)||[]};
 for(const moment of moments.filter(m=>!m.hidden)){
  const row={id:moment.id,title:moment.title,description:moment.description};
  if(moment.kind==='op')result[categories?'op':moment.section==='chef'?'chef':'op'].push({...row,categoryId:moment.operationalCategoryId||null});
  else if(!groups){let section=result.simulator.find(s=>s.title===moment.section);if(!section){section={title:moment.section,rows:[]};result.simulator.push(section)}section.rows.push({...row,max:moment.maxScore??0})}
 }
 if(groups)result.simulator=groups.filter(group=>!group.hidden&&group.children.length).map(group=>({id:group.id,title:group.title,description:group.description,rows:group.children.map(child=>({id:child.id,title:child.title,description:child.description,max:child.maxScore??0}))}));
 return result;
}

export function groupOperationalAreas(areas:IUArea[],categories:IUOperationalCategory[]=[]){
 const known=new Set(categories.map(category=>category.id));
 return [{id:'uncategorized',title:'Utan kategori',rows:areas.filter(area=>!area.categoryId||!known.has(area.categoryId))},...categories.map(category=>({id:category.id,title:category.title,rows:areas.filter(area=>area.categoryId===category.id)}))].filter(group=>group.rows.length);
}

// Legacy snapshots retain their original two areas; current templates use regular categories.
export function operationalGroups(template:IUTemplate){
 if(!template.operationalCategories)return [{id:'legacy-op',title:'Bedömningsområden',rows:template.op},{id:'legacy-chef',title:'Ämnen till chef',rows:template.chef}].filter(group=>group.rows.length);
 return groupOperationalAreas([...template.op,...template.chef],template.operationalCategories);
}

export function visibleIUTemplate(snapshot:IUTemplate,current:IUTemplate):IUTemplate{
 const hidden=new Set(current.hiddenMomentIds||[]),groups=new Set(current.hiddenSimulatorGroupIds||[]);
 return {...snapshot,op:snapshot.op.filter(m=>!hidden.has(m.id)),chef:snapshot.chef.filter(m=>!hidden.has(m.id)),simulator:snapshot.simulator.filter(g=>!g.id||!groups.has(g.id)).map(g=>({...g,rows:g.rows.filter(m=>!hidden.has(m.id))})).filter(g=>g.rows.length)};
}
