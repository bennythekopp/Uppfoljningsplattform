'use client';
import type {CSSProperties} from 'react';
import {TourText} from './tour-text';
import {proposalCellDisplay} from './planning-proposal-display';
import type {PlanningData,PlanningSuggestion} from './planning-types';
import './planning-proposal-cell.css';
export default function PlanningProposalCell({suggestion,side,data}:{suggestion:PlanningSuggestion,side:'previous'|'proposed',data?:PlanningData}){
 const view=proposalCellDisplay(suggestion,side,data),tour=suggestion.field==='tour';
 return <table className="planning-table planning-proposal-cell-table" aria-label={side==='previous'?'Nuvarande när förslaget lämnades':'Föreslaget'}><tbody><tr><td className={'planning-'+suggestion.field} style={view.style as CSSProperties} data-colored={view.paired||undefined} data-neutral={view.neutral}>{tour?<TourText className="planning-read">{view.value||'–'}</TourText>:<span className="planning-read">{view.value||'–'}</span>}</td></tr></tbody></table>;
}
