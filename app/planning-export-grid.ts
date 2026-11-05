import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {addDays,isoWeek} from './grundschema-types';
import {orderedPlanningColumns,taskWidthKey,tourWidthKey,type PlanningColumnLayout} from './planning-column-layout';
import type {PlanningData} from './planning-types';
import type {ExportRow} from './planning-export-data';

type Cell={text:string,color?:string};
type Group={title:string,labels:string[],widths:number[],id:string};
const border=(dark:boolean)=>dark?'#41474b':'#d1d6d9';
const background=(dark:boolean)=>dark?'#222627':'#f6f7f6';
const header=(dark:boolean)=>dark?'#303537':'#edf0f1';
const ink=(dark:boolean)=>dark?'#edf0f1':'#222627';
const validColor=(color?:string)=>!!color&&/^#[0-9a-f]{6}$/i.test(color);
function textColor(color:string|undefined,dark:boolean){
 if(!validColor(color))return ink(dark);
 const c=color!.slice(1);
 return parseInt(c.slice(0,2),16)*.299+parseInt(c.slice(2,4),16)*.587+parseInt(c.slice(4),16)*.114<145?'#ffffff':'#222627';
}
const dateFormat=new Intl.DateTimeFormat('sv-SE',{weekday:'short',timeZone:'UTC'});
function dateLabel(day:string){
 return Number(day.slice(8))+'/'+Number(day.slice(5,7))+' '+dateFormat.format(new Date(day+'T12:00:00Z')).replace('.','');
}
export function planningExportGrid(data:PlanningData,rows:ExportRow[],from:string,to:string,layout:PlanningColumnLayout,app:boolean){
 const included=new Set(rows.map(r=>r.columnId));
 const columns=orderedPlanningColumns(data.columns.filter(c=>included.has(c.id)),layout);
 if(app)columns.sort((a,b)=>Number(a.kind!=='shared')-Number(b.kind!=='shared'));
 const groups:Group[]=columns.map(c=>c.kind==='person'?{
  id:c.id,title:c.title,labels:['Tur','Uppgift'],
  widths:[layout.widths[tourWidthKey(c.id)]??(app?54:60),layout.widths[taskWidthKey(c.id)]??(app?140:data.taskWidth||130)],
 }:{id:c.id,title:c.title,labels:[],widths:[layout.widths[c.id]??(app?130:c.width||90)]});
 const byCell=new Map(rows.map(r=>[r.day+'|'+r.columnId,r]));
 const days=[] as string[];
 for(let day=from;day<=to;day=addDays(day,1))days.push(day);
 const dateWidth=app?65:80;
 function cells(day:string,section=groups):Cell[]{
  const date={text:dateLabel(day)};
  return [date,...section.flatMap(group=>{
   const row=byCell.get(day+'|'+group.id);
   if(!row)return group.widths.map(()=>({text:''}));
   const task={text:row.task,color:row.taskColor};
   return row.shared?[task]:[{text:row.tour,color:row.tourColor},task];
  })];
 }
 return {groups,days,dateWidth,cells};
}
type Grid=ReturnType<typeof planningExportGrid>;

/** Wrap hard lines and long words as well as ordinary whitespace. */
function wrap(text:string,fits:(line:string)=>boolean){
 const lines:string[]=[];
 for(const paragraph of text.split(/\r\n?|\n/)){
  let line='';
  for(const word of paragraph.match(/\s+|\S+/gu)||[]){
   if(fits(line+word)){line+=word;continue}
   if(line){lines.push(line.trimEnd());line=''}
   if(!word.trim())continue;
   if(fits(word)){line=word;continue}
   for(const letter of word){if(line&&!fits(line+letter)){lines.push(line);line=''}line+=letter}
  }
  lines.push(line.trimEnd());
 }
 return lines;
}

