import {db,followupTransaction} from '../../../database';
import {currentUser,error} from '../../../auth';
import {loadIUTemplate} from '../../../iu-data';
import {validAnswers} from '../../../followup-validation';
import {stockholmYear} from '../../../followup-status';
import type {IUTemplate} from '../../../iu-types';
export const dynamic='force-dynamic';
const permitted=(role:string)=>role==='Administratör'||role==='Instruktör';
export async function GET(req:Request){try{
 const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);
 const id=new URL(req.url).searchParams.get('personId');if(!id)return error('Personal saknas',400);
 if(!await db.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(id).first())return error('Personal finns inte',404);
 const {results}=await db.prepare('SELECT kind,form,draft_year AS year,revision FROM personnel_followup_drafts WHERE personnel_id=?').bind(id).all();return Response.json(results);
}catch{return error('Kunde inte läsa pågående uppföljning',503)}}
async function mutate(req:Request,discard:boolean){try{
 const u=await currentUser();if(!u||!permitted(u.role))return error('Behörighet saknas',403);
 const value=await req.json(),{personId,kind,revision}=value;
 if(typeof personId!=='string'||!personId||!['op','simulator'].includes(kind)||!Number.isSafeInteger(revision)||revision<0)return error('Ogiltigt utkast',400);
 return await followupTransaction(personId,kind,async connection=>{
 if(!await connection.prepare('SELECT id FROM personnel WHERE id=? AND moved_at IS NULL').bind(personId).first())return error('Personal finns inte',404);
 const previous=await connection.prepare('SELECT revision,form FROM personnel_followup_drafts WHERE personnel_id=? AND kind=?').bind(personId,kind).first<{revision:number,form:{templateSnapshot?:IUTemplate}|null}>();
 if(revision!==(previous?.revision||0))return error('Uppföljningen har ändrats av någon annan. Ladda om sidan innan du fortsätter.',409);
 let form=null;
 if(!discard){
 const f=value.form;if(!f||typeof f!=='object'||Array.isArray(f)||f.personId!==personId||f.kind!==kind||!['','approved','requires_completion'].includes(f.outcome))return error('Ogiltigt utkast',400);
 for(const [field,max] of Object.entries({followupDate:10,responsible:120,detail:300,summary:5000,news:5000,localResult:300,centralResult:300}))if(typeof f[field]!=='string'||f[field].length>max)return error('Ogiltigt utkast',400);
 if(f.id!==undefined&&(typeof f.id!=='string'||!f.id))return error('Ogiltigt protokoll',400);
 const saved=f.id?await connection.prepare('SELECT template_snapshot AS templateSnapshot FROM personnel_followups WHERE id=? AND personnel_id=? AND kind=?').bind(f.id,personId,kind).first<{templateSnapshot:IUTemplate|null}>():null;
 if(f.id&&!saved)return error('Protokollet finns inte',404);
 const templateSnapshot=saved?.templateSnapshot||previous?.form?.templateSnapshot||await loadIUTemplate(connection);
 if(!validAnswers(kind,f.answers,templateSnapshot))return error('Ogiltiga bedömningar',400);
 form={personId,kind,id:f.id,followupDate:f.followupDate,responsible:f.responsible,detail:f.detail,summary:f.summary,news:f.news,localResult:f.localResult,centralResult:f.centralResult,outcome:f.outcome,completed:f.outcome==='approved',answers:f.answers,templateSnapshot};
 }
 const nextRevision=revision+1,year=stockholmYear();
 await connection.prepare('INSERT INTO personnel_followup_drafts(personnel_id,kind,form,draft_year,revision,updated_at,updated_by) VALUES(?,?,?::jsonb,?,?,?,?) ON CONFLICT(personnel_id,kind) DO UPDATE SET form=EXCLUDED.form,draft_year=EXCLUDED.draft_year,revision=EXCLUDED.revision,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(personId,kind,form?JSON.stringify(form):null,year,nextRevision,Date.now(),u.email).run();
 return Response.json({revision:nextRevision,year});
 });
}catch{return error('Kunde inte spara pågående uppföljning',503)}}
export async function PUT(req:Request){return mutate(req,false)}
export async function DELETE(req:Request){return mutate(req,true)}
