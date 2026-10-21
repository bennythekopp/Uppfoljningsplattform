// Animate existing elements; never remount forms or change assessment data.
const running=new Map<HTMLElement,Animation>();
export function animateView(target:HTMLElement,reduced:boolean){
 if(reduced||typeof target.animate!=='function')return null;
 // Parent and child effects may run together. Never stack their transforms.
 for(const [element,animation] of running){
  if(element!==target&&element.contains(target))return null;
  if(target.contains(element)){animation.cancel();running.delete(element)}
 }
 try{
  const animation=target.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  running.set(target,animation);
  const clear=()=>{if(running.get(target)===animation)running.delete(target)};
  void animation.finished.then(clear,clear);
  return animation;
 }catch{return null}
}
