import 'server-only';
import base from './items.json';
import {withMomentVisibility} from './moment-visibility';
import {db} from './database';
import {ordered} from './ordering';
type Category='System E2'|'System M'|'Övrigt';
export async function loadStudentMoments(){
const [edits,created,deleted]=await Promise.all([db.prepare('SELECT item_id AS id,title,description,category FROM moment_edits').all<{id:number,title:string,description:string,category:Category}>(),db.prepare('SELECT id,title,description,category FROM custom_moments ORDER BY id').all<{id:number,title:string,description:string,category:Category}>(),db.prepare('SELECT item_id AS id FROM deleted_moments').all<{id:number}>()]);const hidden=new Set(deleted.results.map(x=>x.id));const map=new Map(edits.results.map(e=>[e.id,e]));const rows=[...base.filter(b=>!hidden.has(b.id)).map(b=>({category:'System E2' as Category,...b,...map.get(b.id)})),...created.results.map(c=>({...c,id:1000000+c.id}))];
 const result=[];for(const category of ['System E2','System M','Övrigt'])result.push(...await ordered('student-moments:'+category,rows.filter(row=>row.category===category)));return withMomentVisibility('student',result);
}
