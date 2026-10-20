import assert from 'node:assert/strict';
import * as E from './lab-engine.js';
import {buildTemplate} from './lab-planner.js';
import {learningSteps} from './lab-learning.js';
import {coachLesson} from './lab-coach.js';
import {makeFoundation,foundationIssues,checkpointStart} from './lab-foundation.js';
import {challengeCases,createChallenge,challengeResult} from './lab-challenges.js';
const device=(s,t)=>E.ofType(s,t)[0],task=(mission,title)=>learningSteps(mission).find(x=>x.title===title);
const s=buildTemplate('vm');
assert.equal(learningSteps('virtual').length,48);assert.equal(learningSteps('wired').length,42);
for(const mission of ['wired','nas','virtual','wifi','routed','cloud','trouble','free'])for(const st of learningSteps(mission)){
 assert.equal(typeof st.checks,'function');const lesson=coachLesson(st);assert.ok(lesson.terms.length,st.title+' needs definitions');assert.ok(lesson.recap.includes(st.title));assert.ok(lesson.answer.length>15);assert.ok(Array.isArray(st.issues(E.fresh(mission))));
}
const routed=task('routed','Create the second router subnet'),r=device(s,'router').router;Object.assign(r,{secondary:true,second:'192.168.60.1'});assert.ok(routed.pass(s));
for(const [key,bad]of [['dhcp',false],['routing',false],['mask','255.255.0.0'],['second','192.168.61.1']]){const old=r[key];r[key]=bad;assert.equal(routed.pass(s),false,key);assert.ok(routed.issues(s).some(x=>x.includes('currently')));r[key]=old;}r.secondary=false;
const wifi=buildTemplate('home'),c=device(wifi,'laptop');Object.assign(c.network,{wifi:true,ssid:'HomeLab',password:'learnlab123'});const join=task('wifi','Join from the laptop');assert.ok(join.pass(wifi));c.network.mode='static';assert.equal(join.pass(wifi),false,'association alone must not pass DHCP requirement');
const mount=task('wired','Mount the server at U4'),h=device(s,'server');assert.ok(mount.pass(s));h.rails=false;assert.equal(mount.pass(s),false,'rack position without support does not pass');h.rails=true;
assert.equal(makeFoundation(E.fresh()).ok,false);assert.deepEqual(foundationIssues(s,'server'),[]);
const network=makeFoundation(s,'network'),server=makeFoundation(s,'server');assert.ok(network.ok);assert.ok(server.ok);assert.equal(network.state.vms.length,0);assert.equal(device(network.state,'server'),undefined);assert.equal(server.state.walkthrough.index,37);
const resume=checkpointStart('virtual',{network:network.state,server:server.state});assert.ok(resume.ok);assert.equal(resume.state.mission,'virtual');assert.equal(resume.state.walkthrough.index,37);
const corrupt=structuredClone(server.state);device(corrupt,'router').router.dns='192.168.50.250';assert.equal(checkpointStart('virtual',{server:corrupt}).ok,false,'saved checkpoint is revalidated');assert.equal(checkpointStart('wifi',{network:{}}).ok,false);assert.equal(checkpointStart('virtual',{server:{devices:[],links:[],vms:[]}}).ok,false);
for(const id of Object.keys(challengeCases)){
 const state=createChallenge(id);assert.equal(challengeResult(state).ok,false,id+' must begin with a failing goal');
 if(id==='cable')state.links.forEach(l=>l.broken=false);
 if(id==='dns')device(state,'router').router.dns='192.168.50.1';
 if(id==='address')device(state,'laptop').network.gateway='192.168.50.1';
 if(id==='wifi')device(state,'laptop').network.password='learnlab123';
 if(id==='vlan')device(state,'switch').ports.p2.vlan=1;
 if(id==='guest')state.vms.find(v=>v.name==='Web-Lab').mode='external';
 const good=challengeResult(state);assert.equal(good.ok,true,id+' correct fix');assert.equal(good.percent,100);assert.equal(good.hints,0);
 device(state,'laptop').on=false;assert.equal(challengeResult(state).ok,false,id+' must not keep stale credit');
}
const guest=createChallenge('guest'),v=guest.vms.find(x=>x.name==='Web-Lab');v.mode='external';v.ram=2;assert.equal(challengeResult(guest).ok,false,'working HTTPS is insufficient with wrong requested RAM');
console.log('PASS: definitions/recaps for every task, strict routed/Wi-Fi/rack requirements, distinct VM curriculum, validated/rechecked/pruned foundations, malformed checkpoint rejection, six independent faults and fixes, fresh results and wrong VM resources.');

const cloud=buildTemplate('vm'),host=device(cloud,'server');Object.assign(cloud.cloud,{model:'hybrid',service:'iaas',account:true,backup:true,sourceName:host.name,sourceId:host.id});const backup=task('cloud','Select the server as backup source');assert.ok(backup.pass(cloud));cloud.cloud.sourceId='nas999';assert.equal(backup.pass(cloud),false,'a matching source name must not hide the wrong backup device');

const isolated=buildTemplate('vm'),iv=isolated.vms.find(v=>v.name==='Web-Lab');iv.mode='private';isolated.walkthrough={privateVmTest:true};const isolate=task('virtual','Observe Private isolation');assert.ok(isolate.pass(isolated));iv.ram=2;assert.equal(isolate.pass(isolated),false,'expected isolation failure cannot hide wrong guest resources');iv.ram=4;device(isolated,'laptop').on=false;assert.equal(isolate.pass(isolated),false,'expected isolation failure cannot hide a broken physical client');

for(const id of Object.keys(challengeCases)){const deleted=createChallenge(id);deleted.devices=deleted.devices.filter(x=>x.type!=='laptop');assert.equal(challengeResult(deleted).ok,false);assert.match(challengeResult(deleted).checks[0].detail,/Missing laptop/);}
