export function percentageInput(value:string):string|null {
 const text=value.trim().replace(/\s*%$/, '').replace(',', '.');
 if(!text)return '';
 if(!/^-?\d+(?:\.\d+)?$/.test(text))return null;
 const number=Number(text);
 return Number.isFinite(number)?String(number):null;
}
export function percentageValue(value:string):string|null {
 const number=percentageInput(value);
 return number===null||number!==''&&(Number(number)<0||Number(number)>100)?null:number;
}
export function formatPercentage(value:string):string {
 const number=percentageValue(value);
 return number===null?value:number?number.replace('.', ',')+' %':'';
}
