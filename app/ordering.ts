import 'server-only';
import {db} from './database';
export async function ordered<T extends {id:string|number}>(scope:string,rows:T[],connection=db):Promise<T[]>{
 const saved=await connection.prepare('SELECT item_ids AS ids FROM display_orders WHERE scope=?').bind(scope).first<{ids:string[]}>();
 if(!saved)return rows;
 const rank=new Map(saved.ids.map((id,i)=>[String(id),i]));
 return [...rows].sort((a,b)=>(rank.get(String(a.id))??Number.MAX_SAFE_INTEGER)-(rank.get(String(b.id))??Number.MAX_SAFE_INTEGER));
}
