import {moveCableEnd} from './lab-direct-actions.js';
import {explodedPhoto,drawExplodedCallouts,explodedPlug} from './lab-exploded.js';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import * as E from './lab-engine.js';import {portState} from './lab-hardware.js';
const lab=E.fresh(),add=t=>E.find(lab,E.addDevice(lab,t).id),l=add('laptop'),w=add('switch'),p=add('pdu');
const wire=(a,ap,b,bp,type='cat5e')=>assert.ok(E.connect(lab,a,ap,b,bp,type,6).ok);
wire('wall','out1',p.id,'ac','power');wire(p.id,'out1',l.id,'ac','power');wire(p.id,'out2',w.id,'ac','power');wire(l.id,'eth',w.id,'p1');assert.equal(portState(lab,l.id,'eth').live,false);p.on=l.on=w.on=true;assert.equal(portState(lab,l.id,'eth').live,true,'physical link needs no DHCP');assert.equal(E.network(lab,l.id).ok,false);w.on=false;assert.equal(portState(lab,l.id,'eth').live,false);w.on=true;lab.links.at(-1).broken=true;assert.equal(portState(lab,l.id,'eth').live,false);lab.links.at(-1).broken=false;
const panel=add('panel');lab.links.pop();wire(l.id,'eth',panel.id,'front1');wire(panel.id,'back1',w.id,'p1');assert.equal(portState(lab,l.id,'eth').live,true,'patch panel carries link');assert.equal(portState(lab,w.id,'p1').live,true);lab.links.at(-1).broken=true;assert.equal(portState(lab,l.id,'eth').live,false);
const {document,HTMLElement,HTMLSelectElement,Event}=parseHTML('<html><body></body></html>');Object.defineProperty(HTMLSelectElement.prototype,'value',{get(){return this.querySelector('option[selected]')?.getAttribute('value')||this.querySelector('option')?.getAttribute('value')||''},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===v)}});HTMLElement.prototype.showModal=function(){this.open=true};HTMLElement.prototype.close=function(){this.open=false};HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:600,bottom:400,width:600,height:400}};
let state=E.fresh(),id=E.addDevice(state,'laptop').id,ui,lastMessage='',desktopOpened=null;const ctx=vm.createContext({E,moveCableEnd,document,window:{addEventListener(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},console});vm.runInContext(fs.readFileSync('lab-hardware.js','utf8').replace(/^import .*;$/gm,'').replaceAll('export function','function'),ctx);ctx.api={getState:()=>state,result:r=>{lastMessage=r.message;ui.refresh()},test:r=>state.lastTest=r,select(){},settings(){},explain(){},desktop:id=>desktopOpened=id};ui=vm.runInContext('setupHardware(api)',ctx);ui.open(id);const $=x=>document.querySelector(x),click=x=>{const ev=new Event('click',{bubbles:true});ev.detail=0;$(x).dispatchEvent(ev)};assert.ok($('[data-hw-desktop]'));click(`[data-hw-power="${id}"]`);assert.equal(E.find(state,id).on,true);assert.equal(E.ready(state,id).ok,false,'no power path blocks the laptop desktop');$('#hwCable').value='power';$('#hwCable').dispatchEvent(new Event('change'));click(`[data-socket-device="${id}"][data-socket="ac"]`);click('[data-socket-device="wall"][data-socket="out1"]');assert.equal(state.links.length,1);assert.equal(E.ready(state,id).ok,true);assert.equal(document.querySelectorAll('.cable-plug').length,2);click('[data-hw-desktop]');assert.equal(desktopOpened,id);assert.equal($('#hwBrowse'),null);assert.equal($('#hwCommand'),null);ui.open(id);click(`[data-socket-device="${id}"][data-socket="ac"]`);click('#hwUnplug');assert.equal(state.links.length,0);assert.equal(E.ready(state,id).ok,false,'unplugging supply blocks the laptop');
console.log('PASS: physical link vs DHCP distinction, remote power loss, damaged cable, passive patch path, click-to-plug power, switch state, desktop handoff, removal of duplicate mini-browser/terminal, and unplugging.');
const ap=add('ap');wire(ap.id,'eth',w.id,'p2');ap.on=true;assert.equal(E.powered(lab,ap.id),true);assert.equal(portState(lab,ap.id,'eth').live,true);w.poe=false;assert.equal(E.powered(lab,ap.id),false);assert.equal(portState(lab,ap.id,'eth').live,false);w.poe=true;
const full=JSON.parse(fs.readFileSync('test-results/home-lab-demo.json')),client=full.devices.find(d=>d.type==='laptop'),router=full.devices.find(d=>d.type==='router');assert.equal(E.lookupDNS(full,client.id).ok,true);router.router.dns='192.168.50.250';assert.equal(E.lookupDNS(full,client.id).ok,false);assert.equal(E.test(full,client.id,'internet','ping').ok,true,'IP reachability does not require DNS');console.log('PASS: PoE power/link dependency and DNS failure independent of IP ping.');
// Both click and pointer workflows must use the same authoritative connection checks.
state=E.fresh();id=E.addDevice(state,'laptop').id;ui.open(id);
const change=(selector,value)=>{$(selector).value=value;$(selector).dispatchEvent(new Event('change'));};
const socket=(device,port)=>`[data-socket-device="${device}"][data-socket="${port}"]`;
let hit=null;document.elementFromPoint=()=>hit;
const pointer=(selector,type,x,y)=>{const ev=new Event(type,{bubbles:true,cancelable:true});Object.assign(ev,{pointerId:1,button:0,clientX:x,clientY:y});$(selector).dispatchEvent(ev);};
const dragTo=(source,target)=>{pointer(source,'pointerdown',10,10);pointer('#hardwareDialog','pointermove',100,100);hit=target?$(target):null;pointer('#hardwareDialog','pointerup',100,100);};
change('#hwCable','power');dragTo(socket(id,'ac'),null);assert.equal(state.links.length,0);assert.match($('#hardwareMessage').textContent,/missed a socket/);assert.ok($('#hwLoosePlug'));
dragTo('#hwLoosePlug',socket('wall','out1'));assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/Connected · both plugs seated/);ui.refresh();assert.match($('#hardwareMessage').textContent,/Connected · both plugs seated/,'success survives redraw');
change('#hwCable','cat5e');click(socket(id,'eth'));click(socket('wall','out2'));assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/Not connected/);assert.ok($('#hwLoosePlug'),'invalid destination keeps source for retry');
click(socket('wall','out1'));assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/Not connected/,'occupied destination reports error');click('#hwCancel');
change('#hwCable','power');dragTo(socket('wall','out2'),socket(id,'eth'));assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/Not connected/);
click('#hwCancel');change('#hwCable','cat5e');pointer(socket(id,'eth'),'pointerdown',1,1);pointer('#hardwareDialog','pointermove',20,20);pointer('#hardwareDialog','pointercancel',20,20);assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/interrupted/);assert.equal($('#looseCableOverlay'),null);
click('#hwCancel');change('#hwCable','power');click(socket(id,'ac'));click('#hwUnplug');change('#hwLength','100');dragTo(socket(id,'ac'),socket('wall','out1'));assert.equal(state.links.length,0);assert.match($('#hardwareMessage').textContent,/Not connected/);change('#hwLength','6');click(socket('wall','out1'));assert.equal(state.links.length,1);assert.match($('#hardwareMessage').textContent,/Connected/);
console.log('PASS: drag success, missed drop, occupied and incompatible sockets, cancellation, cable length, click retry, and persistent outcome prompts.');

