import * as E from './lab-engine.js?v=class47';
// Validate a cable move on a temporary state, then commit only a successful move.
export function moveCableEnd(s,linkId,device,port,destination){
 const old=s.links.find(l=>l.id===linkId);if(!old||!((old.a===device&&old.ap===port)||(old.b===device&&old.bp===port)))return {ok:false,message:'That connection changed. Grab its current plug and try again.'};
 if(destination?.id===device&&destination?.port===port)return {ok:true,unchanged:true,message:'Plug returned to its original socket.'};
 if(!destination){s.links=s.links.filter(l=>l!==old);return {ok:true,message:'Cable unplugged. Power and link lights now reflect the remaining connections.'};}
 const fixed=old.a===device&&old.ap===port?{id:old.b,port:old.bp}:{id:old.a,port:old.ap};
 const trial={...s,links:s.links.filter(l=>l!==old)};const r=E.connect(trial,fixed.id,fixed.port,destination.id,destination.port,old.type,old.length);
 if(!r.ok)return {ok:false,message:r.message+' The original cable remains connected.'};
 const added=trial.links.at(-1);Object.assign(added,{id:old.id,broken:old.broken});s.links=trial.links;
 return {ok:true,message:'Cable end moved. '+(old.broken?'This cable is still damaged; moving it does not repair it.':'Check power and link lights, then test the network.')};
}
export function rackCheck(s,id,u){const trial={...s,devices:s.devices.map(d=>({...d}))};return E.mount(trial,id,u);}
export function mountWithSupport(s,id,u,fitSupport=false){const d=E.find(s,id);if(!d)return {ok:false,message:'Choose equipment first.'};const prior=d.rails;if(fitSupport&&E.catalog[d.type].u)d.rails=true;const r=E.mount(s,id,u);if(!r.ok)d.rails=prior;return r;}
export function unmountToBench(s,id){const d=E.find(s,id);if(!d||d.rack==null)return {ok:false,message:'Select equipment that is in the rack.'};d.rack=null;if(s.layout)for(const v of ['bench','rear'])if(s.layout[v])delete s.layout[v][id];return {ok:true,message:d.name+' moved back to the bench. Its cables remain connected in this simulation.'};}
