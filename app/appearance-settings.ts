export type Appearance={theme:'system'|'light'|'dark',textSize:'normal'|'large'|'extra-large'};
export const defaultAppearance:Appearance={theme:'system',textSize:'normal'};
export const appearanceLastKey='tc-boden-appearance-last';
export const appearanceUserKey=(email:string)=>'tc-boden-appearance:'+encodeURIComponent(email);
export function normalizeAppearance(value:unknown):Appearance{const v=value&&typeof value==='object'?value as Record<string,unknown>:{};return {theme:v.theme==='light'||v.theme==='dark'?v.theme:'system',textSize:v.textSize==='large'||v.textSize==='extra-large'?v.textSize:'normal'}}
export function resolveTheme(preference:Appearance['theme'],systemDark:boolean){return preference==='system'?(systemDark?'dark':'light'):preference}
// Runs before hydration. Stored values are allowlisted; nothing is inserted as HTML.
export const appearanceBootScript=`try{var v=JSON.parse(localStorage.getItem('${appearanceLastKey}')||'{}');var t=v.theme==='dark'||v.theme==='light'?v.theme:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var s=v.textSize==='large'||v.textSize==='extra-large'?v.textSize:'normal';document.documentElement.dataset.theme=t;document.documentElement.dataset.textSize=s}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`;
