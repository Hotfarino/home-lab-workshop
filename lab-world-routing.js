// World-space cable routing. Socket normals determine the first/last segment.
// A rectilinear desk route avoids padded footprints; rack paths use an outside channel.
export const ROUTE_CLEARANCE=.16;
const add=(a,b)=>a.map((v,i)=>v+b[i]),dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function segmentHitsBox(a,b,box,pad=0){let lo=0,hi=1;for(let i=0;i<3;i++){const min=box.min[i]-pad,max=box.max[i]+pad,d=b[i]-a[i];if(Math.abs(d)<1e-9){if(a[i]<=min||a[i]>=max)return false;}else{let t=(min-a[i])/d,u=(max-a[i])/d;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u);if(lo>=hi-1e-8)return false;}}return hi>1e-7&&lo<1-1e-7;}
export function cleanPoints(points){const out=[];for(const p of points){if(out.length&&dist(out.at(-1),p)<1e-6)continue;while(out.length>1){const a=out.at(-2),b=out.at(-1),ab=dist(a,b),bc=dist(b,p);if(Math.abs(dist(a,p)-ab-bc)>.00001)break;out.pop();}out.push([...p]);}return out;}
function deskPath(a,b,boxes,y){
 const blocks=boxes.filter(o=>o.min[1]<y+.08&&o.max[1]>y-.08);
 const xs=[a[0],b[0]],zs=[a[2],b[2]];for(const o of blocks){xs.push(o.min[0]-.22,o.max[0]+.22);zs.push(o.min[2]-.22,o.max[2]+.22);}xs.push(-24.5,12.65);zs.push(-9.65,12.5);
 const unique=v=>[...new Set(v.map(n=>Math.round(n*1e5)/1e5))].sort((x,z)=>x-z),x=unique(xs),z=unique(zs),point=k=>[x[k% x.length],y,z[Math.floor(k/x.length)]],key=p=>z.indexOf(Math.round(p[2]*1e5)/1e5)*x.length+x.indexOf(Math.round(p[0]*1e5)/1e5),start=key(a),goal=key(b),open=new Set([start]),cost=new Map([[start,0]]),prev=new Map(),closed=new Set();
 while(open.size){let k=-1,score=Infinity;for(const n of open){const p=point(n),f=cost.get(n)+Math.abs(p[0]-b[0])+Math.abs(p[2]-b[2]);if(f<score){score=f;k=n;}}if(k===goal){const path=[];while(k!==undefined){path.push(point(k));k=prev.get(k);}return path.reverse();}open.delete(k);closed.add(k);const ix=k%x.length,iz=Math.floor(k/x.length),next=[];if(ix>0)next.push(k-1);if(ix<x.length-1)next.push(k+1);if(iz>0)next.push(k-x.length);if(iz<z.length-1)next.push(k+x.length);for(const n of next){if(closed.has(n))continue;const p=point(k),q=point(n);if(blocks.some(o=>segmentHitsBox(p,q,o,ROUTE_CLEARANCE)))continue;const value=cost.get(k)+dist(p,q);if(value<(cost.get(n)??Infinity)){cost.set(n,value);prev.set(n,k);open.add(n);}}}
 return null;
}
function endpointPath(e,channel){const {point:p,normal:n,box,rack}=e,tip=add(p,n.map(v=>v*.82));
 if(rack){const rearZ=channel.z,sideX=channel.x;if(n[2]>.5)return [p,tip,[sideX,tip[1],tip[2]],[sideX,tip[1],rearZ]];
 if(n[2]<-.5)return [p,tip,[tip[0],tip[1],rearZ],[sideX,tip[1],rearZ]];
 return [p,tip,[sideX,tip[1],tip[2]],[sideX,tip[1],rearZ]];}
 const path=[p,tip];let exit=tip;if(n[1]>.5){exit=[tip[0],tip[1],box.max[2]+.82];path.push(exit);}path.push([exit[0],channel.y,exit[2]]);return path;
}
export function routeCable(a,b,obstacles,{power=false,lane=0}={}){
 const channel={x:power?21.05:21.38,z:-3.75-(power?0:.3)-lane%6*.055,y:.19+(power?0:.035),deskZ:-9.6+(power?0:.24)};
 const start=endpointPath(a,channel),end=endpointPath(b,channel),aa=start.at(-1),bb=end.at(-1),benchBoxes=obstacles.filter(o=>o.kind==='device'&&!o.rack),bridge=[];
 const desk=(p,q)=>deskPath(p,q,benchBoxes,channel.y);
 if(!a.rack&&!b.rack){const ax=[aa[0],channel.y,channel.deskZ],bx=[bb[0],channel.y,channel.deskZ],pa=desk(aa,ax),pb=desk(bx,bb);if(!pa||!pb)return {ok:false,reason:'Leave space around the sockets and along the rear desk edge.'};bridge.push(...pa,bx,...pb);}
 else if(a.rack&&b.rack)bridge.push(aa,[channel.x,bb[1],channel.z],bb);
 else {const bench=a.rack?bb:aa,rack=a.rack?aa:bb,entry=[12.65,channel.y,channel.deskZ],leg=desk(bench,[bench[0],channel.y,channel.deskZ]);if(!leg)return {ok:false,reason:'Clear the rear desk cable path.'};const path=[...leg,entry,[12.65,channel.y,channel.z],[channel.x,channel.y,channel.z],rack];bridge.push(...(a.rack?path.reverse():path));}
 // Retain the short socket standoffs separately, so only those may touch their owner.
 const points=[...start,...bridge,...end.slice().reverse()].filter((p,i,all)=>!i||dist(p,all[i-1])>1e-6);
 const blocked=[];for(let i=0;i<points.length-1;i++)for(const o of obstacles){if(i===0&&o.id===a.id||i===points.length-2&&o.id===b.id)continue;if(segmentHitsBox(points[i],points[i+1],o,.035)){blocked.push(o.id);}}
 if(blocked.length)return {ok:false,reason:'Move equipment to clear the cable path.',blocked:[...new Set(blocked)]};
 return {ok:true,points:cleanPoints(points),length:points.slice(1).reduce((sum,p,i)=>sum+dist(points[i],p),0)};
}
export function roomObstacles(rackBase,unit,rackUnits){const boxes=[{id:'worktop',kind:'room',min:[-24,-.34,-10],max:[12,.065,12]},{id:'wall',kind:'room',min:[-24,-4,-10.95],max:[12,6,-10.74]}],top=rackBase+rackUnits*unit+.25;for(const x of [13.65,20.35])for(const z of [-2.9,4.2])boxes.push({id:'rack upright',kind:'room',min:[x-.11,rackBase-.2,z-.11],max:[x+.11,top+.2,z+.11]});for(const y of [rackBase-.2,top])boxes.push({id:'rack frame',kind:'room',min:[13.5,y-.085,-3.025],max:[20.5,y+.085,4.325]});return boxes;}