export async function gridExcel(grid:Grid,dark:boolean){
 const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Planering');
 const argb=(value:string)=>'FF'+value.slice(1);
 const widths=[grid.dateWidth,...grid.groups.flatMap(g=>g.widths)];
 sheet.columns=widths.map(w=>({width:Math.max(4,(w-5)/7)}));
 sheet.views=[{state:'frozen',xSplit:1,ySplit:2}];
 function paint(row:number,col:number,value:Cell,isHeader=false,week=false){
  const cell=sheet.getCell(row,col);
  cell.value=value.text;
  cell.alignment={vertical:'top',wrapText:true};
  cell.font={size:9,bold:isHeader,color:{argb:argb(textColor(value.color,dark))}};
  cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:argb(validColor(value.color)?value.color!:isHeader?header(dark):background(dark))}};
  const edge={style:'thin' as const,color:{argb:argb(border(dark))}};
  cell.border={top:week?{...edge,style:'medium'}:edge,left:edge,right:edge,bottom:edge};
 }
 paint(1,1,{text:'Datum'},true);paint(2,1,{text:''},true);sheet.mergeCells(1,1,2,1);
 let index=2;
 for(const group of grid.groups){
  paint(1,index,{text:group.title},true);
  if(group.labels.length){paint(1,index+1,{text:''},true);sheet.mergeCells(1,index,1,index+1);group.labels.forEach((text,i)=>paint(2,index+i,{text},true))}
  else{paint(2,index,{text:''},true);sheet.mergeCells(1,index,2,index)}
  index+=group.widths.length;
 }
 let row=3;
 grid.days.forEach((day,i)=>{
  const cells=grid.cells(day),lines=cells.map((c,j)=>wrap(c.text,line=>line.length<=Math.max(2,Math.floor((widths[j]-12)/7))));
  const max=Math.max(...lines.map(l=>l.length));
  const newWeek=i===0||isoWeek(day)!==isoWeek(addDays(day,-1));
  for(let part=0;part<max;part+=24){
   cells.forEach((cell,j)=>paint(row,j+1,{...cell,text:j===0&&part?cell.text:lines[j].slice(part,part+24).join('\n')},false,part===0&&newWeek));
   sheet.getRow(row++).height=Math.max(25,Math.min(max-part,24)*15+8);
  }
 });
 return new Uint8Array(await book.xlsx.writeBuffer());
}

export async function gridPdf(grid:Grid,dark:boolean){
 const margin=28,doc=new PDFDocument({size:'A3',layout:'landscape',margin,autoFirstPage:false}),chunks:Buffer[]=[];
 const done=new Promise<Uint8Array>((resolve,reject)=>{doc.on('data',c=>chunks.push(c));doc.on('end',()=>resolve(new Uint8Array(Buffer.concat(chunks))));doc.on('error',reject)});
 const sections:Group[][]=[];
 let current:Group[]=[],total=grid.dateWidth;
 for(const group of grid.groups){
  const width=group.widths.reduce((a,b)=>a+b,0);
  if(current.length&&total+width>1350){sections.push(current);current=[];total=grid.dateWidth}
  current.push(group);total+=width;
 }
 if(current.length)sections.push(current);
 for(const section of sections){
  const raw=[grid.dateWidth,...section.flatMap(g=>g.widths)];
  const scale=Math.min(.75,(1190-2*margin)/raw.reduce((a,b)=>a+b,0));
  const widths=raw.map(w=>w*scale),xs=[margin];
  for(const w of widths)xs.push(xs[xs.length-1]+w);
  const fontSize=9,lineHeight=12;
  let y=0;
  function rectangle(x:number,top:number,w:number,h:number,fill:string,week=false){
   doc.rect(x,top,w,h).fillAndStroke(fill,border(dark));
   if(week)doc.save().lineWidth(1.5).moveTo(x,top).lineTo(x+w,top).stroke(border(dark)).restore();
  }
  function label(text:string,x:number,top:number,w:number,h:number){
   rectangle(x,top,w,h,header(dark));
   doc.fillColor(ink(dark)).text(text,x+4,top+5,{width:w-8,height:h-7,ellipsis:true});
  }
  function page(){
   doc.addPage();doc.font('Helvetica-Bold').fontSize(15).fillColor('#222627').text('TC Boden – Planering',margin,margin);
   y=margin+25;doc.fontSize(fontSize);label('Datum',xs[0],y,widths[0],38);
   let col=1;
   for(const group of section){
    if(group.labels.length){
     label(group.title,xs[col],y,widths[col]+widths[col+1],19);
     group.labels.forEach((title,j)=>label(title,xs[col+j],y+19,widths[col+j],19));
    }else label(group.title,xs[col],y,widths[col],38);
    col+=group.widths.length;
   }
   y+=38;
   doc.font('Helvetica').fontSize(fontSize);
  }
  page();
  grid.days.forEach((day,i)=>{
   const cells=grid.cells(day,section);
   const lines=cells.map((cell,j)=>wrap(cell.text,line=>doc.widthOfString(line)<=widths[j]-8));
   const max=Math.max(...lines.map(l=>l.length));
   const newWeek=i===0||isoWeek(day)!==isoWeek(addDays(day,-1));
   let offset=0;
   while(offset<max){
    if(y+25>doc.page.height-margin)page();
    const available=Math.max(1,Math.floor((doc.page.height-margin-y-8)/lineHeight));
    const count=Math.min(max-offset,available);
    const h=Math.max(25,count*lineHeight+8);
    cells.forEach((cell,j)=>{
     rectangle(xs[j],y,widths[j],h,validColor(cell.color)?cell.color!:background(dark),newWeek&&offset===0);
     doc.fillColor(textColor(cell.color,dark));
     const segment=j===0&&offset?lines[j]:lines[j].slice(offset,offset+count);
     segment.forEach((text,k)=>doc.text(text,xs[j]+4,y+4+k*lineHeight,{lineBreak:false}));
    });
    offset+=count;y+=h;
   }
  });
 }
 doc.end();return done;
}
