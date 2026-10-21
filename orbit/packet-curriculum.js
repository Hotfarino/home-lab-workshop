import {freshNetwork,bits,subnet,maskFor,classify,sameSubnet,parseIP,prefixFor,ipNumber,ipText} from './packet-core.js';
export const SOURCES=[
 ['a','CompTIA A+ 220-1201 · final objectives v3.0','https://assets.ctfassets.net/82ripq7fjls2/1oSdlyujpaX3GrM0rir6Ge/91afb2be72785281e8fb4c0d9a70c6f4/CompTIA-A-220-1201-Exam-Objectives-3.0.pdf'],
 ['n','CompTIA Network+ N10-009 · final objectives v4.0','https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-network-n10-009-exam-objectives-(4-0)-(1).pdf'],
 ['win','Microsoft · TCP/IP settings','https://support.microsoft.com/en-us/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows'],
 ['ipconfig','Microsoft · ipconfig','https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig'],
 ['nslookup','Microsoft · nslookup','https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup'],
 ['ping','Microsoft · ping','https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping'],
 ['ubuntu','Canonical · manual IPv4 settings','https://help.ubuntu.com/stable/ubuntu-help/net-manual.html'],
 ['linux','iproute2 · upstream ip command manual','https://man7.org/linux/man-pages/man8/ip.8.html'],
 ['mac','Apple · TCP/IP settings','https://support.apple.com/guide/mac-help/change-tcpip-settings-mh14129/mac'],
 ['maccli','Apple · route command manual','https://github.com/apple-oss-distributions/network_cmds/blob/main/route.tproj/route.8'],
 ['ifconfig','Apple · ifconfig command manual','https://github.com/apple-oss-distributions/network_cmds/blob/main/ifconfig.tproj/ifconfig.8'],
 ['private','RFC 1918 · private ranges','https://www.rfc-editor.org/rfc/rfc1918'],
 ['special','IANA · special-purpose IPv4 registry','https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml'],
 ['linklocal','RFC 3927 · link-local','https://www.rfc-editor.org/rfc/rfc3927'],
 ['31','RFC 3021 · point-to-point /31','https://www.rfc-editor.org/rfc/rfc3021']
].map(([id,title,url])=>({id,title,url}));
export const CHAPTERS=[
 ['Bits','Switches make numbers','Supporting binary instruction; A+ 2.6 / Network+ 1.7 context','a'],
 ['Octets','Eight switches, 256 patterns','Supporting binary instruction; A+ 2.6 / Network+ 1.7 context','a'],
 ['IPv4','Build a unique address','A+ 220-1201 2.6 · Network+ N10-009 1.7','a'],
 ['Address types','Know where an address belongs','A+ 220-1201 2.6 · Network+ N10-009 1.7','n'],
 ['Configuration','Give each setting a job','A+ 220-1201 2.4, 2.6 · Network+ N10-009 3.4','a'],
 ['Network boundaries','Address AND mask','A+ 2.6 foundations; Network+ 1.7 subnetting extension','n'],
 ['Subnetting','Split the space','Network+ N10-009 1.7 extension beyond A+ setup','n'],
 ['Applied troubleshooting','Fix it, then prove it','A+ 220-1201 5.5; Network+ N10-009 5.3 / 5.5 extensions','a']
].map(([name,subtitle,mapping,source],i)=>({id:i,name,subtitle,mapping,source}));
export const TERMS=[
 ['Bit','Binary digit','One 0 or 1.','A switch can hold 0 (off) or 1 (on).'],
 ['Binary','Base-two number system','A way to write numbers using 0 and 1.','1010 = 8 + 2 = decimal 10. Binary is not limited to eight bits.'],
 ['Decimal','Base-ten number system','The number system using digits 0 through 9.','Ten dots are written 10 in decimal, 1010 in binary.'],
 ['Byte','Eight-bit unit','A group of eight bits in modern computers.','One byte can hold an unsigned value 0–255.'],
 ['Octet','Exactly eight bits','An eight-bit group, often part of an IP address.','192.168.1.20 has four octets.'],
 ['IP','Internet Protocol','Rules for addressing and moving packets between networks.','An address gives routers a destination to work toward.'],
 ['IPv4','Internet Protocol version 4','Uses 32-bit addresses in four octets.','192.168.1.20 = four eight-bit groups.'],
 ['IPv6','Internet Protocol version 6','Uses 128-bit addresses.','2001:db8::1 is a documentation example. IPv6 has no broadcast; do not apply IPv4 broadcast rules.'],
 ['Address','Network interface identifier','A number used to identify an interface in a network.','An interface needs an address suitable for its subnet.'],
 ['Host','Network endpoint','A computer or other device that sends or receives traffic.','A laptop and printer are hosts.'],
 ['Packet','Addressed unit of network data','A piece of data with information about where it should go.','Like a small delivery with a destination label.'],
 ['Network','Connected devices and paths','Devices joined so they can exchange data.','A switch links classroom computers.'],
 ['Subnet','IP network subdivision','Addresses that share a network prefix.','192.168.1.128/26 spans .128 through .191.'],
 ['Subnet mask','Network/host bit pattern','Tells the computer which address bits identify the network.','255.255.255.192 is /26: 26 network bits, 6 host bits.'],
 ['Prefix','Leading network bits','The number of bits used to identify the network.','/24 means the first 24 of IPv4’s 32 bits.'],
 ['CIDR','Classless Inter-Domain Routing','Uses explicit prefixes instead of historical address classes.','10.0.0.20/23 uses /23, not a guessed mask from the first octet.'],
 ['Network address','Subnet identifier','The first address: all host bits are zero.','192.168.1.130/26 → network 192.168.1.128, not .0.'],
 ['Broadcast address','All-hosts destination in an IPv4 subnet','The last address: all host bits are one.','192.168.1.130/26 → broadcast .191, not .255.'],
 ['Usable host','Assignable endpoint address','A conventional LAN address excluding network and broadcast.','/26 has 64 total, 62 usable. /31 point-to-point uses both; /32 identifies one address.'],
 ['Router','Network-forwarding device','Forwards packets between networks using routes.','A switch handles a local link; a router reaches another network.'],
 ['Gateway','Default next-hop router','Used for destinations without a more specific matching route.','192.168.1.20/24 can use router 192.168.1.1 to reach 192.168.2.20.'],
 ['DNS','Domain Name System','Resolves names into records, including IP addresses.','printer.lab → 192.168.1.40. A numeric-address test does not need DNS.'],
 ['DHCP','Dynamic Host Configuration Protocol','Offers address settings to clients automatically.','An offer can include IP, mask, router and DNS.'],
 ['Static address','Manually assigned IP','Settings entered and maintained by an administrator.','Choose a free address within the correct subnet.'],
 ['Dynamic address','Automatically assigned IP','An address assigned through a service such as DHCP.','A lease is time-limited; it may renew with the same address.'],
 ['Private address','RFC 1918 address','An address reserved for private networks.','10/8; 172.16/12 (only 172.16–172.31); 192.168/16.'],
 ['Public address','Globally usable address category','An address outside special/private ranges may be globally assignable.','8.8.8.8 is publicly used. A public candidate label does not prove ownership, routing or service availability.'],
 ['APIPA','Automatic Private IP Addressing','Windows IPv4 link-local configuration, often seen when DHCP fails.','169.254/16 stays on the local link. Investigate DHCP; this alone does not identify the fault.'],
 ['Loopback','Local-host return path','Traffic stays inside this computer.','127.0.0.1 is in 127/8. Success does not prove the cable works.'],
 ['Duplicate IP','Conflicting interface addresses','Two devices on a link use the same IP address.','A laptop cannot take the printer’s .40 address.'],
 ['Special-use','Reserved purpose','Some nonprivate ranges are not ordinary public host addresses.','127/8 loopback, 169.254/16 link-local, 224/4 multicast, 100.64/10 shared space and documentation ranges.']
].map(([term,full,meaning,example])=>({term,full,meaning,example}));
const b=(title,target,width=8)=>({kind:'bits',title,target,width,concept:width===4?'Bit':'Octet',goal:`Build ${target}. Turn on the weights that add up to it.`,help:'Start at the largest weight. Turn it on only if it fits the amount you still need. Then subtract it and move right.',explain:`${target} = ${[128,64,32,16,8,4,2,1].filter(w=>target&w).join(' + ')||'0'}. A 0 adds nothing. ${width===4?'Four bits are a training model, not a complete IPv4 octet.':'Eight bits make one octet.'}`});
const pick=(title,goal,answer,options,concept,explain)=>({kind:'choice',title,goal,answer,options,concept,help:explain,explain});
const mask=p=>({kind:'mask',title:`Slide to /${p}`,target:p,concept:'Subnet mask',goal:`Build a /${p} mask. Move the network/host boundary.`,help:`Count ${p} network bits from the left. Every remaining bit must be 0.`,explain:`/${p} = ${maskFor(p)}. ${32-p} host bits give ${2**(32-p)} total addresses. More network bits leave fewer host combinations.`});
const sort=(prefix=24)=>({kind:'sort',title:`Sort the /${prefix} devices`,concept:'Subnet',prefix,devices:prefix===23?['10.0.0.20','10.0.1.40','10.0.2.20']:prefix===27?['192.168.1.130','192.168.1.150','192.168.1.161']:['192.168.1.20','192.168.1.40','192.168.2.20'],bins:prefix===23?['10.0.0.0','10.0.2.0']:prefix===27?['192.168.1.128','192.168.1.160']:['192.168.1.0','192.168.2.0'],goal:'Select a device tile, then its network tray. Membership uses address AND mask.',help:'Apply the same mask to each address. Equal network IDs belong in the same tray. A network or broadcast address can belong to a range without being assignable to a host.',explain:'The mask determines the boundary. Similar-looking addresses can be in different subnets; /23 can join addresses with different third octets.'});
const range=(ip,prefix)=>({kind:'range',title:`Find the /${prefix} range`,concept:'Usable host',ip,prefix,goal:`Place the four address tiles for ${ip}/${prefix}.`,help:`${32-prefix} host bits give blocks of ${2**(32-prefix)} addresses. All host bits 0 gives the network; all 1 gives broadcast.`,explain:`${ip}/${prefix}: network ${subnet(ip,prefix).network}, broadcast ${subnet(ip,prefix).broadcast}, usable ${subnet(ip,prefix).first}–${subnet(ip,prefix).last}.`});
const config=(fault,title,extra={})=>({kind:'config',fault,title,concept:({ip:'Address',duplicate:'Duplicate IP',dns:'DNS',gateway:'Gateway',dhcp:'DHCP',offer:'APIPA',mask:'Subnet mask',mixed:'Gateway'})[fault],goal:'Use OS settings to repair the fault, apply the settings, then Send Packet.',help:'Compare the computer settings with the LAN plan. Numeric targets test routing without DNS; names also test DNS.',explain:'The form, diagnostic commands and packet route read the same configuration. Correct settings restore the modeled request and reply.',...extra});
const address={kind:'address',title:'Assemble four octets',concept:'IPv4',goal:'Arrange the octet tiles to build the free address 192.168.1.20.',target:'192.168.1.20',tiles:['20','1','192','168'],help:'Select a tile, then select its destination slot. Expand any octet to see its eight bits.',explain:'192.168.1.20 contains four octets. Each is 0–255, and together they contain 32 bits.'};
const authored=[
 [b('Wake the first bit',1,4),b('Keep the signal off',0,4),b('Make five',5,4),b('Make ten',10,4)],
 [b('Meet the 128 switch',128),b('Build 192',192),{kind:'decimal',title:'Read the signal',concept:'Octet',target:42,goal:'Read 00101010. Enter its decimal value.',help:'Add 32 + 8 + 2.',explain:'00101010 = 32 + 8 + 2 = 42. Leading zeroes do not change its value.'},b('All eight on',255)],
 [address,pick('Find the invalid octet','Which address has an octet outside 0–255?','192.168.1.300',['192.168.1.20','192.168.1.300','10.0.0.1'],'IPv4','300 cannot fit in an unsigned eight-bit octet.'),config('duplicate','One device, one address'),b('Open an address octet',168)],
 [pick('Find the private block','Which address is private?','172.31.4.8',['172.15.4.8','172.31.4.8','172.32.4.8'],'Private address','Only 172.16 through 172.31 are inside 172.16/12.'),pick('Not every nonprivate address is public','What is 169.254.10.20?','Link-local',['Public candidate','Link-local','Private'],'APIPA','169.254/16 is link-local; it is not an ordinary internet host address.'),pick('A packet to yourself','Where does 127.0.0.1 traffic go?','This computer',['This computer','Default gateway','Internet'],'Loopback','Loopback stays within the local host.'),pick('Public or special?','Which is an ordinary publicly used address?','8.8.8.8',['8.8.8.8','224.0.0.1','192.0.2.5','100.64.0.1'],'Public address','Multicast, documentation and shared space have special uses. Not every nonprivate address is public.')],
 [config('ip','Repair a static address'),config('dhcp','Ask DHCP for settings',{requiredMode:'dhcp'}),config('dns','The name will not resolve'),config('gateway','Find the exit',{target:'portal.lab'})],
 [mask(24),sort(24),pick('Local or gateway?','192.168.1.20/24 sends to 192.168.2.20. Choose the next path.','Gateway',['Local switch only','Gateway'],'Gateway','The /24 network IDs differ. Send to a reachable router.'),sort(23)],
 [mask(25),mask(26),range('192.168.1.130',26),sort(27)],
 [config('mask','A mask sends traffic the wrong way',{prefix:26,target:'192.168.1.70'}),config('offer','DHCP is silent',{requiredMode:'dhcp'}),config('mixed','Fix the route and the name',{target:'portal.lab'}),range('192.168.1.77',30)]
];
export const ROUNDS=authored.flatMap((rows,c)=>rows.map((r,i)=>({...r,id:`c${c+1}-${i+1}`,chapter:c,phase:i===0?'Watch one':i===1?'Do one with help':'Try independently',mapping:CHAPTERS[c].mapping,source:CHAPTERS[c].source})));
// Three aligned, original rescue variants per chapter. Original Rescue and arcade saves remain untouched.
const variants=[
 [b('Beacon rescue',2,4),b('Robot rescue',6,4),b('Sensor rescue',9,4)],
 [b('Laptop octet',64),b('Server octet',200),b('Uplink octet',77)],
 [{...address,title:'Printer address rescue'},config('duplicate','Duplicate laptop'),pick('Repair an invalid address','Pick the valid IPv4 address.','10.0.0.20',['10.0.0.20','10.0.0.256','10.0.20'],'IPv4','IPv4 needs four octets, each 0–255.')],
 [pick('Private boundary rescue','Is 172.32.0.1 private RFC 1918 space?','No',['Yes','No'],'Private address','172.32 is outside 172.16/12.'),pick('Loopback rescue','Does a loopback reply prove the cable works?','No',['Yes','No'],'Loopback','Loopback does not leave this host.'),pick('Special address rescue','Classify 192.0.2.20.','Special-use',['Private','Public candidate','Special-use'],'Special-use','192.0.2/24 is reserved for documentation.')],
 [config('dhcp','Automatic settings rescue',{requiredMode:'dhcp'}),config('dns','DNS desk rescue'),config('gateway','Remote printer rescue',{target:'portal.lab'})],
 [mask(24),sort(24),sort(23)],
 [mask(27),mask(28),range('192.168.1.130',26)],
 [config('offer','DHCP service rescue',{requiredMode:'dhcp'}),config('mixed','Name and route rescue',{target:'portal.lab'}),range('192.168.1.77',30)]
];
export const RESCUES=variants.flatMap((rs,c)=>rs.map((r,i)=>({...r,id:`r${c+1}-${i+1}`,chapter:c,phase:'Rescue mission',mapping:CHAPTERS[c].mapping,source:CHAPTERS[c].source})));
export const ALL=[...ROUNDS,...RESCUES];
export function createRun(m){const net=freshNetwork(m.kind==='mask'?m.target:m.prefix===26?26:24);if(m.kind==='sort'){const gateway=ipText(ipNumber(subnet(m.devices[0],m.prefix).network)+1);net.config={mode:'manual',ip:m.devices[0],mask:maskFor(m.prefix),gateway,dns:gateway};net.plan={prefix:m.prefix,gateway,dns:gateway,lease:m.devices[0]};net.peer=m.devices[1];net.remote=m.devices[2];net.names={'printer.lab':net.peer,'portal.lab':net.remote};}if(m.kind==='mask')net.config.mask=maskFor(16);if(m.fault==='ip')net.config.ip='192.168.9.20';if(m.fault==='duplicate')net.config.ip=net.peer;if(m.fault==='dhcp')net.config.ip='192.168.9.20';if(m.fault==='offer'){net.dhcp=false;net.config={mode:'dhcp',ip:'169.254.10.20',mask:'255.255.0.0',gateway:'',dns:''};}if(m.fault==='dns'||m.fault==='mixed')net.config.dns='192.168.1.250';if(m.fault==='gateway'||m.fault==='mixed')net.config.gateway='192.168.1.254';if(m.fault==='mask'){net.config.mask=maskFor(24);net.remote='192.168.1.70';net.names['portal.lab']=net.remote;}return {id:m.id,net,value:0,prefix:16,choice:'',slots:['','','',''],placements:{},attempts:0,helped:['Watch one','Do one with help'].includes(m.phase),passed:false,applied:false};}
export function checkPuzzle(m,s){if(m.kind==='bits'||m.kind==='decimal')return Number(s.value)===m.target;if(m.kind==='choice')return s.choice===m.answer;if(m.kind==='address')return s.slots.join('.')===m.target&&s.net.config.ip===m.target;if(m.kind==='mask')return s.prefix===m.target&&s.net.config.mask===maskFor(m.target);if(m.kind==='sort')return m.devices.every(ip=>s.placements[ip]===subnet(ip,m.prefix).network);if(m.kind==='range'){const r=subnet(m.ip,m.prefix);return ['network','broadcast','first','last'].every(k=>s.placements[k]===r[k]);}if(m.kind==='config')return configurationIssues(m,s).length===0;return false;}
export function solvedRun(m){const s=createRun(m);s.value=m.target;s.prefix=m.target;if(m.kind==='mask')s.net.config.mask=maskFor(m.target);s.choice=m.answer;s.slots=m.target?.split?.('.')||[];if(m.kind==='sort')for(const ip of m.devices)s.placements[ip]=subnet(ip,m.prefix).network;if(m.kind==='range'){const r=subnet(m.ip,m.prefix);for(const k of ['network','broadcast','first','last'])s.placements[k]=r[k];}if(m.kind==='config'){s.net.dhcp=true;s.net.config={mode:m.requiredMode||'manual',ip:s.net.plan.lease,mask:maskFor(s.net.plan.prefix),gateway:s.net.plan.gateway,dns:s.net.plan.dns};s.applied=true;}return s;}
export function endless(seed){const n=seed>>>0,p=[24,25,26,27,28,30][n%6],m=n%2?b('Endless bit signal',n%256):range(`192.168.${n%200}.${1+n%253}`,p);return {...m,id:'endless-'+n,chapter:6,phase:'Endless practice',mapping:CHAPTERS[6].mapping,source:'n'};}

