import * as E from './lab-engine.js?v=class47';
import {equipmentFaces,wallSockets} from './lab-physical-layout.js?v=class47';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function explodedPhoto(d){
 const entries=Object.keys(E.catalog[d.type].ports);
 const marker=(p,xy)=>`<button type="button" class="photo-port-marker" data-photo-device="${esc(d.id)}" data-photo-port="${p}" style="left:${xy[0]}%;top:${xy[1]}%" aria-label="Locate ${esc(d.name)} ${p.toUpperCase()} enlarged socket" title="${p.toUpperCase()}">${entries.indexOf(p)+1}</button>`;
 if(d.type==='wall')return `<div class="exploded-wall-photos">${[0,1].map(i=>{const cropX=i?1180:562;return `<figure><div class="wall-photo-crop"><img src="lab-bench-hd.jpg" alt="${i?'Right':'Left'} wall outlet plate from the workbench" style="left:${-cropX}%;top:${-266/116*100}%">${Object.entries(wallSockets).filter(([p])=>Number(p.slice(3))>(i?2:0)&&Number(p.slice(3))<=(i?4:2)).map(([p,xy])=>marker(p,[(xy[0]*16.72-cropX),((xy[1]*9.41-266)/116)*100])).join('')}</div><figcaption>${i?'Right':'Left'} wall plate</figcaption></figure>`;}).join('')}</div>`;
 const face=equipmentFaces[d.type];if(!face)return '';
 return `<div class="exploded-photo" role="group" aria-label="${esc(d.name)} photo and socket locations" style="background-position:${face.tile%3*50}% ${Math.floor(face.tile/3)*100/3}%">${Object.entries(face.ports).map(([p,xy])=>marker(p,xy)).join('')}</div>`;
}
// The intact chassis stays put. Dotted leaders lift socket faces into the wiring plane.
export function drawExplodedCallouts(stage,focus={}){
 for(const unit of stage.querySelectorAll('.exploded-unit')){
  const svg=unit.querySelector('.exploded-callout'),bounds=unit.getBoundingClientRect();if(!svg||!bounds.width)continue;
  const id=unit.dataset.unit;svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  const paths=[];
  for(const dot of unit.querySelectorAll('[data-photo-port]')){
   const port=dot.dataset.photoPort,button=unit.querySelector(`[data-socket="${port}"]`),socket=button?.querySelector('.socket-art');
   dot.classList.toggle('photo-port-active',focus[id]===port);
   if(!socket||button.closest('[hidden]'))continue;
   const a=dot.getBoundingClientRect(),b=socket.getBoundingClientRect();if(!b.width)continue;
   const x=a.left+a.width/2-bounds.left,y=a.top+a.height/2-bounds.top,tx=b.left+b.width/2-bounds.left,ty=b.top+b.height/2-bounds.top;
   paths.push(`<path d="M${x} ${y} L${tx} ${ty}"/>`);
  }
  svg.innerHTML=paths.join('');
 }
}
// Side views of the actual connector family, separated from its socket for inspection.
export function explodedPlug(kind,type,cable){
 let tip='',bodyColor=cable==='power'?'#344857':cable==='sc'?'#309b64':cable==='lc'?'#258fa1':'#1686cb';
 if(kind==='powerIn'&&['laptop','router','ont','nas','ap'].includes(type))tip='<path fill="#c6d4dd" stroke="#677c89" d="M7 22h24v12H7z"/><path stroke="#566e7e" d="M11 22v12M18 22v12"/><ellipse cx="7" cy="28" rx="3" ry="6" fill="#455d6d"/>';
 else if(kind==='powerOut')tip='<path stroke="#8397a5" stroke-width="5" d="M8 17h22M8 36h22"/><path stroke="#b6c5cf" stroke-width="5" d="M12 26h18"/>';
 else if(kind==='powerIn')tip='<path fill="#354652" stroke="#91a5b2" d="M8 14h22v28H8z"/><path fill="#131f28" d="M9 17h5v7H9zM9 31h5v7H9zM18 24h5v7h-5z"/>';
 else if(kind==='copper')tip='<path fill="#d9eaf2" fill-opacity=".95" stroke="#748fa1" d="M4 16h28v27H4z"/><path fill="#c9a246" d="M5 17h18v2H5zM5 21h18v2H5zM5 25h18v2H5zM5 29h18v2H5z"/><path fill="none" stroke="#a5bbc8" stroke-width="3" d="M7 16l9-9h17"/>';
 else if(kind==='sc')tip='<path fill="#eaf3f4" stroke="#b0c5ca" d="M4 23h13v10H4z"/><path fill="#41ba76" stroke="#287c54" d="M16 16h18v24H16z"/>';
 else if(cable==='lc')tip='<path stroke="#bbd5d9" stroke-width="5" d="M4 19h16M4 36h16"/><path fill="#c1edf0" stroke="#4e9ca6" d="M14 13h20v14H14zM14 30h20v14H14z"/>';
 else tip='<path fill="#becbd4" stroke="#657e90" d="M4 14h31v28H4z"/><path fill="#364e5c" d="M6 18h6v20H6z"/><path fill="none" stroke="#62bfe5" stroke-width="3" d="M18 12v-5h20v10"/>';
 return `<svg viewBox="0 0 100 56" aria-hidden="true">${tip}<path fill="${bodyColor}" stroke="#345568" d="M30 13h30l12 9v13l-12 8H30z"/><path stroke="#ffffff55" stroke-width="2" d="M37 17v22m7-22v22m7-22v22"/><path stroke="${bodyColor}" stroke-width="9" stroke-linecap="round" d="M68 28h28"/></svg>`;
}
