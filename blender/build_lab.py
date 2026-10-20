"""Editable Blender hardware library. Coordinates use the simulator's socket contract.
One scene unit = 19/6 inches. GLB assets keep immutable port IDs in extras.
Run: blender --background --python blender/build_lab.py
"""
import bpy, json, math, os
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent.parent
SPEC=json.loads((BASE/'blender/hardware-spec.json').read_text())
OUT=BASE; U=6*1.75/19; FLOOR=-9.45; RACK_BASE=-8.5; RACK_UNITS=18
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.context.scene.unit_settings.system='IMPERIAL';bpy.context.scene.unit_settings.scale_length=19*.0254/6
M={}
def material(name,c,metal=0,rough=.45,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emission:p.inputs['Emission Color'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=emission
 M[name]=m;return m
for args in [('graphite',(.055,.065,.08),.35,.38),('black',(.008,.012,.019),.05,.58),('aluminum',(.48,.55,.61),.78,.3),('steel',(.23,.29,.34),.82,.32),('ivory',(.87,.9,.91),.06,.38),('white',(.96,.975,.99),.05,.32),('rubber',(.023,.027,.032),0,.83),('gold',(.72,.46,.09),.75,.3),('blue',(.014,.27,.56),.2,.35),('green',(.013,.32,.09),0,.5),('screen_active',(.015,.25,.49),.05,.26,.4),('lamp_active',(.01,.6,.27),0,.22,.8),('link_active',(.01,.6,.25),0,.25,.6),('keylegend',(.66,.69,.72),0,.7),('esd',(.075,.19,.24),0,.82),('red',(.55,.025,.018),0,.3)]:material(*args)
# Separate worktop and backdrop finishes keep equipment readable under studio lighting.
material('desk_surface',(.36,.235,.135),0,.75)
material('backdrop_blue',(.38,.53,.63),0,.85)
material('room_floor',(.49,.55,.61),0,.8)
def cv(p):return (p[0],-p[2],p[1])
def group(name,parent=None,**extras):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent
 for k,v in extras.items():o[k]=v
 return o
def finish(o,name,mat,parent):
 o.name=name;o.data.materials.append(M[mat]);o.parent=parent
 return o
def box(name,size,pos,mat='graphite',parent=None,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=cv(pos));o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Manufactured edge radius','BEVEL');mod.width=min(bevel,min(size)*.26);mod.segments=3
  bpy.ops.object.modifier_apply(modifier=mod.name)
  mod=o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL');mod.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,mat,parent)
def cyl(name,r,depth,pos,mat='steel',parent=None,normal=(0,0,1),vertices=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=cv(pos));o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector(cv(normal)).to_track_quat('Z','Y')
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat,parent)
def ring(name,r,tube,pos,mat='steel',parent=None,normal=(0,0,1)):
 bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=tube,major_segments=32,minor_segments=6,location=cv(pos));o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector(cv(normal)).to_track_quat('Z','Y')
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat,parent)
def screw(x,y,z,parent,normal=(0,0,1)):
 cyl('Recessed screw head',.034,.012,(x,y,z),'steel',parent,normal)
 if normal==(0,0,1):
  box('Phillips slot',(.04,.009,.015),(x,y,z+.009),'black',parent,.002);box('Phillips cross',(.009,.04,.015),(x,y,z+.009),'black',parent,.002)
def text(label,pos,size,parent,normal=(0,0,1),mat='keylegend'):
 bpy.ops.object.text_add(location=cv(pos));o=bpy.context.object;o.name='Marking '+label;o.data.body=label;o.data.size=size;o.data.extrude=.0003;o.data.align_x='CENTER';o.data.align_y='CENTER';o.rotation_mode='QUATERNION';o.rotation_quaternion=(1,0,0,0) if normal==(0,1,0) else Vector(cv(normal)).to_track_quat('Z','Y');o.data.materials.append(M[mat]);o.parent=parent
 bpy.ops.object.convert(target='MESH');return bpy.context.object