export function networkTarget(m,s){return m.kind==='config'?(m.target||'printer.lab'):m.kind==='sort'?s.net.remote:m.kind==='choice'&&m.concept==='Gateway'?'portal.lab':m.kind==='choice'&&m.concept==='Loopback'?'127.0.0.1':s.net.peer;}

export function configurationIssues(m,s){const c=s.net.config,p=s.net.plan,issues=[];if(!s.applied)issues.push("Apply the settings before testing.");if(m.requiredMode&&c.mode!==m.requiredMode)issues.push("Choose Automatic (DHCP) for this mission.");if(m.requiredMode==='dhcp'&&!s.net.dhcp)issues.push("Enable the classroom DHCP service, then request a new offer.");if(!parseIP(c.ip)||!sameSubnet(c.ip,p.gateway,p.prefix)||[p.gateway,s.net.peer,s.net.remote,...s.net.duplicates].includes(c.ip))issues.push("Use the free client address from the LAN plan.");else {const r=subnet(c.ip,p.prefix);if(c.ip===r.network||c.ip===r.broadcast)issues.push("Use a host address, not the network or broadcast address.");}if(prefixFor(c.mask)!==p.prefix)issues.push("Set the mask to "+maskFor(p.prefix)+" (/"+p.prefix+") to match the LAN plan.");if(c.gateway!==p.gateway)issues.push("Set the gateway/router to "+p.gateway+".");if(c.dns!==p.dns)issues.push("Set DNS to "+p.dns+".");return issues;}
