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
const ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,setupPresentation,setupDesktop,setupControlCenter,routerPage,buildTemplate,setupWorld:()=>{const root=document.createElement('section');root.id='worldLab';const source=fs.readFileSync('lab-world.js','utf8'),markup=source.slice(source.indexOf('root.innerHTML=`')+16,source.indexOf('`;\n',source.indexOf('root.innerHTML=`')));root.innerHTML=new Function('E','esc','return `'+markup+'`')(E,x=>x);document.getElementById('benchViewport').before(root);return {openScreen:()=>true,closeScreen(){},refresh(){},guide(){},view(){}};},E,portState,renderBenchEquipment,setupBenchConnections,setupLearningGuide,setupHardware:()=>null,setupStudio:()=>{const frame=document.createElement('div');frame.id='benchViewport';const scene=document.getElementById('scene');scene.before(frame);frame.append(scene);return {refresh(){},refreshScene(){},onResult(){},sound(){}};},document,window:win,Option:function(t,v){const e=document.createElement('option');e.textContent=t;e.value=v;return e},localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:(fn,ms)=>{if(ms===2500)fn();return 1},clearTimeout(){},queueMicrotask,console,Blob,URL});
const run=x=>vm.runInContext(x,ctx),$=x=>document.getElementById(x),click=x=>$(x).dispatchEvent(new Event('click',{bubbles:true})),change=(x,v)=>{$(x).checked=v;$(x).dispatchEvent(new Event('change',{bubbles:true}));};
run(fs.readFileSync('lab-ux.js','utf8').replaceAll('export function','function'));run(fs.readFileSync('lab-app.js','utf8').replace(/^import .*;$/gm,''));

const submit=id=>$(id).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
for(const mission of ['wired','nas','virtual','wifi','routed','cloud','trouble','free']){
 run(`start('${mission}')`);if(mission==='free'){assert.equal($('learningGuide').hidden,true,'Free build starts without a checklist');run("learning.setMode('guided')");}const steps=run('learning.steps');assert.ok(steps.length>4);assert.equal($('learningGuide').hidden,false);
 for(let i=0;i<steps.length;i++){
  const st=steps[i];ctx.spec=st;assert.equal(run('s.walkthrough.index'),i);assert.equal($('learningTaskTitle').textContent,st.title);
  if(st.add)click('learningAction');
  else if(st.a){const r=run("E.connect(s,['wall','isp'].includes(spec.a)?spec.a:E.ofType(s,spec.a)[spec.aNth||0].id,spec.ap,['wall','isp'].includes(spec.b)?spec.b:by(spec.b).id,spec.bp,spec.cable,6)");assert.ok(r.ok,r.message);run('render()');}
  else if(st.powerType)run('E.ofType(s,spec.powerType)[spec.nth||0].on=true;render()');
  else if(st.safety){for(const el of document.querySelectorAll('[data-learning-safety]')){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}}
  else if(st.settings){
   if(st.settings.field==='dhcp'&&!run("routerPage(s,by('laptop').id,'http://'+by('router').router.lan).ok")){
    run("desktop.configureDevice(by('laptop').id)");$('osIpMode').value='static';$('osIp').value='192.168.50.10';$('osMask').value='255.255.255.0';$('osGateway').value='192.168.50.1';$('osDns').value='192.168.50.1';submit('osNetworkForm');
   }
   click('learningAction');assert.equal($('osDesktop').open,true,st.title+' runs inside laptop');
   switch(st.settings.field){
    case 'dhcp':change('dhcp',true);click('applyRouter');break;
    case 'ipMode':$('osIpMode').value='dhcp';submit('osNetworkForm');break;
    case 'partChoice':for(let j=0;j<(st.choose==='disk|1'?4:1);j++)click('fitPart');break;
    case 'rackU':change('rails',true);click('mountDevice');break;
    case 'raidLevel':if(st.title.startsWith('Fail'))document.querySelector('[data-drive="0"]').click();else if(st.title.startsWith('Replace'))document.querySelector('[data-drive="0"]').click();else click('setRaid');break;
    case 'osChoice':click('installOs');break;
    case 'drivers':change('drivers',true);change('virt',true);break;
    case 'fileService':change('fileService',true);break;
    case 'apSsid':click('applyAp');break;
    case 'useWifi':$('osSsid').value='HomeLab';$('osWifiPassword').value='learnlab123';submit('osWifiForm');break;
    case 'secondary':change('secondary',true);click('applyRouter');break;
    case 'vlan-p4':$('vlan-p4').value='20';$('vlan-p5').value='20';click('applySwitch');break;
    case 'routerDns':$('routerDns').value='192.168.50.1';click('applyRouter');break;
   }
  }else if(st.reveal){click('learningAction');if(mission==='trouble')document.querySelector(`[data-break="${run('s.links.find(l=>l.broken).id')}"]`).click();else run("s.links=s.links.filter(l=>l.type==='power'||!(l.a===by('laptop').id||l.b===by('laptop').id));render()");}
  else if(st.test||st.runTest)click('learningAction');
  else if(st.desktop)click('learningAction');
  else if(st.panel==='vm'){
   click('learningAction');
   if(st.vmMode){const select=document.querySelector('[data-vmmode]');select.value=st.vmMode;select.dispatchEvent(new Event('change',{bubbles:true}));}
   else if(st.title.startsWith('Choose a cloud')){$('cloudModel').value='hybrid';$('cloudService').value='iaas';click('provisionCloud');}
   else if(st.prepareBackup)click('cloudBackup');
   else if(st.title.startsWith('Verify the recovery'))click('verifyBackup');
   else if(st.title.startsWith('Create'))click('createVm');
   else document.querySelector(st.title.startsWith('Install')?'[data-vmos]':st.title.startsWith('Start')?'[data-vmrun]':'[data-vmservice]').click();
  }
  if(st.runTest||st.test){assert.equal($('testProtocol').value,st.runTest?.protocol||'https');if(st.test==='vm')assert.equal($('testTarget').value,run("s.vms.find(v=>v.name==='Web-Lab').id"));}
  await Promise.resolve();run('learning.refresh()');assert.ok(st.pass(run('s')),mission+' task '+i+': '+st.title);assert.equal($('learningNext').disabled,false);click('learningNext');
 }
 const clean=run('validateSave(JSON.parse(JSON.stringify(s)))');assert.equal(clean.walkthrough.index,steps.length);console.log('PASS laptop-routed '+mission+': '+steps.length+' checked guided tasks, UI actions and save/resume.');
}

