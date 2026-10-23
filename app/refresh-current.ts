'use client';
import {useEffect,useRef} from 'react';
const listeners=new Set<()=>Promise<unknown>>();
export function useRefreshCurrent(callback:()=>Promise<unknown>){const latest=useRef(callback);latest.current=callback;useEffect(()=>{const run=()=>latest.current();listeners.add(run);return()=>{listeners.delete(run)}},[])}
export async function refreshCurrent(){for(const run of listeners)await run()}
