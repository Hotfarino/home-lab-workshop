// Run after build_lab.py. Named socket nodes and extras must survive compression.
import {readFileSync,writeFileSync,mkdtempSync,copyFileSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const base=resolve(import.meta.dirname,'..'),temp=mkdtempSync(join(tmpdir(),'lab-gltf-'));
try{
 for(const name of ['hardware','room']){const output=join(base,`lab-blender-${name}.glb`),input=join(temp,`${name}.glb`);copyFileSync(output,input);execFileSync(join(base,'node_modules/.bin/gltfpack'),['-i',input,'-o',output,'-cc','-kn','-km','-ke','-vpf'],{stdio:'inherit'});}
 const report=JSON.parse(readFileSync(join(base,'blender/export-report.json'),'utf8'));report.optimization='gltfpack 1.3.0, EXT_meshopt_compression; named nodes, materials and extras retained';report.optimized_library_bytes=statSync(join(base,'lab-blender-hardware.glb')).size;report.optimized_room_bytes=statSync(join(base,'lab-blender-room.glb')).size;writeFileSync(join(base,'blender/export-report.json'),JSON.stringify(report,null,2)+'\n');
}finally{rmSync(temp,{recursive:true,force:true});}
