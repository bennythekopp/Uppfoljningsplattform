import {secureApi} from '../../api-security';
import {auditMutation} from '../../activity-log';
import { db,removePerson,renamePerson } from '../../database';
import { currentUser,error } from '../../auth';
export const dynamic='force-dynamic';
async function GETEndpoint(){try{if(!await currentUser())return error('Behörighet saknas',403);const {results}=await db.prepare('SELECT id,name,created_at AS createdAt FROM students WHERE moved_at IS NULL ORDER BY name COLLATE NOCASE').all();return Response.json(results);}catch{return error('Kunde inte läsa elever',503)}}
async function POSTHandler(req:Request){try{const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Endast instruktörer och administratörer kan lägga till elever',403);const {name}=await req.json() as {name:unknown};if(typeof name!=='string'||!name.trim()||name.length>120)return error('Ange elevens namn',400);const id=crypto.randomUUID();await db.prepare('INSERT INTO students(id,name,created_at,created_by) VALUES(?,?,?,?)').bind(id,name.trim(),Date.now(),user.email).run();return Response.json({id,name:name.trim()});}catch{return error('Kunde inte spara eleven',503)}}
async function PUTHandler(req:Request){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {id,name}=await req.json() as {id:unknown,name:unknown};if(typeof id!=='string'||!id||typeof name!=='string'||!name.trim()||name.length>120)return error('Ogiltigt namn',400);if(!await renamePerson(id,'students',name.trim()))return error('Eleven finns inte',404);return Response.json({id,name:name.trim()})}catch{return error('Kunde inte ändra elevens namn',503)}}
async function DELETEHandler(req:Request){try{const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Endast instruktörer och administratörer kan ta bort elever',403);const {id}=await req.json() as {id:unknown};if(typeof id!=='string'||!id.trim())return error('Elev saknas',400);if(!await removePerson(id,'students'))return error('Eleven finns inte',404);return Response.json({ok:true});}catch{return error('Kunde inte ta bort eleven',503)}}

const POSTEndpoint=(req:Request)=>auditMutation(req,POSTHandler,'Elever');

const PUTEndpoint=(req:Request)=>auditMutation(req,PUTHandler,'Elever');

const DELETEEndpoint=(req:Request)=>auditMutation(req,DELETEHandler,'Elever');

export const GET=secureApi('/api/students',GETEndpoint);
export const POST=secureApi('/api/students',POSTEndpoint);
export const PUT=secureApi('/api/students',PUTEndpoint);
export const DELETE=secureApi('/api/students',DELETEEndpoint);