// A learner can grab the cord itself before choosing either socket.
state=E.fresh();id=E.addDevice(state,'laptop').id;ui.open(id);
assert.equal($('#hwCable').value,'power','an unconnected power inlet starts with a power cord');
assert.ok($('#hwLoosePlug svg'),'the draggable cord is visible before selecting a socket');
click('#hwCancel'); // Manual two-end workflow remains available.
dragTo('#hwLoosePlug',socket(id,'eth'));assert.equal(state.links.length,0);assert.match($('#hardwareMessage').textContent,/does not fit/);
dragTo('#hwLoosePlug',socket(id,'ac'));assert.equal(state.links.length,0,'one end cannot power equipment');assert.ok($(socket(id,'ac')).classList.contains('port-chosen'));
dragTo('#hwLoosePlug',null);assert.equal(state.links.length,0);assert.match($('#hardwareMessage').textContent,/missed/);
dragTo('#hwLoosePlug',socket('wall','out1'));assert.equal(state.links.length,1);assert.equal(E.powered(state,id),false,'a valid cord does not turn on a switched-off device');
click(socket(id,'ac'));click('#hwUnplug');
const originalSocket=$(socket(id,'ac'));pointer(socket(id,'ac'),'pointerdown',1,1);pointer('#hardwareDialog','pointermove',20,20);
assert.equal($(socket(id,'ac')),originalSocket,'starting a drag must not remove its pointer target');ui.refresh();assert.equal($(socket(id,'ac')),originalSocket,'an app refresh must preserve an active drag');
hit=$(socket('wall','out2'));pointer('#hardwareDialog','pointerup',100,100);assert.equal(state.links.length,1);assert.equal($('#looseCableOverlay'),null);
console.log('PASS: visible cord before selection, wrong first socket, two-end drag, missed-drop retry, device power state, and stable pointer targets.');