def fan(x,y,z,r,parent):
 cyl('Fan shadow',r,.018,(x,y,z),'black',parent)
 for a in range(8):
  q=a*math.pi/4;bar=box('Fan blade',(r*.72,r*.19,.015),(x+math.cos(q)*r*.37,y+math.sin(q)*r*.37,z-.015),'graphite',parent,.012);bar.rotation_euler.y=q
 cyl('Fan hub',r*.21,.04,(x,y,z+.012),'steel',parent)
 for f in [.32,.54,.77,.98]:ring('Fan finger guard',r*f,.012,(x,y,z+.038),'steel',parent)
 for a in [0,math.pi/2]:
  b=box('Grille support',(r*2,.022,.018),(x,y,z+.046),'steel',parent,.004);b.rotation_euler.y=a

def socket(parent,typ,p):
 holder=group(typ+'__port__'+p['id'],parent,labPort=p['id'],labKind=p['kind'])
 k=p['kind'];dc=k=='powerIn' and typ in ['laptop','router','ont','nas','ap']
 if k=='copper':
  box('RJ45 shield',(.47,.35,.13),(0,0,-.017),'steel',holder,.025);box('RJ45 cavity',(.381,.269,.019),(0,0,.058),'black',holder,.009);box('Latch cutout',(.16,.06,.018),(0,-.138,.066),'black',holder,.004)
  for i in range(8):box('Gold contact '+str(i+1),(.017,.08,.022),((i-3.5)*.043,.065,.075),'gold',holder,.003)
  for x in [-.187,.187]:box('Link indicator',(.048,.032,.015),(x,.139,.058),'link_active',holder,.008)
  if typ=='laptop':holder.scale.z=.58
 elif dc:
  r=.09 if typ=='laptop' else .15;cyl('Barrel outer sleeve',r,.065,(0,0,.012),'steel',holder);cyl('Barrel well',r*.75,.015,(0,0,.048),'black',holder);cyl('Barrel center pin',r*.15,.043,(0,0,.061),'gold',holder);ring('Rolled rim',r*.83,.012,(0,0,.058),'aluminum',holder)
 elif k=='powerOut':
  box('Outlet recess',(.53,.6,.08),(0,0,0),'graphite' if typ!='wall' else 'ivory',holder,.085);box('Outlet insert',(.45,.51,.036),(0,0,.049),'black' if typ!='wall' else 'white',holder,.065)
  for x in [-.1,.1]:box('Polarized blade opening',(.048,.18 if x>0 else .15,.018),(x,.073,.076),'black',holder,.007)
  cyl('Ground pin opening',.048,.018,(0,-.135,.077),'black',holder)
 elif k=='powerIn':
  box('IEC inlet flange',(.69,.51,.064),(0,0,.0),'graphite',holder,.05);box('IEC shaped well',(.51,.34,.06),(0,-.017,.038),'black',holder,.063)
  for x,y in [(-.15,-.055),(.15,-.055),(0,.108)]:box('IEC pin',(.043,.085,.06),(x,y,.083),'aluminum',holder,.008)
 elif k=='sc':
  box('SC/APC adapter',(.37,.36,.19),(0,0,.042),'green',holder,.02);box('SC key recess',(.26,.28,.018),(0,0,.146),'black',holder,.009);cyl('Ceramic ferrule sleeve',.052,.019,(0,0,.156),'ivory',holder);cyl('Optical aperture',.025,.02,(0,0,.171),'black',holder)
 else:
  box('SFP plus cage',(.52,.24,.16),(0,0,.015),'aluminum',holder,.012);box('Module slot',(.44,.168,.013),(0,0,.102),'black',holder,.004)
  for i in range(10):box('Cage contact',(.02,.034,.013),((i-4.5)*.035,-.05,.113),'gold',holder,.002)
  box('Cage latch',(.34,.025,.045),(0,-.135,.058),'steel',holder,.003)
 holder.location=cv((p['position'][0],p['position'][1]-.35,p['position'][2]));holder.rotation_mode='QUATERNION'
 # Local +Z (Three forward) is Blender -Y. Map using a Blender orientation converted from vectors.
 f=Vector(cv(p['normal']));holder.rotation_quaternion=Vector((0,-1,0)).rotation_difference(f)
 return holder

