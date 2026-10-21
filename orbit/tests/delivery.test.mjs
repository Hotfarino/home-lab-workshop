import test from 'node:test';import assert from 'node:assert/strict';
import {deliveryMission,deliveryTrace,deliveryCheck,deliveryComplete} from '../delivery-model.js';
import {subnet,sameSubnet,ipNumber} from '../network-game.js';
import {SECTORS,mission,initialRun,canRescue,freshRescue,restoreRescue,creditRescue} from '../rescue-model.js';
test('Delivery teaches actual prefix boundaries, including the /26 and /23 traps',()=>{
 assert.equal(Object.keys(SECTORS).length*6,24);
 for(let i=0;i<6;i++)for(const seed of [0,1,42,999,4294967295]){const m=mission('delivery',i,seed);assert.deepEqual(m,mission('delivery',i,seed));assert.equal(m.local,[true,false,false,true,true,false][i]);assert.equal(m.local,sameSubnet(m.source,m.destination,m.prefix));for(const ip of [m.source,m.peer,m.gateway]){assert.equal(subnet(ip,m.prefix).network,m.sourceNet);assert.ok(ipNumber(ip)>ipNumber(m.sourceNet));assert.ok(ipNumber(ip)<ipNumber(subnet(ip,m.prefix).broadcast));}assert.ok(deliveryCheck(m,m.route).pass);assert.ok(!deliveryCheck(m,m.local?'gateway':'local').pass);assert.ok(!deliveryCheck(m,'').pass);}
 assert.equal(deliveryMission(2).sourceNet,'192.168.10.0');assert.equal(deliveryMission(2).destNet,'192.168.10.64');assert.equal(deliveryMission(3).sourceNet,deliveryMission(3).destNet);assert.equal(deliveryMission(4).sourceNet,'192.168.10.128');
});
test('Local frames stay on the switch; routed frames change next-hop MAC and decrement TTL once',()=>{
 for(let i=0;i<6;i++){const m=deliveryMission(i),steps=deliveryTrace(m);assert.equal(steps[0].destinationMAC,'Not resolved yet');assert.equal(steps[1].nextHop,m.local?m.destination:m.gateway);if(m.local){assert.ok(steps.every(s=>!['router','farSwitch','remote'].includes(s.node)));assert.ok(steps.every(s=>s.ttl===64));assert.equal(steps.at(-1).node,'peer');}else{assert.deepEqual(steps.map(s=>s.node),['source','source','switch','router','router','farSwitch','remote','remote']);assert.equal(steps[3].ttl,64);assert.ok(steps.slice(4).every(s=>s.ttl===63));assert.notEqual(steps[3].sourceMAC,steps[4].sourceMAC);assert.notEqual(steps[3].destinationMAC,steps[4].destinationMAC);assert.equal(steps[4].nextHop,m.destination);}}
});
test('No delivery credit before final arrival or for an incorrect route; replay cannot inflate XP',()=>{
 const state=freshRescue();for(let i=0;i<6;i++){state.run=initialRun('delivery',i);const m=mission('delivery',i),steps=deliveryTrace(m);assert.equal(canRescue(state.run),false);state.run.route=m.route;for(let j=-1;j<steps.length-1;j++){state.run.deliveryStep=j;assert.equal(creditRescue(state),false);}state.run.deliveryStep=steps.length-1;state.run.route=m.local?'gateway':'local';assert.equal(creditRescue(state),false);state.run.route=m.route;assert.equal(creditRescue(state),true);assert.equal(creditRescue(state),false);assert.equal(deliveryComplete(m,{...state.run,deliveryStep:99}),false);}assert.equal(state.completed.delivery.length,6);
 state.run=initialRun('delivery',0);state.run.route='local';state.run.deliveryStep=deliveryTrace(mission('delivery',0)).length-1;assert.equal(creditRescue(state),true);assert.equal(state.completed.delivery.length,6);
});
test('Old saves migrate intact; delivery saves resume safely and reject invalid trace/route pairs',()=>{
 const old={version:1,completed:{bits:[0,1],slicer:[2]},run:initialRun('slicer',2),sound:true,coaching:false};const p=restoreRescue(JSON.stringify(old));assert.deepEqual(p.completed,{bits:[0,1],slicer:[2],delivery:[],repair:[]});assert.deepEqual(p.run,old.run);assert.equal(p.sound,true);assert.equal(p.coaching,false);
 const s=freshRescue();s.run=initialRun('delivery',1);s.run.route='gateway';s.run.deliveryStep=4;assert.deepEqual(restoreRescue(JSON.stringify(s)),s);
 s.run.solved=true;assert.equal(restoreRescue(JSON.stringify(s)).run.solved,false);s.run.deliveryStep=7;assert.equal(restoreRescue(JSON.stringify(s)).run.solved,true);
 for(const patch of [{route:'local'},{route:'evil'},{deliveryStep:8},{deliveryStep:-5},{deliveryStep:'7'}]){const r=restoreRescue(JSON.stringify({...s,run:{...s.run,...patch}}));assert.equal(r.run.solved,false);assert.equal(r.run.deliveryStep,-1);}
});