// Quick setup prepares a UI endpoint without secretly adding or energizing a cable.
state=E.fresh();id=E.addDevice(state,'laptop').id;ui.open(id);
assert.equal(state.links.length,0);assert.ok($(socket(id,'ac')).classList.contains('port-chosen'));assert.equal($('#hwPeer').value,'wall');assert.equal($('#hwLength').value,'6');assert.equal($('#hwCableOptions').hasAttribute('open'),false);
dragTo('#hwLoosePlug',socket('wall','out1'));assert.equal(state.links.length,1,'one drag from the ready cord completes power wiring');assert.equal(E.powered(state,id),false);assert.ok($('.power-next'));click('.power-next');assert.equal(E.powered(state,id),true);assert.equal(E.ready(state,id).ok,true);
// Prefer a powered strip with a free outlet, and never suggest a strip for another strip.
const strip=E.find(state,E.addDevice(state,'surge').id);assert.ok(E.connect(state,'wall','out2',strip.id,'ac','power',6).ok);strip.on=true;
const second=E.addDevice(state,'laptop').id;ui.open(second);assert.equal($('#hwPeer').value,strip.id);assert.equal(state.links.length,2,'suggestions do not mutate wiring');dragTo('#hwLoosePlug',socket(strip.id,'out1'));assert.equal(state.links.length,3);
for(const [out,type] of [['out3','ont'],['out4','router']]){const load=E.addDevice(state,type).id;assert.ok(E.connect(state,'wall',out,load,'ac','power',6).ok);}
const newStrip=E.addDevice(state,'surge').id;ui.open(newStrip);assert.match($('#hardwareMessage').textContent,/No free suitable outlet/);assert.notEqual($('#hwPeer').value,strip.id);
// Reopening wired equipment keeps its existing cable and does not prepare a replacement.
ui.open(id);assert.equal(document.querySelectorAll('.port-chosen').length,0);assert.equal(state.links.length,5);
console.log('PASS: one-drag power setup, explicit power-on, powered outlet suggestions, no hidden wiring, unavailable outlets, and reopening connected equipment.');


// Guided connections now stay assembled; the same validation and hints remain.
HTMLElement.prototype.focus=function(){};HTMLElement.prototype.scrollIntoView=function(){};
state=E.fresh();id=E.addDevice(state,'laptop').id;let guided=true;
ctx.api.getConnection=()=>({a:id,ap:'ac',b:'wall',bp:'out1',cable:'power',guided,complete:state.links.some(l=>l.type==='power')});
const before=JSON.stringify(state);ui.openConnection(ctx.api.getConnection());
assert.equal(document.querySelectorAll('.exploded-unit').length,0);assert.equal(document.querySelectorAll('[data-hw-face="exploded"],[data-hw-model]').length,0);
assert.equal(document.querySelectorAll('.hw-destination').length,1);
click('#hwZoomIn');assert.equal($('#hwZoomValue').textContent,'125%');click('#hwZoomFit');assert.equal($('#hwZoomValue').textContent,'100%');assert.equal(JSON.stringify(state),before);
guided=false;ui.refresh();assert.equal(document.querySelectorAll('.hw-destination').length,0);guided=true;ui.refresh();click(socket(id,'ac'));click(socket('wall','out1'));assert.equal(state.links.length,1);assert.equal(document.querySelectorAll('.hw-destination').length,0);
// Pull a seated end out, reconnect, move it, reject incompatible drops, cancel safely.
ui.openConnections(id,'ac');dragTo(socket('wall','out1'),null);assert.equal(state.links.length,0);assert.match($('#hardwareMessage').textContent,/unplugged/);
click(socket(id,'ac'));click(socket('wall','out1'));assert.equal(state.links.length,1);
dragTo(socket('wall','out1'),socket('wall','out2'));assert.equal(state.links.length,1);assert.ok(state.links.some(l=>l.ap==='out2'||l.bp==='out2'));
const linked=JSON.stringify(state.links);dragTo(socket('wall','out2'),socket(id,'eth'));assert.equal(JSON.stringify(state.links),linked);assert.match($('#hardwareMessage').textContent,/original cable remains/);
pointer(socket('wall','out2'),'pointerdown',1,1);pointer('#hardwareDialog','pointermove',30,30);pointer('#hardwareDialog','pointercancel',30,30);assert.equal(JSON.stringify(state.links),linked);
ctx.api.getConnection=()=>null;
for(const type of Object.keys(E.catalog)){
 const target=['wall','isp'].includes(type)?type:E.addDevice(state,type).id;ui.openConnections(target);
 const count=document.querySelector(`[data-unit="${target}"]`).querySelectorAll('[data-socket]').length;assert.equal(count,type==='panel'?4:Object.keys(E.catalog[type].ports).length);
 if(type==='panel'){click('[data-hw-face="front"]');assert.equal(document.querySelector(`[data-unit="${target}"]`).querySelectorAll('[data-socket]').length,4);}
}
state=E.fresh();id=E.addDevice(state,'laptop').id;const switchId=E.addDevice(state,'switch').id;assert.ok(E.connect(state,id,'eth',switchId,'p3','cat5e',6).ok);const unchanged=JSON.stringify(state);ui.openConnections(id,'eth');assert.equal($('#hwPeer').value,switchId);assert.equal(JSON.stringify(state),unchanged);
console.log('PASS: assembled connection UI, guided targets, zoom without mutations, seated-plug detach and replug, invalid moves and cancellation preserve cables, all device ports, and exact connected peer.');
