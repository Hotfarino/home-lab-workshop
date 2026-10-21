import {makeFoundation,checkpointStart,foundationKey} from './lab-foundation.js';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import * as E from './lab-engine.js';
import {setupLearningGuide} from './lab-learning.js';
import {renderBenchEquipment,setupBenchConnections} from './lab-bench-connections.js';
import {portState} from './lab-hardware.js';
const {document,HTMLSelectElement,HTMLElement,Event}=parseHTML(fs.readFileSync('home-lab.html','utf8'));
Object.defineProperty(HTMLSelectElement.prototype,'value',{get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?.getAttribute('value')??o?.textContent??''},set(v){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',(o.getAttribute('value')??o.textContent)===String(v))}});
Object.defineProperty(HTMLSelectElement.prototype,'options',{get(){return [...this.querySelectorAll('option')]}});HTMLSelectElement.prototype.add=function(x){this.append(x)};
Object.defineProperty(HTMLElement.prototype,'checked',{get(){return this.hasAttribute('checked')},set(v){this.toggleAttribute('checked',v)}});
for(const method of ['scrollIntoView','setPointerCapture','focus'])HTMLElement.prototype[method]=function(){};
HTMLElement.prototype.showModal=function(){this.open=true};HTMLElement.prototype.close=function(){this.open=false};HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:800,right:1000,bottom:800});
const store=new Map(),win={addEventListener(){},matchMedia:()=>({matches:false})},localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
Object.assign(globalThis,{document,window:win,localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
const ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,E,portState,renderBenchEquipment,setupBenchConnections,setupLearningGuide,setupHardware:()=>null,setupStudio:()=>{const frame=document.createElement('div');frame.id='benchViewport';const scene=document.getElementById('scene');scene.before(frame);frame.append(scene);return {refresh(){},refreshScene(){},onResult(){},sound(){}};},document,window:win,Option:function(t,v){const e=document.createElement('option');e.textContent=t;e.value=v;return e},localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},queueMicrotask,console,Blob,URL});
const run=x=>vm.runInContext(x,ctx),$=x=>document.getElementById(x),click=x=>$(x).dispatchEvent(new Event('click',{bubbles:true})),change=(x,v)=>{$(x).checked=v;$(x).dispatchEvent(new Event('change',{bubbles:true}));};
run(fs.readFileSync('lab-ux.js','utf8').replaceAll('export function','function'));run(fs.readFileSync('lab-app.js','utf8').replace(/^import .*;$/gm,''));
assert.equal($('learningNext').disabled,true);assert.equal($('welcomeDialog').open,false);assert.match($('learningTaskTitle').textContent,/Add Laptop/);
click('learningNext');assert.equal(run('s.walkthrough.index'),0);
const steps=run('learning.steps');assert.equal(steps.length,42);
for(let i=0;i<steps.length;i++){
 const step=steps[i];assert.equal(run('s.walkthrough.index'),i);assert.equal($('learningTaskTitle').textContent,step.title);
 if(step.add)click('learningAction');
 else if(step.a){ctx.spec=step;const r=run("E.connect(s,['wall','isp'].includes(spec.a)?spec.a:by(spec.a).id,spec.ap,['wall','isp'].includes(spec.b)?spec.b:by(spec.b).id,spec.bp,spec.cable,6)");assert.ok(r.ok,r.message);run('render()');}
 else if(step.targets){ctx.spec=step;run("by(spec.title.replace('Turn on ','')==='Laptop client'?'laptop':spec.title.includes('PDU')?'pdu':spec.title.includes('ONT')?'ont':spec.title.includes('router')?'router':spec.title.includes('switch')?'switch':'server').on=true;render()");}
 else if(step.safety){for(const el of document.querySelectorAll('[data-learning-safety]')){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}}
 else if(step.settings){
  click('learningAction');assert.ok(document.body.classList.contains('learning-settings-open'));
  switch(step.settings.field){
   case 'dhcp':change('dhcp',true);click('applyRouter');break;
   case 'ipMode':click('applyNetwork');break;
   case 'partChoice':for(let n=0;n<(step.choose==='disk|1'?4:1);n++)click('fitPart');break;
   case 'rackU':change('rails',true);click('mountDevice');break;
   case 'raidLevel':click('setRaid');break;
   case 'osChoice':click('installOs');break;
   case 'drivers':change('drivers',true);change('virt',true);break;
  }
 }else if(step.test)click('learningAction');
 else if(step.panel==='vm'){
  if(step.vmMode){const select=document.querySelector('[data-vmmode]');select.value=step.vmMode;select.dispatchEvent(new Event('change',{bubbles:true}));}
  else if(step.title.startsWith('Create'))click('createVm');
  else{const selector=step.title.startsWith('Install')?'[data-vmos]':step.title.startsWith('Start')?'[data-vmrun]':'[data-vmservice]';document.querySelector(selector).dispatchEvent(new Event('click',{bubbles:true}));}
 }
 await Promise.resolve();run('learning.refresh()');assert.ok(step.pass(run('s')),'Task '+(i+1)+' must finish: '+step.title);assert.equal($('learningNext').disabled,false);
 click('learningNext');
}
assert.match($('learningTaskTitle').textContent,/whole path/);
click('learningSave');const saved=JSON.parse(store.get('home-lab-save-v1'));assert.equal(saved.walkthrough.index,42);ctx.saved=saved;assert.equal(run('validateSave(saved).walkthrough.index'),42);
const snapshot=run('JSON.stringify(s.devices)');$('learningMode').value='free';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));assert.equal($('learningGuide').hidden,true);assert.equal(run('JSON.stringify(s.devices)'),snapshot);
$('learningMode').value='practice';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));click('learningReview');assert.equal(document.querySelector('.learning-why'),null);$('learningHelp').open=true;$('learningHelp').ontoggle();assert.ok(document.querySelector('.learning-why'));
click('learningTools');assert.ok(document.body.classList.contains('learning-tools-open'));click('learningTools');assert.equal(document.body.classList.contains('learning-tools-open'),false);
run("start('wired')");assert.equal(run('s.walkthrough.index'),0);click('learningLoad');assert.equal(run('s.walkthrough.index'),42);assert.equal(run('s.vms.length'),1);
const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);
console.log('PASS: 42 guided tasks through real UI/engine actions, blocked early advance, hardware/network/RAID/VM completion, help levels without resets, hints, tools, saved progress and resume.');

