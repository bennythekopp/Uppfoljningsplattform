'use client';
import type {PlanningSuggestion} from './planning-types';
export function SuggestionBadge({suggestions,onReview,label}:{suggestions:PlanningSuggestion[],label?:string,onReview?: (v:PlanningSuggestion[])=>void}){return suggestions.length?<button type="button" className="planning-suggestion-badge" aria-label={label||'Visa '+suggestions.length+' ändringsförslag'} onClick={()=>onReview?.(suggestions)}>!</button>:null}