roots={}
for typ,(w,h,d) in SPEC['bodies'].items():
 root=group('device_'+typ,labType=typ,assetAuthoring='Blender',socketContract=1);roots[typ]=root
 if typ=='ap':
  cyl('Access point base',w/2,.18,(0,.1,0),'ivory',root,(0,1,0),64);cyl('Domed radio cover',w/2-.06,h-.12,(0,h/2+.06,0),'white',root,(0,1,0),64);ring('Activity light ring',w/2-.27,.018,(0,h+.006,0),'lamp_active',root,(0,1,0))
 elif typ=='wall':
  for x in [-.78,.78]:
   box('Wall plate',(1.32,2.12,.085),(x,1.09,d/2+.025),'ivory',root,.09)
   for y in [.12,2.06]:screw(x,y,d/2+.077,root)
 elif typ=='laptop':
  box('Aluminum unibody base',(w,h,d),(0,h/2,0),'graphite',root,.09);box('Palm rest',(w-.08,.017,d-.08),(0,h+.006,0),'steel',root,.05)
  for row in range(5):
   for col in range(12):
    x=(col-5.5)*.298;z=-.88+row*.252
    box('Sculpted keycap',(.254,.028,.203),(x,h+.035,z),'graphite',root,.018)
    if row<4:text(('1234567890-=' if row==0 else 'QWERTYUIOP[]' if row==1 else 'ASDFGHJKL;\"~' if row==2 else 'ZXCVBNM,./<>')[col],(x,h+.051,z),.064,root,(0,1,0))
  box('Space bar',(1.36,.025,.18),(0,h+.036,.42),'graphite',root,.014);box('Precision trackpad rim',(1.42,.018,.73),(0,h+.016,.94),'black',root,.055);box('Glass trackpad',(1.37,.021,.69),(0,h+.027,.94),'steel',root,.05)
  for x in [-1.76,1.76]:cyl('Display hinge',.09,.52,(x,h+.05,-1.29),'steel',root,(1,0,0))
  lid=group('Display assembly',root);box('Display aluminum shell',(w,2.72,.115),(0,1.36,0),'graphite',lid,.07);box('Screen bezel',(w-.13,2.57,.025),(0,1.36,.072),'black',lid,.03);box('Active display',(w-.36,2.24,.008),(0,1.44,.089),'screen_active',lid,.015)
  cyl('Camera lens',.033,.012,(0,2.59,.092),'black',lid);ring('Camera bezel',.036,.005,(0,2.59,.093),'steel',lid)
  lid.location=cv((0,h+.05,-1.37));lid.rotation_euler.x=math.radians(-9)
 else:
  shade='white' if typ in ['ont','isp'] else 'aluminum' if typ=='server' else 'graphite'
  box('Main enclosure',(w,h,d),(0,h/2,0),shade,root,.1 if typ in ['router','ont','ups','nas'] else .033)
  if typ!='isp':
   box('Front fascia',(w-.06,max(.08,h-.055),.046),(0,h/2,d/2+.004),'graphite' if typ!='ont' else 'ivory',root,.03)
   box('Lid separation seam',(w-.09,.012,d-.07),(0,h-.07,0),'black',root,.009)
   box('Lid panel',(w-.13,.048,d-.11),(0,h-.027,0),shade,root,.027)
  if typ in ['server','switch','router','pdu','panel']:
   for sign in [-1,1]:
    box('Rack mounting ear',(.25,h,.12),(sign*(w/2+.04),h/2,d/2-.03),'steel',root,.016)
    for y in [h*.23,h*.77]:cyl('Mounting screw hole',.041,.018,(sign*(w/2+.04),y,d/2+.041),'black',root)
  if typ not in ['isp','surge']:
   for x in [-1,1]:
    for z in [-1,1]:cyl('Top lid screw',.028,.014,(x*(w/2-.13),h+.005,z*(d/2-.13)),'steel',root,(0,1,0))
   for i in range(18):box('Vent slot',(.026,.012,min(.82,d*.43)),((i-8.5)*min(.14,(w-.5)/18),h+.003,-.15),'black',root,.004)
 if typ in ['server','nas']:
  for i in range(4):
   horizontal=typ=='server';x=(i-1.5)*(1.22 if horizontal else .49);bh=.84 if horizontal else 2.35;bw=1.12 if horizontal else .43;y=h/2 if horizontal else 1.45
   box('Drive tray frame',(bw,bh,.12),(x,y,d/2+.05),'steel',root,.025);box('Tray recessed face',(bw-.08,bh-.1,.045),(x,y,d/2+.12),'black',root,.02)
   for j in range(8):box('Tray ventilation',(bw-.16,.025,.014),(x,y-bh*.32+j*bh*.085,d/2+.151),'graphite',root,.005)
   box('Drive release latch',(bw*.65,.08,.09),(x,y-bh*.3,d/2+.179),'aluminum',root,.02);box('Drive activity LED',(.035,.055,.013),(x+bw*.35,y+bh*.33,d/2+.161),'lamp_active',root,.008)
   text(str(i+1),(x,y+bh*.34,d/2+.164),.081,root)
  if typ=='server':
   for x in [-1.27,-.3]:fan(x,h/2,-d/2-.03,.34,root)
   for sign in [-1,1]:box('Rack pull handle',(.1,.64,.22),(sign*2.76,h/2,d/2+.14),'graphite',root,.035)
  else:fan(-.22,1.46,-d/2-.03,.61,root)
 if typ=='ups':
  box('Control bezel',(1.5,1.03,.075),(0,2.4,d/2+.05),'black',root,.085);box('UPS LCD',(1.09,.59,.014),(0,2.47,d/2+.096),'screen_active',root,.023)
  text('UPS',(0,2.53,d/2+.108),.15,root);text('900 W',(0,2.31,d/2+.108),.08,root)
  for i in range(10):box('Intake vent',(1.58,.031,.024),(0,.35+i*.115,d/2+.039),'black',root,.008)
 if typ=='surge':
  box('Red rocker surround',(.46,.032,.66),(2.26,h+.018,0),'black',root,.04);box('Rocker switch',(.32,.065,.43),(2.26,h+.047,0),'red',root,.045)
 if typ=='ont':
  for i,name in enumerate(['PWR','PON','LAN']):
   x=-.48+i*.49;box('Indicator lens',(.12,.014,.055),(x,h+.009,.55),'lamp_active',root,.008);text(name,(x,h+.014,.79),.08,root,(0,1,0),'graphite')
 if typ=='panel':
  for i in range(4):text(str(i+1),((i-1.5)*1.05,h-.072,d/2+.037),.09,root)
 if typ not in ['wall','isp','ap']:
  for x in [-1,1]:
   for z in [-1,1]:box('Rubber foot',(.26,.075,.26),(x*(w/2-.24),.038,z*(d/2-.22)),'rubber',root,.025)
 for port in SPEC['ports'][typ]:socket(root,typ,port)
 if typ not in ['wall','isp','panel']:
  power=group(typ+'__power',root,labPower=True)
  cyl('Power key',.098,.035,(0,0,0),'black',power);ring('Illuminated power ring',.058,.008,(0,0,.025),'lamp_active',power);box('Power glyph',(.018,.065,.013),(0,.035,.031),'keylegend',power,.003)
  pos=(1.93,h+.058,-.99) if typ=='laptop' else (2.26,h+.088,0) if typ=='surge' else (.6,h+.05,.55) if typ=='ap' else (2.55,h/2,d/2+.084) if typ=='server' else (0,1.76,d/2+.09) if typ=='ups' else (w/2-.16,h/2,d/2+.07)
  power.location=cv(pos)
  if typ in ['laptop','surge','ap']:power.rotation_euler.x=-math.pi/2

