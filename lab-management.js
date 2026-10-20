import * as E from './lab-engine.js?v=class47';
export function routerPage(s,clientId,raw){
 let url;try{url=new URL(/^\d+\.\d+\.\d+\.\d+(?:\/|$)/.test(raw)?'http://'+raw:raw);}catch{return null;}
 const router=E.ofType(s,'router').find(d=>d.router.lan===url.hostname||(d.router.secondary&&d.router.second===url.hostname));
 if(!router)return null;
 const r=router.router,port=url.hostname===r.lan?'lan1':'lan2',base={management:true,device:router.id,address:url.hostname,url:'http://'+url.hostname,trace:[]};
 if(url.protocol!=='http:'||url.port&&url.port!=='80'||url.username||url.password||!['','/'].includes(url.pathname)||url.search||url.hash)return {...base,ok:false,why:'This router models its local setup page at http://'+url.hostname+' (HTTP port 80). Use that exact address.'};
 if(!E.powered(s,router.id))return {...base,ok:false,why:'The router is off or has no working power supply. Restore its power on the bench.'};
 const n=E.network(s,clientId);
 if(!n.ok){const subnet=E.subnetInfo(url.hostname,r.mask),candidate=subnet&&E.ipNumber(subnet.network)+10;const ip=candidate?[(candidate>>>24)&255,(candidate>>>16)&255,(candidate>>>8)&255,candidate&255].join('.'):'';return {...base,ok:false,why:n.why,bootstrap:n.ip?.startsWith('169.254.')&&r.mask==='255.255.255.0'?{ip,mask:r.mask,gateway:url.hostname,dns:url.hostname}:null};}
 if(!E.sameSubnet(n.ip,url.hostname,n.mask)||!E.sameSubnet(n.ip,url.hostname,r.mask))return {...base,ok:false,why:'The laptop and this router interface must be in the same local subnet for setup. Open laptop Network settings and check its address and mask.'};
 const path=E.path(s,n.endpoint,E.key(router.id,port));if(!path)return {...base,ok:false,why:'No local path to the router '+port.toUpperCase()+' port. Check the laptop cable, switch VLAN and router LAN cable. WAN is not the setup port.'};
 return {...base,ok:true,why:'Local router setup is reachable. Internet, DNS and NAT are not needed to open this numeric LAN address.',path,trace:['Laptop '+n.ip+' reaches router '+url.hostname+' over its LAN interface.','The local HTTP setup page opens on port 80. Credentials and TLS are not simulated here.']};
}
export function labConsoleAccess(s,clientId,id){const client=E.ready(s,clientId);if(!client.ok)return client;const d=E.find(s,id);if(!d)return {ok:false,why:'Select equipment first.'};if(['ap','switch'].includes(d.type)){
 if(!E.powered(s,d.id))return {ok:false,why:'Power the '+E.catalog[d.type].name+' before using its local setup utility.'};
 const c=E.find(s,clientId);if(c.osState?.adapterEnabled===false||c.osState?.driverInstalled===false)return {ok:false,why:'Enable the laptop adapter and install its driver first.'};
 let endpoint=E.key(c.id,'eth');if(c.network.wifi){const w=E.wifiAssociation(s,c.id);if(!w.ok)return w;endpoint=E.key(w.ap,'eth');}
 const ports=d.type==='ap'?['eth']:Object.keys(d.ports).filter(p=>p!=='ac');if(!ports.some(p=>E.path(s,endpoint,E.key(d.id,p))))return {ok:false,why:'Connect the laptop to this powered device through the local network first.'};
 return {ok:true,why:'Local setup utility. This teaching device has no separate management IP; the utility checks its physical LAN path.'};
 }return {ok:true,why:'Bench service simulator: these controls represent hands-on hardware, a locally attached setup screen and firmware tools. They do not claim remote access to an unbooted or uncabled server.'};}
