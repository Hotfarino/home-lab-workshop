import * as E from './lab-engine.js?v=class47';

const names={wired:'Home network → rack → VMs',nas:'Shared storage & RAID',virtual:'Virtual machines',wifi:'Wi-Fi network',routed:'Routed networks',cloud:'Cloud backup',trouble:'Troubleshooting',free:'Free build'};
export function screenPolicy(s){
 const mission=s.mission||'wired',all=mission==='free';
 const vm=all||['wired','virtual'].includes(mission),cloud=all||mission==='cloud',wifi=all||mission==='wifi';
 const service=all||['wired','virtual','nas','cloud','trouble'].includes(mission);
 return {name:names[mission]||names.wired,vm,cloud,wifi,service,
  apps:['lab','repos','terminal','settings','browser','firefox','tools',...(vm?['vms']:[]),...(cloud?['cloud']:[])],
  lessons:['start','shell','ip','subnet','dhcp','windows','linux','ports','diagnose',...(wifi?['wifi']:[]),...(vm?['vm']:[]),...(cloud?['cloud']:[])],
  projects:['read','static','dns','page','automatic',...(wifi?['wifi']:[]),...(vm?['service']:[]),...(cloud?['cloud']:[])]};
}
export function commandAllowed(s,command){
 const p=screenPolicy(s);
 if(/^(Get-VM(?:Switch)?|Connect-VMNetworkAdapter)\b/i.test(command)&&!p.vm)return false;
 if(/^(?:(?:Get|Start|Stop|Restart)-Service|net (?:start|stop)|services\.msc|tasklist|Get-NetTCPConnection)\b/i.test(command)&&!p.service)return false;
 if(/^(?:sudo )?systemctl\b/.test(command)&&!p.service)return false;
 return true;
}
// The display belongs to a powered physical client. Remote consoles also need a
// management path to the host; a guest's private switch does not block its console.
export function screenSession(s,targetId,clientId){
 const target=E.find(s,targetId),vm=s.vms.find(v=>v.id===targetId);
 const client=target?.type==='laptop'?target:E.find(s,clientId)?.type==='laptop'?E.find(s,clientId):E.ofType(s,'laptop').find(d=>E.ready(s,d.id).ok);
 if(!client)return {ok:false,why:'Add and power a laptop first. Server and VM consoles open on that computer’s screen.'};
 const ready=E.ready(s,client.id);if(!ready.ok)return {ok:false,why:client.name+': '+ready.why};
 if(!target&&!vm)return {ok:false,why:'This computer or VM is no longer in the lab.'};
 if(vm&&!screenPolicy(s).vm)return {ok:false,why:'VM consoles are enabled in Home network → rack → VMs, Virtual machines and Free build.'};
 if(target?.type==='laptop')return {ok:true,client:client.id,target:targetId,remote:false};
 const host=vm?E.find(s,vm.host):target;
 if(host?.type!=='server')return {ok:false,why:'Choose a laptop or server console.'};
 const path=E.test(s,client.id,host.id,'ping');if(!path.ok)return {ok:false,why:'Management path from '+client.name+' to '+host.name+' is unavailable. '+path.why};
 const status=vm?E.vmStatus(s,vm):E.ready(s,host.id);if(!status.ok)return status;
 return {ok:true,client:client.id,target:targetId,remote:true,host:host.id};
}