# Collapse static parts by material within their semantic parent. Socket anchors remain separate.
def compact(root):
 parents=[root]+[o for o in root.children_recursive if o.type=='EMPTY']
 for parent in parents:
  meshes=[o for o in parent.children if o.type=='MESH']
  groups={}
  for o in meshes:groups.setdefault(o.data.materials[0].name,[]).append(o)
  for mat,items in groups.items():
   if len(items)<2:continue
   bpy.ops.object.select_all(action='DESELECT')
   for o in items:o.select_set(True)
   bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();items[0].name=parent.name+'__'+mat
# Purpose-built rack chassis preserve component proportions instead of flattening towers.
rack_roots={}
for typ in ['nas','ups']:
 w,h,d=6,2*U-.06,4.5 if typ=='nas' else 4.7
 root=group('device_'+typ+'_rack',labType=typ,assetAuthoring='Blender',socketContract=1,labDimensions=[w,h,d]);rack_roots[typ]=root
 box('Rack enclosure',(w,h,d),(0,h/2,0),'aluminum',root,.045)
 box('Ventilated front bezel',(w-.08,h-.04,.06),(0,h/2,d/2+.02),'graphite',root,.025)
 for x in [-3.04,3.04]:
  box('Rack ear',(.25,h,.12),(x,h/2,d/2-.03),'steel',root,.016)
  for y in [h*.23,h*.77]:cyl('Captive mounting point',.04,.02,(x,y,d/2+.045),'black',root)
 if typ=='nas':
  for i in range(4):
   x=(i-1.5)*1.27
   box('Drive tray frame',(1.17,.8,.14),(x,h/2,d/2+.05),'steel',root,.03)
   box('Drive tray',(1.04,.65,.045),(x,h/2,d/2+.14),'black',root,.025)
   for j in range(6):box('Air intake',(.9,.026,.018),(x,.3+j*.078,d/2+.175),'graphite',root,.005)
   box('Tray release handle',(.8,.09,.08),(x,.24,d/2+.2),'aluminum',root,.02)
 else:
  box('UPS display bezel',(1.6,.72,.075),(-1.15,h/2,d/2+.065),'black',root,.07)
  box('UPS display',(1.26,.46,.018),(-1.15,h/2,d/2+.111),'screen_active',root,.02)
  text('900 W',(-1.15,h/2,d/2+.132),.14,root)
  for j in range(8):box('Cooling intake',(2.2,.025,.018),(1.2,.24+j*.082,d/2+.062),'black',root,.005)
 for i in range(18):box('Top ventilation',(.032,.014,1.12),((i-8.5)*.15,h+.005,-.3),'black',root,.006)
 outputs=[p for p in SPEC['ports'][typ] if p['kind']=='powerOut']
 for p in SPEC['ports'][typ]:
  pp=dict(p);k=p['kind'];x=-2.3 if k=='powerIn' else (next(i for i,o in enumerate(outputs) if o['id']==p['id'])-(len(outputs)-1)/2)*1.05 if k=='powerOut' else 1.05 if p['id']=='eth' else 2.1
  pp['position']=[x,h/2+.35,-d/2-.01];pp['normal']=[0,0,-1];socket(root,typ,pp)
 power=group(typ+'__rack_power',root,labPower=True);cyl('Power switch',.09,.035,(0,0,0),'black',power);ring('Power ring',.055,.008,(0,0,.025),'lamp_active',power);power.location=cv((2.7,h/2,d/2+.085))
