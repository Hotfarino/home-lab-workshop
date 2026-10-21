import test from 'node:test';import assert from 'node:assert/strict';
import {repairMission,parseSettings,maskPrefix,probe,verifyRepair,planIssues,repairComplete,settingsKey} from '../repair-model.js';
import {mission,initialRun,freshRescue,restoreRescue,creditRescue} from '../rescue-model.js';
test('All six faults and remixes start broken and accept a complete repair',()=>{
 for(let i=0;i<6;i++)for(const seed of [0,1,12,4294967295]){const m=repairMission(i,seed);assert.deepEqual(m,repairMission(i,seed));assert.equal(verifyRepair(m,m.initial).pass,false);const fixed=verifyRepair(m,m.good);assert.equal(fixed.pass,true);assert.equal(fixed.results.length,3);assert.ok(fixed.results.every(r=>r.steps.at(-1).node==='source'&&r.steps.at(-1).kind==='reply'));}
});
test('A broad mask bypasses the router and fails ARP for the remote server, but local probes work',()=>{
 const m=repairMission(1);assert.ok(probe(m,m.initial,'local').ok);assert.ok(probe(m,m.initial,'gateway').ok);const remote=probe(m,m.initial,'remote');assert.equal(remote.ok,false);assert.equal(remote.code,'arp-miss');assert.ok(!remote.steps.some(s=>s.node==='router'));assert.equal(remote.steps.at(-1).kind,'blocked');
});
test('A responding computer is not a router; missing/offlink/unassigned gateways fail precisely',()=>{
 const m=repairMission(2);assert.equal(probe(m,m.initial,'local').ok,true);assert.equal(probe(m,m.initial,'gateway').ok,true);assert.equal(probe(m,m.initial,'remote').code,'not-router');
 for(const [gateway,code] of [['','no-route'],['192.168.10.254','gateway-absent'],['192.168.90.1','offlink-gateway'],[m.good.ip,'self-gateway']]){const c={...m.good,gateway};assert.equal(probe(m,c,'remote').code,code);assert.equal(probe(m,c,'local').ok,true);assert.equal(verifyRepair(m,c).pass,false);}
});
test('Usable, unique alternative IPs are accepted; network, broadcast, duplicate and off-plan IPs are rejected',()=>{
 const m=repairMission(0);for(let n=0;n<=255;n++){const c={...m.good,ip:'192.168.10.'+n};assert.equal(verifyRepair(m,c).pass,![0,1,30,255].includes(n),String(n));}
 for(const [ip,code] of [['192.168.10.0','reserved-ip'],['192.168.10.255','reserved-ip'],[m.peer,'duplicate-ip'],[m.router,'duplicate-ip'],['10.0.0.20','wrong-ip']]){const p=probe(m,{...m.good,ip},'remote');assert.equal(p.code,code);assert.ok(p.steps.every(s=>s.node==='source'));}
});
test('Wrong narrower masks can still pass pings; plan validation prevents premature repair credit',()=>{
 const m=repairMission(0),c={...m.good,mask:'255.255.255.192'};assert.ok(verifyRepair(m,c).results.every(t=>t.ok));assert.ok(planIssues(m,c).some(i=>i.field==='mask'));assert.equal(verifyRepair(m,c).pass,false);
 const localViaRouter=probe(m,{...m.good,ip:'192.168.10.70',mask:'255.255.255.128'},'local');assert.equal(localViaRouter.ok,true);
 const narrow=probe(m,{...m.good,ip:'192.168.10.70',mask:'255.255.255.192'},'remote');assert.equal(narrow.code,'offlink-gateway');
});
test('Input parsing rejects invalid IPs and noncontiguous masks and normalizes slash masks',()=>{
 assert.equal(parseSettings({ip:'192.168.10.20',mask:'/24',gateway:''}).settings.mask,'255.255.255.0');assert.equal(maskPrefix('255.255.254.0'),23);assert.equal(maskPrefix('255.0.255.0'),null);
 for(const mask of ['/0','/31','/32','/33','255.0.255.0','bad'])assert.equal(parseSettings({ip:'192.168.10.20',mask,gateway:''}).ok,false);
 for(const ip of ['999.1.1.1','1.2.3','<img src=x>','192.168.010.20'])assert.equal(parseSettings({ip,mask:'/24',gateway:''}).ok,false);
 assert.equal(parseSettings({ip:'192.168.10.20',mask:'/24',gateway:'bad'}).ok,false);
});
test('Credit requires applied repairs, current verification, and no unapplied edits; replay preserves unique XP',()=>{
 const s=freshRescue();s.run=initialRun('repair',5);const m=mission('repair',5);assert.equal(creditRescue(s),false);
 s.run.config={...m.good};s.run.draft={...m.good};assert.equal(creditRescue(s),false,'must verify');s.run.verifiedKey=settingsKey(s.run.config);assert.equal(creditRescue(s),true);assert.equal(creditRescue(s),false);assert.deepEqual(s.completed.repair,[5]);
 s.run.solved=false;s.run.draft.gateway='';assert.equal(creditRescue(s),false,'unsaved draft');s.run.draft={...s.run.config};s.run.config.mask='255.255.0.0';s.run.draft={...s.run.config};s.run.verifiedKey=settingsKey(s.run.config);assert.equal(creditRescue(s),false,'forged evidence does not bypass plan');
 s.run.config={...m.good};s.run.draft={...m.good};s.run.verifiedKey=settingsKey(s.run.config);assert.equal(creditRescue(s),true);assert.deepEqual(s.completed.repair,[5]);
});
test('Progress migration keeps all earlier sectors and restores drafts without false completion',()=>{
 const old={version:1,completed:{bits:[1],slicer:[2],delivery:[3]},run:initialRun('delivery',2)};const p=restoreRescue(JSON.stringify(old));assert.deepEqual(p.completed,{bits:[1],slicer:[2],delivery:[3],repair:[]});assert.deepEqual(p.run,old.run);
 const s=freshRescue();s.run=initialRun('repair',2);s.run.draft.gateway='192.168.10.';s.run.probes=['local'];assert.deepEqual(restoreRescue(JSON.stringify(s)).run,s.run);
 const m=mission('repair',2);s.run.config={...m.good};s.run.draft={...m.good};s.run.verifiedKey=settingsKey(s.run.config);s.run.solved=true;assert.ok(restoreRescue(JSON.stringify(s)).run.solved);
 s.run.draft.ip='unfinished';assert.equal(restoreRescue(JSON.stringify(s)).run.solved,false);s.run.config.ip='<img src=x onerror=1>';const restored=restoreRescue(JSON.stringify(s));assert.deepEqual(restored.run.config,m.initial);assert.equal(restored.run.solved,false);assert.equal(repairComplete(m,restored.run),false);
});
