import { timingSafeEqual } from 'node:crypto';
const enc=new TextEncoder();
export const PASSWORD_ITERATIONS=600000;
async function derive(password:string,salt:string,iterations:number){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations,hash:'SHA-256'},key,256);
 return Buffer.from(bits).toString('hex');
}
export async function passwordHash(password:string,salt:string){return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${await derive(password,salt,PASSWORD_ITERATIONS)}`}
export async function verifyPassword(password:string,salt:string,stored:string){
 const legacy=/^[a-f0-9]{64}$/.test(stored);
 const match=/^pbkdf2-sha256\$600000\$([a-f0-9]{64})$/.exec(stored);
 if(!legacy&&!match)return false;
 const actual=await derive(password,salt,legacy?180000:PASSWORD_ITERATIONS);
 return timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(legacy?stored:match![1],'hex'));
}
export const needsPasswordUpgrade=(stored:string)=>/^[a-f0-9]{64}$/.test(stored);
