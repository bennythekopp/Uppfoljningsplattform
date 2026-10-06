'use client';
import {useEffect,useState} from 'react';
import {stockholmYear} from './followup-status';
export function useStockholmYear(){
 const [year,setYear]=useState(()=>stockholmYear());
 useEffect(()=>{const refresh=()=>setYear(stockholmYear());const timer=window.setInterval(refresh,60000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)}},[]);
 return year;
}
