import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import * as E from './lab-engine.js';
import {buildTemplate} from './lab-planner.js';
import {routeCable,renderCableRoutes} from './lab-cable-routing.js';

for (const power of [true,false]) for (const lane of [0,1,8,17]) {
  for (const [a,b] of [[[200,120],[720,470]],[[180,330],[510,315]],[[12,30],[975,675]]]) {
    const input={a,b,exitA:a[1]+18,exitB:b[1]+18,power,lane,height:720};
    const r=routeCable(input);
    assert.equal(r.d,routeCable(input).d,'Deterministic routing');
    assert.deepEqual(r.points[0],a);assert.deepEqual(r.points.at(-1),b);
    assert.ok(!/NaN|Infinity/.test(r.d));
    for (let i=1;i<r.points.length;i++) assert.ok(r.points[i][0]===r.points[i-1][0] || r.points[i][1]===r.points[i-1][1],'Every run is orthogonal before rounding');
    assert.ok(power?r.rail<110:r.rail>890,'Separate power and data side lanes');
  }
}
const {document,HTMLSelectElement}=parseHTML('<div id="benchViewport"><div id="scene" style="height:800px"><svg id="wires"></svg></div></div>');
Object.defineProperty(HTMLSelectElement.prototype,'value',{get(){return [...this.options].find(o=>o.hasAttribute('selected'))?.value ?? this.options[0]?.value ?? '';},set(v){for(const o of this.options)o.toggleAttribute('selected',o.value===v);}});
let s=buildTemplate('vm');const original=JSON.stringify(s);
const scene=document.getElementById('scene'),svg=document.getElementById('wires');
scene.getBoundingClientRect=()=>({top:100,left:20,width:700,height:560});
const map=Object.fromEntries(s.devices.map((d,i)=>[d.id,[12+i%3*28,20+Math.floor(i/3)*20]]));
const portPosition=(id,p)=>[map[id][0]+Object.keys(E.catalog[E.find(s,id).type].ports).indexOf(p),map[id][1]];
for(const d of s.devices)for(const p of Object.keys(E.catalog[d.type].ports)){const n=document.createElement('button');n.dataset.scenePort=E.key(d.id,p);scene.append(n);}
function draw(overrides={}){renderCableRoutes({state:s,scene,svg,map,portPosition,overrides});}
draw();
assert.equal(svg.querySelectorAll('.wire').length,s.links.length);
assert.equal(JSON.stringify(s),original,'Routing never changes the saved configuration');
const laptop=E.ofType(s,'laptop')[0], l=s.links.find(l=>l.a===laptop.id && l.type!=='power');
const before=svg.querySelector(`[data-link="${l.id}"]`).getAttribute('d');
draw({[laptop.id]:[map[laptop.id][0]+5,map[laptop.id][1]+7]});
const after=svg.querySelector(`[data-link="${l.id}"]`).getAttribute('d');
assert.notEqual(before,after,'Connected equipment follows drag overrides');
assert.equal(JSON.stringify(s),original);
draw();
const ctx=vm.createContext({E,document});
vm.runInContext(fs.readFileSync('lab-cable-routing.js','utf8').replace(/^import .*;$/gm,'').replace(/^export /gm,''),ctx);
ctx.api={getState:()=>s};const manager=vm.runInContext('setupCableManager(api)',ctx);
const select=document.getElementById('traceCable');select.value=l.id;select.onchange();
assert.equal(svg.querySelectorAll('.wire.cable-selected').length,1);
assert.equal(svg.querySelectorAll('.wire.cable-muted').length,s.links.length-1);
assert.equal(scene.querySelectorAll('.cable-endpoint').length,2);
assert.match(document.getElementById('cableTraceDetail').textContent,/physical data link/);
draw();manager.refresh();assert.equal(select.value,l.id,'Trace remains after re-render');
document.getElementById('clearCableTrace').onclick();assert.equal(svg.querySelectorAll('.cable-muted').length,0);
select.value=l.id;select.onchange();s.links=s.links.filter(x=>x.id!==l.id);draw();manager.refresh();assert.equal(select.value,'','Removed connection clears trace');
s=E.fresh();manager.refresh();assert.equal(select.disabled,true);assert.equal(document.querySelectorAll('.cable-manager').length,1);
console.log('PASS: socket endpoints, rounded routing, separate lanes, drag offsets, unchanged lab state, trace selection, both socket highlights, reset and removed-cable recovery.');
