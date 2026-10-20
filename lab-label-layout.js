// Place readable device labels near their projected anchor without covering
// other labels. Priority labels (selection/current task) always get first choice.
export function placeLabels(items,width,height){
 const placed=[],result=[];
 for(const item of items.slice().sort((a,b)=>Number(b.important)-Number(a.important)||a.y-b.y||a.id.localeCompare(b.id))){
  const w=Math.min(item.width,width-16),h=item.height;
  let best=null;
  for(let row=0;row<15&&!best;row++)for(const column of [0,-1,1]){
   const dy=row===0?0:Math.ceil(row/2)*(h+7)*(row%2?-1:1),dx=column*(w+10);
   const x=Math.max(8+w/2,Math.min(width-8-w/2,item.x+dx)),y=Math.max(8+h/2,Math.min(height-8-h/2,item.y+dy));
   const box={left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2};
   if(!placed.some(p=>box.left<p.right+5&&box.right>p.left-5&&box.top<p.bottom+5&&box.bottom>p.top-5))best={...item,x,y,box};
  }
  if(best){placed.push(best.box);result.push(best);}
 }
 return result;
}
