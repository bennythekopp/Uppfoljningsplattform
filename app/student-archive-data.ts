import 'server-only';
import {ordered} from './ordering';
import {loadExamTemplate} from './exam-data';
import type {ExamRecord} from './exam-types';
import base from './items.json';
import type {db} from './database';
import {loadKPTemplate} from './kp-data';
import type {KPData,KPSaved,KPKind} from './kp-types';
import type {ArchivedStudent} from './student-archive-types';
export async function archiveStudent(connection:typeof db,id:string,name:string,actor:string,eventAt:number){
 const {results:existing}=await connection.prepare('SELECT kind FROM personnel_student_archives WHERE personnel_id=? AND event_at=?').bind(id,eventAt).all<{kind:string}>();const seen=new Set(existing.map(x=>x.kind));
 const {results:kp}=await connection.prepare('SELECT kind,data,saved_data AS savedData,is_draft AS isDraft FROM student_kp_assessments WHERE student_id=?').bind(id).all<{kind:KPKind,data:KPData,savedData:KPSaved|null,isDraft:boolean}>();
 const protocols:Partial<Record<KPKind,KPSaved>>={};for(const row of kp){if(!row.savedData&&!row.isDraft)continue;const protocol=row.savedData||{...row.data,template:await loadKPTemplate(row.kind,connection)};protocols[row.kind]=protocol;if(!seen.has(row.kind))await connection.prepare('INSERT INTO personnel_student_archives(id,personnel_id,kind,event_at,created_at,created_by,payload) VALUES(?,?,?,?,?,?,?::jsonb) ON CONFLICT(personnel_id,event_at,kind) DO NOTHING').bind(crypto.randomUUID(),id,row.kind,eventAt,Date.now(),actor,JSON.stringify({kind:row.kind,name,protocol,isDraft:!row.savedData})).run()}
 const exam=await connection.prepare('SELECT data,saved_data AS savedData,is_draft AS isDraft,revision FROM student_examinations WHERE student_id=?').bind(id).first<ExamRecord>();
 const examProtocol=exam&&(exam.savedData||exam.isDraft)?(exam.savedData||{...exam.data,template:await loadExamTemplate(connection)}):undefined;
 if(examProtocol&&!seen.has('Examen'))await connection.prepare('INSERT INTO personnel_student_archives(id,personnel_id,kind,event_at,created_at,created_by,payload) VALUES(?,?,?,?,?,?,?::jsonb) ON CONFLICT(personnel_id,event_at,kind) DO NOTHING').bind(crypto.randomUUID(),id,'Examen',eventAt,Date.now(),actor,JSON.stringify({kind:'Examen',name,protocol:examProtocol,isDraft:!exam?.savedData})).run();
 if(seen.has('student'))return;
 const {results:edits}=await connection.prepare('SELECT item_id AS id,title,category FROM moment_edits').all<{id:number,title:string,category:string}>(),{results:created}=await connection.prepare('SELECT id,title,category FROM custom_moments ORDER BY id').all<{id:number,title:string,category:string}>(),{results:deleted}=await connection.prepare('SELECT item_id AS id FROM deleted_moments').all<{id:number}>();
 const {results:assessments}=await connection.prepare('SELECT a.item_id AS itemId,a.level,a.updated_at AS updatedAt,COALESCE(u.name,a.updated_by) AS updatedByName FROM assessments a LEFT JOIN users u ON u.email=a.updated_by WHERE a.student_id=?').bind(id).all<{itemId:number,level:string,updatedAt:number,updatedByName:string}>();
 const {results:comments}=await connection.prepare('SELECT c.id,c.item_id AS itemId,c.body,c.created_at AS createdAt,COALESCE(u.name,c.author_email) AS authorName FROM comments c LEFT JOIN users u ON u.email=c.author_email WHERE c.student_id=? AND c.deleted_at IS NULL ORDER BY c.created_at,c.id').bind(id).all<ArchivedStudent['comments'][number]>();
 const hidden=new Set(deleted.map(x=>x.id)),map=new Map(edits.map(x=>[x.id,x]));const items=[...base.filter(b=>!hidden.has(b.id)).map(b=>({id:b.id,title:b.title,category:'System E2',...map.get(b.id)})),...created.map(c=>({...c,id:1000000+c.id}))].map(item=>({...item,assessment:assessments.find(a=>a.itemId===item.id)||null}));
 const orderedItems=[];for(const category of ['System E2','System M','Övrigt'])orderedItems.push(...await ordered('student-moments:'+category,items.filter(item=>item.category===category),connection));
 const payload:ArchivedStudent={kind:'student',name,items:orderedItems,comments,kp:protocols,exam:examProtocol};await connection.prepare('INSERT INTO personnel_student_archives(id,personnel_id,kind,event_at,created_at,created_by,payload) VALUES(?,?,?,?,?,?,?::jsonb) ON CONFLICT(personnel_id,event_at,kind) DO NOTHING').bind(crypto.randomUUID(),id,'student',eventAt,Date.now(),actor,JSON.stringify(payload)).run();
}
