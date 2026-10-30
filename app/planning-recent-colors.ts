const prefix='tc-planning-recent-colors:';
export const recentColorsEvent='tc-planning-recent-colors';
export function recentColorList(colors:unknown):string[]{return Array.isArray(colors)?[...new Set(colors.filter((c):c is string=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)).map(c=>c.toLowerCase()))].slice(0,5):[]}
export function addRecentColor(colors:unknown,color:string){return /^#[0-9a-f]{6}$/i.test(color)?recentColorList([color,...recentColorList(colors)]):recentColorList(colors)}
export function readRecentColors(user:string){try{return recentColorList(JSON.parse(localStorage.getItem(prefix+user)||'[]'))}catch{return []}}
export function rememberPlanningColor(user:string,color:string){if(!/^#[0-9a-f]{6}$/i.test(color))return;try{localStorage.setItem(prefix+user,JSON.stringify(addRecentColor(readRecentColors(user),color)));window.dispatchEvent(new Event(recentColorsEvent))}catch{}}
