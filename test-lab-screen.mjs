import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from './lab-three.js';
import * as E from './lab-engine.js';
import {buildTemplate} from './lab-planner.js';
import {displayAnchor,displayCorners} from './lab-device-display.js';
import {screenTransform} from './lab-screen-math.js';
import {screenPolicy,screenSession,commandAllowed} from './lab-screen-policy.js';
const b=readFileSync('lab-blender-hardware.glb');
const asset=await new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
const model={group:asset.scene.getObjectByName('device_laptop')};
const anchor=displayAnchor(model);assert.ok(anchor);assert.ok(Math.abs(anchor.width-4.04)<.001);assert.ok(Math.abs(anchor.height-2.24)<.001);
const camera=new T.PerspectiveCamera(40,16/9,.1,200);camera.position.set(5,6,9);camera.lookAt(0,1.5,-1.5);camera.updateMatrixWorld(true);
for(const position of [[0,0,0],[-18,0,-5],[6,0,5]]){
 model.group.position.set(...position);camera.lookAt(position[0],position[1]+1.5,position[2]-1.5);camera.updateMatrixWorld(true);const corners=displayCorners(anchor).map(p=>{const q=p.project(camera);return {x:(q.x+1)*640,y:(1-q.y)*360}});
 const m=screenTransform(corners,1100,610);assert.ok(m);
 const points=[[0,0],[1100,0],[1100,610],[0,610]];
 for(let i=0;i<4;i++){const [x,y]=points[i],w=m[3]*x+m[7]*y+m[15];assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/w-corners[i].x)<.001);assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/w-corners[i].y)<.001);}
}
assert.equal(screenTransform(Array(4).fill({x:0,y:0}),1100,610),null);
let s=buildTemplate('vm'),l=E.ofType(s,'laptop')[0],host=E.ofType(s,'server')[0],v=s.vms[0];
assert.equal(screenSession(s,v.id,l.id).client,l.id);v.mode='private';assert.equal(screenSession(s,v.id,l.id).ok,true,'private guests still have host management consoles');
const link=s.links.find(c=>c.a===l.id&&c.type!=='power'||c.b===l.id&&c.type!=='power');link.broken=true;assert.equal(screenSession(s,v.id,l.id).ok,false);assert.equal(screenSession(s,l.id).ok,true,'local OS runs without a network');link.broken=false;
host.on=false;assert.equal(screenSession(s,v.id,l.id).ok,false);host.on=true;l.on=false;assert.equal(screenSession(s,v.id,l.id).ok,false);l.on=true;v.running=false;assert.equal(screenSession(s,v.id,l.id).ok,false);v.running=true;
for(const mission of ['wired','nas','virtual','wifi','routed','cloud','trouble','free']){s.mission=mission;const p=screenPolicy(s);assert.equal(p.vm,['wired','virtual','free'].includes(mission));assert.equal(p.wifi,['wifi','free'].includes(mission));assert.equal(p.cloud,['cloud','free'].includes(mission));assert.equal(commandAllowed(s,'Get-VM'),p.vm);assert.equal(commandAllowed(s,'sudo systemctl start nginx'),p.service);assert.ok(commandAllowed(s,'ip addr'));}
console.log('PASS screen: real Blender LCD bounds, perspective click mapping at 3 positions, degenerate projection, physical-client ownership, management-link/power/VM failures, isolated guest console, lab capability policies.');
