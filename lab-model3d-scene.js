import {connectionLayout,updateTube,fittedBoxDistance} from './lab-model3d-geometry.js?v=class47';
import {createBlenderEquipment} from './lab-blender-assets.js?v=class47';
import * as T from './lab-three.js?v=class47';
import {OrbitControls,RoundedBoxGeometry} from './lab-three.js?v=class47';
// All geometry is generic teaching hardware. The chassis remains assembled.
export function createModelScene(host,spec,{onSelect,onError,onExplode}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf3f7fc);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D equipment. Drag to rotate. Scroll to zoom. Choose sockets using the adjacent buttons.');renderer.domElement.tabIndex=0;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=4;controls.maxDistance=23;controls.maxPolarAngle=Math.PI*.86;controls.target.set(0,.9,0);controls.enablePan=false;controls.zoomSpeed=.35;controls.rotateSpeed=.65;
 scene.add(new T.HemisphereLight(0xe4f5ff,0x718198,3));const key=new T.DirectionalLight(0xffffff,4.2);key.position.set(-4,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:30});key.shadow.bias=-.0004;scene.add(key);const rim=new T.DirectionalLight(0x80beff,2.5);rim.position.set(5,4,-6);scene.add(rim);
 const root=new T.Group();scene.add(root);const targets=[],assemblies=[];const materials=new Set(),geometries=new Set(),textures=new Set();
 function mat(color,metalness=0,roughness=.42,extra={}){const m=new T.MeshStandardMaterial({color,metalness,roughness,...extra});materials.add(m);return m;}
 const white=mat(0xe7eef5,.25),metal=mat(0x9cafc2,.72,.24),dark=mat(0x122131,.32,.38),black=mat(0x061019,.08,.62),blue=mat(0x168be8,.3,.27),gold=mat(0xd7a342,.75,.22),green=mat(0x10c795,.2),light=mat(0x55d9ff,.3,.2,{emissive:0x087fbb,emissiveIntensity:.6});
 function mesh(geometry,material,parent=root){geometries.add(geometry);const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(size,pos,material=white,parent=root,r=.04){const o=mesh(new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(v=>v/4))),material,parent);o.position.set(...pos);return o;}
 function cyl(radius,len,pos,material=metal,parent=root){const o=mesh(new T.CylinderGeometry(radius,radius,len,32),material,parent);o.rotation.x=Math.PI/2;o.position.set(...pos);return o;}
 function label(text,pos,width=2,parent=root){const cv=document.createElement('canvas');cv.width=768;cv.height=96;const c=cv.getContext('2d');c.clearRect(0,0,768,96);c.fillStyle='#283d57';let font=40;c.font='600 '+font+'px system-ui';while(c.measureText(text).width>720&&font>19)c.font='600 '+(--font)+'px system-ui';if(c.measureText(text).width>720){while(text.length&&c.measureText(text+'…').width>720)text=text.slice(0,-1);text+='…';}c.textAlign='center';c.fillText(text,384,61);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);const material=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false});materials.add(material);const sprite=new T.Sprite(material);sprite.position.set(...pos);sprite.scale.set(width,width/8,1);parent.add(sprite);return sprite;}
 const floor=mesh(new T.PlaneGeometry(200,200),mat(0xf3f7fc,0,.9),scene);floor.rotation.x=-Math.PI/2;floor.position.y=-.3;floor.castShadow=false;const platform=box([8,.18,6.3],[0,-.18,0],mat(0xe5edf5,.2,.55),root,.12);const grid=new T.GridHelper(7.6,19,0xc1d5e7,0xd7e4ef);grid.position.y=-.08;root.add(grid);materials.add(grid.material);geometries.add(grid.geometry);
 const [w,h,d]=spec.dimensions,cy=h/2+.35;const chassis=new T.Group();root.add(chassis);
 if(spec.type==='ap'){const o=mesh(new T.CylinderGeometry(1.5,1.45,h,64),white,chassis);o.position.y=cy;const ring=mesh(new T.TorusGeometry(1.24,.025,12,80),spec.on?light:metal,chassis);ring.rotation.x=Math.PI/2;ring.position.y=h+.37;}
 else box([w,h,d],[0,cy,0],['laptop','wall','ont','isp','surge'].includes(spec.type)?white:dark,chassis,.08);
 // Feet and machined case details.
 if(!['wall','isp'].includes(spec.type))for(const x of [-1,1])for(const z of [-1,1])box([.3,.18,.3],[x*(w/2-.3),.22,z*(d/2-.3)],black,chassis);
 if(!['wall','ap','laptop','surge'].includes(spec.type)){for(let i=0;i<14;i++)box([.038,.009,Math.min(.9,d*.42)],[(i-6.5)*Math.min(.2,(w-.7)/14),h+.354,-.12],black,chassis,.003);for(const x of [-1,1])for(const z of [-1,1]){const screw=cyl(.045,.02,[x*(w/2-.16),h+.36,z*(d/2-.16)],metal,chassis);screw.rotation.x=0;}}
 if(spec.type==='laptop'){
  const lid=new T.Group();lid.position.set(0,.49,-d/2+.08);lid.rotation.x=-.17;chassis.add(lid);box([w,2.65,.12],[0,1.31,0],metal,lid,.06);box([w-.27,2.35,.022],[0,1.35,.075],black,lid,.025);
  if(spec.on){box([w-.4,2.19,.014],[0,1.35,.092],blue,lid);box([2.2,1.23,.02],[-.4,1.45,.11],white,lid);for(let i=0;i<4;i++)box([1.45,.045,.016],[-.45,1.72-i*.18,.129],metal,lid);box([.7,.23,.017],[-.6,1.02,.13],blue,lid);box([w-.42,.16,.015],[0,.36,.13],dark,lid);}
  for(let row=0;row<5;row++)for(let col=0;col<12;col++)box([.24,.022,.19],[(col-5.5)*.3,.586,-.74+row*.24],dark,chassis,.016);box([1.1,.012,.59],[0,.582,.85],metal,chassis);
 }else if(['server','nas'].includes(spec.type)){
  for(let i=0;i<4;i++){const horizontal=spec.type==='server',x=horizontal?(i-1.5)*1.3:(i-1.5)*.48,y=horizontal?cy:1.82,bw=horizontal?1.16:.4,bh=horizontal?.73:2.2;box([bw,bh,.13],[x,y,d/2+.045],metal,chassis);box([bw-.12,bh-.16,.14],[x,y,d/2+.11],black,chassis);for(let j=0;j<6;j++)box([bw-.17,.025,.025],[x,y-bh*.3+j*bh*.1,d/2+.19],metal,chassis);box([.08,.08,.05],[x+bw*.28,y+bh*.3,d/2+.2],spec.on?green:black,chassis);}
 }else if(spec.type==='ups'){box([1.32,1.13,.05],[0,2.5,d/2+.04],black,chassis);box([.97,.63,.02],[0,2.52,d/2+.08],spec.on?light:dark,chassis);for(let i=0;i<10;i++)box([1.5,.028,.015],[0,.65+i*.095,d/2+.1],black,chassis);}
 else if(spec.type==='wall'){for(const x of [-.78,.78])box([1.23,2.2,.08],[x,1.55,.13],white,chassis,.1);}
 if(['server','switch','router','pdu','panel'].includes(spec.type)){for(const x of [-1,1]){box([.29,h+.06,.13],[x*(w/2+.08),cy,d/2-.02],metal,chassis);for(const sy of [-1,1])cyl(.045,.024,[x*(w/2+.08),cy+sy*h*.3,d/2+.06],black,chassis);}}
 if(!['wall','isp','panel','laptop'].includes(spec.type))box([.2,.03,.13],[w/2-.35,h+.39,d/2-.3],spec.on?green:black,chassis);
 const authored=createBlenderEquipment(spec.type,spec.name,spec.on,{rack:spec.rack});if(authored){chassis.visible=false;authored.group.position.y=.35;root.add(authored.group);authored.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const port of authored.ports.values())port.removeFromParent();}
 label(spec.type==='server'?'2U LAB SERVER':spec.type==='switch'?'MANAGED SWITCH':spec.type==='laptop'?'LAB CLIENT':spec.type.toUpperCase(),[0,h+.95,-.2],3.4);
 function connector(kind,type,isPlug,cable){const g=new T.Group(),barrel=kind==='powerIn'&&['laptop','router','ont','nas','ap'].includes(type);
  if(barrel){cyl(isPlug?.16:.23,isPlug?.45:.1,[0,0,isPlug?.19:0],isPlug?metal:black,g);cyl(isPlug?.085:.055,.08,[0,0,isPlug?-.055:.075],isPlug?black:gold,g);if(isPlug)cyl(.22,.36,[0,0,.54],black,g);}
  else if(kind==='copper'){box([.47,.37,isPlug?.42:.075],[0,0,isPlug?.17:0],isPlug?mat(0xc5e4f3,.1,.18,{transparent:true,opacity:.85}):metal,g,.022);if(!isPlug)box([.38,.27,.06],[0,-.015,.045],black,g,.009);for(let i=0;i<8;i++)box([.026,.07,.09],[(i-3.5)*.041,.095,isPlug?-.055:.09],gold,g,.001);box([.14,.06,.18],[0,-.2,isPlug?.13:.01],isPlug?white:black,g);if(isPlug){box([.39,.32,.39],[0,0,.54],blue,g);for(let i=0;i<3;i++)box([.42,.33,.025],[0,0,.41+i*.1],blue,g);}}
  else if(kind==='powerOut'){box([.53,.65,isPlug?.34:.1],[0,0,isPlug?.22:0],isPlug?black:white,g,.1);for(const x of [-.12,.12])box([isPlug?.046:.064,.19,isPlug?.25:.018],[x,.1,isPlug?-.065:.064],isPlug?metal:black,g,.003);cyl(.055,isPlug?.23:.018,[0,-.16,isPlug?-.05:.065],isPlug?metal:black,g);}
  else if(kind==='powerIn'){const shape=new T.Shape();shape.moveTo(-.32,-.23);shape.lineTo(.32,-.23);shape.lineTo(.32,.1);shape.lineTo(.19,.25);shape.lineTo(-.19,.25);shape.lineTo(-.32,.1);shape.closePath();const body=mesh(new T.ExtrudeGeometry(shape,{depth:isPlug?.43:.1,bevelEnabled:false}),black,g);body.position.z=isPlug?-.03:0;for(const [x,y]of [[-.16,-.08],[.16,-.08],[0,.13]])box([.065,.095,.03],[x,y,isPlug?-.05:.115],isPlug?dark:metal,g,.002);}
  else if(kind==='sc'){box([.35,.36,isPlug?.5:.15],[0,0,isPlug?.15:0],green,g);cyl(.065,.07,[0,0,isPlug?-.13:.09],isPlug?white:black,g);if(isPlug)box([.23,.27,.24],[0,0,.52],green,g);}
  else {box([.53,.24,isPlug?.6:.15],[0,0,isPlug?.23:0],metal,g,.012);if(!isPlug)box([.46,.18,.04],[0,0,.09],black,g,.007);if(cable==='lc'){for(const x of [-.12,.12])box([.18,.16,isPlug?.35:.03],[x,0,isPlug?-.02:.12],isPlug?mat(0x48ccd7):blue,g);}else if(isPlug){box([.4,.19,.23],[0,0,.65],black,g);box([.35,.03,.2],[0,-.14,.6],blue,g);}}
  return g;
 }
 function tagObjects(group,id){group.traverse(o=>{if(o.isMesh){o.userData.port=id;targets.push(o);}});}
 const toV=a=>new T.Vector3(...a);
 for(const p of spec.ports){const holder=new T.Group();holder.position.fromArray(p.position);holder.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),toV(p.normal));root.add(holder);const socket=connector(p.kind,spec.type,false,p.cable);holder.add(socket);tagObjects(socket,p.id);
  const halo=mesh(new T.TorusGeometry(p.kind.startsWith('power')?.45:.35,.017,8,48),mat(p.live?(p.power?0x05c78e:0x188aff):0xa5b7c9,0,.5,{emissive:p.live?(p.power?0x05c78e:0x188aff):0,emissiveIntensity:.3}),holder);halo.position.z=.13;halo.visible=false;
  const plug=connector(p.kind,spec.type,true,p.cable);root.add(plug);plug.quaternion.copy(holder.quaternion);tagObjects(plug,p.id);
  const lineMat=new T.LineDashedMaterial({color:0x65a3d2,dashSize:.09,gapSize:.07,transparent:true,opacity:.75});materials.add(lineMat);const guideGeo=new T.BufferGeometry();guideGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(6),3));guideGeo.setAttribute('lineDistance',new T.Float32BufferAttribute([0,0],1));const guide=new T.Line(guideGeo,lineMat);geometries.add(guide.geometry);root.add(guide);
  const wireMat=mat(p.connected?(p.live?(p.power?0x148763:0x1484d5):0x677889):0x9dafc0,.2,.48);const initial=connectionLayout(p,spec.ports,0);const wire=mesh(new T.TubeGeometry(initial.curve,32,p.power?.044:.032,8,false),wireMat);wire.castShadow=false;
  const bead=mesh(new T.SphereGeometry(.052,12,10),mat(p.power?0x36ffba:0x60cfff,.05,.1,{emissive:p.power?0x00cb7f:0x007fff,emissiveIntensity:2.5}));bead.castShadow=false;const endCap=mesh(new T.SphereGeometry(.09,16,12),wireMat);endCap.castShadow=false;
  const caption=label(p.id.toUpperCase(),[0,0,0],1.15);const endLabel=label(p.connected?('TO '+p.peer+' · '+p.peerPort.toUpperCase()):'EXAMPLE · NO CABLE',[0,0,0],3.2);const adapter=p.kind==='powerIn'&&['laptop','router','ont','nas','ap'].includes(spec.type)?box([.68,.32,.4],[0,0,0],dark):null;
  assemblies.push({p,holder,plug,halo,guide,wire,bead,endCap,caption,endLabel,adapter,curve:initial.curve,geometryAmount:-1});
 }
 let selected=spec.ports[0]?.id,amount=0,animation=null,disposed=false,contextLost=false,raf=0,last=0,interacting=false;
 function updateGeometry(){
  for(const a of assemblies){
   const {p}=a,selectedPort=p.id===selected,visible=p.connected||selectedPort;
   a.plug.visible=a.wire.visible=a.endCap.visible=visible;
   a.guide.visible=visible&&amount>.02;a.caption.visible=a.endLabel.visible=a.halo.visible=selectedPort;
   a.bead.visible=visible&&p.live&&!reduced;if(a.adapter)a.adapter.visible=visible;
   if(visible&&a.geometryAmount!==amount){
    const layout=connectionLayout(p,spec.ports,amount);a.geometryAmount=amount;a.curve=layout.curve;
    a.plug.position.copy(layout.tip);updateTube(a.wire.geometry,a.curve,p.power?.044:.032);
    a.endCap.position.copy(layout.end);a.endLabel.position.copy(layout.end).add(new T.Vector3(0,-.32,0));
    if(a.adapter){a.adapter.position.copy(a.curve.getPointAt(.64));a.adapter.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),a.curve.getTangentAt(.64));}
    const line=a.guide.geometry.getAttribute('position'),from=layout.base.clone().addScaledVector(layout.normal,.12);
    line.setXYZ(0,from.x,from.y,from.z);line.setXYZ(1,layout.tip.x,layout.tip.y,layout.tip.z);line.needsUpdate=true;
    const distance=a.guide.geometry.getAttribute('lineDistance');distance.setX(1,from.distanceTo(layout.tip));distance.needsUpdate=true;a.guide.geometry.computeBoundingSphere();
    a.caption.position.copy(layout.tip).add(new T.Vector3(0,.52,0));
   }
   a.wire.material.transparent=!selectedPort;a.wire.material.opacity=selectedPort?1:.3;
  }
 }
 function select(id){if(!assemblies.some(a=>a.p.id===id))return;selected=id;updateGeometry();}
 function setExplosion(v){if(!Number.isFinite(v))return;animation=null;amount=Math.max(0,Math.min(1,v));updateGeometry();onExplode?.(amount);}
 function animateTo(value){if(!Number.isFinite(value))return;value=Math.max(0,Math.min(1,value));if(reduced)return setExplosion(value);animation={from:amount,to:value,start:performance.now()};}
 function framing(){
  const bounds=new T.Box3(new T.Vector3(-w/2,0,-d/2),new T.Vector3(w/2,h+.8,d/2));
  if(spec.type==='laptop')bounds.max.y=Math.max(bounds.max.y,3.3);
  for(const a of assemblies)if(a.p.connected||a.p.id===selected){const l=connectionLayout(a.p,spec.ports,1);bounds.expandByPoint(l.tip);bounds.expandByPoint(l.tail);bounds.expandByPoint(l.end.clone().add(new T.Vector3(0,-.5,0)));}
  return {center:bounds.getCenter(new T.Vector3()),bounds};
 }
 let currentView=['server','nas','ups','ap'].includes(spec.type)?'rear':'hero';
 function view(name){
  currentView=name;const directions={hero:[-6,5,8],front:[0,2,10],rear:[-4.5,4,-10],top:[0,12,.001]},f=framing();
  const direction=toV(directions[name]||directions.hero).normalize();f.distance=fittedBoxDistance(f.bounds,direction,camera.aspect);
  controls.maxDistance=Math.max(23,f.distance*1.8);controls.enableDamping=false;
  controls.target.copy(f.center);camera.position.copy(f.center).addScaledVector(direction,f.distance);controls.update();controls.enableDamping=true;
 }
 updateGeometry();
 let previousAspect=0;
 const resize=()=>{if(disposed)return;const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();if(Math.abs(camera.aspect-previousAspect)>.05){view(currentView);previousAspect=camera.aspect;}};
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 const ray=new T.Raycaster(),mouse=new T.Vector2();let pointer=null;
 const cancel=()=>{pointer=null;},down=e=>{pointer=e.button===0?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;},up=e=>{
  if(!pointer||pointer.id!==e.pointerId||Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>5){cancel();return;}cancel();
  const r=renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return;
  mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);
  const hits=ray.intersectObjects(targets).filter(hit=>{let o=hit.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});
  if(hits[0]){select(hits[0].object.userData.port);onSelect?.(selected);}
 };
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
 const keyboard=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
  e.preventDefault();const v=camera.position.clone().sub(controls.target),sph=new T.Spherical().setFromVector3(v);
  if(e.key==='ArrowLeft')sph.theta-=.12;if(e.key==='ArrowRight')sph.theta+=.12;if(e.key==='ArrowUp')sph.phi=Math.max(.1,sph.phi-.12);if(e.key==='ArrowDown')sph.phi=Math.min(Math.PI*.86,sph.phi+.12);
  camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(sph));controls.update();
 }};renderer.domElement.addEventListener('keydown',keyboard);
 const lost=e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(raf);onError?.('The 3D display lost its graphics connection. Close and reopen this view, or choose “Wire this socket in the lab.”');};renderer.domElement.addEventListener('webglcontextlost',lost);
 const begin=()=>{interacting=true;},end=()=>{interacting=false;};controls.addEventListener('start',begin);controls.addEventListener('end',end);
 function tick(now){
  if(disposed||contextLost||document.hidden)return;raf=requestAnimationFrame(tick);if(now-last<(interacting?16:33))return;last=now;
  if(animation){const t=Math.max(0,Math.min(1,(now-animation.start)/1400));amount=animation.from+(animation.to-animation.from)*(1-(1-t)**3);updateGeometry();onExplode?.(amount);if(t===1)animation=null;}
  for(let i=0;i<assemblies.length;i++){const a=assemblies[i];if(a.bead.visible&&a.curve)a.bead.position.copy(a.curve.getPointAt((now/2600+i*.18)%1));}
  controls.update();renderer.render(scene,camera);
 }
 const visibility=()=>{cancelAnimationFrame(raf);if(!document.hidden&&!disposed&&!contextLost){last=0;raf=requestAnimationFrame(tick);}};
 document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(tick);
 return {select,setExplosion,animateTo,view,focus(){
  const a=assemblies.find(a=>a.p.id===selected);if(!a)return;const l=connectionLayout(a.p,spec.ports,amount),center=l.tip.clone().lerp(l.end,.25);
  controls.enableDamping=false;controls.target.copy(center);camera.position.copy(center).addScaledVector(l.normal,5.2).add(new T.Vector3(0,1.8,0));controls.update();controls.enableDamping=true;
 },zoom(factor){if(!Number.isFinite(factor)||factor<=0)return;camera.position.sub(controls.target).multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance).add(controls.target);controls.update();},dispose(){
  disposed=true;cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('visibilitychange',visibility);
  controls.removeEventListener('start',begin);controls.removeEventListener('end',end);controls.dispose();
  for(const [name,fn]of [['webglcontextlost',lost],['pointerdown',down],['pointerup',up],['pointercancel',cancel],['keydown',keyboard]])renderer.domElement.removeEventListener(name,fn);
  for(const x of geometries)x.dispose();for(const x of materials)x.dispose();for(const x of textures)x.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 }};
}