for root in list(roots.values())+list(rack_roots.values()):compact(root)
def select_tree(root):
 root.select_set(True)
 for o in root.children_recursive:o.select_set(True)
def export(roots,path):
 bpy.ops.object.select_all(action='DESELECT')
 for root in roots:select_tree(root)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_extras=True,export_yup=True,export_cameras=False,export_lights=False,export_animations=False)
export(list(roots.values())+list(rack_roots.values()),OUT/'lab-blender-hardware.glb')

room=group('lab_environment',assetAuthoring='Blender')
box('Seamless room floor',(100,.15,90),(0,FLOOR-.09,0),'room_floor',room,.04)
box('Worktop molded edge',(36,.28,22),(-6,-.16,1),'graphite',room,.14);box('Warm laminate work surface',(35.92,.105,21.92),(-6,-.015,1),'desk_surface',room,.08)
box('ESD work mat',(31,.018,16),(-6,.047,.2),'esd',room,.1)
for x in [-22,10]:
 for z in [-8,10]:
  box('Powder coated table leg',(.39,9.05,.39),(x,-4.94,z),'steel',room,.065);box('Adjustable leveling foot',(.74,.2,.74),(x,FLOOR+.1,z),'rubber',room,.08)
 box('Bench side brace',(.2,.32,18),(x,-7.1,1),'steel',room,.035)
