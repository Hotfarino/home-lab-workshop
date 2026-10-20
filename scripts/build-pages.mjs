import {readdir, readFile, writeFile, mkdir, copyFile, rm, stat} from 'node:fs/promises';
import {resolve, extname, basename} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'dist');
const extensions=new Set(['.js','.css','.jpg','.jpeg','.png','.svg','.glb','.txt']);
const entries=await readdir(root,{withFileTypes:true});
const files=entries.filter(e=>e.isFile()&&(
  ['home-lab.html','raid-workflow.html','HomeLab.Tools.psm1','three-license.txt'].includes(e.name)||
  (e.name.startsWith('lab-')&&extensions.has(extname(e.name)))
)).map(e=>e.name);
for(const required of ['home-lab.html','lab-app.js','lab-three.js','lab-blender-hardware.glb','lab-blender-room.glb']){
  if(!files.includes(required))throw Error(`Missing runtime file: ${required}`);
}
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const name of files){
  if(!(await stat(resolve(root,name))).size)throw Error(`Empty runtime file: ${name}`);
  await copyFile(resolve(root,name),resolve(out,name));
}
// Both entry points load the same application with relative asset URLs.
await copyFile(resolve(out,'home-lab.html'),resolve(out,'index.html'));
await writeFile(resolve(out,'.nojekyll'),'');
const published=new Set([...files,'index.html','.nojekyll']);
function requireLocal(value,source){
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)||value.includes('${'))return;
  const name=decodeURIComponent(value.split(/[?#]/,1)[0]).replace(/^\.\//,'');
  if(!name)return;
  if(name.startsWith('/')||basename(name)!==name||!published.has(name))throw Error(`Unpublished local reference in ${source}: ${value}`);
}
for(const name of published){
  const extension=extname(name);
  if(!['.html','.js','.css'].includes(extension))continue;
  const text=await readFile(resolve(out,name),'utf8');
  if(/per-scholas-dct-study-hub|core-1-reviewed-flashcards/.test(text))throw Error(`Wider study-hub link found in ${name}`);
  if(extension==='.html')for(const match of text.matchAll(/\b(?:src|href)=["']([^"']+)["']/g))requireLocal(match[1],name);
  if(extension==='.js')for(const match of text.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["'](\.[^"']+)["']/g))requireLocal(match[1],name);
  if(extension==='.css')for(const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))requireLocal(match[1],name);
}
console.log(`Built ${published.size} Home Lab runtime files. All local references resolve; no study-hub links, test files, dependencies or Git history are published.`);
