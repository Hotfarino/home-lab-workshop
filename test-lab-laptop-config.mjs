import {makeFoundation,checkpointStart,foundationKey} from './lab-foundation.js';
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
Object.assign(globalThis,{document,window:win,localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
const ctx=vm.createContext({makeFoundation,checkpointStart,foundationKey,setupDesktop,setupControlCenter,routerPage,buildTemplate,setupWorld:()=>({openScreen:()=>true,closeScreen(){},refresh(){},guide(){},view(){}}),E,portState,renderBenchEquipment,setupBenchConnections,setupLearningGuide,setupHardware:()=>null,setupStudio:()=>{const frame=document.createElement('div');frame.id='benchViewport';const scene=document.getElementById('scene');scene.before(frame);frame.append(scene);return {refresh(){},refreshScene(){},onResult(){},sound(){}};},document,window:win,Option:function(t,v){const e=document.createElement('option');e.textContent=t;e.value=v;return e},localStorage,requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},queueMicrotask,console,Blob,URL});
const run=x=>vm.runInContext(x,ctx),$=x=>document.getElementById(x),click=x=>$(x).dispatchEvent(new Event('click',{bubbles:true})),change=(x,v)=>{$(x).checked=v;$(x).dispatchEvent(new Event('change',{bubbles:true}));};
run(fs.readFileSync('lab-ux.js','utf8').replaceAll('export function','function'));run(fs.readFileSync('lab-app.js','utf8').replace(/^import .*;$/gm,''));

const submit=id=>$(id).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
run("s=buildTemplate('vm');render()");
assert.equal($('laptopToolStore').children.length,5);
const laptop=run("by('laptop').id"),router=run("by('router').id"),host=run("by('server').id");
ctx.laptop=laptop;ctx.router=router;ctx.host=host;
assert.ok(run("desktop.configureDevice(router)"));assert.equal($('osUrl').value,'http://192.168.50.1');
assert.ok($('osLabPanel').contains($('applyRouter')));
change('dhcp',false);click('applyRouter');assert.match($('osDesktop').textContent,/temporary address/i);assert.equal($('osLabPanel'),null);
run("desktop.configureDevice(laptop)");$('osIpMode').value='static';$('osIp').value='192.168.50.10';$('osMask').value='255.255.255.0';$('osGateway').value='192.168.50.1';$('osDns').value='192.168.50.1';submit('osNetworkForm');
assert.ok(run("routerPage(s,laptop,'http://192.168.50.1').ok"));
run("desktop.configureDevice(router)");change('nat',false);change('wan',false);$('routerDns').value='192.168.50.250';click('applyRouter');assert.ok($('osLabPanel'),'local numeric setup needs neither NAT, WAN nor DNS');
$('routerLan').value='192.168.60.1';click('applyRouter');assert.equal($('osLabPanel'),null);assert.match($('osDesktop').textContent,/address has changed/);
run("desktop.configureDevice(router)");assert.match($('osDesktop').textContent,/same local subnet/);
run("by('router').router.lan='192.168.50.1';by('router').router.dhcp=true;by('router').router.nat=true;by('router').router.wan=true;by('router').router.dns='192.168.50.1';render();desktop.configureDevice(laptop)");$('osIpMode').value='dhcp';submit('osNetworkForm');
run("desktop.configureDevice(router)");$('osUrl').value='https://example.com';submit('osBrowserForm');assert.match($('osDesktop').textContent,/Example page received/);assert.ok($('laptopToolStore').contains(document.querySelector('.inspector')));
for(const view of ['devices','network','tests','vms','planner']){ctx.view=view;run('desktop.openLab(view)');if(view!=='devices')assert.ok($('osLabPanel').children.length);const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(ids.length,new Set(ids).size);}
run("s.walkthrough.index=learning.steps.findIndex(st=>st.test==='web');learning.refresh();desktop.runNetworkTest({source:laptop,target:'internet',protocol:'https'})");assert.equal(run('s.walkthrough.webTest'),true);assert.equal($('osBuildContinue').disabled,false);assert.ok(document.querySelector('.os-browser-result.pass'));
run("s.walkthrough.index=learning.steps.findIndex(st=>st.test==='vm');s.vms[0].name='Web-Lab';s.vms[0].service=true;learning.refresh();desktop.openLab('vms')");
const vmId=run('s.vms[0].id');document.querySelector('[data-vmtest="'+vmId+'"]').click();assert.equal(run('s.walkthrough.vmTest'),true);assert.equal($('osBuildContinue').disabled,false);
run("s.links.find(l=>(l.a===laptop&&l.ap==='eth')||(l.b===laptop&&l.bp==='eth')).broken=true;render()");const n=run('s.vms.length');$('vmName').value='Blocked';click('createVm');assert.equal(run('s.vms.length'),n);assert.match($('vmFeedback').textContent,/network path/);const running=run('s.vms[0].running');document.querySelector('[data-vmrun="'+vmId+'"]').click();assert.equal(run('s.vms[0].running'),running);
run('desktop.close()');assert.equal($('osDesktop').open,false);assert.equal($('laptopToolStore').children.length,5);

// Switch hardware remains installable while its network configuration requires power and a LAN path.
run("by('switch').on=false;s.links=s.links.filter(l=>!(l.type==='power'&&(l.a===by('switch').id||l.b===by('switch').id)));s.safety={mat:true,strap:true,clearance:true};desktop.configureDevice(by('switch').id,'Install parts')");
assert.ok($('osLabPanel'));$('partChoice').value='sr|sr';click('fitPart');assert.equal(run("by('switch').sr"),true);run("desktop.configureDevice(by('switch').id)");assert.equal($('osLabPanel'),null);assert.match($('osDesktop').textContent,/Power the/);run('desktop.close()');
// Local setup does not treat a WAN-only wire or a powered-but-isolated client as management access.
const edge=buildTemplate('vm'),cl=E.ofType(edge,'laptop')[0],rt=E.ofType(edge,'router')[0],sw=E.ofType(edge,'switch')[0];
rt.router.wan=false;rt.router.nat=false;rt.router.dns='192.168.50.250';
assert.ok(routerPage(edge,cl.id,'http://192.168.50.1').ok);assert.equal(routerPage(edge,cl.id,'https://192.168.50.1').ok,false);
assert.equal(routerPage(edge,cl.id,'http://192.168.50.1:8080').ok,false);assert.equal(routerPage(edge,cl.id,'https://outside.example'),null);
cl.osState={adapterEnabled:false,driverInstalled:true};assert.equal(routerPage(edge,cl.id,'http://192.168.50.1').ok,false);cl.osState.adapterEnabled=true;
assert.ok(labConsoleAccess(edge,cl.id,sw.id).ok);edge.links.find(l=>(l.a===cl.id&&l.ap==='eth')||(l.b===cl.id&&l.bp==='eth')).broken=true;assert.equal(labConsoleAccess(edge,cl.id,sw.id).ok,false);
run("s=buildTemplate('vm');s.mission='cloud';s.walkthrough={index:0};render();s.walkthrough.index=learning.steps.findIndex(st=>st.prepareBackup);learning.refresh();desktop.openLab('cloud')");
$('cloudModel').value='hybrid';$('cloudService').value='iaas';click('provisionCloud');click('cloudBackup');assert.equal(run('s.cloud.backup'),true);assert.equal($('osBuildContinue').disabled,false);
assert.ok($('osLabPanel').contains($('backupStatus')));assert.ok($('osLabPanel').contains($('cloudBackupSource')));
run('desktop.close()');
console.log('PASS laptop control center: panels stay inside OS; router DHCP bootstrap, static recovery, local access without WAN/DNS/NAT, address-change invalidation; native settings; public test page; all workspaces; guide evidence; VM isolation; park/restore and unique IDs.');
