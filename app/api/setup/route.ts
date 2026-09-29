import { db } from '../../database';
import { error,passwordHash,randomToken,sha256 } from '../../auth';
export const dynamic='force-dynamic';
export async function GET(){try{const row=await db.prepare("SELECT email FROM users WHERE role='Administratör' LIMIT 1").first();return Response.json({configured:!!row})}catch{return error('Databasen är inte redo',503)}}
export async function POST(req:Request){try{
 const {token,username,name,password}=await req.json() as {token:unknown,username:unknown,name:unknown,password:unknown};
 const secret=process.env.ADMIN_SETUP_TOKEN;
 if(!secret||secret.length<32||typeof token!=='string'||typeof username!=='string'||!(/^[a-zA-Z0-9._-]{3,40}$/.test(username))||typeof name!=='string'||!name.trim()||name.length>120||typeof password!=='string'||password.length<12||password.length>200)return error('Kontrollera uppgifterna och engångsnyckeln',400);
 if(await sha256(token)!==await sha256(secret))return error('Fel engångsnyckel',403);
 const normalized=username.toLowerCase(),salt=randomToken(),hash=await passwordHash(password,salt);
 const result=await db.prepare("INSERT INTO users(email,username,name,role,password_hash,password_salt,created_at) SELECT ?,?,?,'Administratör',?,?,? WHERE NOT EXISTS(SELECT 1 FROM users WHERE role='Administratör')").bind(normalized+'@local.invalid',normalized,name.trim(),hash,salt,Date.now()).run();
 if(!result.meta.changes)return error('Administratören är redan skapad',409);
 return Response.json({ok:true});
 }catch{return error('Kunde inte skapa administratör',503)}}
