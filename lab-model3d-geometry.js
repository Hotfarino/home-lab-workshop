import * as T from './lab-three.js?v=class47';

// Fan cable tails into ordered lanes. Plugs still move only along the socket's
// insertion axis; no chassis or internal parts are taken apart.
export function connectionLayout(port, ports, amount) {
  const normal = new T.Vector3(...port.normal), base = new T.Vector3(...port.position);
  const axis = Math.abs(normal.z) > .5 ? 0 : Math.abs(normal.x) > .5 ? 2 : 0;
  const siblings = ports.filter(p => p.normal.every((v,i) => v === port.normal[i]))
    .slice().sort((a,b) => a.position[axis]-b.position[axis] || a.id.localeCompare(b.id));
  const lane = siblings.findIndex(p => p.id === port.id)-(siblings.length-1)/2;
  const tip = base.clone().addScaledVector(normal, .13+Math.max(0,Math.min(1,amount))*1.6);
  const tail = tip.clone().addScaledVector(normal, port.kind==='powerIn' ? .74 : .88);
  const bend = tail.clone().addScaledVector(normal, .7);
  const end = base.clone().addScaledVector(normal, 4.45);
  end.setComponent(axis, base.getComponent(axis)+lane*.52);
  if (normal.y > .5) {
    // Top outlets: route over the case rather than dipping through it.
    end.y = base.y+1.05; end.z += 3.0;
    bend.z += .45; bend.y = Math.max(bend.y,base.y+1.05);
  } else {
    end.y = Math.max(.45,base.y-.22);
    bend.y = Math.max(.5,bend.y+.16);
  }
  const curve = new T.CatmullRomCurve3([tail,bend,end.clone().add(new T.Vector3(0,.18,0)),end]);
  return {base,normal,tip,tail,end,curve};
}

// Keep the GPU geometry and attributes throughout the animation. Only write
// positions/normals; the indices and UVs of this fixed-size tube do not change.
export function updateTube(geometry, curve, radius, segments=32, sides=8) {
  const frames=curve.computeFrenetFrames(segments,false), positions=geometry.getAttribute('position'), normals=geometry.getAttribute('normal');
  let vertex=0;
  for(let i=0;i<=segments;i++) {
    const center=curve.getPointAt(i/segments), n=frames.normals[i], b=frames.binormals[i];
    for(let j=0;j<=sides;j++) {
      const angle=j/sides*Math.PI*2, cs=-Math.cos(angle), sn=Math.sin(angle);
      const x=cs*n.x+sn*b.x,y=cs*n.y+sn*b.y,z=cs*n.z+sn*b.z;
      normals.setXYZ(vertex,x,y,z); positions.setXYZ(vertex++,center.x+radius*x,center.y+radius*y,center.z+radius*z);
    }
  }
  positions.needsUpdate=normals.needsUpdate=true;
  geometry.computeBoundingSphere();
  return geometry;
}

export function fittedDistance(radius, aspect, fov=38) {
  const vertical=fov*Math.PI/360, horizontal=Math.atan(Math.tan(vertical)*Math.max(.1,aspect));
  return Math.max(4, radius/Math.sin(Math.min(vertical,horizontal))*1.12);
}

export function fittedBoxDistance(bounds, direction, aspect, fov=38) {
  const center=bounds.getCenter(new T.Vector3()),dir=direction.clone().normalize();
  const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),dir).normalize(),up=new T.Vector3().crossVectors(dir,right);
  const tanV=Math.tan(fov*Math.PI/360),tanH=tanV*Math.max(.1,aspect);let distance=0;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const v=new T.Vector3(x,y,z).sub(center);
    distance=Math.max(distance,v.dot(dir)+Math.abs(v.dot(right))/tanH,v.dot(dir)+Math.abs(v.dot(up))/tanV);
  }
  return Math.max(4,distance*1.1);
}
