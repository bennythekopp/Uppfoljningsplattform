import 'server-only';
import {ordered} from './ordering';
import {db} from './database';
import type {ExamData,ExamGroup} from './exam-types';
import {validKPData} from './kp-data';
import type {KPMoment} from './kp-types';
export async function loadExamTemplate(connection=db){const rows=(await connection.prepare('SELECT id,part,title,moments FROM exam_templates WHERE deleted_at IS NULL ORDER BY position,id').all<ExamGroup>()).results;for(const group of rows)group.moments=await ordered('exam-moments:'+group.id,group.moments,connection);const scenarios=await ordered('exam-scenarios',rows.filter(g=>g.part==='simulator'),connection);return [...rows.filter(g=>g.part==='op'),...scenarios]}
export function validExamData(d:ExamData,t:ExamGroup[]):boolean{
 if(!d||!['','approved','requires_completion'].includes(d.outcome)||!d.session||typeof d.session!=='object'||Array.isArray(d.session)||!Array.isArray(d.logs)||d.logs.length>500)return false;
 if(!validKPData({outcome:d.outcome,date:d.session.date,assessor:d.session.assessor,examPercent:null,answers:d.answers},t.flatMap(g=>g.moments) as KPMoment[]))return false;
 const text=(s:unknown,max:number):s is string=>typeof s==='string'&&s.length<=max;
 if(!text(d.session.route,300)||!text(d.session.scenarioId,120)||!text(d.session.coAssessor,120))return false;
 const seen=new Set<string>();for(const l of d.logs){if(!l||!text(l.id,120)||!l.id||seen.has(l.id)||!['op','simulator'].includes(l.part)||!text(l.date,10)||!/^\d{4}-\d{2}-\d{2}$/.test(l.date)||!Number.isFinite(Date.parse(l.date))||!text(l.route,300)||!text(l.scenarioId,120)||!text(l.scenarioTitle,300)||!text(l.assessor,120)||!l.assessor.trim()||!text(l.coAssessor,120)||l.part==='op'&&!l.route.trim())return false;seen.add(l.id)}return true;
}
