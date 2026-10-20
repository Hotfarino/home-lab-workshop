import * as T from './lab-three.js?v=class47';
import {bodies,equipmentDimensions} from './lab-model3d-data.js?v=class47';
import {catalog} from './lab-engine.js?v=class47';
let library=null,room=null,promise=null;
export async function loadBlenderAssets(){
 if(!promise)promise=(async()=>{const loader=new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder);const results=await Promise.allSettled([loader.loadAsync('./lab-blender-hardware.glb?v=class47'),loader.loadAsync('./lab-blender-room.glb?v=class47')]);if(results[0].status==='fulfilled')library=results[0].value.scene;if(results[1].status==='fulfilled')room=results[1].value.scene;return {hardware:!!library,room:!!room};})();return promise;
}
// Test import uses the same parser and model factory without a network request.
export function setBlenderLibraryForTest(scene){library=scene;}
function cloneTree(source,on){
 const cloned=source.clone(true),geometries=new Map(),materials=new Map();
 cloned.traverse(o=>{if(!o.isMesh)return;if(!geometries.has(o.geometry))geometries.set(o.geometry,o.geometry.clone());o.geometry=geometries.get(o.geometry);const make=m=>{if(m.name==='link_active')return m.clone();if(!materials.has(m)){const c=m.clone();if(c.name.endsWith('_active')&&!on){c.color.set('#0b151e');c.emissive?.set(0);c.emissiveIntensity=0;}materials.set(m,c);}return materials.get(m);};o.material=Array.isArray(o.material)?o.material.map(make):make(o.material);for(const m of Array.isArray(o.material)?o.material:[o.material])m.userData.labSharedMaps=true;o.castShadow=true;o.receiveShadow=true;});return cloned;
}
export function createBlenderEquipment(type,name,on=false,{rack=false}={}){
 const variant=rack&&['nas','ups'].includes(type);const source=library?.getObjectByName('device_'+type+(variant?'_rack':''));if(!source)return null;
 const group=new T.Group(),visual=cloneTree(source,on),ports=new Map();group.name=name;group.userData={type,assetSource:'Blender'};visual.position.set(0,0,0);group.add(visual);let power=null;
 visual.traverse(o=>{if(o.userData.labPort){o.userData.kind='port';o.userData.port=o.userData.labPort;ports.set(o.userData.labPort,o);}if(o.userData.labPower){o.userData.kind='power';power=o;}});
 let dims=equipmentDimensions(type,rack);const units=catalog[type]?.u;
 if(rack&&units&&!variant){group.scale.set(dims[0]/bodies[type][0],dims[1]/bodies[type][1],1);}
 return {group,ports,power,dims,size:dims,assetSource:'Blender'};
}
export function setBlenderPortLight(holder,live){holder?.traverse(o=>{if(!o.isMesh)return;for(const mat of Array.isArray(o.material)?o.material:[o.material])if(mat.name==='link_active'){mat.color.set(live?'#13bb6b':'#142329');mat.emissive?.set(live?'#04a45d':'#000000');mat.emissiveIntensity=live?.6:0;}});}
export function createBlenderRoom(){const source=room?.getObjectByName('lab_environment');return source?cloneTree(source,false):null;}
