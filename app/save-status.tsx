'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,LoaderCircle,AlertCircle} from 'lucide-react';
type Store={pending?:Promise<void>,jobs:Record<string,unknown>,error?:string};
export default function SaveStatus({store,busy=false,ready=true}:{store:Store,busy?:boolean,ready?:boolean}){
 const [state,setState]=useState('loading');
 useEffect(()=>{const refresh=()=>setState(!ready?'loading':store.error?'error':store.pending||busy?'saving':Object.keys(store.jobs).length?'unsaved':'saved');refresh();const id=setInterval(refresh,200);return()=>clearInterval(id)},[store,busy,ready]);
 const text={loading:'Läser in…',error:'Kunde inte spara',saving:'Sparar…',unsaved:'Osparade ändringar',saved:'Alla ändringar sparade'}[state];
 return <div className="save-status-slot"><span className={'save-status '+state} role="status" aria-live="polite" aria-atomic="true">{state==='saved'?<CheckCircle2 size={16}/>:state==='saving'||state==='loading'?<LoaderCircle className="save-spinner" size={16}/>:<AlertCircle size={16}/>}<span>{text}</span></span></div>;
}
