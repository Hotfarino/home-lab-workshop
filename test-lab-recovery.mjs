import {makeFoundation,checkpointStart,foundationKey} from './lab-foundation.js';
import {setupPresentation} from './lab-presentation.js';
import {setupDesktop} from './lab-desktop.js';
import {setupControlCenter} from './lab-control-center.js';
import {routerPage,labConsoleAccess} from './lab-management.js';
import {buildTemplate} from './lab-planner.js';
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
Object.assign(globalThis,{location:{hash:''},document,window:win,localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
const pendingRebuilds=[];
const ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,setupPresentation,setupDesktop,setupControlCenter,routerPage,buildTemplate,setupWorld:()=>{const root=document.createElement('section');root.id='worldLab';const source=fs.readFileSync('lab-world.js','utf8'),markup=source.slice(source.indexOf('root.innerHTML=`')+16,source.indexOf('`;\n',source.indexOf('root.innerHTML=`')));root.innerHTML=new Function('E','esc','return `'+markup+'`')(E,x=>x);document.getElementById('benchViewport').before(root);return {openScreen:()=>true,closeScreen(){},refresh(){},guide(){},view(){}};},E,portState,renderBenchEquipment,setupBenchConnections,setupLearningGuide,setupHardware:()=>null,setupStudio:()=>{const frame=document.createElement('div');frame.id='benchViewport';const scene=document.getElementById('scene');scene.before(frame);frame.append(scene);return {refresh(){},refreshScene(){},onResult(){},sound(){}};},document,window:win,Option:function(t,v){const e=document.createElement('option');e.textContent=t;e.value=v;return e},localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:(fn,ms)=>{if(ms===2500)pendingRebuilds.push(fn);return 1},clearTimeout(){},queueMicrotask,console,Blob,URL});
const run=x=>vm.runInContext(x,ctx),$=x=>document.getElementById(x),click=x=>$(x).dispatchEvent(new Event('click',{bubbles:true})),change=(x,v)=>{$(x).checked=v;$(x).dispatchEvent(new Event('change',{bubbles:true}));};
run(fs.readFileSync('lab-ux.js','utf8').replaceAll('export function','function'));run(fs.readFileSync('lab-app.js','utf8').replace(/^import .*;$/gm,''));

// Guided tests and manual retries must describe and execute the same request.
run("s=buildTemplate('vm');render();desktop.runNetworkTest({source:by('laptop').id,target:'internet',protocol:'ping'})");
assert.equal($('testProtocol').value,'ping','ping result must keep Ping selected');
assert.equal($('testSource').value,run("by('laptop').id"));
assert.match($('testResult').textContent,/Last test:.*Ping/);
click('runTest');assert.match($('testResult').textContent,/Internet IP responds to ping/);
run("desktop.runNetworkTest({source:by('laptop').id,target:s.vms[0].id,protocol:'https',vm:true})");
assert.equal($('testTarget').value,run('s.vms[0].id'),'VM request must keep its actual target');
click('runTest');assert.match($('testResult').textContent,/PASS.*Guest web page reached/);
$('testProtocol').value='smb';click('runTest');assert.match($('testResult').textContent,/CHECK.*HTTPS/,'unsupported VM test must not silently run HTTPS');
run('desktop.close()');
// Storage errors must not produce a Saved checkmark or erase the older save.
click('learningSave');const priorSave=store.get('home-lab-save-v1'),realSet=localStorage.setItem;
localStorage.setItem=()=>{throw new Error('Quota exceeded')};click('learningSave');
assert.equal($('learningSave').textContent,'Save failed');assert.match($('saveStatus').textContent,/unavailable/);assert.equal(store.get('home-lab-save-v1'),priorSave);localStorage.setItem=realSet;
// Delayed rebuilding belongs to the exact device and build that started it.
run("s=buildTemplate('vm');s.selected=by('server').id;by('server').disks[0].failed=true;render();desktop.configureDevice(by('server').id,'Storage & RAID','raidLevel')");
document.querySelector('[data-drive="0"]').click();assert.equal(pendingRebuilds.length,1);
run("s=buildTemplate('vm');render()");const replacement=run('JSON.stringify(s)');pendingRebuilds.shift()();assert.equal(run('JSON.stringify(s)'),replacement,'old rebuild cannot mutate or announce success in a new lab');
run("s.selected=by('server').id;by('server').disks[0].failed=true;render();desktop.configureDevice(by('server').id,'Storage & RAID','raidLevel')");
document.querySelector('[data-drive="0"]').click();run("by('server').on=false;render()");pendingRebuilds.shift()();assert.equal(run("by('server').disks[0].failed"),true);assert.ok(run("s.events.some(e=>e.includes('Rebuild stopped'))"));
run("by('server').on=true;render();desktop.configureDevice(by('server').id,'Storage & RAID','raidLevel')");document.querySelector('[data-drive="0"]').click();pendingRebuilds.shift()();assert.equal(run("by('server').disks[0].failed"),false);
// A cable-list hint must not unexpectedly expand the equipment tray.
run("desktop.close();start('trouble')");assert.equal(document.body.classList.contains('learning-tools-open'),false);click('learningAction');assert.equal(document.body.classList.contains('learning-tools-open'),false);assert.ok($('cableList').closest('details').hasAttribute('open'));
console.log('PASS: diagnostic selector/retry consistency, VM requests, unsupported protocols, truthful save errors, rebuild interruption/retry/reset isolation, focused cable hints.');
