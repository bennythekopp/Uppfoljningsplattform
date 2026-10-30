import 'server-only';
import {createHash} from 'node:crypto';
import {db} from './database';
import base from './items.json';
export async function studentBackupProtocol(personId:string){
 const assessments=(await db.prepare('SELECT a.item_id AS itemId,a.level,a.comment,a.updated_at AS updatedAt,COALESCE(u.name,a.updated_by) AS updatedByName FROM assessments a LEFT JOIN users u ON u.email=a.updated_by WHERE a.student_id=?').bind(personId).all<any>()).results;
 const comments=(await db.prepare('SELECT c.item_id AS itemId,c.body,c.created_at AS createdAt,COALESCE(u.name,c.author_email) AS authorName FROM comments c LEFT JOIN users u ON u.email=c.author_email WHERE c.student_id=? AND c.deleted_at IS NULL ORDER BY c.created_at,c.id').bind(personId).all()).results;
 const edits=(await db.prepare('SELECT item_id AS id,title,category FROM moment_edits').all<any>()).results,custom=(await db.prepare('SELECT id,title,category FROM custom_moments').all<any>()).results;
 const items=[...base.map(i=>({...i,...edits.find(e=>e.id===i.id)})),...custom.map(i=>({...i,id:1000000+Number(i.id)}))].map(i=>({...i,assessment:assessments.find(a=>Number(a.itemId)===i.id)||null})).filter(i=>i.assessment||comments.some((c:any)=>Number(c.itemId)===i.id));
 return {kind:'student',items,comments};
}
export async function captureBackupProtocol(area:string,input:any,output:any,personId:string,name:string,actor:string,method:string){
 let kind='',payload:any;
 if(method==='POST'&&(area==='KP'||area==='Examen')){kind=area==='KP'?input.kind:'Examen';payload=output.savedData}
 else if(method==='POST'&&area==='Individuell uppföljning'){kind=input.kind==='op'?'Operativ':'Simulator';payload=output}
 else if(area==='Bedömning'&&method==='PUT'||area==='Kommentarer'&&method==='POST'){kind='Elevbedömning';payload=await studentBackupProtocol(personId)}
 if(!kind||!payload)return;
 const id=createHash('sha256').update(JSON.stringify([personId,kind,payload])).digest('hex');
 await db.prepare('INSERT INTO backup_protocol_history(id,person_id,person_name,kind,source,payload,created_at,created_by) VALUES(?,?,?,?,?,?::jsonb,?,?) ON CONFLICT(id) DO NOTHING').bind(id,personId,name,kind,area,JSON.stringify(payload),Date.now(),actor).run();
}
