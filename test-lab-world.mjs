import assert from 'node:assert/strict';
import * as E from './lab-engine.js?v=world33';
import {createEquipment} from './lab-world-assets.js?v=world33';
import {devicePosition,benchPosition,ensureWorldLayout,storeBenchPosition} from './lab-world-state.js?v=world33';
import {mountWithSupport,moveCableEnd} from './lab-direct-actions.js?v=world33';
import * as T from './lab-three.js?v=world33';
const s=E.fresh(),server=E.find(s,E.addDevice(s,'server').id),laptop=E.find(s,E.addDevice(s,'laptop').id);ensureWorldLayout(s);const initial=benchPosition(s,laptop);
assert(mountWithSupport(s,server.id,4,true).ok);assert.deepEqual(benchPosition(s,laptop),initial);assert(!storeBenchPosition(s,server.id,...[initial[0],initial[2]]).ok);assert.equal(server.rack,4);assert.deepEqual(benchPosition(s,laptop),initial);
assert(storeBenchPosition(s,server.id,6,5).ok);assert.equal(server.rack,null);assert.deepEqual(benchPosition(s,laptop),initial);const loc=benchPosition(s,server);const returned=E.returnToShelf(s,server.id);assert(returned.ok);assert(E.restoreFromShelf(s,returned.record).ok);assert.deepEqual(benchPosition(s,E.find(s,server.id)),loc);
const edge=E.fresh(),l=E.find(edge,E.addDevice(edge,'laptop').id),o=E.find(edge,E.addDevice(edge,'ont').id);assert(storeBenchPosition(edge,l.id,5.5,5).ok);assert(storeBenchPosition(edge,o.id,9.6,5).ok);assert(Math.abs(benchPosition(edge,o)[0]-benchPosition(edge,l)[0])>=3.6);
const cable=E.connect(edge,l.id,'ac','wall','out1','power',6);assert(cable.ok);const before=JSON.stringify(edge.links);assert(!moveCableEnd(edge,edge.links[0].id,l.id,'ac',{id:o.id,port:'fiber'}).ok);assert.equal(JSON.stringify(edge.links),before);assert(moveCableEnd(edge,edge.links[0].id,l.id,'ac',null).ok);assert.equal(edge.links.length,0);
let ports=0;for(const type of Object.keys(E.catalog)){for(const rack of [false,true]){const m=createEquipment(type,type,true,{rack});assert.deepEqual([...m.ports.keys()].sort(),Object.keys(E.catalog[type].ports).sort());m.group.updateMatrixWorld(true);for(const p of m.ports.values()){assert(p.getWorldPosition(new T.Vector3()).toArray().every(Number.isFinite));ports++;}const bounds=new T.Box3().setFromObject(m.group);assert(bounds.min.toArray().every(Number.isFinite));assert(bounds.max.toArray().every(Number.isFinite));}}
console.log('PASS: 3D geometry for every device and '+ports+' socket transforms, stable mounting/desk placement, collision rejection, exact coordinate round trip, shelf undo, and atomic cable moves.');
// Rack faces share the front rail plane even when chassis depths differ.
for(const type of ['server','switch','router','pdu','panel']){const d=E.find(s,E.addDevice(s,type).id);d.rack=1;const p=devicePosition(s,d);const model=createEquipment(type,type,true,{rack:true});assert(Math.abs(p[2]+model.size[2]/2-4.15)<1e-9);}
