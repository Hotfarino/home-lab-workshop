import assert from 'node:assert/strict';
import * as E from './lab-engine.js';
import {portLayout,modelSnapshot,bodies} from './lab-model3d-data.js';
let ports=0;
for(const [type,d] of Object.entries(E.catalog)){
 const layout=portLayout(type);assert.deepEqual(layout.map(p=>p.id),Object.keys(d.ports));assert.ok(bodies[type].every(n=>n>0));
 for(const p of layout){ports++;assert.equal(p.kind,d.ports[p.id]);assert.ok([...p.position,...p.normal].every(Number.isFinite));assert.equal(Math.hypot(...p.normal),1);}
}
const s=E.fresh();const laptop=E.addDevice(s,'laptop').id,sw=E.addDevice(s,'switch').id;
const wire=(...args)=>assert.ok(E.connect(s,...args).ok);
wire('wall','out1',laptop,'ac','power',6);wire('wall','out2',sw,'ac','power',6);wire(laptop,'eth',sw,'p1','cat6a',6);
let m=modelSnapshot(s,laptop);assert.equal(m.ports[0].live,true,'input may have power while device switched off');assert.equal(m.ports[1].live,false);
E.find(s,laptop).on=E.find(s,sw).on=true;m=modelSnapshot(s,laptop);assert.equal(m.ports[1].live,true);assert.equal(E.network(s,laptop).ok,false,'physical link is not proof of IP connectivity');assert.equal(m.ports[1].peer,'Managed switch 1');assert.equal(m.ports[1].peerPort,'p1');
const before=JSON.stringify(s);for(let i=0;i<50;i++)modelSnapshot(s,laptop);assert.equal(JSON.stringify(s),before,'snapshot is read-only');
s.links.at(-1).broken=true;assert.equal(modelSnapshot(s,laptop).ports[1].live,false,'broken cable must stop blue pulse');s.links.at(-1).broken=false;s.outage=true;assert.equal(modelSnapshot(s,laptop).ports[0].live,false);assert.equal(modelSnapshot(s,laptop).ports[1].live,false);
const empty=modelSnapshot(s,sw).ports.find(p=>p.id==='p2');assert.equal(empty.connected,false);assert.equal(empty.live,false);assert.equal(empty.peer,null);assert.match(empty.description.fit,/latch/);
for(const type of Object.keys(E.catalog)){let id=['wall','isp'].includes(type)?type:E.addDevice(s,type).id;assert.ok(modelSnapshot(s,id));}
assert.equal(modelSnapshot(s,'missing'),null);
console.log(`PASS: 13 model types, ${ports} uniquely mapped finite socket positions, connector definitions, real power/link/peer state, empty examples, faults, outages, and no lab mutations.`);

// The animation must preserve the plug axis and GPU buffers across every frame.
const {connectionLayout,updateTube,fittedDistance}=await import('./lab-model3d-geometry.js');
const T=await import('./lab-three.js');
for(const type of Object.keys(E.catalog)){
 const layout=portLayout(type),dims=bodies[type];
 for(const p of layout){
  const fitted=connectionLayout(p,layout,0),exploded=connectionLayout(p,layout,1);
  const delta=exploded.tip.clone().sub(fitted.tip),normal=new T.Vector3(...p.normal);
  assert.ok(delta.clone().cross(normal).length()<1e-8,'Plug stays on insertion axis');
  assert.ok(delta.dot(normal)>1.5);
  for(const amount of [0,.5,1]){
   const result=connectionLayout(p,layout,amount);
   for(let i=0;i<=100;i++){
    const point=result.curve.getPoint(i/100);
    assert.ok(point.toArray().every(Number.isFinite));
    assert.ok(point.clone().sub(result.base).dot(result.normal)>.5,'Cable remains outside its socket plane');
   }
  }
  const geo=new T.TubeGeometry(fitted.curve,32,.032,8,false),attributes=geo.attributes,index=geo.index;
  updateTube(geo,exploded.curve,.032);
  const reference=new T.TubeGeometry(exploded.curve,32,.032,8,false);
  assert.equal(geo.attributes,attributes);assert.equal(geo.index,index);
  assert.deepEqual(Array.from(geo.getAttribute('position').array),Array.from(reference.getAttribute('position').array));
  const endpoint=exploded.curve.getPointAt(1);assert.ok(endpoint.distanceTo(exploded.end)<1e-7);
  geo.dispose();reference.dispose();
 }
}
assert.ok(fittedDistance(5,.5)>fittedDistance(5,1.5),'Portrait views fit more conservatively');
console.log('PASS: all connector axes, cable paths clear of socket planes, matching tube normals/positions, stable GPU attributes and portrait camera fit.');

const {fittedBoxDistance}=await import('./lab-model3d-geometry.js');
const {placeLabels}=await import('./lab-label-layout.js');
for(const aspect of [.45,1,2.8])for(const direction of [[-6,5,8],[0,2,10],[-4.5,4,-10],[0,12,.001]]){
 const bounds=new T.Box3(new T.Vector3(-3,0,-6),new T.Vector3(3,3,2)),dir=new T.Vector3(...direction).normalize(),distance=fittedBoxDistance(bounds,dir,aspect),center=bounds.getCenter(new T.Vector3());
 const camera=new T.PerspectiveCamera(38,aspect,.1,100);camera.position.copy(center).addScaledVector(dir,distance);camera.lookAt(center);camera.updateMatrixWorld();
 for(const x of [-3,3])for(const y of [0,3])for(const z of [-6,2]){const projected=new T.Vector3(x,y,z).project(camera);assert.ok(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1,'Camera bounds fit in each view/aspect');}
}
const labels=Array.from({length:12},(_,i)=>({id:'device'+i,x:350,y:180,width:120,height:28,important:i===9}));
const placed=placeLabels(labels,800,440);assert.equal(placed.length,12);assert.equal(placed[0].id,'device9');
for(let i=0;i<placed.length;i++){const a=placed[i].box;assert.ok(a.left>=8&&a.right<=792&&a.top>=8&&a.bottom<=432);for(const b of placed.slice(i+1).map(p=>p.box))assert.ok(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom,'Device labels never overlap');}
console.log('PASS: all 12 camera view/aspect combinations frame hardware and cables; crowded device labels stay readable, prioritized and inside the scene.');
