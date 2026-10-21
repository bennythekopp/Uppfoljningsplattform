// Animate existing elements; never remount forms or change assessment data.
const running=new Map<HTMLElement,Animation>();
export function animateView(target:HTMLElement,reduced:boolean,compact=false){
 if(reduced||typeof target.animate!=='function')return null;
 // Parent and child effects may run together. Never stack their transforms.
 for(const [element,animation] of running){
  if(element.contains(target)||target.contains(element)){animation.cancel();running.delete(element)}
 }
 try{
  const animation=target.animate([{opacity:0,transform:`translateY(${compact?12:18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:compact?550:650,easing:'cubic-bezier(.4,0,.2,1)'});
  running.set(target,animation);
  const clear=()=>{if(running.get(target)===animation)running.delete(target)};
  void animation.finished.then(clear,clear);
  return animation;
 }catch{return null}
}