// Destination beacons belong only to a pending fully guided connection task.
run("s=E.fresh();E.addDevice(s,'laptop');s.walkthrough={index:1};render()");
$('learningMode').value='guided';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));
assert.equal(document.querySelectorAll('.learning-destination').length,1);
assert.equal(document.querySelector('.learning-destination').dataset.scenePort,'wall:out1');
assert.ok($('learningExploded'));assert.equal(run('learning.connection().guided'),true);
$('learningMode').value='practice';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));
assert.equal(document.querySelectorAll('.learning-destination').length,0);assert.equal(run('learning.connection().guided'),false);
$('learningMode').value='free';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));
assert.equal(run('learning.connection()'),null);assert.equal(document.querySelectorAll('.learning-destination').length,0);
$('learningMode').value='guided';$('learningMode').dispatchEvent(new Event('change',{bubbles:true}));
run("E.connect(s,by('laptop').id,'ac','wall','out1','power',6);render()");
assert.equal(document.querySelectorAll('.learning-destination').length,0);assert.equal(run('learning.connection().complete'),true);
console.log('PASS: one exact guided destination, explicit connection close-up action, practice/free exclusion and beacon removal after success.');

run("start('free')");assert.equal($('learningGuide').hidden,true);
assert.equal(run('learning.progress().mode'),'free');
run("start('wired')");assert.equal($('learningGuide').hidden,false);
assert.equal(run('learning.progress().mode'),'guided');
