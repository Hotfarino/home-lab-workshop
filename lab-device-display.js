import * as T from './lab-three.js?v=class47';
// The authored Blender screen is the anchor. No guessed page coordinates.
export function displayAnchor(model){
 let display=model.group.getObjectByName('Active_display');
 if(!display)model.group.traverse(o=>{if(o.userData.labDisplay)display=o;});
 if(!display)return null;
 display.geometry.computeBoundingBox();const b=display.geometry.boundingBox;
 return {display,width:b.max.x-b.min.x,height:b.max.y-b.min.y,z:b.max.z+.006,bounds:b};
}
export function displayCorners(anchor){
 const {display,bounds:b,z}=anchor;display.updateWorldMatrix(true,false);
 return [[b.min.x,b.max.y,z],[b.max.x,b.max.y,z],[b.max.x,b.min.y,z],[b.min.x,b.min.y,z]].map(p=>display.localToWorld(new T.Vector3(...p)));
}
const wallpapers=new Map();
function wallpaper(linux){const path=linux?'lab-wallpaper-ubuntu.jpg':'lab-wallpaper-windows-bloom.jpg';if(!wallpapers.has(path)){const img=new Image();const loaded=new Promise(resolve=>{img.onload=()=>resolve(img);img.onerror=()=>resolve(null)});img.src=path;wallpapers.set(path,loaded);}return wallpapers.get(path);}
export function installDisplay(model,device,ready){
 const anchor=displayAnchor(model);if(!anchor)return null;
 const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=800;const c=canvas.getContext('2d'),linux=device.os==='Linux';
 const paint=img=>{c.fillStyle=ready?(linux?'#33103f':'#dbe9fa'):'#070c15';c.fillRect(0,0,1440,800);if(!ready)return;
  if(img){const scale=Math.max(1440/img.width,800/img.height),w=img.width*scale,h=img.height*scale;c.drawImage(img,(1440-w)/2,(800-h)/2,w,h);}
  c.fillStyle=linux?'#191919':'#eaf0f8ed';c.fillRect(0,linux?0:744,1440,linux?40:56);
  if(linux){c.fillStyle='#fff';c.fillRect(20,17,28,7);c.font='17px system-ui';c.fillText('Ubuntu',678,27);c.fillStyle='#211b28c9';c.fillRect(0,40,76,760);}
  for(let i=0;i<5;i++){c.fillStyle=['#087cdb','#f6c142','#282a30','#7e8da0','#289cde'][i];const x=linux?20:562+i*63,y=linux?73+i*72:759;c.fillRect(x,y,linux?36:29,linux?36:29);if(i===0&&!linux){c.fillStyle='#eaf0f8';c.fillRect(x+13,y,3,29);c.fillRect(x,y+13,29,3);}if(i===2){c.fillStyle='#fff';c.font='18px monospace';c.fillText('>_',x+3,y+20);}}
  c.fillStyle=linux?'#fff':'#172b42';c.font='20px system-ui';c.fillText('Learning',linux?1260:25,linux?688:90);c.fillText('Repositories',linux?1240:25,linux?716:118);c.fillStyle='#f4c448';c.fillRect(linux?1290:55,linux?620:34,40,33);
 };
 paint(null);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;let disposed=false;texture.addEventListener('dispose',()=>{disposed=true;});
 if(ready)wallpaper(linux).then(img=>{if(img&&!disposed){paint(img);texture.needsUpdate=true;}});
 const plane=new T.Mesh(new T.PlaneGeometry(anchor.width,anchor.height),new T.MeshBasicMaterial({map:texture,toneMapped:false}));plane.position.set(0,0,anchor.z);plane.userData.kind='screen';anchor.display.add(plane);return {...anchor,plane};
}
