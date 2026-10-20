import * as E from './lab-engine.js?v=class47';
import {portState} from './lab-hardware.js?v=class47';
export const bodies={wall:[3.2,2.4,.18],isp:[1.8,1.5,.6],laptop:[4.4,.22,2.9],router:[4.2,.65,2.5],switch:[6,.65,2.6],server:[6,1.15,3.8],nas:[2.3,3,2.7],ap:[3,.5,3],surge:[5.5,.5,1.4],ups:[2,3.2,2.8],pdu:[6.2,.6,1.5],ont:[2.8,.6,2],panel:[5.8,.6,1.7]};
export function equipmentDimensions(type,rack=false){if(!rack||!E.catalog[type]?.u)return [...bodies[type]];return [6,E.catalog[type].u*(6*1.75/19)-.06,type==='nas'?4.5:type==='ups'?4.7:bodies[type][2]];}
export function equipmentPorts(type,rack=false){if(!rack||!E.catalog[type]?.u)return portLayout(type);if(!['nas','ups'].includes(type)){const dims=equipmentDimensions(type,true);return portLayout(type).map(p=>({...p,position:[p.position[0]*dims[0]/bodies[type][0],(p.position[1]-.35)*dims[1]/bodies[type][1]+.35,p.position[2]]}));}const [w,h,d]=equipmentDimensions(type,true),ports=Object.entries(E.catalog[type].ports),outputs=ports.filter(([,k])=>k==='powerOut');return ports.map(([id,kind])=>({id,kind,normal:[0,0,-1],position:[kind==='powerIn'?-2.3:kind==='powerOut'?(outputs.findIndex(([p])=>p===id)-(outputs.length-1)/2)*1.05:id==='eth'?1.05:2.1,h/2+.35,-d/2-.01]}));}
export function portLayout(type){
 const [w,h,d]=bodies[type],entries=Object.entries(E.catalog[type].ports),base=h/2+.35;
 return entries.map(([id,kind],i)=>{let position,normal=[0,0,1],others=entries.filter(([,k])=>k!=='powerIn'),j=others.findIndex(([p])=>p===id);
  if(type==='wall'){position=[i<2?-.78:.78,i%2===0?1.9:.9,d/2+.015];}
  else if(type==='laptop'){position=[-w/2-.01,.46,id==='ac'?-.75:.3];normal=[-1,0,0];}
  else if(type==='surge'&&kind==='powerOut'){position=[-1.9+j*.72,h+.36,0];normal=[0,1,0];}
  else if(type==='surge'){position=[-w/2-.01,base,0];normal=[-1,0,0];}
  else if(['nas','ups'].includes(type)){position=[kind==='powerIn'?-.48:.45,.95+(kind==='powerOut'?j*.8:kind==='copper'?1.25:0),-d/2-.01];normal=[0,0,-1];}
  else if(type==='panel'){const num=Number(id.replace(/\D/g,''));normal=[0,0,id.startsWith('back')?-1:1];position=[(num-2.5)*1.05,base,normal[2]*(d/2+.01)];}
  else if(type==='server'){normal=[0,0,-1];position=[kind==='powerIn'?-2.3:id==='eth'?.6:1.7,base,-d/2-.01];}
  else if(type==='ap'){normal=[0,0,-1];position=[id==='ac'?-.55:.4,base,-1.39];}
  else if(kind==='powerIn'){normal=[0,0,-1];position=[-w/2+.55,base,-d/2-.01];}
  else {const count=others.length;position=[(j-(count-1)/2)*Math.min(.59,(w-.8)/Math.max(1,count-1)),base,d/2+.01];}
  return {id,kind,position,normal};
 });
}
export function describePort(kind,type,cable){
 if(kind==='copper')return {name:'RJ45 Ethernet',fit:'The clear plug slides into the rectangular socket. Its small latch clicks and holds it in place.',job:'Carries network data. A link light means the physical connection is ready; it does not prove that your IP address or Internet access is correct.'};
 if(kind==='powerOut')return {name:'AC power outlet',fit:'The two flat blades and round ground pin line up with the matching outlet holes.',job:'Supplies power to the device at the other end. Green means power is available in this simulation.'};
 if(kind==='powerIn'&&['laptop','router','ont','nas','ap'].includes(type))return {name:'DC barrel power input',fit:'A matching round barrel plug fits over the center pin. The cord includes the device’s AC-to-DC adapter.',job:'The adapter changes wall AC into the DC power this device needs. Match voltage, polarity and connector on real hardware.'};
 if(kind==='powerIn')return {name:['surge','pdu'].includes(type)?'Power input · teaching connector':'IEC-style power input',fit:'Match the shaped equipment connector to its inlet. The other end goes to an appropriate power source.',job:['surge','pdu'].includes(type)?'This teaching model makes the incoming lead visible as a socket. Real products may have a permanently attached cord.':'Brings power into the device. Having a cord connected does not mean the device’s power switch is on.'};
 if(kind==='sc')return {name:'SC fiber connector',fit:'The square fiber connector pushes into its matching adapter. Protect the small optical tip from dirt.',job:'Carries light through fiber. This lab uses an SC provider handoff. Never look into a live fiber connector.'};
 return {name:cable==='lc'?'LC pair + SFP+ optical module':'SFP+ high-speed connection',fit:cable==='lc'?'The two small LC plugs fit into the optical module installed in the SFP+ cage.':'A DAC cable has an SFP+ end built in. It slides into the metal cage; fiber instead requires compatible optical modules.',job:'Provides this lab’s 10 Gb/s link. Match the cable or optics at both ends. SFP+ is the slot/module form; it does not make every inserted cable compatible.'};
}
export function modelSnapshot(s,id){const d=E.find(s,id);if(!d)return null;return {id,type:d.type,name:d.name,on:E.powered(s,id),rack:d.rack!=null,dimensions:equipmentDimensions(d.type,d.rack!=null),ports:equipmentPorts(d.type,d.rack!=null).map(p=>{const r=portState(s,id,p.id),cable=r.link?.type||(p.kind.startsWith('power')?'power':p.kind==='sc'?'sc':p.kind==='sfp'?(d.sr?'lc':'dac'):'cat6a');return {...p,connected:r.plugged,live:r.live,why:r.why,cable,power:p.kind.startsWith('power'),peer:r.peer?E.find(s,r.peer)?.name:null,peerPort:r.port,length:r.link?.length,description:describePort(p.kind,d.type,cable)};})};}
