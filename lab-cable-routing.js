import * as E from './lab-engine.js?v=class47';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const compact = new Set(['laptop','router','ont','nas','ap']);
const fiber = type => ['fiber','lc','sc','fiberLC','fiberSC'].includes(type) || /fiber/i.test(E.cableTypes[type]?.name || '');
export const cableLabel = (s, l) => `${E.find(s,l.a)?.name || l.a} ${l.ap.toUpperCase()} ↔ ${E.find(s,l.b)?.name || l.b} ${l.bp.toUpperCase()}`;

// Rounded, orthogonal runs: short tails at real sockets, then separate side lanes.
// These are drawing coordinates, not the physical cable length used by the engine.
export function roundedPath(points, radius = 10) {
  const p = points.filter((v, i) => !i || v[0] !== points[i-1][0] || v[1] !== points[i-1][1]);
  const num = n => Math.round(n * 100) / 100;
  let d = `M${num(p[0][0])},${num(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i-1], b = p[i], c = p[i+1];
    const before = Math.hypot(b[0]-a[0], b[1]-a[1]), after = Math.hypot(c[0]-b[0], c[1]-b[1]);
    const r = Math.min(radius, before/2, after/2);
    if (!r) continue;
    const x = [b[0]+(a[0]-b[0])*r/before, b[1]+(a[1]-b[1])*r/before];
    const y = [b[0]+(c[0]-b[0])*r/after, b[1]+(c[1]-b[1])*r/after];
    d += ` L${num(x[0])},${num(x[1])} Q${num(b[0])},${num(b[1])} ${num(y[0])},${num(y[1])}`;
  }
  return d + ` L${num(p.at(-1)[0])},${num(p.at(-1)[1])}`;
}
export function routeCable({a, b, exitA, exitB, power, lane = 0, height = 720, wallA = false, wallB = false}) {
  const ya = clamp(exitA, 12, height-10), yb = clamp(exitB, 12, height-10);
  const near = Math.abs(ya-yb) < 42 && !wallA && !wallB;
  const rail = power ? 24 + (lane % 16)*5 : 976 - (lane % 16)*5;
  const y = Math.max(ya,yb);
  const points = near ? [a,[a[0],y],[b[0],y],b] : [a,[a[0],ya],[rail,ya],[rail,yb],[b[0],yb],b];
  return {d:roundedPath(points),points,rail};
}

export function renderCableRoutes({state:s, scene, svg, map, portPosition, overrides = {}}) {
  const height = parseFloat(scene.style.height) || 720, bounds = scene.getBoundingClientRect();
  const locate = (id, port) => {
    const base = map[id], anchor = portPosition(id,port,map), shift = overrides[id];
    if (!anchor) return null;
    return [(anchor[0]+(shift && base ? shift[0]-base[0] : 0))*10,
      (anchor[1]+(shift && base ? shift[1]-base[1] : 0))*height/100];
  };
  const exit = (id, anchor, power, lane) => {
    const d = E.find(s,id), shift = overrides[id], base = map[id];
    const dy = shift && base ? (shift[1]-base[1])*height/100 : 0;
    if (d?.type === 'wall' && s.view === 'bench') return Math.max(64,anchor[1]-42-(lane%4)*5);
    const face = scene.querySelector(`[data-device="${id}"] .bench-device-face`);
    if (face && bounds.height) {
      const r = face.getBoundingClientRect();
      // The clear strip below the photographed chassis stays above its name and switch.
      if (r.height) return Math.max(anchor[1]+12, (r.bottom-bounds.top)/bounds.height*height + dy - (power?30:10) - (lane%4)*4);
    }
    return anchor[1]+18+(power?0:14)+(lane%4)*4;
  };
  const path = s.lastTest?.ok ? s.lastTest.path || [] : [];
  const lanes = {power:0,data:0};
  const links = [...s.links].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
  svg.innerHTML = links.map(l => {
    const a = locate(l.a,l.ap), b = locate(l.b,l.bp);
    if (!a || !b) return '';
    const power = l.type === 'power', lane = lanes[power?'power':'data']++;
    const route = routeCable({a,b,exitA:exit(l.a,a,power,lane),exitB:exit(l.b,b,power,lane),power,lane,height,wallA:l.a==='wall',wallB:l.b==='wall'});
    const flowing = !power && path.includes(E.key(l.a,l.ap)) && path.includes(E.key(l.b,l.bp));
    let adapter = '';
    if (power && [l.a,l.b].some(id=>compact.has(E.find(s,id)?.type))) {
      const atA = compact.has(E.find(s,l.a)?.type), end = atA ? route.points[1] : route.points.at(-2);
      const other = atA ? route.points[2] : route.points.at(-3);
      const space = Math.abs(other[0]-end[0]);
      const x = end[0]+Math.sign(other[0]-end[0])*Math.min(38,space/2);
      if (space >= 36) adapter = `<g class="bench-adapter" data-adapter-link="${esc(l.id)}" transform="translate(${x},${end[1]})"><title>AC-to-DC power adapter for ${esc(cableLabel(s,l))}</title><rect x="-16" y="-7" width="32" height="14" rx="4" fill="#263742" stroke="#8796a0"/><path d="M-8 -3v6m4-6v6m4-6v6" stroke="#687983" stroke-width="1"/></g>`;
    }
    return `<path data-link="${esc(l.id)}" class="wire ${power?'power':fiber(l.type)?'fiber':''} ${l.broken?'broken':''} ${flowing?'flowing':''}" d="${route.d}"><title>${esc(cableLabel(s,l))} · ${esc(E.cableTypes[l.type]?.name)} · ${l.length} ft</title></path>${adapter}`;
  }).join('');
}

export function setupCableManager(api) {
  const scene = document.getElementById('scene'), panel = document.createElement('details');
  panel.className = 'cable-manager'; panel.id = 'cableManager';
  panel.innerHTML = '<summary>Trace a cable <span id="cableRouteCount"></span></summary><div class="cable-manager-body"><label for="traceCable">Follow one connection</label><div class="cable-trace-controls"><select id="traceCable" aria-describedby="cableTraceHint"></select><button id="clearCableTrace" type="button">Show all cables</button></div><p id="cableTraceHint">Choose a cable to highlight both sockets. Other wires fade so you can follow its path.</p><div class="cable-key"><span><i class="power-key"></i>Power</span><span><i class="data-key"></i>Ethernet</span><span><i class="fiber-key"></i>Fiber</span><span><i class="fault-key"></i>Damaged cable</span></div><p id="cableTraceDetail" role="status" aria-live="polite"></p></div>';
  (document.getElementById('benchViewport') || scene).before(panel);
  const select = panel.querySelector('select'), detail = panel.querySelector('#cableTraceDetail'), clear = panel.querySelector('button');
  let selected = '', signature = '', owner = api.getState();
  function apply() {
    const s = api.getState(), link = s.links.find(l=>l.id===selected);
    scene.classList.toggle('cable-tracing',!!link);
    for (const n of scene.querySelectorAll('[data-link],[data-adapter-link]')) {
      const id = n.dataset.link || n.dataset.adapterLink;
      n.classList.toggle('cable-muted',!!link && id!==selected);
      n.classList.toggle('cable-selected',!!link && id===selected);
    }
    for (const n of scene.querySelectorAll('[data-scene-port]')) n.classList.toggle('cable-endpoint',!!link && [E.key(link.a,link.ap),E.key(link.b,link.bp)].includes(n.dataset.scenePort));
    clear.disabled = !link;
    detail.textContent = link ? `${cableLabel(s,link)}. ${E.cableTypes[link.type]?.name} · ${link.length} ft. ${link.broken?'This cable is damaged. Repair or replace it in Connected cables.':link.type==='power'?'Green pulses mean power is available through this cord. The device may still be switched off.':'Blue pulses mean the physical data link is ready. Use Test the build to check IP, DNS and services.'}${link.type==='power' && [link.a,link.b].some(id=>compact.has(E.find(s,id)?.type))?' The small black block is an AC-to-DC power adapter.':''}` : (s.links.length?'All connections shown. Power and data use separate lanes. Routes are simplified; the configured length still controls the lab checks.':'Plug in a cable to see it here.');
  }
  function refresh() {
    const s = api.getState();
    if (owner !== s) {owner=s;selected='';signature='';}
    if (!s.links.some(l=>l.id===selected)) selected='';
    const next = s.links.map(l=>l.id+':'+cableLabel(s,l)).join('|');
    if (next !== signature || !select.options.length) {
      signature=next;
      select.innerHTML='<option value="">All cables</option>'+s.links.map(l=>`<option value="${esc(l.id)}">${esc(cableLabel(s,l))}</option>`).join('');
    }
    select.value=selected; select.disabled=!s.links.length;
    panel.querySelector('#cableRouteCount').textContent=`${s.links.length} connected`;
    panel.hidden=s.view==='inside'; apply();
  }
  select.onchange=()=>{selected=select.value;apply();};
  clear.onclick=()=>{selected='';select.value='';apply();};
  refresh(); return {refresh};
}
