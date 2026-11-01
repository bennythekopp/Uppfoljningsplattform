 'use client';
import {RotateCw,Check} from 'lucide-react';
export default function RefreshSymbol({loading=false,done=false,offset=0}:{loading?:boolean,done?:boolean,offset?:number}){return done?<Check size={22}/>:<RotateCw size={22} className={'tc-refresh-symbol'+(loading?' is-loading':'')} style={{transform:loading?undefined:`rotate(${offset*3}deg)`}}/>}
