import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import * as E from './lab-engine.js';
import {renderBenchEquipment,setupBenchConnections,equipmentFaces,wallSockets} from './lab-bench-connections.js';
const {document,Event,HTMLElement,HTMLSelectElement}=parseHTML('<html><body><div><div id="benchViewport"><div id="scene"><div id="equipment"></div></div></div></div></body></html>');
Object.defineProperty(HTMLSelectElement.prototype,'value',{get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?.getAttribute('value')||''},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===v)}});
HTMLElement.prototype.setPointerCapture=function(){};HTMLElement.prototype.hasPointerCapture=()=>false;
Object.assign(globalThis,{document,window:{addEventListener(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
let s=E.fresh(),ui;const sounds=[];
const $=sel=>document.querySelector(sel),port=(id,p)=>`[data-bench-device="${id}"][data-bench-port="${p}"]`;
function render(){const positions=Object.fromEntries(s.devices.map((d,i)=>[d.id,[15+i*7,50]]));$('#equipment').innerHTML=renderBenchEquipment(s,positions);ui?.refresh();}
for(const type of Object.keys(E.catalog).filter(x=>!['wall','isp'].includes(x)))E.addDevice(s,type);
render();ui=setupBenchConnections({getState:()=>s,result:r=>{assert.ok(r.ok);render()},sound:x=>sounds.push(x)});
assert.equal(Object.keys(wallSockets).length,4);
for(const d of s.devices){for(const p of Object.keys(E.catalog[d.type].ports)){assert.ok($(port(d.id,p)),d.type+' '+p+' has a real hit target');}}
for(const [type,face] of Object.entries(equipmentFaces)){for(const xy of Object.values(face.ports))assert.ok(xy.every(v=>v>=0&&v<=100),type+' anchors stay on their equipment image');}
const laptop=E.ofType(s,'laptop')[0],sw=E.ofType(s,'switch')[0],surge=E.ofType(s,'surge')[0];
let target=null;document.elementFromPoint=()=>target;
function pointer(selector,type,x,y){const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:3,button:0,clientX:x,clientY:y});$(selector).dispatchEvent(e);}
function drag(from,to){pointer(from,'pointerdown',0,0);pointer('#scene','pointermove',30,30);target=to?$(to):null;pointer('#scene','pointerup',40,40);}
function click(selector){const e=new Event('click',{bubbles:true});e.detail=0;$(selector).dispatchEvent(e);}
// The room's fourth photographed outlet participates in the same power engine.
drag(`[data-bench-plug="${laptop.id}"]`,port('wall','out4'));assert.equal(s.links.length,1);assert.equal(E.powered(s,laptop.id),false);
pointer(`[data-bench-power="${laptop.id}"]`,'pointerdown',0,0);const realClick=new Event('click',{bubbles:true});realClick.detail=1;$(`[data-bench-power="${laptop.id}"]`).dispatchEvent(realClick);assert.equal(E.powered(s,laptop.id),true);assert.ok($('.bench-screen-glow'));
drag(`[data-bench-plug="${sw.id}"]`,port('wall','out1'));click(`[data-bench-power="${sw.id}"]`);
drag(port(laptop.id,'eth'),port(sw.id,'p1'));assert.equal(s.links.length,3);assert.ok($(port(laptop.id,'eth')).classList.contains('socket-live'));
// Occupied ports, wrong connectors, lengths, missed drops and cancel cannot add cables.
drag(`[data-bench-plug="${surge.id}"]`,port(sw.id,'p2'));assert.equal(s.links.length,3);assert.match($('#benchConnectionStatus').textContent,/power cord/i);
drag(`[data-bench-plug="${surge.id}"]`,port('wall','out1'));assert.equal(s.links.length,3);assert.match($('#benchConnectionStatus').textContent,/occupied/);
drag(`[data-bench-plug="${surge.id}"]`,null);assert.equal(s.links.length,3);assert.equal($('#benchCableCancel').disabled,false);
$('#benchCableLength').value='100';drag(`[data-bench-plug="${surge.id}"]`,port('wall','out2'));assert.equal(s.links.length,3);assert.match($('#benchConnectionStatus').textContent,/length/);
$('#benchCableLength').value='6';click(port('wall','out2'));assert.equal(s.links.length,4);click(port(surge.id,'ac'));click('[data-bench-unplug]');assert.equal(s.links.length,3);assert.ok($(`[data-bench-plug="${surge.id}"]`));
click(port(sw.id,'p2'));click('#benchCableCancel');assert.equal($('#benchCableCancel').disabled,true);
// No equipment move handler should receive the socket gesture.
let outerPointerDown=0;document.addEventListener('pointerdown',()=>outerPointerDown++);drag(port(sw.id,'p2'),null);assert.equal(outerPointerDown,0);
pointer('#scene','pointercancel',40,40);click('#benchCableCancel');assert.equal(s.links.length,3);
click(port(laptop.id,'ac'));click('[data-bench-unplug]');assert.equal(E.powered(s,laptop.id),false);assert.equal($('.bench-screen-glow'),null);assert.equal(s.links.length,2);
const before=s.links.length;click(port(sw.id,'p2'));s=E.fresh();render();assert.equal($('#benchCableCancel').disabled,true);assert.equal(s.links.length,0);assert.ok(before>0);
assert.ok(sounds.includes('error'));
console.log('PASS: every photographed device port, all four wall sockets, direct cord and data dragging, power/screen/link state, occupied/wrong/missed drops, cable length, unplug, equipment gesture isolation and session reset.');

// Direct drag-out and end relocation use the same checked wiring rules.
s=E.fresh();const pc=E.addDevice(s,'laptop').id,sw2=E.addDevice(s,'switch').id;E.connect(s,pc,'ac','wall','out1','power',6);E.connect(s,sw2,'ac','wall','out2','power',6);E.find(s,pc).on=E.find(s,sw2).on=true;E.connect(s,pc,'eth',sw2,'p1','cat5e',6);render();
drag(port(sw2,'p1'),port(sw2,'p2'));assert.equal(s.links.at(-1).bp,'p2');assert.equal(s.links.length,3);
const original=JSON.stringify(s.links);drag(port(sw2,'p2'),port('wall','out3'));assert.equal(JSON.stringify(s.links),original);
pointer(port(sw2,'p2'),'pointerdown',0,0);pointer('#scene','pointermove',30,30);pointer('#scene','pointercancel',30,30);assert.equal(JSON.stringify(s.links),original);
drag(port(pc,'ac'),null);assert.equal(s.links.length,2);assert.equal(E.powered(s,pc),false);assert.equal($('.bench-screen-glow'),null);assert.ok($(`[data-bench-plug="${pc}"]`));
console.log('PASS: bench drag-out drops power, seated-end moves preserve cable, rejected destinations and cancelled drags preserve original wiring.');
