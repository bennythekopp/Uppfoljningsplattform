import { db } from '../../database';
import { currentUser,error } from '../../auth';
export const dynamic='force-dynamic';
export async function GET(){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {results}=await db.prepare("SELECT s.id,s.name,SUM(CASE WHEN a.level='Grön' THEN 1 ELSE 0 END) AS green,SUM(CASE WHEN a.level='Gul' THEN 1 ELSE 0 END) AS yellow,SUM(CASE WHEN a.level='Röd' THEN 1 ELSE 0 END) AS red FROM students s LEFT JOIN assessments a ON a.student_id=s.id GROUP BY s.id,s.name ORDER BY s.name COLLATE NOCASE").all();return Response.json(results)}catch{return error('Kunde inte läsa översikten',503)}}
