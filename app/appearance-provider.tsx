'use client';
import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {appearanceLastKey,appearanceUserKey,defaultAppearance,normalizeAppearance,resolveTheme,type Appearance} from './appearance-settings';
type Controls={settings:Appearance,dark:boolean,setTheme:(dark:boolean)=>void,setTextSize:(size:Appearance['textSize'])=>void,selectUser:(email:string|null)=>void};
const Context=createContext<Controls|null>(null);
function read(key:string){try{return normalizeAppearance(JSON.parse(localStorage.getItem(key)||'null'))}catch{return {...defaultAppearance}}}
function apply(settings:Appearance){const dark=resolveTheme(settings.theme,window.matchMedia('(prefers-color-scheme: dark)').matches)==='dark';document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.dataset.textSize=settings.textSize;return dark}
export default function AppearanceProvider({children}:{children:ReactNode}){
 const [settings,setSettings]=useState<Appearance>(defaultAppearance),[dark,setDark]=useState(false),owner=useRef<string|null>(null),current=useRef<Appearance>(defaultAppearance);
 const update=useCallback((next:Appearance,persist=false)=>{current.current=next;setSettings(next);setDark(apply(next));if(persist){try{localStorage.setItem(appearanceLastKey,JSON.stringify(next));if(owner.current)localStorage.setItem(appearanceUserKey(owner.current),JSON.stringify(next))}catch{}}},[]);
 useLayoutEffect(()=>{update(read(appearanceLastKey))},[update]);
 const selectUser=useCallback((email:string|null)=>{if(owner.current===email)return;owner.current=email;if(email)update(read(appearanceUserKey(email)),true)},[update]);
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)'),changed=()=>setDark(apply(current.current)),storage=(event:StorageEvent)=>{const key=owner.current?appearanceUserKey(owner.current):appearanceLastKey;if(event.key===key)update(read(key))};media.addEventListener('change',changed);window.addEventListener('storage',storage);return()=>{media.removeEventListener('change',changed);window.removeEventListener('storage',storage)}},[update]);
 return <Context.Provider value={{settings,dark,selectUser,setTheme:enabled=>update({...current.current,theme:enabled?'dark':'light'},true),setTextSize:size=>update({...current.current,textSize:size},true)}}>{children}</Context.Provider>;
}
export function useAppearance(){const value=useContext(Context);if(!value)throw new Error('Utseendeinställningarna saknas');return value}
export function useAppearanceUser(email:string|null){const {selectUser}=useAppearance();useEffect(()=>selectUser(email),[email,selectUser])}
