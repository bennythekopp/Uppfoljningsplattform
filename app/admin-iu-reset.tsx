'use client';
import {useState} from 'react';
import {createPortal} from 'react-dom';
import {RotateCcw} from 'lucide-react';
import {stockholmYear} from './followup-status';

export default function AdminIUReset(){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const year=stockholmYear();
 async function reset(){
  setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/admin/iu-reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Det gick inte att nollställa årets IU.');
   setOpen(false);setMessage(`Markeringarna för genomförd IU ${year} har nollställts.`);
   window.dispatchEvent(new Event('iu-year-reset'));
  }catch(e){setMessage((e as Error).message)}finally{setBusy(false)}
 }
 return <><section className="personnelcard adminiureset"><div><h2>Årets individuella uppföljning</h2><p>Nollställ markeringarna för genomförd IU på personalöversikten för pågående år. Protokollen finns kvar i historiken.</p></div><button type="button" className="secondary adminresetbutton" onClick={()=>{setMessage('');setOpen(true)}}><RotateCcw size={17}/> Nollställ årets IU</button></section>{message&&<p className="personnelnotice" role="status">{message}</p>}{open&&typeof document!=='undefined'&&createPortal(<div className="modalback" onClick={()=>{if(!busy)setOpen(false)}}><section className="modal" role="dialog" aria-modal="true" aria-label="Nollställ årets IU?" onClick={e=>e.stopPropagation()}><h2>Nollställ årets IU?</h2><p>Markeringarna för genomförd Operativ och Simulator på personalöversikten nollställs för {year}. Befintliga protokoll finns kvar i historiken.</p><div className="modalactions"><button className="cancel-button" type="button" autoFocus disabled={busy} onClick={()=>setOpen(false)}>Avbryt</button><button type="button" className="primary" disabled={busy} onClick={()=>void reset()}><RotateCcw size={17}/> Nollställ {year}</button></div></section></div>,document.body)}</>;
}
