import * as E from './lab-engine.js?v=class47';
// Physical correctness is independent of a successful application/network test.
export function cableIssue(s,l){
 const a=E.find(s,l.a),b=E.find(s,l.b),c=E.cableTypes[l.type],ap=E.port(s,l.a,l.ap),bp=E.port(s,l.b,l.bp);
 if(l.broken)return 'Cable damaged';
 if(!a||!b||a.id===b.id||!c||!ap||!bp)return 'Cable endpoint missing or incompatible';
 if(!Number.isFinite(l.length)||l.length<=0||l.length>c.limit)return 'Cable exceeds its supported length';
 if(l.type==='power'){
  if(![ap,bp].includes('powerIn')||![ap,bp].includes('powerOut'))return 'Power input and output must match';
  const source=ap==='powerOut'?a:b,load=ap==='powerIn'?a:b;
  if((load.type==='surge'&&source.type!=='wall')||(source.type==='surge'&&['surge','pdu','ups'].includes(load.type)))return 'Invalid power-strip chain';
 }else if(!c.kinds.includes(ap)||!c.kinds.includes(bp))return 'Cable connector mismatch';
 if(l.type==='lc'&&(!a.sr||!b.sr))return 'Matching optical modules are missing';
 if(l.type==='dac'&&(a.sr||b.sr))return 'Remove optical modules before using a DAC';
 return null;
}
export function connectionStatus(s,l,readPortState){
 if(!s.links.some(x=>x.id===l.id))return {live:false,kind:l.type==='power'?'power':'data',why:'Cable disconnected'};
 const kind=l.type==='power'?'power':'data',issue=cableIssue(s,l);
 if(issue)return {live:false,kind,why:issue};
 const a=readPortState(s,l.a,l.ap),b=readPortState(s,l.b,l.bp),live=!!(a.live&&b.live);
 return {live,kind,why:live?(kind==='power'?'Power available through this cord':'Physical data link ready; IP and services still need testing'):(!a.live?a.why:b.why)};
}
// CSS animates continuously; state refreshes only add/remove eligible overlays.
export function refreshConnectionPulses(svg,s,readPortState){
 if(!svg)return;
 for(const n of svg.querySelectorAll('.connection-pulse,.data-packet'))n.remove();
 for(const p of svg.querySelectorAll('path[data-link]')){
  const link=s.links.find(l=>l.id===p.dataset.link),status=link?connectionStatus(s,link,readPortState):{live:false};
  p.classList.toggle('power-available',!!status.live&&status.kind==='power');
  p.classList.toggle('data-link-ready',!!status.live&&status.kind==='data');
  p.dataset.connectionState=status.live?status.kind+'-ready':'inactive';
  if(!status.live)continue;
  const pulse=p.cloneNode(true),muted=p.classList.contains('cable-muted'),selected=p.classList.contains('cable-selected');
  pulse.setAttribute('class','connection-pulse '+(status.kind==='power'?'power-pulse':'data-pulse')+(muted?' cable-muted':'')+(selected?' cable-selected':''));
  pulse.setAttribute('aria-hidden','true');pulse.setAttribute('pathLength','100');
  for(const title of pulse.querySelectorAll('title'))title.remove();
  p.after(pulse);
 }
}
