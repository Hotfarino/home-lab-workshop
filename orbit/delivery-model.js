/** One-way IPv4 unicast on two switched Ethernet LANs. No NAT, VLANs or policy routes. */
import {subnet,ipNumber,ipText,sameSubnet} from './network-game.js';
export const DELIVERY_TITLES=['Desk to desk','Across the router','The /26 surprise','One bigger neighborhood','The upper-half LAN','Across a /16 boundary'];
const examples=[
 ['192.168.10.20','192.168.10.30',24,'Send a design file to the next computer.'],
 ['192.168.10.20','192.168.20.30',24,'Deliver an update to the server in the other LAN.'],
 ['192.168.10.20','192.168.10.70',26,'The first three numbers match. Does that mean local? Check the mask!'],
 ['192.168.10.20','192.168.11.30',23,'The third number changed. Check whether this bigger subnet still contains both computers.'],
 ['192.168.10.130','192.168.10.150',25,'Find the neighborhood in the upper half of this address block.'],
 ['10.42.1.20','10.43.1.30',16,'A larger subnet still has a boundary. Deliver the final message.']
];
export function deliveryMission(index,seed=0){
 if(!Number.isInteger(index)||index<0||index>=examples.length)throw Error('Unknown delivery mission.');
 let [source,destination,prefix,story]=examples[index];
 if(seed){const offset=(seed>>>0)%10;source=ipText(ipNumber(source)+offset);destination=ipText(ipNumber(destination)+offset);}
 const sourceNet=subnet(source,prefix),destNet=subnet(destination,prefix),local=sameSubnet(source,destination,prefix);
 const gateway=sourceNet.first,remoteGateway=local?'172.20.1.1':destNet.first;
 const peer=local?destination:ipText(ipNumber(sourceNet.network)+30),remote=local?'172.20.1.30':destination;
 const explanation=local?`Both addresses belong to ${sourceNet.network}/${prefix}. The frame travels through the local switch to the other computer. This delivery does not use the router.`:`${sourceNet.network}/${prefix} and ${destNet.network}/${prefix} are different subnets. The sender uses gateway ${gateway}. The router forwards the packet into the destination LAN.`;
 return {source,destination,prefix,mask:sourceNet.mask,sourceNet:sourceNet.network,destNet:destNet.network,gateway,remoteGateway,peer,remote,local,route:local?'local':'gateway',story,explanation};
}
export const DELIVERY_TERMS=[
 {term:'Packet',definition:'A small unit of network-layer data. An IPv4 packet carries source and destination IP addresses.',use:'A file normally travels as many packets. Here we slow down one example packet.'},
 {term:'Frame',definition:'The local-link envelope around a packet. An Ethernet frame has source and destination MAC addresses.',use:'At a router, the old Ethernet envelope is removed and a new one is made for the outgoing link.'},
 {term:'ARP',definition:'Address Resolution Protocol. On an IPv4 Ethernet LAN, it finds the MAC address for a next-hop IP address.',use:'For a remote destination, a PC resolves the gateway’s local MAC address, not the remote computer’s MAC.'},
 {term:'MAC address',definition:'Media Access Control address. This identifies an interface for local-link delivery. It is different from an IP address.',use:'The local frame goes to the peer’s MAC for local traffic, or the router’s LAN MAC for routed traffic.'},
 {term:'Switch',definition:'An Ethernet switch forwards frames within a LAN using MAC addresses. Our switches are Layer 2 switches.',use:'Two computers in this LAN can exchange data through their switch without going through the router.'},
 {term:'Router',definition:'A device that forwards IP packets between networks using a routing table.',use:'The default gateway is the router a host uses when no more specific route applies.'},
 {term:'TTL',definition:'Time To Live. An IPv4 field that limits how far a packet can be forwarded. A router decreases it; a Layer 2 switch does not.',use:'Our packet starts at 64. After one router it is 63. A router discards a packet whose TTL expires; starting values vary by system.'}
];
export const DELIVERY_SOURCES=[
 {name:'RFC 1122 §3.3.1 • Local versus remote delivery',url:'https://www.rfc-editor.org/rfc/rfc1122#section-3.3.1'},
 {name:'RFC 826 • Address Resolution Protocol',url:'https://www.rfc-editor.org/rfc/rfc826'},
 {name:'RFC 1812 §5.2 • Router forwarding and TTL',url:'https://www.rfc-editor.org/rfc/rfc1812#section-5.2'}
];
export const DELIVERY_NODES={source:[90,200],switch:[270,200],peer:[270,76],router:[470,200],farSwitch:[660,200],remote:[840,200]};
export function deliveryTrace(m){
 const next=m.local?m.destination:m.gateway,localMac=m.local?'02:00:00:00:00:02':'02:00:00:00:00:01';
 const initial={ttl:64,sourceMAC:'02:00:00:00:00:20',destinationMAC:localMac,nextHop:next};
 const step=(node,title,text,extra={})=>({...initial,node,title,text,...extra});
 const trace=[
  step('source','1. Read the addresses',`I’m the sender, ${m.source}. My mask is ${m.mask}. Applying it gives my network ${m.sourceNet} and the destination’s network ${m.destNet}. ${m.local?'They match: stay local.':'They differ: use my gateway.'}`,{destinationMAC:'Not resolved yet'}),
  step('source','2. Find the next-hop MAC',`ARP means Address Resolution Protocol. With an empty ARP cache, I ask the local LAN for the MAC of ${next}. ${m.local?'That is the other computer.':'That is my gateway, not the remote computer.'} Its reply lets me build an Ethernet frame. The diagram follows our data packet after ARP; the ARP broadcast is not animated.`),
  step('switch','3. Cross the local switch',`The switch reads the frame’s destination MAC and forwards it toward ${m.local?'the other computer':'the gateway'}. It does not reduce the IP packet’s TTL. Our switch has already learned the MAC locations.`)
 ];
 if(m.local){trace.push(step('peer','4. Reach the other computer',`Delivered across the local LAN! The router stayed out of the path. The IP destination is still ${m.destination}, and TTL is still 64.`));}
 else{
  trace.push(step('router','4. Reach the gateway',`The frame reached gateway ${m.gateway}. Its MAC was the local delivery address, but the IP destination is still ${m.destination}. The router removes the incoming Ethernet envelope.`));
  const forwarded={ttl:63,sourceMAC:'02:00:00:00:01:01',destinationMAC:'02:00:00:00:01:30',nextHop:m.destination};
  trace.push(step('router','5. Route and re-wrap',`The router finds a route to ${m.destNet}/${m.prefix} through its ${m.remoteGateway} interface. It reduces TTL from 64 to 63 and resolves the destination’s MAC on that LAN if needed. It builds a new Ethernet frame. The IP source and destination stay the same here; this lab does not use NAT.`,forwarded));
  trace.push(step('farSwitch','6. Cross the destination switch',`The second switch forwards the new frame to the destination computer. It uses the local MAC address. TTL stays 63; this switch is not another router hop.`,forwarded));
  trace.push(step('remote','7. Reach the destination',`The packet reached ${m.destination}. The router connected two different LANs. A remote LAN does not have to be the internet.`,forwarded));
 }
 const last=trace.at(-1);trace.push({...last,title:`${trace.length+1}. Open the delivery`,text:`The destination accepts the frame and reads the packet for its IP address. Mission delivered! ${m.local?'Same subnet: use the local switch.':'Different subnet: use the gateway in this simple setup.'} This is a one-way example. A reply makes its own routing decision in the other direction.`});
 return trace;
}
export function deliveryHint(m){return `Use the mask ${m.mask} (/${m.prefix}) on both IP addresses. You get ${m.sourceNet} and ${m.destNet}. ${m.local?'Same network: choose Stay on this LAN.':'Different networks: choose Use the gateway.'} The entire prefix matters, not just matching dots.`;}
export function deliveryCheck(m,route){return {pass:route===m.route,text:route===m.route?`Good route! ${m.explanation}`:!route?'Choose a route before launching your packet.':m.local?`These addresses are in the SAME /${m.prefix} subnet. They share one switch and LAN, so this delivery can stay local. Try Stay on this LAN.`:`The mask puts these addresses in DIFFERENT networks. A Layer 2 switch cannot route between them. Try Use the gateway.`};}
export function deliveryComplete(m,run){return run.route===m.route&&Number.isInteger(run.deliveryStep)&&run.deliveryStep===deliveryTrace(m).length-1;}
