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
const ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,E,portState,renderBenchEquipment,setupBenchConnections,setupLearningGuide,setupHardware:()=>null,setupStudio:()=>{const frame=document.createElement('div');frame.id='benchViewport';const scene=document.getElementById('scene');scene.before(frame);frame.append(scene);return {refresh(){},refreshScene(){},onResult(){},sound(){}};},document,window:win,Option:function(t,v){const e=document.createElement('option');e.textContent=t;e.value=v;return e},localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:(fn,ms)=>{if(ms===2500)fn();return 1},clearTimeout(){},queueMicrotask,console,Blob,URL});
const run=x=>vm.runInContext(x,ctx),$=x=>document.getElementById(x),click=x=>$(x).dispatchEvent(new Event('click',{bubbles:true})),change=(x,v)=>{$(x).checked=v;$(x).dispatchEvent(new Event('change',{bubbles:true}));};
run(fs.readFileSync('lab-ux.js','utf8').replaceAll('export function','function'));run(fs.readFileSync('lab-app.js','utf8').replace(/^import .*;$/gm,''));
for(const mission of ['nas','virtual','wifi','routed','cloud','trouble','free']){
 run(`start('${mission}')`);if(mission==='free'){assert.equal($('learningGuide').hidden,true,'Free build starts without a checklist');run("learning.setMode('guided')");}const steps=run('learning.steps');assert.ok(steps.length>4);assert.equal($('learningGuide').hidden,false);
 for(let i=0;i<steps.length;i++){
  const st=steps[i];ctx.spec=st;assert.equal(run('s.walkthrough.index'),i);assert.equal($('learningTaskTitle').textContent,st.title);
  if(st.add)click('learningAction');
  else if(st.a){const r=run("E.connect(s,['wall','isp'].includes(spec.a)?spec.a:E.ofType(s,spec.a)[spec.aNth||0].id,spec.ap,['wall','isp'].includes(spec.b)?spec.b:by(spec.b).id,spec.bp,spec.cable,6)");assert.ok(r.ok,r.message);run('render()');}
  else if(st.powerType)run('E.ofType(s,spec.powerType)[spec.nth||0].on=true;render()');
  else if(st.safety){for(const el of document.querySelectorAll('[data-learning-safety]')){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}}
  else if(st.settings){click('learningAction');assert.ok($(st.settings.field),'Missing guided field '+st.settings.field);
   switch(st.settings.field){
    case 'dhcp':change('dhcp',true);click('applyRouter');break;
    case 'ipMode':click('applyNetwork');break;
    case 'partChoice':for(let j=0;j<(st.choose==='disk|1'?4:1);j++)click('fitPart');break;
    case 'rackU':change('rails',true);click('mountDevice');break;
    case 'raidLevel':if(st.title.startsWith('Fail'))document.querySelector('[data-drive="0"]').click();else if(st.title.startsWith('Replace'))document.querySelector('[data-drive="0"]').click();else click('setRaid');break;
    case 'osChoice':click('installOs');break;
    case 'drivers':change('drivers',true);change('virt',true);break;
    case 'fileService':change('fileService',true);break;
    case 'apSsid':click('applyAp');break;
    case 'useWifi':change('useWifi',true);$('clientSsid').value='HomeLab';$('clientPass').value='learnlab123';click('applyNetwork');break;
    case 'secondary':change('secondary',true);click('applyRouter');break;
    case 'vlan-p4':$('vlan-p4').value='20';$('vlan-p5').value='20';click('applySwitch');break;
    case 'routerDns':$('routerDns').value='192.168.50.1';click('applyRouter');break;
   }
  }else if(st.reveal){click('learningAction');if(mission==='trouble')document.querySelector(`[data-break="${run('s.links.find(l=>l.broken).id')}"]`).click();else run("s.links=s.links.filter(l=>l.type==='power'||!(l.a===by('laptop').id||l.b===by('laptop').id));render()");}
  else if(st.test||st.runTest)click('learningAction');
  else if(st.desktop)run('s.desktopProgress={opened:true,machines:{}};render()');
  else if(st.panel==='vm'){
   click('learningAction');
   if(st.vmMode){const select=document.querySelector('[data-vmmode]');select.value=st.vmMode;select.dispatchEvent(new Event('change',{bubbles:true}));}
   else if(st.title.startsWith('Choose a cloud')){$('cloudModel').value='hybrid';$('cloudService').value='iaas';click('provisionCloud');}
   else if(st.prepareBackup)click('cloudBackup');
   else if(st.title.startsWith('Verify the recovery'))click('verifyBackup');
   else if(st.title.startsWith('Create'))click('createVm');
   else document.querySelector(st.title.startsWith('Install')?'[data-vmos]':st.title.startsWith('Start')?'[data-vmrun]':'[data-vmservice]').click();
  }
  await Promise.resolve();run('learning.refresh()');assert.ok(st.pass(run('s')),mission+' task '+i+': '+st.title);assert.equal($('learningNext').disabled,false);click('learningNext');
 }
 const clean=run('validateSave(JSON.parse(JSON.stringify(s)))');assert.equal(clean.walkthrough.index,steps.length);console.log('PASS '+mission+': '+steps.length+' checked guided tasks, UI actions and save/resume.');
}
