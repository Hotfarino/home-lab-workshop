import {makeFoundation,checkpointStart,foundationKey} from './lab-foundation.js';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import * as E from './lab-engine.js';
const code=fs.readFileSync('lab-app.js','utf8'),start=code.indexOf('function validateSave('),end=code.indexOf("$('saveLab').onclick",start),ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,E,missions:Object.fromEntries(['wired','nas','virtual','wifi','routed','cloud','trouble','free'].map(k=>[k,{steps:[{}]}]))});vm.runInContext(code.slice(start,end),ctx);ctx.fixture=JSON.parse(fs.readFileSync('test-results/home-lab-demo.json'));for(const d of ctx.fixture.devices.filter(d=>d.type==='switch')){delete d.ports.p7;delete d.ports.p8;}const clean=vm.runInContext('validateSave(fixture)',ctx);assert.equal(clean.devices.length,12);assert.equal(clean.links.length,17);assert.equal(E.testVM(clean,E.ofType(clean,'laptop')[0].id,clean.vms[0].id).ok,true);ctx.fixture=JSON.parse(JSON.stringify(clean));assert.equal(vm.runInContext('validateSave(fixture).links.length',ctx),17);ctx.fixture.vms[0].ram='<img onerror=alert(1)>';assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid VM/);ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.links.push(ctx.fixture.links[0]);assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid saved cable/);ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(x=>x.type==='server').ram='bad';assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid number/);console.log('PASS: portable lab round trip preserves connected equipment, RAID and working guests; malformed VM, cable and component data rejected.');

// Older six-port switch saves gain the two new ports without losing their build.
assert.equal(E.ofType(clean,'switch')[0].ports.p7.vlan,1);assert.equal(E.ofType(clean,'switch')[0].ports.p8.vlan,1);
ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(d=>d.type==='switch').ports.p7.vlan=9999;assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid VLAN/);
ctx.fixture=JSON.parse(JSON.stringify(clean));delete ctx.fixture.devices.find(d=>d.type==='switch').ports.p1;assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid VLAN/);
console.log('PASS: six-port saves migrate safely; malformed VLANs and missing original ports remain rejected.');

ctx.fixture=JSON.parse(JSON.stringify(clean));const guest=ctx.fixture.vms[0];guest.network={mode:'static',ip:'192.168.50.210',mask:'255.255.255.0',gateway:'192.168.50.1',dns:'192.168.50.1',wifi:false};ctx.fixture.desktopProgress={opened:true,machines:{[guest.id]:{commands:['read','ports'],quizzes:['subnet','linux'],projects:['static'],page:true},fake:{commands:['read']}}};ctx.fixture.walkthrough={index:29,courseTest:true,degradedTest:true,ipTest:true};const withDesktop=vm.runInContext('validateSave(fixture)',ctx);assert.equal(withDesktop.vms[0].network.ip,'192.168.50.210');assert.equal(withDesktop.desktopProgress.machines[guest.id].quizzes.length,2);assert.equal(withDesktop.desktopProgress.machines.fake,undefined);assert.equal(withDesktop.walkthrough.courseTest,true);assert.ok(E.testVM(withDesktop,E.ofType(withDesktop,'laptop')[0].id,guest.id).ok);guest.network.mask='255.0.255.0';assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid guest address/);console.log('PASS: guest IPv4 settings and desktop learning evidence survive portable saves; unknown machine evidence and invalid guest masks are rejected.');
ctx.fixture=JSON.parse(JSON.stringify(clean));const laptop=ctx.fixture.devices.find(d=>d.type==='laptop');laptop.osState={adapterEnabled:false,driverInstalled:false,dhcpReleased:true,hostname:'STUDENT-PC',allowServices:false,unknown:'discard'};ctx.fixture.vms[0].osState={adapterEnabled:true,allowServices:false};ctx.fixture.desktopProgress={opened:true,machines:{[laptop.id]:{commands:[],quizzes:[],projects:[],workflows:['adapter','driver']}}};const configSave=vm.runInContext('validateSave(fixture)',ctx);assert.equal(configSave.devices.find(d=>d.id===laptop.id).osState.adapterEnabled,false);assert.equal(configSave.devices.find(d=>d.id===laptop.id).osState.hostname,'STUDENT-PC');assert.equal(configSave.devices.find(d=>d.id===laptop.id).osState.unknown,undefined);assert.equal(configSave.vms[0].osState.allowServices,false);assert.equal(configSave.desktopProgress.machines[laptop.id].workflows.length,2);laptop.osState.adapterEnabled='false';assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx));console.log('PASS: OS adapter/driver/DHCP/name/rules and guided task completion persist; unsupported fields stripped and invalid booleans rejected.');

// Hostile or physically impossible imported builds must fail before rendering.
for(const value of ['constructor','toString','__proto__']){
 ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.mission=value;
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Unsupported lab file/);
 ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices[2].type=value;
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid device/);
}
for(const [property,value] of [['ram',-16],['cpu','unlisted-chip'],['nic','fake'],['os','fake'],['rebuilds',-1]]){
 ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(d=>d.type==='server')[property]=value;
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid installed component/);
}
ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(d=>d.type==='server').rack=ctx.fixture.devices.find(d=>d.type==='ups').rack;
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/overlap/);
ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(d=>d.type==='laptop').rack=17;
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid rack position/);
ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.devices.find(d=>d.type==='server').os='Windows Server';
 assert.equal(vm.runInContext('validateSave(fixture)',ctx).devices.find(d=>d.type==='server').os,'Windows Server');
ctx.challengeCases={network:{}};ctx.fixture=JSON.parse(JSON.stringify(clean));ctx.fixture.assessment={id:'constructor'};
 assert.throws(()=>vm.runInContext('validateSave(fixture)',ctx),/Invalid challenge/);
console.log('PASS: inherited course/device/challenge keys, incompatible components, negative memory/counters, rack overlaps and bench-only rack placement are rejected; valid Windows Server saves remain supported.');
