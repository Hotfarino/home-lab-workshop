import {moveCableEnd} from './lab-direct-actions.js?v=class47';
import * as E from './lab-engine.js?v=class47';
import {portState} from './lab-hardware.js?v=class47';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Coordinates refer to the photographed surface, so sockets and cables share one anchor.
export {wallSockets,equipmentFaces} from './lab-physical-layout.js?v=class47';
import {wallSockets,equipmentFaces} from './lab-physical-layout.js?v=class47';
const label = (port,kind) => kind==='powerIn'?'POWER IN':kind==='powerOut'?port.replace('out','OUT '):port.toUpperCase();
const cordArt = '<svg viewBox="0 0 88 42" aria-hidden="true"><path d="M2 20C14 43 40 42 49 18S71 7 72 20" fill="none" stroke="currentColor" stroke-width="5"/><path d="M65 8V1m14 7V1m-7 7V3" stroke="#b1bbc5" stroke-width="3"/><rect x="60" y="8" width="25" height="25" rx="5" fill="currentColor"/><path d="M63 13h18m-18 5h18m-18 5h18" stroke="#617585"/></svg>';

function socketMarkup(s,d,port,xy,wall=false){
  const kind=E.port(s,d.id,port), status=portState(s,d.id,port);
  return `<button type="button" class="bench-socket ${wall?'wall-socket':''} ${status.plugged?'occupied':''} ${status.live?'socket-live':''} ${kind}" data-bench-port="${port}" data-bench-device="${d.id}" data-scene-port="${d.id}:${port}" style="left:${xy[0]}%;top:${xy[1]}%" aria-label="${escapeHTML(d.name+' '+label(port,kind)+': '+status.why)}" title="${escapeHTML(label(port,kind)+' · '+status.why)}"><span class="bench-socket-label">${label(port,kind)}</span>${status.plugged?`<span class="bench-seated-plug ${status.link.type}" aria-hidden="true"></span>`:''}<span class="bench-link-led" aria-hidden="true"></span></button>`;
}

