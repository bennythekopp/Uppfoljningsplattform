'use client';
import {useState} from 'react';
import {Eye,EyeOff} from 'lucide-react';
export default function MomentVisibilityButton({area,id,title,hidden=false,disabled=false,onChanged}:{area:'student'|'iu-op'|'iu-simulator'|'kp'|'exam',id:string|number,title:string,hidden?:boolean,disabled?:boolean,onChanged:()=>void|Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <span className="momentvisibility"><button type="button" className="editicon" disabled={disabled||busy} aria-label={(hidden?'Visa ':'Dölj ')+title+' i bedömningen'} title={hidden?'Visa i bedömningen':'Dölj i bedömningen'} onClick={async()=>{setBusy(true);setError('');try{const r=await fetch('/api/moment-visibility',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({area,id:String(id),hidden:!hidden,previousHidden:hidden})}),v=await r.json();if(!r.ok)throw Error(v.error||'Kunde inte ändra synligheten');await onChanged()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}>{hidden?<EyeOff size={18}/>:<Eye size={18}/>}</button>{error&&<small role="alert" className="formerror">{error}</small>}</span>
}
export function HiddenMomentBadge({hidden}:{hidden?:boolean}){return hidden?<small className="hiddenmomentbadge">Dolt i bedömningen</small>:null}
