import * as E from './lab-engine.js?v=class47';
const first=(s,t,n=0)=>E.ofType(s,t)[n];
const yes=x=>x?'on':'off';
export function taskChecks(s,st){
 const rows=[],add=(name,ok,expected,actual)=>rows.push({name,ok:!!ok,expected:String(expected),actual:String(actual===''?'empty':actual??'missing')});
 const d=first(s,st.settings?.type||st.add||st.powerType,st.nth||0),title=st.title;
 const field=(name,actual,expected)=>add(name,actual===expected,expected,actual);
 if(st.add)add('Equipment',!!d,E.catalog[st.add].name+' present',d?.name);
 if(st.powerType){add('Power switch',d?.on,true,d?.on);add('Power path',d&&E.powered(s,d.id),'powered',d&&E.powered(s,d.id)?'powered':'no usable power');}
 if(st.a){const a=['wall','isp'].includes(st.a)?st.a:first(s,st.a,st.aNth||0)?.id,b=['wall','isp'].includes(st.b)?st.b:first(s,st.b)?.id;const l=s.links.find(l=>(l.a===a&&l.ap===st.ap&&l.b===b&&l.bp===st.bp)||(l.b===a&&l.bp===st.ap&&l.a===b&&l.ap===st.bp));add('Cable endpoints',!!l,`${st.a} ${st.ap} → ${st.b} ${st.bp}`,l?'correct endpoints':'no cable between these sockets');if(l){field('Cable type',l.type,st.cable);field('Cable damage',l.broken===true,false);}}
 if(st.safety){for(const k of ['mat','strap','clearance'])field({mat:'Grounded ESD mat',strap:'Wrist strap',clearance:'Clear workspace'}[k],s.safety[k],true);const unit=first(s,title.includes('NAS')?'nas':'server');field('Equipment switched off',unit?.on,false);add('Equipment unplugged',unit&&!s.links.some(l=>l.type==='power'&&(l.a===unit.id||l.b===unit.id)),'no power cord',unit&&s.links.some(l=>l.type==='power'&&(l.a===unit.id||l.b===unit.id))?'cord attached':'no cord');}
 const f=st.settings?.field;
 if(f==='partChoice'){
  field('Equipment switched off',d?.on,false);add('No power cord during installation',d&&!s.links.some(l=>l.type==='power'&&(l.a===d.id||l.b===d.id)),'unplugged',d&&s.links.some(l=>l.type==='power'&&(l.a===d.id||l.b===d.id))?'power cord attached':'unplugged');
  const [part,value]=(st.choose||'').split('|');
  if(part==='disk'){field('Drive count',d?.disks.length,4);add('Drive capacities',d?.disks.every(x=>x.tb===1),'all 1 TB',d?.disks.map(x=>x.tb+' TB').join(', '));add('Drive health',d?.disks.every(x=>!x.failed),'all healthy',d?.disks.some(x=>x.failed)?'failed member':'healthy');}
  else field({cpu:'CPU',ram:'RAM · GB',cooler:'Cooler',nic:'NIC'}[part]||part,d?.[part],part==='ram'?Number(value):part==='cooler'?true:value);
 }
 if(f==='rackU'){field('Rack support fitted',d?.rails,true);field('Bottom rack unit',d?.rack,Number(st.choose));}
 if(f==='dhcp'){
  field('DHCP',d?.router.dhcp,true);
  if(title!=='Restore DHCP')for(const [key,v,name]of [['lan','192.168.50.1','LAN gateway'],['mask','255.255.255.0','Mask'],['start',100,'Pool first host'],['end',150,'Pool last host'],['dns','192.168.50.1','DNS']])field(name,d?.router[key],v);
 }
 if(f==='ipMode'){
  field('Address mode',d?.network.mode,'dhcp');field('Wi-Fi',d?.network.wifi,false);
  const n=d?E.network(s,d.id):{ok:false,why:'Client missing'},second=st.nth===1,gateway=second?'192.168.60.1':'192.168.50.1';
  add('Client address',n.ok&&E.sameSubnet(n.ip,gateway,'255.255.255.0'),'a usable address on '+gateway.replace(/\.1$/,'.0')+'/24',n.ok?n.ip:n.why);field('Mask',n.mask,'255.255.255.0');field('Gateway',n.gateway,gateway);field('DNS',n.dns,'192.168.50.1');
 }
 if(f==='secondary')for(const [key,v,name]of [['secondary',true,'Separate LAN2'],['second','192.168.60.1','LAN2 gateway'],['mask','255.255.255.0','Mask'],['dhcp',true,'DHCP'],['routing',true,'Inter-subnet routing']])field(name,d?.router[key],v);
 if(f==='vlan-p4')for(const [p,v]of [['p1',1],['p2',1],['p4',20],['p5',20]])field(p.toUpperCase()+' VLAN',d?.ports[p].vlan,v);
 if(f==='routerDns')field('DNS',d?.router.dns,'192.168.50.1');
 if(f==='apSsid')for(const [key,v,name]of [['ssid','HomeLab','SSID'],['password','learnlab123','Passphrase'],['security','WPA2-AES','Security'],['band','5','Band · GHz'],['channel','36','Channel']])field(name,d?.[key],v);
 if(f==='useWifi'){field('Wi-Fi enabled',d?.network.wifi,true);field('Address mode',d?.network.mode,'dhcp');field('SSID',d?.network.ssid,'HomeLab');field('Passphrase',d?.network.password,'learnlab123');const assoc=d?E.wifiAssociation(s,d.id):{ok:false,why:'Client missing'};add('Association',assoc.ok,'joined AP',assoc.why);const n=d?E.network(s,d.id):{ok:false,why:'Client missing'};add('DHCP lease',n.ok&&n.gateway==='192.168.50.1'&&n.dns==='192.168.50.1','home subnet with correct gateway/DNS',n.ok?`${n.ip}; gateway ${n.gateway}; DNS ${n.dns}`:n.why);}
 if(f==='fileService'){field('SMB service',d?.services.file,true);field('Address mode',d?.network.mode,'dhcp');}
 if(f==='osChoice')field('Host OS',d?.os,st.choose);
 if(f==='drivers'){field('Drivers loaded',d?.drivers,true);field('Firmware virtualization',d?.virt,true);}
 if(f==='raidLevel'){
  field('Member count',d?.disks.length,4);add('Member capacity',d?.disks.every(x=>x.tb===1),'four 1 TB members',d?.disks.map(x=>x.tb+' TB').join(', '));
  const r=d?E.raidStatus(d):{ok:false};
  field('RAID level',d?.raid,title.includes('RAID 10')?'10':'5');
  if(title.startsWith('Fail')){field('Drive 1 failed',d?.disks[0]?.failed,true);add('Other members healthy',d?.disks.slice(1).every(x=>!x.failed),'drives 2–4 healthy',d?.disks.slice(1).some(x=>x.failed)?'another failed member':'healthy');}
  else {add('Array usable',r.ok,'available',r.message);field('Failed drives',r.failed,0);if(title.startsWith('Replace'))add('This device rebuilt',d?.rebuilds>0,'completed rebuild on this NAS',d?.rebuilds||0);}
 }
 if(st.panel==='vm'&&!['cloud'].includes(st.course||s.mission)){
  const v=s.vms.find(v=>v.name==='Web-Lab'),mode=st.vmMode||'external';field('Guest name',v?.name,'Web-Lab');field('Guest host',v?.host,first(s,'server')?.id);field('Guest RAM · GB',v?.ram,4);field('Guest vCPUs',v?.cpu,2);field('Guest disk · GB',v?.disk,40);field('Virtual switch',v?.mode,mode);
  if(!title.startsWith('Create')){field('Guest OS',v?.os,'Linux');if(!title.startsWith('Install'))field('Guest running',v?.running,true);if(title.includes('web service')||st.vmMode)field('HTTPS service',v?.service,true);}
 }
 if(st.test||st.runTest){
  const source=first(s,st.test==='server'?'server':'laptop')?.id,target=st.test==='vm'?s.vms.find(v=>v.name==='Web-Lab')?.id:st.runTest?(typeof st.runTest.target==='function'?st.runTest.target(s):st.runTest.target):'internet',protocol=st.runTest?.protocol||'https';
  const r=st.test==='vm'?E.testVM(s,source,target):E.test(s,source,target,protocol),expected=st.expectedOk!==false;
  if(st.test==='vm'){const v=s.vms.find(v=>v.id===target);field('Guest host',v?.host,first(s,'server')?.id);field('Guest RAM · GB',v?.ram,4);field('Guest vCPUs',v?.cpu,2);field('Guest disk · GB',v?.disk,40);field('Virtual switch',v?.mode,st.vmMode||'external');field('Guest OS',v?.os,'Linux');field('Guest running',v?.running,true);field('Guest HTTPS service',v?.service,true);const path=v?E.test(s,source,v.host,'ping'):{ok:false,why:'Guest/host missing'};add('Physical laptop → host',path.ok,'working physical host path',path.why);}
  const flag=st.testFlag||st.runTest?.flag||(st.test==='vm'?'vmTest':st.test==='server'?'serverTest':'webTest');
  add('Requested test performed',s.walkthrough?.[flag]===true,'run this task’s test',s.walkthrough?.[flag]?'recorded':'not recorded');
  add('Live connectivity',r.ok===expected,expected?'successful '+protocol:'isolated physical-client connection',r.why);
  if(!expected){const v=s.vms.find(v=>v.id===target);add('Isolation cause',v?.mode===st.vmMode&&E.vmStatus(s,v).ok,st.vmMode+' switch with a running guest',v?.mode||'guest missing');}
 }
 if((st.course||s.mission)==='cloud'&&st.panel==='vm'){
  field('Learning account',s.cloud.account,true);field('Deployment model',s.cloud.model,'hybrid');field('Service model',s.cloud.service,'iaas');
  if(!title.startsWith('Choose')){field('Backup exists',s.cloud.backup,true);field('Backup source',s.cloud.sourceName,first(s,'server')?.name);field('Backup source device',s.cloud.sourceId,first(s,'server')?.id);const r=first(s,'server')?E.test(s,first(s,'server').id,'cloud','https'):{ok:false,why:'Server missing'};add('Backup source path',r.ok,'working server-to-cloud HTTPS path',r.why);}
  if(title.startsWith('Verify'))field('Recovery record verified',s.cloud.verified,true);
 }
 if(st.desktop)field('Desktop opened',s.desktopProgress?.opened,true);
 if(st.reveal==='cableList'&&title.startsWith('Unplug')){const client=first(s,'laptop');add('Ethernet removed',client&&!s.links.some(l=>l.type!=='power'&&(l.a===client.id||l.b===client.id)),'no Ethernet cable','inspect laptop ETH');add('Laptop power',client&&E.powered(s,client.id),'powered laptop',client&&E.powered(s,client.id)?'powered':'no power');}
 if(title==='Inspect the failed physical link'){const l=s.links.filter(l=>l.type!=='power'&&(l.a===first(s,'laptop')?.id||l.b===first(s,'laptop')?.id));add('Laptop link repaired',l.length>0&&l.every(l=>!l.broken),'present, undamaged Ethernet link',l.length?l.some(l=>l.broken)?'damaged':'repaired':'missing');}
 return rows;
}
export function checkedTask(st){
 const original=st.pass,originalIssues=st.issues;
 return {...st,checks:s=>taskChecks(s,st),pass:s=>{const checks=taskChecks(s,st);return checks.length?checks.every(x=>x.ok)&&!!original(s):!!original(s);},issues:s=>{const checks=taskChecks(s,st),issues=checks.filter(x=>!x.ok).map(x=>`${x.name}: expected ${x.expected}; currently ${x.actual}.`);return issues.length?issues:original(s)?[]:originalIssues?.(s)?.length?originalIssues(s):['Complete the requested action, then save/apply its settings.'];}};
}