export function renderBenchEquipment(s,map){
  const wall=E.find(s,'wall');
  let html=s.view==='bench'?`<div class="wall-outlet-plane" aria-label="Wall outlets in the room photograph">${Object.entries(wallSockets).map(([p,xy])=>socketMarkup(s,wall,p,xy,true)).join('')}</div>`:'';
  for(const d of s.devices){
    if(d.rack!=null&&!(['wall','isp'].includes(d.type)))continue;
    if(d.type==='wall'&&s.view==='bench')continue;
    const [x,y]=map[d.id],on=E.powered(s,d.id),c=E.catalog[d.type];
    if(d.type==='wall'){
      html+=`<article class="physical-wall-panel" style="left:${x}%;top:${y}%"><b>Wall outlets</b><div>${Object.keys(wallSockets).map((p,i)=>socketMarkup(s,d,p,[25+(i>1?50:0),35+(i%2)*40],true)).join('')}</div></article>`;continue;
    }
    const face=equipmentFaces[d.type];if(!face)continue;
    const loose=c.ports.ac==='powerIn'&&!portState(s,d.id,'ac').plugged&&!on;
    html+=`<article class="device physical-device equipment-${d.type} ${on?'live':''} ${s.selected===d.id?'selected':''}" data-device="${d.id}" style="left:${x}%;top:${y}%" aria-label="${escapeHTML(d.name)}">
      <div class="bench-device-face"><button type="button" class="bench-device-photo" data-device="${d.id}" aria-label="Inspect ${escapeHTML(d.name)}" title="Click to select; double-click for connection close-up; hold and drag to move; right-click for connections" style="background-position:${face.tile%3*50}% ${Math.floor(face.tile/3)*100/3}%"></button>
      ${Object.entries(face.ports).filter(([p])=>c.ports[p]).map(([p,xy])=>socketMarkup(s,d,p,xy)).join('')}
      ${d.type==='surge'?`<button type="button" class="bench-rocker ${on?'is-on':''}" data-bench-power="${d.id}" aria-label="${d.on?'Switch off':'Switch on'} surge protector rocker" aria-pressed="${!!d.on}" title="Surge protector power switch"></button>`:''}${loose?`<svg class="resting-cord" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M${face.ports.ac[0]} ${face.ports.ac[1]} C${face.ports.ac[0]} 94,68 86,68 100"/></svg>`:''}${d.type==='laptop'&&on?'<span class="bench-screen-glow" aria-hidden="true"></span>':''}
      </div><div class="bench-device-caption"><b>${escapeHTML(d.name)}</b>${!['isp','panel'].includes(d.type)?`<button type="button" class="bench-power ${on?'is-on':''}" data-bench-power="${d.id}" aria-label="${d.on?'Switch off':'Switch on'} ${escapeHTML(d.name)}" aria-pressed="${!!d.on}">⏻<span>${d.on?'ON':'OFF'}</span></button>`:''}</div>
      ${loose?`<button type="button" class="bench-loose-cord" data-bench-plug="${d.id}" aria-label="Drag ${escapeHTML(d.name)} power cord to an outlet">${cordArt}<span>Drag to an outlet</span></button>`:''}
      </article>`;
  }
  return html;
}

export function setupBenchConnections(api){
  const $=id=>document.getElementById(id),scene=$('scene');
  const state=()=>api.getState();let owner=state(),pending=null,drag=null,raf=0,ignoreClick=false;
  const tools=document.createElement('section');tools.id='benchConnectionTools';tools.className='bench-connection-tools';
  tools.innerHTML=`<div class="bench-cable-controls"><label>Cable<select id="benchCable"><option value="auto">Match the starting port</option>${Object.entries(E.cableTypes).map(([id,c])=>`<option value="${id}">${escapeHTML(c.name)}</option>`).join('')}</select></label><label>Length · ft<input id="benchCableLength" type="number" min="1" max="984" value="6"></label><button id="benchCableCancel" type="button" disabled>Put cord down</button><button id="benchPortLabels" type="button" aria-pressed="true">Port labels on</button></div><div id="benchConnectionStatus" class="bench-connection-status" role="status" aria-live="polite">Grab a device’s loose power cord and drag it to an actual wall outlet. For data, drag between matching sockets. Pull a seated plug away and release to unplug; drag it to another socket to move that end.</div><div id="benchConnectionAction"></div>`;
  $('benchViewport').before(tools);
  const tell=(text,ok=true)=>{const box=$('benchConnectionStatus');box.textContent=text;box.classList.toggle('error',!ok);box.setAttribute('role',ok?'status':'alert');};
  const endpoint=(id,p)=>E.find(state(),id)?.name+' · '+label(p,E.port(state(),id,p));
  const compatible=(id,p)=>!!pending&&id!==pending.id&&!portState(state(),id,p).plugged&&E.cableTypes[pending.cable].kinds.includes(E.port(state(),id,p))&&(pending.cable!=='power'||E.port(state(),id,p)!==E.port(state(),pending.id,pending.port));
  function highlight(){
    scene.querySelectorAll('[data-bench-port]').forEach(el=>{const {benchDevice:id,benchPort:p}=el.dataset;el.classList.toggle('bench-fit',compatible(id,p));el.classList.toggle('bench-source',pending?.id===id&&pending?.port===p);});
    $('benchCableCancel').disabled=!pending;scene.classList.toggle('cable-in-hand',!!pending);
  }
  function source(id,port){
    if(portState(state(),id,port).plugged){inspectCable(id,port);return false;}
    const kind=E.port(state(),id,port),choice=$('benchCable').value;
    const cable=choice==='auto'?(kind.startsWith('power')?'power':kind==='sc'?'sc':kind==='sfp'?'dac':'cat5e'):choice;
    if(!E.cableTypes[cable].kinds.includes(kind)){tell('This cable does not fit '+endpoint(id,port)+'. Choose a matching cable.',false);api.sound('error');return false;}
    pending={id,port,cable};$('benchConnectionAction').innerHTML='';
    tell(endpoint(id,port)+' holds the first end. Drop the loose plug on a highlighted socket.');highlight();return true;
  }
  function inspectCable(id,port){
    const status=portState(state(),id,port);if(!status.plugged)return;
    tell(endpoint(id,port)+' is connected to '+endpoint(status.peer,status.port)+'. '+status.why+'.');
    $('benchConnectionAction').innerHTML=`<button type="button" data-bench-unplug="${status.link.id}">Unplug this cable</button>`;
  }
  function finish(id,port){
    if(!pending)return source(id,port);
    const first={...pending},r=E.connect(state(),first.id,first.port,id,port,first.cable,Number($('benchCableLength').value));
    if(!r.ok){tell(r.message+' Keep hold of the cord and try another socket.',false);api.sound('error');highlight();return false;}
    pending=null;api.result(r);const target=scene.querySelector(`[data-bench-device="${id}"][data-bench-port="${port}"]`);target?.classList.add('bench-snap');
    const hasAdapter=first.cable==='power'&&[first.id,id].some(key=>['laptop','router','ont','nas','ap'].includes(E.find(state(),key)?.type));
    tell('Connected: '+endpoint(first.id,first.port)+' to '+endpoint(id,port)+'. '+(first.cable==='power'?(hasAdapter?'The matched AC-to-DC adapter is included. Turn on the device.':'Turn on the device and check its light.'):'Check link lights, then test addressing and traffic.'));
    const load=first.cable==='power'?E.find(state(),E.port(state(),id,port)==='powerIn'?id:first.id):null;
    $('benchConnectionAction').innerHTML=load&&!load.on?`<button type="button" data-bench-power="${load.id}">Turn on ${escapeHTML(load.name)}</button>`:'';highlight();return true;
  }
  function clearDrag(){
    if(raf)cancelAnimationFrame(raf);raf=0;const pointer=drag?.pointerId;drag=null;
    $('benchDraggingCord')?.remove();document.body.classList.remove('bench-cable-dragging');
    scene.querySelectorAll('.bench-drop-fit,.bench-drop-error').forEach(e=>e.classList.remove('bench-drop-fit','bench-drop-error'));
    if(pointer!==undefined&&scene.hasPointerCapture?.(pointer))scene.releasePointerCapture(pointer);
  }
  function hit(x,y){return document.elementFromPoint?.(x,y)?.closest('[data-bench-port]');}
  function paintDrag(){
    raf=0;if(!drag?.moved||!pending)return;
    const anchor=scene.querySelector(`[data-bench-device="${pending.id}"][data-bench-port="${pending.port}"]`);if(!anchor)return;
    let overlay=$('benchDraggingCord');if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.id='benchDraggingCord';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);}
    const a=anchor.getBoundingClientRect(),target=hit(drag.x,drag.y);let x=drag.x,y=drag.y;
    scene.querySelectorAll('.bench-drop-fit,.bench-drop-error').forEach(e=>e.classList.remove('bench-drop-fit','bench-drop-error'));
    if(target){const fits=compatible(target.dataset.benchDevice,target.dataset.benchPort);target.classList.add(fits?'bench-drop-fit':'bench-drop-error');if(fits){const b=target.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2;}}
    const ax=a.left+a.width/2,ay=a.top+a.height/2,bend=Math.max(ay,y)+70,color=pending.cable==='power'?'#24333e':pending.cable==='sc'||pending.cable==='lc'?'#d4af2f':'#1388d8';
    const tip=pending.cable==='power'?'<path d="M-5 -6v-9m10 9v-9M0 -6v-6" stroke="#c6d3dd" stroke-width="3"/>':pending.cable==='sc'||pending.cable==='lc'?'<rect x="-5" y="-14" width="10" height="10" fill="#ecece6"/>':'<rect x="-8" y="-15" width="16" height="11" fill="#d3e4e9" stroke="#768d9c"/><path d="M-5 -13v7m3-7v7m4-7v7m3-7v7" stroke="#caa249"/>';
    overlay.innerHTML=`<path d="M${ax} ${ay}C${ax} ${bend} ${x} ${bend} ${x} ${y}" stroke="#10283f33" stroke-width="9" fill="none"/><path d="M${ax} ${ay}C${ax} ${bend} ${x} ${bend} ${x} ${y}" stroke="${color}" stroke-width="5" fill="none"/><g transform="translate(${x},${y})"><rect x="-9" y="-6" width="18" height="26" rx="4" fill="${color}" stroke="white"/>${tip}</g>`;
    const frame=$('benchViewport'),r=frame.getBoundingClientRect();let dx=0,dy=0;
    if(x<r.left+35)dx=-12;else if(x>r.right-35)dx=12;if(y<r.top+35)dy=-12;else if(y>r.bottom-35)dy=12;
    if(dx||dy)frame.scrollBy({left:dx,top:dy,behavior:'instant'});raf=requestAnimationFrame(paintDrag);
  }
  scene.addEventListener('pointerdown',e=>{
    ignoreClick=false;
    if(e.button!==0&&e.button!==undefined)return;
    const plug=e.target.closest('[data-bench-plug]'),socket=e.target.closest('[data-bench-port]');if(!plug&&!socket)return;
    e.stopPropagation();ignoreClick=false;
    const id=plug?.dataset.benchPlug||socket.dataset.benchDevice,port=plug?'ac':socket.dataset.benchPort;
    const attached=portState(state(),id,port);
    drag={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,id,port,moved:false,attached:attached.plugged?attached.link:null};
  });
  scene.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pointerId)return;e.stopPropagation();drag.x=e.clientX;drag.y=e.clientY;
    if(!drag.moved&&Math.hypot(drag.x-drag.startX,drag.y-drag.startY)<5)return;
    if(!drag.moved){if(drag.attached){const l=drag.attached;pending={id:l.a===drag.id&&l.ap===drag.port?l.b:l.a,port:l.a===drag.id&&l.ap===drag.port?l.bp:l.ap,cable:l.type};drag.moved=true;scene.setPointerCapture?.(e.pointerId);document.body.classList.add('bench-cable-dragging');tell('Pull away and release to unplug. Drop on another matching socket to move this end. Escape keeps the original cable.');}else {if(pending&&(pending.id!==drag.id||pending.port!==drag.port)){tell('Finish the cord in your hand, or choose Put cord down first.',false);clearDrag();ignoreClick=true;return;}if(!pending&&!source(drag.id,drag.port)){clearDrag();ignoreClick=true;return;}drag.moved=true;scene.setPointerCapture?.(e.pointerId);document.body.classList.add('bench-cable-dragging');}}
    e.preventDefault();if(!raf)raf=requestAnimationFrame(paintDrag);
  });
  scene.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.pointerId)return;e.stopPropagation();const current=drag,moved=drag.moved,target=hit(e.clientX,e.clientY);clearDrag();if(!moved)return;ignoreClick=true;if(current.attached){pending=null;const r=moveCableEnd(state(),current.attached.id,current.id,current.port,target?{id:target.dataset.benchDevice,port:target.dataset.benchPort}:null);if(r.ok)api.result(r);else api.sound('error');tell(r.message,r.ok);highlight();return;}
    if(target)finish(target.dataset.benchDevice,target.dataset.benchPort);else{tell('The plug missed a socket. Your first end is still selected; drag its cord again or click a highlighted socket.',false);api.sound('error');}
  });
  function cancelDrag(){if(!drag)return;if(drag.attached)pending=null;clearDrag();ignoreClick=true;tell('Drag stopped. Try the loose plug again, or put the cord down.');}
  scene.addEventListener('pointercancel',cancelDrag);scene.addEventListener('lostpointercapture',cancelDrag);window.addEventListener('blur',cancelDrag);
  function putDown(){clearDrag();pending=null;ignoreClick=false;$('benchConnectionAction').innerHTML='';tell('Cord put down. No new connection was added.');highlight();}
  $('benchCableCancel').onclick=putDown;$('benchCable').onchange=putDown;
  $('benchPortLabels').onclick=()=>{const on=scene.classList.toggle('hide-bench-labels');$('benchPortLabels').textContent=on?'Port labels off':'Port labels on';$('benchPortLabels').setAttribute('aria-pressed',String(!on));};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pending)putDown();});
  function click(e){
    const b=e.target.closest('[data-bench-port],[data-bench-plug],[data-bench-power],[data-bench-unplug]');if(!b)return;
    e.stopPropagation();if(ignoreClick&&e.detail!==0){ignoreClick=false;return;}ignoreClick=false;
    const a=b.dataset;
    if(a.benchPower){const d=E.find(state(),a.benchPower);d.on=!d.on;api.result({ok:true,message:d.name+' switch '+(d.on?'ON':'OFF')+'.'});tell(E.powered(state(),d.id)?d.name+' has power. Check its screen or status light.':d.name+(d.on?' has no working power path. Check the upstream cords and switches.':' is switched off.'));$('benchConnectionAction').innerHTML='';return;}
    if(a.benchUnplug){state().links=state().links.filter(l=>l.id!==a.benchUnplug);pending=null;api.result({ok:true,message:'Cable removed. Power and link lights now reflect the remaining connections.'});$('benchConnectionAction').innerHTML='';tell('Cable unplugged. Grab the loose cord or choose a socket to reconnect.');return;}
    if(a.benchPlug){if(!pending)source(a.benchPlug,'ac');else tell('Drag the loose plug to a highlighted socket, or click that socket.');return;}
    if(pending&&!(pending.id===a.benchDevice&&pending.port===a.benchPort))finish(a.benchDevice,a.benchPort);
    else if(portState(state(),a.benchDevice,a.benchPort).plugged)inspectCable(a.benchDevice,a.benchPort);
    else source(a.benchDevice,a.benchPort);
  }
  scene.addEventListener('click',click);tools.addEventListener('click',click);tools.addEventListener('pointerdown',()=>{ignoreClick=false;});
  function refresh(){
    if(owner!==state()){clearDrag();pending=null;owner=state();$('benchConnectionAction').innerHTML='';tell('Drag a device’s cord to an outlet, or connect two matching data ports.');}
    if(pending&&(!E.find(state(),pending.id)||portState(state(),pending.id,pending.port).plugged)){pending=null;clearDrag();}
    tools.hidden=!['bench','rear','rack'].includes(state().view);if(tools.hidden&&pending)putDown();
    scene.classList.toggle('hide-bench-labels',$('benchPortLabels').getAttribute('aria-pressed')==='false');highlight();
  }
  refresh();return {refresh,busy:()=>!!drag?.moved,cancel:putDown};
}
