import {secureApi} from '../../api-security';
import { db } from '../../database';
import { currentUser,error } from '../../auth';
export const dynamic='force-dynamic';
async function GETEndpoint(){try{const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);const {results}=await db.prepare("SELECT s.id,s.name,SUM(CASE WHEN h.moment_id IS NULL AND a.level='Grön' THEN 1 ELSE 0 END) AS green,SUM(CASE WHEN h.moment_id IS NULL AND a.level='Gul' THEN 1 ELSE 0 END) AS yellow,SUM(CASE WHEN h.moment_id IS NULL AND a.level='Röd' THEN 1 ELSE 0 END) AS red FROM students s LEFT JOIN assessments a ON a.student_id=s.id LEFT JOIN hidden_moments h ON h.area='student' AND h.moment_id=CAST(a.item_id AS text) WHERE s.moved_at IS NULL GROUP BY s.id,s.name ORDER BY s.name COLLATE NOCASE").all();return Response.json(results)}catch{return error('Kunde inte läsa översikten',503)}}

export const GET=secureApi('/api/overview',GETEndpoint);