box('Rear cross brace',(32,.32,.25),(-6,-7.1,-8),'steel',room,.04)
# Rack matches 19-inch equipment and 1.75-inch unit pitch in the same world scale.
base=RACK_BASE;top=base+RACK_UNITS*U+.25
for x in [13.65,20.35]:
 for z in [-2.9,4.2]:
  box('Rack upright',(.21,top-base+.35,.21),(x,(top+base)/2,z),'graphite',room,.025)
  for u in range(RACK_UNITS):
   for f in [.21,.5,.79]:box('Rack rail mounting hole',(.084,.075,.025),(x,base+(u+f)*U,4.315),'black',room,.003)
for y in [base-.2,top]:box('Rack cross frame',(7,.17,7.35),(17,y,.66),'graphite',room,.03)
for x in [13.85,20.15]:
 for z in [-2.65,3.95]:
  cyl('Rack caster wheel',.24,.21,(x,FLOOR+.3,z),'rubber',room,(1,0,0));box('Caster bracket',(.3,.3,.32),(x,FLOOR+.54,z),'steel',room,.04)
# A cable tray sits below the rear edge, leaving the desk open.
box('Cable tray',(31,.12,1.1),(-6,-.95,-8.7),'graphite',room,.04)
for x in [-20,8]:box('Tray bracket',(.12,1.05,.8),(x,-.46,-8.7),'steel',room,.03)
back=group('architectural_backdrop',room)
box('Back wall',(36,10,.18),(-6,1,-10.85),'backdrop_blue',back,.03);box('Blue wall accent',(36,.13,.08),(-6,5.25,-10.7),'blue',back,.02)
compact(room);export([room],OUT/'lab-blender-room.glb')
# Rear cable-management hoops stay outside the equipment footprint.
for y in [base+2*U,base+7*U,base+12*U,base+16*U]:
 ring('Cable management hoop',.55,.028,(21.3,y,-3.95),'steel',room,(0,1,0))
export([room],OUT/'lab-blender-room.glb')
# Save an editable assembled home-lab scene, using an intentional overview camera.
positions={'wall':(-20,3,-10),'isp':(-14,3.5,-10),'laptop':(-18,0,-5),'pdu':(-10,0,-5),'ont':(-2,0,-5),'router':(6,0,-5),'switch':(-18,0,1),'nas':(-10,0,1),'ap':(-2,0,1),'surge':(6,0,1),'ups':(-18,0,7),'panel':(-10,0,7),'server':(17,base+3*U,4.15-SPEC['bodies']['server'][2]/2)}
for i,root in enumerate(rack_roots.values()):
 root.location=cv((17,base+(8+i*3)*U,4.15-(4.5 if i==0 else 4.7)/2))
for typ,root in roots.items():
 root.location=cv(positions[typ])
 if typ=='server':root.scale=(1,1,(2*U-.06)/SPEC['bodies'][typ][1])
bpy.ops.object.camera_add(location=cv((32,24,39)));camera=bpy.context.object;direction=Vector(cv((-2,-1,0)))-camera.location;camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();camera.data.lens=35;bpy.context.scene.camera=camera
for name,pos,energy,size in [('Daylight softbox',(-10,30,20),4200,18),('Fill light',(25,18,-8),2800,14),('Front fill',(-25,12,24),1800,10)]:
 bpy.ops.object.light_add(type='AREA',location=cv(pos));light=bpy.context.object;light.name=name;light.data.energy=energy;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector(cv((-3,0,0)))-light.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.world.color=(.35,.35,.35);scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(BASE/'blender/home-lab-preview.png');scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'blender/home-lab.blend'),compress=True)
report={'blender':bpy.app.version_string,'device_types':list(roots),'port_anchors':sum(len(SPEC['ports'][k]) for k in roots),'unit_inches':19/6,'rack_unit_inches':1.75,'rack_units':RACK_UNITS,'rack_variants':list(rack_roots),'library_bytes':(OUT/'lab-blender-hardware.glb').stat().st_size,'room_bytes':(OUT/'lab-blender-room.glb').stat().st_size}
(BASE/'blender/export-report.json').write_text(json.dumps(report,indent=2));print('LAB_EXPORT_REPORT '+json.dumps(report))
if os.environ.get('LAB_RENDER')=='1':bpy.ops.render.render(write_still=True)
