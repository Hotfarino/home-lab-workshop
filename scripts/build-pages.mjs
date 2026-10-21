import {readdir,readFile,writeFile,mkdir,copyFile,rm,stat,cp} from 'node:fs/promises';
import {resolve,extname,dirname,relative,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'dist');
const extensions=new Set(['.js','.css','.jpg','.jpeg','.png','.svg','.glb','.txt']);
const entries=await readdir(root,{withFileTypes:true});
const files=entries.filter(e=>e.isFile()&&(
 ['index.html','home-lab.html','raid-workflow.html','HomeLab.Tools.psm1','three-license.txt'].includes(e.name)||
 (e.name.startsWith('lab-')&&extensions.has(extname(e.name)))
)).map(e=>e.name);
for(const name of ['index.html','home-lab.html','lab-app.js','lab-three.js','lab-blender-hardware.glb','lab-blender-room.glb'])if(!files.includes(name))throw Error(`Missing runtime file: ${name}`);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of files){if(!(await stat(resolve(root,name))).size)throw Error(`Empty runtime file: ${name}`);await copyFile(resolve(root,name),resolve(out,name));}
// Portfolio assets are explicit; drafts and review screenshots are not deployed.
for(const name of ['style.css','home.js','mark.svg','media/network-studio.png','media/orbit-studio.png','media/packet-delivery.jpg']){
 const target=resolve(out,'portfolio',name);await mkdir(dirname(target),{recursive:true});await copyFile(resolve(root,'portfolio',name),target);
}
const orbit=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:resolve(root,'orbit'),stdio:'inherit'});
if(orbit.error)throw orbit.error;if(orbit.status!==0)throw Error('Orbit build failed.');
await cp(resolve(root,'orbit/dist'),resolve(out,'orbit'),{recursive:true});
await writeFile(resolve(out,'.nojekyll'),'');
async function walk(dir){const names=[];for(const e of await readdir(dir,{withFileTypes:true})){const full=resolve(dir,e.name);if(e.isDirectory())names.push(...await walk(full));else if(e.isFile())names.push(relative(out,full).split(sep).join('/'));else throw Error(`Unsupported published entry: ${full}`);}return names;}
const published=new Set(await walk(out));
function requireLocal(value,source){
 if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)||value.includes('${'))return;
 const url=decodeURIComponent(value.split(/[?#]/,1)[0]);if(!url)return;
 if(url.startsWith('/'))throw Error(`Root-absolute URL breaks project Pages in ${source}: ${value}`);
 let path=relative(out,resolve(out,dirname(source),url)).split(sep).join('/');
 if(published.has(path))return;
 path=path.replace(/\/$/,'');if(published.has((path?path+'/':'')+'index.html'))return;
 throw Error(`Unpublished local reference in ${source}: ${value}`);
}
for(const name of published){
 if(/(?:^|\/)(?:tests|snapshots|node_modules|\.git|\.github)(?:\/|$)|\.env(?:\.|$)|\.test\.mjs$/.test(name))throw Error(`Development/private file in website: ${name}`);
 if(!['.html','.js','.css','.mjs'].includes(extname(name)))continue;
 const text=await readFile(resolve(out,name),'utf8');
 if(/per-scholas-dct-study-hub|core-1-reviewed-flashcards|\/Users\/brandonwilliams/.test(text))throw Error(`Study-hub or local-machine reference in ${name}`);
 if(extname(name)==='.html')for(const match of text.matchAll(/\b(?:src|href)=["']([^"']+)["']/g))requireLocal(match[1],name);
 if(['.js','.mjs'].includes(extname(name)))for(const match of text.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["'](\.[^"']+)["']/g))requireLocal(match[1],name);
 if(extname(name)==='.css')for(const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))requireLocal(match[1],name);
}
console.log(`Built ${published.size} portfolio runtime files. Both labs, subdirectory links and local imports checked. No study-hub, tests, exports or Git metadata in the website.`);
