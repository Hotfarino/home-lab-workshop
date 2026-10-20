// Map a real screen rectangle onto its four projected 3D corners. The browser
// uses the same transform for rendering and hit testing, including perspective.
export function screenTransform(corners,width,height){
 if(corners.length!==4||!corners.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))return null;
 const src=[[0,0],[width,0],[width,height],[0,height]],a=[];
 src.forEach(([x,y],i)=>{const {x:u,y:v}=corners[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
 for(let i=0;i<8;i++){let best=i;for(let j=i+1;j<8;j++)if(Math.abs(a[j][i])>Math.abs(a[best][i]))best=j;
  if(Math.abs(a[best][i])<1e-9)return null;[a[i],a[best]]=[a[best],a[i]];
  const d=a[i][i];for(let k=i;k<9;k++)a[i][k]/=d;
  for(let j=0;j<8;j++)if(j!==i){const v=a[j][i];for(let k=i;k<9;k++)a[j][k]-=v*a[i][k];}
 }
 const [aa,b,c,d,e,f,g,h]=a.map(r=>r[8]);return [aa,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1];
}
