export const examResultFields=[{key:'systemH',label:'System H'},{key:'systemM',label:'System M'},{key:'local',label:'Lokalt'}] as const;
export type ExamResults=Record<typeof examResultFields[number]['key'],number|null>;
export function normalizeExamResults(results?:Partial<ExamResults>):ExamResults{return {systemH:results?.systemH??null,systemM:results?.systemM??null,local:results?.local??null}}
export function validExamResults(value:unknown):boolean{
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const results=value as Record<string,unknown>;
 return Object.keys(results).every(key=>examResultFields.some(field=>field.key===key))&&examResultFields.every(({key})=>results[key]===undefined||results[key]===null||typeof results[key]==='number'&&Number.isFinite(results[key])&&results[key]>=0&&results[key]<=100);
}
