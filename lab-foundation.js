import * as E from './lab-engine.js?v=class47';
const d=(s,t)=>E.ofType(s,t)[0];
export function foundationIssues(s,kind='network'){
 if(!s||!Array.isArray(s.devices)||!Array.isArray(s.links)||!Array.isArray(s.vms))return ['The saved foundation is damaged or incomplete. Validate and save a new working build.'];
 const issues=[],check=(ok,msg)=>{if(!ok)issues.push(msg)};
 for(const t of ['laptop','ont','router','switch','pdu'])check(d(s,t)&&E.powered(s,d(s,t).id),'Power the '+t+'.');
 const r=d(s,'router')?.router;check(r?.lan==='192.168.50.1'&&r.mask==='255.255.255.0'&&r.dhcp&&r.start===100&&r.end===150&&r.dns==='192.168.50.1'&&!r.secondary,'Use the foundation router: LAN 192.168.50.1/24, DHCP pool 100–150, DNS 192.168.50.1, LAN2 bridging.');
 const c=d(s,'laptop');check(c?.network.mode==='dhcp'&&!c.network.wifi,'Keep the foundation laptop on wired DHCP.');
 const web=c?E.test(s,c.id,'internet','https'):{ok:false,why:'Laptop missing'};check(web.ok,'Laptop web path: '+web.why);
 if(kind==='server'){const h=d(s,'server');check(h?.cpu==='AM4-8'&&h.ram===32&&h.cooler&&h.nic==='1g','Server needs AM4-8, 32 GB RAM, cooler and 1 Gb/s NIC.');check(h?.rails&&h.rack===4,'Support the server at U4.');check(h?.disks.length===4&&h.disks.every(x=>x.tb===1&&!x.failed)&&h.raid==='10'&&E.raidStatus(h).ok,'Server needs four healthy 1 TB drives in RAID 10.');check(h?.os==='Hypervisor'&&h.drivers&&h.virt,'Install Hypervisor, load drivers and enable firmware virtualization.');check(h?.network.mode==='dhcp','Use DHCP on the host.');const test=h?E.test(s,h.id,'internet','https'):{ok:false,why:'Host missing'};check(test.ok,'Server web path: '+test.why);}
 return issues;
}
export function makeFoundation(s,kind='network'){
 const issues=foundationIssues(s,kind);if(issues.length)return {ok:false,issues};
 const copy=JSON.parse(JSON.stringify(s)),types=['laptop','ont','router','switch','pdu','ups','surge',...(kind==='server'?['server']:[])],keep=new Set(['wall','isp']);for(const t of types){const x=d(copy,t);if(x)keep.add(x.id);}
 copy.devices=copy.devices.filter(x=>keep.has(x.id));copy.links=copy.links.filter(x=>keep.has(x.a)&&keep.has(x.b));copy.vms=[];copy.cloud=E.fresh().cloud;copy.selected=d(copy,'laptop').id;copy.assessment=undefined;copy.walkthrough={index:kind==='server'?37:22,webTest:true,serverTest:kind==='server'};copy.desktopProgress={opened:true,machines:{}};copy.events=['Validated '+kind+' foundation loaded.'];copy.step=0;
 const final=foundationIssues(copy,kind);return final.length?{ok:false,issues:final}:{ok:true,kind,state:copy};
}
export const foundationKey='home-lab-foundations-v1';
export function checkpointStart(mission,records){const kind=['virtual','cloud'].includes(mission)&&records?.server?'server':'network',record=records?.[kind]||(kind==='network'?records?.server:null);if(!record)return {ok:false,issues:['Complete and save a working network foundation first.']};try{const r=makeFoundation(record,kind);if(r.ok)r.state.mission=mission;return r;}catch{return {ok:false,issues:['The saved foundation contains invalid equipment or settings. Validate and save a new working build.']};}}
