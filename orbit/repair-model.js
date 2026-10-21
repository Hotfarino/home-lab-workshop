/** Small IPv4 fault lab: one router, two Ethernet LANs, working links, no NAT or firewall drops. */
import {parseIP,ipNumber,ipText,maskFor,subnet,sameSubnet} from './network-game.js';
export const REPAIR_TITLES=['Offline workbench','Local works, remote fails','The false doorway','No way out','Address at the edge','After the move'];
export const REPAIR_SOURCE={name:'Microsoft • TCP/IP addressing and troubleshooting',url:'https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/tcpip-addressing-and-subnetting'};
export function repairMission(index,seed=0){
 if(!Number.isInteger(index)||index<0||index>5)throw Error('Unknown repair mission.');
 const a=seed?30+(seed>>>0)%80:10,b=seed?150+(seed>>>0)%80:20;
 const lan=`192.168.${a}`,far=`192.168.${b}`,good={ip:lan+'.20',mask:'255.255.255.0',gateway:lan+'.1'};
 const broken=[{ip:'192.168.250.20'},{mask:'255.255.0.0'},{gateway:lan+'.30'},{gateway:''},{ip:lan+'.255'},{ip:'192.168.250.20',mask:'255.255.0.0',gateway:lan+'.254'}][index];
 const stories=[
 'A workbench computer cannot reach the team. The cable is connected. Compare its address with the lab’s network plan.',
 'The nearby computer responds, but the remote server does not. Find out why the sender chooses the wrong path.',
 'The configured gateway answers a ping, but remote packets still fail. A reply alone does not prove a device can route.',
 'Local sharing works. The remote server is unreachable. Find the missing setting that tells the computer how to leave its LAN.',
 'Someone used the last address in the subnet for this computer. Find a usable, unique host address.',
 'This computer kept old settings after a move. More than one setting is wrong. Fix it, then verify every connection.'
 ];
 return {title:REPAIR_TITLES[index],story:stories[index],good,initial:{...good,...broken},lan:lan+'.0',prefix:24,peer:lan+'.30',router:lan+'.1',remote:far+'.30',remoteGateway:far+'.1',remoteNet:far+'.0',explanation:'You checked the address plan, used a unique host IP and the correct mask, then verified the router and both computers. Local traffic stays on the LAN; remote traffic goes through the real gateway.'};
}
export function maskPrefix(text){
 const v=String(text??'').trim();if(/^\/(?:[0-9]|[12][0-9]|3[0-2])$/.test(v))return +v.slice(1);
 if(!parseIP(v))return null;for(let p=0;p<=32;p++)if(maskFor(p)===v)return p;return null;
}
export function parseSettings(values){
 const ip=String(values?.ip??'').trim(),mask=String(values?.mask??'').trim(),gateway=String(values?.gateway??'').trim(),prefix=maskPrefix(mask),errors={};
 if(!parseIP(ip))errors.ip='Use four numbers from 0 to 255, separated by dots. Example: 192.168.10.20.';
 if(prefix===null)errors.mask='Use a contiguous subnet mask, such as 255.255.255.0, or slash notation such as /24.';
 else if(prefix<1||prefix>30)errors.mask='This Ethernet LAN exercise supports /1–/30. /31 point-to-point links and /32 host routes are different cases.';
 if(gateway&&!parseIP(gateway))errors.gateway='Use an IPv4 address, or leave this blank to test a missing gateway.';
 return {ok:Object.keys(errors).length===0,errors,settings:{ip,mask:prefix!==null?maskFor(prefix):mask,gateway},prefix};
}
export function sourceIssue(m,c){
 const p=parseSettings(c);if(!p.ok)return {code:'format',text:'A setting has an invalid format. Correct it before sending a probe.'};
 const n=subnet(c.ip,m.prefix);
 if(n.network!==m.lan)return {code:'wrong-ip',text:`Your IP ${c.ip} is outside the assigned ${m.lan}/${m.prefix} LAN. Our configuration precheck stops the probe. Choose an unused host IP from this LAN.`};
 if(c.ip===n.network||c.ip===n.broadcast)return {code:'reserved-ip',text:`${c.ip} is the ${c.ip===n.network?'network':'broadcast'} address of this /${m.prefix} LAN. It is not a host address. The configuration precheck stops the probe.`};
 if([m.router,m.peer].includes(c.ip))return {code:'duplicate-ip',text:`${c.ip} already belongs to ${c.ip===m.router?'the router':'the local computer'}. Two devices need different IPs. The duplicate-address precheck stops the probe.`};
 // A configured mask can also turn an otherwise free address into a reserved address.
 const own=subnet(c.ip,p.prefix);if(c.ip===own.network||c.ip===own.broadcast)return {code:'reserved-mask',text:`With the entered mask, ${c.ip} becomes a network or broadcast address. Recheck the mask against the plan.`};
 return null;
}
export function planIssues(m,c){
 const out=[],p=parseSettings(c);if(!p.ok)return Object.entries(p.errors).map(([field,text])=>({field,text}));
 const bad=sourceIssue(m,c);if(bad)out.push({field:bad.code==='reserved-mask'?'mask':'ip',text:bad.text});
 if(p.prefix!==m.prefix)out.push({field:'mask',text:`The plan requires ${m.good.mask} (/${m.prefix}). Your mask is ${c.mask} (/${p.prefix}). Some pings may still work with a wrong mask; that does not make the configuration correct.`});
 if(c.gateway!==m.router)out.push({field:'gateway',text:!c.gateway?`No default gateway is configured. Use the router's LAN IP from the plan (${m.router}) to reach the other LAN.`:`The gateway must be the router's LAN IP, ${m.router}. ${c.gateway===m.peer?'Your current entry belongs to a computer, not a router.':c.gateway===c.ip?'Your current entry points back to this computer.':'The current entry does not identify the router in this lab.'}`});
 return out;
}
export const PROBE_NAMES={local:'Local computer',gateway:'Configured gateway',remote:'Remote server'};
export function probe(m,c,target='remote'){
 if(!Object.hasOwn(PROBE_NAMES,target))throw Error('Unknown probe target.');
 const destination=target==='local'?m.peer:target==='gateway'?c.gateway:m.remote;
 const steps=[],add=(node,text,kind='data')=>steps.push({node,text,kind});
 add('source',`Test ${PROBE_NAMES[target].toLowerCase()}${destination?' at '+destination:''}. A ping uses ICMP: Internet Control Message Protocol. We need a request AND a reply.`);
 const finish=(ok,code,text)=>{add(steps.at(-1).node,text,ok?'reply':'blocked');return {target,destination,ok,code,text,steps};};
 const sourceError=sourceIssue(m,c);if(sourceError)return finish(false,sourceError.code,sourceError.text);
 if(!destination)return finish(false,'no-gateway','There is no configured gateway to test. Local traffic may work, but a remote destination needs a route.');
 const p=maskPrefix(c.mask),onLink=sameSubnet(c.ip,destination,p),actualLocal=[m.peer,m.router,c.ip].includes(destination);
 if(destination===c.ip)return finish(true,'self','This ping returns to your own IP. It does not test the cable or prove that the gateway routes traffic.');
 if(onLink){
  add('switch',`The sender's /${p} mask treats ${destination} as local. It asks this LAN for that IP's MAC address using ARP.`, 'arp');
  if(!actualLocal)return finish(false,'arp-miss',`${destination} has no matching interface on this Ethernet LAN, so ARP receives no reply. ${destination===m.remote?'The mask made a remote server look local. The data packet never reaches the router.':'The gateway entry may point to an unused address.'}`);
  add(destination===m.router?'router':'peer',`ARP resolved the destination. The switch delivers the ICMP request to ${destination}.`);
 }else{
  add('source',`The sender's /${p} mask treats ${destination} as remote. It looks for its default gateway.`);
  if(!c.gateway)return finish(false,'no-route','There is no default route. The computer has no next hop for this off-link destination. Local traffic can still work.');
  if(!sameSubnet(c.ip,c.gateway,p))return finish(false,'offlink-gateway',`Gateway ${c.gateway} is outside the sender's configured subnet. This simple LAN needs an on-link gateway. Check the mask and gateway.`);
  if(c.gateway===c.ip)return finish(false,'self-gateway','The gateway points back to this computer. It cannot route the packet to the other LAN.');
  add('switch',`ARP looks for the gateway at ${c.gateway} on the local LAN.`, 'arp');
  if(c.gateway!==m.router){
   if(c.gateway===m.peer){add('peer',`The gateway entry resolves to the local computer at ${m.peer}.`);return finish(false,'not-router','That computer can answer a ping to itself, but it does not forward this packet. Use the router’s LAN interface as the gateway.');}
   return finish(false,'gateway-absent',`No device at ${c.gateway} replies to ARP. The packet is waiting for the next-hop MAC. Compare the gateway with the network plan.`);
  }
  add('router',`The real gateway receives the packet. It looks up the destination route and reduces the forwarded packet's TTL.`);
  if(destination===m.remote){add('farSwitch','The router builds a new Ethernet frame on its other LAN. The remote switch forwards it.');add('remote',`The server at ${m.remote} receives the request.`);}
  else if(destination===m.peer){add('switch','The router forwards back onto this same LAN. The mask caused an unnecessary router trip.');add('peer','The local computer receives the request. A successful ping does not prove the mask matches the plan.');}
  else if(destination!==m.router)return finish(false,'no-route','This router has no route to the requested network. The lab has only the two connected LANs shown.');
 }
 // All other nodes have the planned /24 masks and correct return routes.
 if(destination===m.remote){add('farSwitch','The server sends an ICMP echo reply through its switch toward its gateway.','reply');add('router','The reply crosses the router back toward the sender’s LAN.','reply');}
 add('switch','The reply travels through the local switch.','reply');add('source',`Reply received from ${destination}. The round trip works.`,'reply');
 return {target,destination,ok:true,code:'reply',text:destination===m.peer&&target==='gateway'?'This address answers, but the plan identifies it as a computer. A gateway ping alone does not prove forwarding.':`Reply received from ${destination}.`,steps};
}
export function verifyRepair(m,c){const results=Object.keys(PROBE_NAMES).map(t=>probe(m,c,t)),issues=planIssues(m,c);return {pass:issues.length===0&&results.every(r=>r.ok),results,issues};}
export const settingsKey=c=>JSON.stringify([c.ip,c.mask,c.gateway]);
export function repairComplete(m,r){return !!r.config&&!!r.draft&&settingsKey(r.draft)===settingsKey(r.config)&&r.verifiedKey===settingsKey(r.config)&&verifyRepair(m,r.config).pass;}
export function repairHints(m,r){const issues=planIssues(m,r.config),bad=issues[0];return [
 'Start with evidence. Inspect the settings, test the local computer, then test the remote server. Notice where the request or reply stops.',
 bad?bad.text:'The settings match the plan. Use Verify all connections to prove the local computer, gateway and remote server work.',
 `One working example: IP ${m.good.ip}, mask ${m.good.mask}, gateway ${m.router}. Other unused host IPs in this /24 are accepted too. Apply your edit, then verify all connections.`
 ];}
