'use client';

/** Browser PDF export uses the existing A4 print layout and proposes this title as the file name. */
export function pdfFileName(name:string,kind:string,date?:string|number){
 const iso=typeof date==='number'?new Date(date).toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'}):date||new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'});
 const compact=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
 const stamp=compact?compact[1].slice(-2)+compact[2]+compact[3]:new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'}).replace(/^(\d{4})-(\d{2})-(\d{2})$/,(_,y,m,d)=>y.slice(-2)+m+d);
 const safe=(value:string)=>value.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'').replace(/\s+/g,' ');
 return `${safe(name)}_${safe(kind)}_${stamp}.pdf`;
}

export function preparePdfPrint(name:string,kind:string,date?:string|number){
 const previous=document.title;
 const file=pdfFileName(name,kind,date);
 document.title=file.slice(0,-4);
 let restored=false;
 const restore=()=>{if(restored)return;restored=true;window.removeEventListener('afterprint',restore);document.title=previous};
 window.addEventListener('afterprint',restore);
 // A cancelled or unsupported print dialog should not leave the filename in the tab.
 window.setTimeout(restore,60000);
}
