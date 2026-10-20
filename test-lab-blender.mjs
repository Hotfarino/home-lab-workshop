import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from './lab-three.js?v=refine35a';
import {portLayout,bodies} from './lab-model3d-data.js?v=refine35a';
import {setBlenderLibraryForTest,createBlenderEquipment,setBlenderPortLight} from './lab-blender-assets.js';
const parse=async path=>{const b=readFileSync(path);return new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const asset=await parse('lab-blender-hardware.glb');setBlenderLibraryForTest(asset.scene);
let count=0;for(const type of Object.keys(bodies)){
 const model=createBlenderEquipment(type,type,true);model.group.updateMatrixWorld(true);
 assert.deepEqual([...model.ports.keys()].sort(),portLayout(type).map(p=>p.id).sort());
 for(const port of portLayout(type)){const expected=new T.Vector3(...port.position);expected.y-=.35;const actual=model.ports.get(port.id).getWorldPosition(new T.Vector3());assert(actual.distanceTo(expected)<.001,`${type}/${port.id} ${actual.toArray()} != ${expected.toArray()}`);count++;}
 const bounds=new T.Box3().setFromObject(model.group);assert(bounds.min.toArray().every(Number.isFinite));assert(bounds.max.toArray().every(Number.isFinite));
}
const sw=createBlenderEquipment('switch','Switch',true);const [a,b]=['p1','p2'].map(id=>sw.ports.get(id));assert(a&&b);
const lamps=p=>{let m;p.traverse(o=>{if(o.isMesh){for(const mat of Array.isArray(o.material)?o.material:[o.material])if(mat.name==='link_active')m=mat;}});return m;};
assert(lamps(a)&&lamps(b));assert.notEqual(lamps(a),lamps(b));setBlenderPortLight(a,true);setBlenderPortLight(b,false);assert(lamps(a).emissiveIntensity>0);assert.equal(lamps(b).emissiveIntensity,0);
const second=createBlenderEquipment('switch','Second',false);setBlenderPortLight(second.ports.get('p1'),false);assert(lamps(a).emissiveIntensity>0);
const server=createBlenderEquipment('server','Rack server',true,{rack:true});assert.equal(server.dims[0],6);assert(Math.abs(server.dims[1]-(2*6*1.75/19-.06))<1e-9);
const room=await parse('lab-blender-room.glb');assert(room.scene.getObjectByName('lab_environment'));assert(room.scene.getObjectByName('architectural_backdrop'));
console.log(`PASS: compressed Blender assets load; ${count} socket positions match across 13 models; rack proportions, independent link lamps, scene/backdrop names preserved.`);
