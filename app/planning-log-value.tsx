import type {CSSProperties} from 'react';
import {findTour,tourStyle} from './grundschema-types';
import type {PlanningLog} from './planning-types';
import {TourText} from './tour-text';
import './planning-proposal-cell.css';
export default function PlanningLogValue({row,value}:{row:PlanningLog,value:string}){
 if(row.field!=='tour')return <span className="admin-log-full-value">{value||'Tomt'}</span>;
 const logged=value.match(/^(.*) · (#[0-9a-f]{6})$/i),snapshot=findTour({tours:[]},value);
 const tour=logged?{code:logged[1],color:logged[2],passes:[],meal:false}:snapshot;
 const label=tour?.code||value||'Tomt',style=tour?tourStyle({tours:[tour]},tour.code):undefined;
 return <table className="planning-table planning-proposal-cell-table planning-log-tour"><tbody><tr><td className="planning-tour" style={style as CSSProperties} data-neutral={tour&&['#ffffff','#dedede'].includes(tour.color.toLowerCase())?(label==='FP'?'free':'neutral'):undefined}><TourText className="planning-read">{label}</TourText></td></tr></tbody></table>;
}
