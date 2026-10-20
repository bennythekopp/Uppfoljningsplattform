import {loadStudentMoments} from '../../student-moments';
import {secureApi} from '../../api-security';
import {auditMutation} from '../../activity-log';
import { db,removeMoment } from '../../database';
import { currentUser,error } from '../../auth';
import base from '../../items.json';
export const dynamic='force-dynamic';
type Category='System E2'|'System M'|'Övrigt';
const validCategory=(value:unknown):value is Category=>value==='System E2'||value==='System M'||value==='Övrigt';
async function GETEndpoint(){try{const u=await currentUser();if(!u)return error('Behörighet saknas',403);const rows=await loadStudentMoments();return Response.json(['Administratör','Instruktör'].includes(u.role)?rows:rows.filter(m=>!m.hidden))}catch{return error('Kunde inte läsa moment',503)}}
async function POSTHandler(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {title,description,category}=await req.json() as {title:unknown,description:unknown,category:unknown};if(typeof title!=='string'||!title.trim()||title.length>180||typeof description!=='string'||description.length>10000||!validCategory(category))return error('Ange rubrik och beskrivning',400);const result=await db.prepare('INSERT INTO custom_moments(title,description,category,created_at,created_by) VALUES(?,?,?,?,?)').bind(title.trim(),description.trim(),category,Date.now(),u.email).run();return Response.json({id:1000000+Number(result.meta.last_row_id),title:title.trim(),description:description.trim(),category});}catch{return error('Kunde inte lägga till momentet',503)}}
async function PUTHandler(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {id,title,description,category}=await req.json() as {id:unknown,title:unknown,description:unknown,category:unknown};if(typeof id!=='number'||!Number.isInteger(id)||typeof title!=='string'||!title.trim()||title.length>180||typeof description!=='string'||description.length>10000||!validCategory(category))return error('Ogiltigt moment',400);if(id>=1000000){const result=await db.prepare('UPDATE custom_moments SET title=?,description=?,category=? WHERE id=?').bind(title.trim(),description.trim(),category,id-1000000).run();if(!result.meta.changes)return error('Momentet finns inte',404)}else{if(!base.some(b=>b.id===id))return error('Momentet finns inte',404);await db.prepare('INSERT INTO moment_edits(item_id,title,description,category,updated_at,updated_by) VALUES(?,?,?,?,?,?) ON CONFLICT(item_id) DO UPDATE SET title=excluded.title,description=excluded.description,category=excluded.category,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(id,title.trim(),description.trim(),category,Date.now(),u.email).run()}return Response.json({id,title:title.trim(),description:description.trim(),category});}catch{return error('Kunde inte spara momentet',503)}}

async function DELETEHandler(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {id}=await req.json() as {id:unknown};if(typeof id!=='number'||!Number.isInteger(id)||id<0||id<1000000&&!base.some(b=>b.id===id))return error('Ogiltigt moment',400);if(!await removeMoment(id,u.email))return error('Momentet finns inte',404);return Response.json({ok:true});}catch{return error('Kunde inte ta bort momentet',503)}}

const POSTEndpoint=(req:Request)=>auditMutation(req,POSTHandler,'Elevunderlag');

const PUTEndpoint=(req:Request)=>auditMutation(req,PUTHandler,'Elevunderlag');

const DELETEEndpoint=(req:Request)=>auditMutation(req,DELETEHandler,'Elevunderlag');

export const GET=secureApi('/api/moments',GETEndpoint);
export const POST=secureApi('/api/moments',POSTEndpoint);
export const PUT=secureApi('/api/moments',PUTEndpoint);
export const DELETE=secureApi('/api/moments',DELETEEndpoint);