export function repairCoach(m,r){if(r.solved)return 'Repair proved! Your settings match the plan and all three connection checks passed. You followed the full cycle: inspect, test, repair, verify.';if(r.repairMessage)return r.repairMessage;if(r.probes?.length)return 'Use the result as evidence. Compare your settings with the plan, change one setting, Apply settings, and run the same test again. Finish with Verify all connections.';return 'Let’s investigate before changing anything. Open Inspect settings to see what this computer is using. Then test the local computer and the remote server. I’ll explain what each result tells us.';}
export function repairExplain(m){return `<h3>Four steps to a reliable repair</h3><ol><li><strong>Inspect:</strong> compare the actual settings with the trusted network plan.</li><li><strong>Test:</strong> a local ping checks a different path from a remote ping. A reply from an address proves that address responded; it does not prove the device is a router.</li><li><strong>Repair:</strong> use a unique, usable IP in the planned LAN, the planned mask, and the router's LAN IP as gateway. Apply one change at a time so you can connect cause and effect.</li><li><strong>Verify:</strong> check local, gateway and remote traffic again. The full mission also checks the mask and address plan; one green result is not enough.</li></ol><h3>What each setting does</h3><p><strong>IP address:</strong> this interface's address. In this /24, the .0 address names the network and .255 is broadcast; neither is a host address. This is based on this mask, not a universal rule about .0 and .255.</p><p><strong>Subnet mask:</strong> separates the network bits from host bits. A mask that is too broad can make a computer ARP locally for a server that is actually behind the router. A narrower wrong mask can still allow some traffic through a router. We check the plan as well as pings.</p><p><strong>Default gateway:</strong> the next-hop router for destinations without a more specific route. Local neighbors do not need it. In this lab the router is ${m.router}, and the nearby computer ${m.peer} does not forward packets.</p><h3>Simulation boundaries</h3><p>These are simulated ICMP echo requests and replies, not real network commands. Cables, switches, return routes and firewalls are known to work. The lab prechecks invalid, duplicate or out-of-plan source addresses before sending. ARP attempts are shown as amber markers; they are not the IP data packet. In real life, failed pings can also come from firewall rules or disabled ICMP. No DNS lookup is involved because we test numeric IPs. This is a private two-LAN network with no NAT, VLANs or extra routes.</p><p><a href="${REPAIR_SOURCE.url}" target="_blank" rel="noopener noreferrer">${REPAIR_SOURCE.name} ↗</a></p>`;}
