import * as T from './lab-three.js?v=class47';
import {bodies,portLayout} from './lab-model3d-data.js?v=class47';

// Generic teaching hardware. Each returned group owns its resources; dispose by
// traversing meshes and collecting unique geometries/materials in Sets.
// Front is +Z. The case bottom is y=0. Labels are supplied by the world UI.
export function createEquipment(type,name,powered=false,{rack=false}={}){
  if(!bodies[type])throw new Error('Unknown equipment type: '+type);
  const [w,h,d]=bodies[type],group=new T.Group(),ports=new Map();
  group.name=name||type;group.userData={type,name:name||type};
  const materials=new Map(),unitBox=new T.BoxGeometry(1,1,1);
  const palette={
    shell:[0xd8e1e8,.62,.32],white:[0xf5f3ec,.12,.36],silver:[0xa8b7c6,.8,.28],
    face:[0x243344,.5,.4],black:[0x08131e,.12,.5],rubber:[0x14202a,0,.78],
    gold:[0xdcae4f,.78,.25],blue:[0x168cce,.4,.3],teal:[0x39c6b2,.25,.3],
    green:[0x12bb86,.2,.35],screen:[0x082d48,.25,.23],glass:[0x142333,.15,.2],
    led:[powered?0x35ecc4:0x334a4a,.15,.3],cyan:[powered?0x39bafa:0x263d4c,.1,.3]
  };
  function mat(key){
    if(!materials.has(key)){
      const [color,metalness,roughness]=palette[key];
      const lit=powered&&['led','cyan'].includes(key);
      materials.set(key,new T.MeshStandardMaterial({color,metalness,roughness,
        emissive:lit?color:0,emissiveIntensity:lit?.65:0}));
    }
    return materials.get(key);
  }
  function mesh(geo,key,parent=group){const o=new T.Mesh(geo,mat(key));o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(size,pos,key='shell',parent=group,round=0){
    const o=mesh(round?new T.RoundedBoxGeometry(...size,2,Math.min(round,...size.map(v=>v*.24))):unitBox,key,parent);
    if(!round)o.scale.set(...size);o.position.set(...pos);return o;
  }
  function cylinder(radius,length,pos,key='silver',parent=group){
    const o=mesh(new T.CylinderGeometry(radius,radius,length,20),key,parent);
    o.rotation.x=Math.PI/2;o.position.set(...pos);return o;
  }
  function ring(radius,tube,pos,key='silver',parent=group){
    const o=mesh(new T.TorusGeometry(radius,tube,8,40),key,parent);o.position.set(...pos);return o;
  }
  function instances(size,points,key,parent=group){
    if(!points.length)return null;
    const o=new T.InstancedMesh(unitBox,mat(key),points.length),dummy=new T.Object3D();
    dummy.scale.set(...size);points.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});
    o.instanceMatrix.needsUpdate=true;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  }
  function screw(x,y,z,parent=group){
    cylinder(.038,.012,[x,y,z],'silver',parent);box([.044,.008,.013],[x,y,z+.009],'black',parent);
  }
  function topVents(x,z,width,depth,y=h+.004){
    const n=Math.max(5,Math.floor(width/.13));instances([.036,.014,depth],Array.from({length:n},(_,i)=>[x+(i-(n-1)/2)*width/n,y,z]),'black');
  }
  const rackable=['server','switch','router','pdu','panel'].includes(type);
  if(type==='ap'){
    const body=mesh(new T.CylinderGeometry(w/2-.08,w/2,h,56),'white');body.position.y=h/2;
    const trim=ring(w/2-.2,.018,[0,h+.006,0],powered?'cyan':'silver');trim.rotation.x=-Math.PI/2;
    cylinder(.12,.016,[0,h+.005,0],powered?'led':'silver').rotation.x=0;
    const base=mesh(new T.CylinderGeometry(w/2-.1,w/2-.1,.05,56),'silver');base.position.y=.05;
  }else{
    const color=['wall','isp','ont','surge'].includes(type)?'white':'shell';
    box([w,h,d],[0,h/2,0],color,group,Math.min(.07,h*.19));
    if(!['wall','laptop','surge'].includes(type)){
      box([w-.08,Math.max(.04,h-.1),.035],[0,h/2,d/2+.012],'face',group,.016);
      box([w-.08,Math.max(.04,h-.1),.025],[0,h/2,-d/2-.008],'face',group,.009);
    }
  }
  if(!['wall','isp','ap'].includes(type)){
    // Feet remain inside the lower case envelope so the placement origin is exact.
    const points=[];for(const x of [-1,1])for(const z of [-1,1])points.push([x*(w/2-.28),.034,z*(d/2-.23)]);
    instances([.26,.068,.24],points,'rubber');
  }
  if(!['wall','isp','laptop','ap','surge'].includes(type)){
    topVents(0,-.12,Math.min(w-1,2.8),Math.min(d*.5,1.12));
    for(const x of [-1,1])for(const z of [-1,1]){
      const s=cylinder(.035,.012,[x*(w/2-.13),h+.008,z*(d/2-.14)],'silver');s.rotation.x=0;
    }
    box([w-.2,.013,.016],[0,h*.23,d/2+.033],'silver');
  }
  if(rackable){
    for(const sign of [-1,1]){
      box([.24,h,.11],[sign*(w/2+.055),h/2,d/2-.02],'silver',group,.018);
      for(const yy of [h*.22,h*.78]){
        cylinder(.047,.018,[sign*(w/2+.055),yy,d/2+.043],'black');
        box([.047,.075,.01],[sign*(w/2+.055),yy,d/2+.055],'black',group,.012);
      }
    }
  }
  if(type==='laptop'){
    box([w-.18,.028,d-.22],[0,h+.012,0],'silver',group,.055);
    const lid=new T.Group();lid.position.set(0,h+.05,-d/2+.07);lid.rotation.x=-.16;group.add(lid);
    box([w,2.66,.13],[0,1.33,0],'shell',lid,.075);
    box([w-.19,2.46,.034],[0,1.35,.075],'black',lid,.035);
    const display=box([w-.32,2.29,.014],[0,1.35,.099],powered?'screen':'glass',lid,.012);display.userData.labDisplay=true;
    cylinder(.027,.014,[0,2.59,.099],'glass',lid);
    const keys=[];for(let row=0;row<5;row++)for(let col=0;col<12;col++)keys.push([(col-5.5)*.30,h+.039,-.88+row*.235]);
    instances([.255,.034,.178],keys,'face');
    box([1.46,.025,.16],[0,h+.04,.29],'face',group,.014);
    box([1.36,.014,.68],[0,h+.034,.88],'shell',group,.025);
    box([1.28,.014,.6],[0,h+.043,.88],'silver',group,.02);
    for(const x of [-1,1]){const hinge=cylinder(.09,.62,[x*1.47,h+.04,-d/2+.10],'face');hinge.rotation.set(0,0,Math.PI/2);}
  }else if(type==='server'){
    for(let i=0;i<4;i++){
      const x=(i-1.5)*1.21;
      box([1.13,.79,.10],[x,h/2,d/2+.052],'silver',group,.018);
      box([1.03,.67,.04],[x,h/2,d/2+.12],'black',group,.012);
      instances([.85,.028,.018],Array.from({length:7},(_,j)=>[x,h/2-.24+j*.08,d/2+.15]),'face');
      box([.71,.07,.08],[x,h/2-.21,d/2+.18],'silver',group,.015);
      box([.055,.073,.021],[x+.45,h/2+.22,d/2+.16],'led',group,.008);
    }
    for(const side of [-1,1]){
      box([.08,.67,.16],[side*2.75,h/2,d/2+.17],'black',group,.028);
      box([.05,.45,.055],[side*2.75,h/2,d/2+.28],'silver',group,.02);
    }
    // Rear fan grille, separate from the real power and network sockets.
    for(const x of [-1.24,-.34]){
      cylinder(.31,.018,[x,h/2,-d/2-.035],'black');
      for(const radius of [.11,.2,.28])ring(radius,.014,[x,h/2,-d/2-.05],'silver');
      box([.59,.026,.018],[x,h/2,-d/2-.066],'face');
    }
  }else if(type==='nas'){
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.49;
      box([.44,2.29,.12],[x,1.42,d/2+.065],'black',group,.025);
      box([.36,1.93,.05],[x,1.48,d/2+.14],'face',group,.02);
      instances([.26,.022,.019],Array.from({length:11},(_,j)=>[x,.74+j*.11,d/2+.17]),'silver');
      box([.25,.085,.055],[x,.43,d/2+.17],'silver',group,.01);
      box([.045,.055,.022],[x,2.36,d/2+.175],'led',group,.005);
    }
    cylinder(.57,.025,[-.25,1.55,-d/2-.037],'black');
    for(const radius of [.16,.28,.4,.52])ring(radius,.017,[-.25,1.55,-d/2-.064],'silver');
  }else if(type==='ups'){
    box([1.51,1.22,.065],[0,2.34,d/2+.055],'black',group,.08);
    box([1.18,.67,.025],[0,2.43,d/2+.102],powered?'screen':'glass',group,.025);
    if(powered){
      box([.83,.29,.017],[0,2.48,d/2+.12],'cyan',group,.015);
      instances([.13,.11,.02],[-.3,-.1,.1,.3].map(x=>[x,2.15,d/2+.12]),'led');
    }
    instances([1.5,.044,.035],Array.from({length:10},(_,i)=>[0,.39+i*.104,d/2+.035]),'black');
    for(const x of [-.46,0,.46])cylinder(.065,.022,[x,1.82,d/2+.076],'silver');
  }else if(type==='wall'){
    for(const x of [-.78,.78]){
      box([1.31,2.08,.072],[x,1.07,d/2+.022],'shell',group,.065);
      box([1.18,1.96,.041],[x,1.07,d/2+.071],'white',group,.06);
      for(const y of [.13,1.97])screw(x,y,d/2+.102);
    }
  }else if(type==='isp'){
    box([w-.22,h-.22,.042],[0,h/2,d/2+.04],'white',group,.05);
    box([.54,.08,.028],[0,h-.21,d/2+.075],'blue',group,.014);
    for(const x of [-.63,.63])screw(x,.2,d/2+.076);
  }else if(type==='surge'){
    box([w-.15,.018,.035],[0,h+.008,-.53],'silver');
    box([.48,.03,.59],[2.24,h+.012,0],'face',group,.05);
  }else if(type==='ont'){
    box([1.01,.023,.14],[-.55,h+.018,.57],'blue',group,.02);
    for(let i=0;i<4;i++)box([.085,.021,.065],[.33+i*.18,h+.017,.57],i===0?'led':'cyan',group,.008);
  }else if(type==='router'){
    box([.51,.08,.031],[-1.56,h*.55,d/2+.052],'silver',group,.008);
    box([.035,.36,.034],[-.77,h/2,d/2+.047],'blue');
  }else if(type==='panel'){
    for(let i=0;i<4;i++)box([.51,.07,.023],[(i-1.5)*1.05,h-.072,d/2+.04],'white',group,.006);
  }
  function socket(kind,id,holder){
    if(kind==='copper'){
      box([.46,.35,.081],[0,0,.006],'silver',holder,.013);
      box([.372,.267,.018],[0,-.003,.055],'black',holder,.006);
      box([.16,.055,.02],[0,-.145,.058],'black',holder);
      instances([.021,.065,.027],Array.from({length:8},(_,i)=>[(i-3.5)*.042,.078,.077]),'gold',holder);
      box([.057,.039,.012],[-.188,.135,.056],powered?'led':'glass',holder);
      box([.057,.039,.012],[.188,.135,.056],powered?'cyan':'glass',holder);
      if(type==='laptop')holder.scale.y=.57;
    }else if(kind==='powerOut'){
      box([.49,.55,.085],[0,0,.018],'white',holder,.09);
      box([.427,.482,.032],[0,0,.075],'shell',holder,.065);
      box([.055,.16,.013],[-.105,.077,.096],'black',holder,.005);
      box([.055,.183,.013],[.105,.066,.096],'black',holder,.005);
      cylinder(.049,.013,[0,-.143,.097],'black',holder);
      box([.087,.033,.012],[0,-.16,.105],'black',holder);
    }else if(kind==='powerIn'&&['laptop','router','ont','nas','ap'].includes(type)){
      const r=type==='laptop'?.095:.165;
      cylinder(r,.052,[0,0,.006],'silver',holder);
      cylinder(r*.75,.012,[0,0,.04],'black',holder);
      cylinder(r*.2,.035,[0,0,.057],'gold',holder);
      ring(r*.81,r*.12,[0,0,.043],'silver',holder);
    }else if(kind==='powerIn'){
      box([.69,.51,.06],[0,0,.013],'silver',holder,.037);
      const shape=new T.Shape();shape.moveTo(-.285,-.2);shape.lineTo(.285,-.2);shape.lineTo(.285,.085);shape.lineTo(.17,.2);shape.lineTo(-.17,.2);shape.lineTo(-.285,.085);shape.closePath();
      const body=mesh(new T.ExtrudeGeometry(shape,{depth:.038,bevelEnabled:false}),'black',holder);body.position.z=.049;
      instances([.051,.093,.054],[[-.153,-.069,.099],[.153,-.069,.099],[0,.108,.099]],'silver',holder);
    }else if(kind==='sc'){
      box([.36,.36,.15],[0,0,.048],'green',holder,.013);
      box([.267,.277,.022],[0,0,.136],'black',holder,.007);
      cylinder(.069,.017,[0,0,.151],'white',holder);
      cylinder(.031,.018,[0,0,.164],'black',holder);
      for(const sign of [-1,1])box([.065,.15,.035],[sign*.19,0,.037],'green',holder);
    }else{
      box([.52,.235,.1],[0,0,.035],'silver',holder,.01);
      box([.448,.164,.013],[0,0,.094],'black',holder,.005);
      instances([.024,.029,.01],Array.from({length:10},(_,i)=>[(i-4.5)*.036,-.061,.103]),'gold',holder);
      box([.35,.025,.032],[0,-.132,.078],'blue',holder,.005);
    }
  }
  for(const p of portLayout(type)){
    const holder=new T.Group();holder.name=p.id;holder.userData={kind:'port',port:p.id};
    // Source layouts include the old model viewer's 0.35-unit plinth offset.
    holder.position.fromArray(p.position);holder.position.y-=.35;
    holder.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...p.normal));
    group.add(holder);socket(p.kind,p.id,holder);ports.set(p.id,holder);
  }
  let power=null;
  if(!['wall','isp','panel'].includes(type)){
    power=new T.Group();power.name='Power switch';power.userData={kind:'power'};group.add(power);
    if(['laptop','surge','ap'].includes(type)){
      power.position.set(type==='laptop'?1.92:type==='surge'?2.24:.6,h+.053,type==='laptop'?-.99:type==='ap'?.55:0);
      power.rotation.x=-Math.PI/2;
    }else power.position.set(type==='server'?2.46:type==='ups'?0:w/2-.2,type==='ups'?1.55:type==='nas'?2.76:h/2,d/2+.055);
    cylinder(.105,.048,[0,0,0],'black',power);
    ring(.066,.009,[0,0,.029],powered?'led':'silver',power);
    box([.024,.075,.018],[0,.045,.034],powered?'led':'silver',power,.005);
    power.traverse(o=>{o.userData.kind='power';});
  }
  let dims=[w,h,d];
  const units={server:2,nas:2,ups:2,router:1,switch:1,pdu:1,panel:1}[type];
  if(rack&&units){
    // Generic rackmount variants retain socket identities and proportional layout.
    // NAS/UPS become low, wide appliance cases instead of standing tower cases.
    dims=[6,units*(6*1.75/19)-.06,d];group.scale.set(dims[0]/w,dims[1]/h,1);
    if(!rackable)for(const sign of [-1,1]){
      box([w*.036,h,.11],[sign*(w/2+w*.009),h/2,d/2-.02],'silver',group,.018);
      for(const yy of [h*.22,h*.78])cylinder(.046,.018,[sign*(w/2+w*.009),yy,d/2+.047],'black');
    }
  }
  return {group,ports,power,dims,size:dims};
}