// Exercise wrong saved values, not just the normal happy path.
run("s=buildTemplate('vm');s.mission='virtual';s.vms=[];render();s.walkthrough.index=learning.steps.findIndex(x=>x.title==='Create your first virtual machine');learning.refresh()");
click('learningAction');
$('vmName').value='Web-Lab';$('vmRam').value='2';$('vmCpu').value='1';$('vmDisk').value='20';$('vmMode').value='private';click('createVm');
assert.equal($('learningNext').disabled,true,'a name alone must not finish VM creation');
assert.equal($('osBuildContinue').disabled,true,'laptop guidance must also block the wrong setup');
for(const text of ['Guest RAM','Guest vCPUs','Guest disk','Virtual switch'])assert.ok($('osBuildTask').textContent.includes(text),'show the missing VM setting: '+text);
const vmMode=document.querySelector('[data-vmmode]');vmMode.value='external';vmMode.dispatchEvent(new Event('change',{bubbles:true}));
assert.equal($('osBuildTask').querySelector('.os-setup-feedback').textContent.includes('Virtual switch:'),false,'feedback updates while other settings are still wrong');
assert.equal($('osBuildContinue').disabled,true);
document.querySelector('[data-vmdelete]').click();
$('vmName').value='Web-Lab';$('vmRam').value='4';$('vmCpu').value='2';$('vmDisk').value='40';$('vmMode').value='external';click('createVm');
assert.equal($('osBuildContinue').disabled,false,'recreating with the required settings recovers the task');
const vmState=run('s'),guest=vmState.vms[0],creation=run('learning.steps[s.walkthrough.index]');
for(const [key,bad] of [['name','Other'],['host','missing'],['ram',2],['cpu',1],['disk',20],['mode','private'],['mode','internal']]){const good=guest[key];guest[key]=bad;assert.equal(creation.pass(vmState),false,'reject wrong VM '+key);guest[key]=good;assert.equal(creation.pass(vmState),true);}

run("desktop.close();s=buildTemplate('vm');s.walkthrough={index:19};render()");
assert.equal(run('learning.steps[19].settings.field'),'dhcp');
click('learningAction');$('routerDns').value='192.168.50.254';click('applyRouter');
assert.equal($('learningNext').disabled,true);assert.equal($('osBuildContinue').disabled,true);
assert.match($('osBuildTask').textContent,/DNS: expected 192\.168\.50\.1/);
$('routerDns').value='192.168.50.1';run('learning.refresh()');
assert.equal($('learningNext').disabled,true,'unsaved fields must not receive completion');
click('applyRouter');assert.equal($('learningNext').disabled,false);assert.equal($('osBuildContinue').disabled,false);
const routerState=run('s'),router=E.ofType(routerState,'router')[0].router,dhcp=run('learning.steps[19]');
for(const [key,bad] of [['dhcp',false],['lan','192.168.51.1'],['mask','255.255.0.0'],['start',101],['end',149],['dns','192.168.50.254']]){const good=router[key];router[key]=bad;assert.equal(dhcp.pass(routerState),false,'reject wrong DHCP '+key);router[key]=good;assert.equal(dhcp.pass(routerState),true);}
router.dns='192.168.50.254';run("start('trouble')");const trouble=run('s');E.ofType(trouble,'router')[0].router.dhcp=true;
assert.equal(run("learning.steps.find(x=>x.title==='Restore DHCP').pass(s)"),true,'troubleshooting deliberately fixes DHCP before DNS');
console.log('PASS: bad VM resources/host/mode and every DHCP setting rejected; unsaved inputs rejected; laptop feedback refreshes; correcting through real controls unlocks Continue; isolated DHCP repair preserved.');
