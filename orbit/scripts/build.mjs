import {mkdir,copyFile,readdir,readFile,stat,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const files=['index.html','style.css','app.js','code-results.js','engine.js','curriculum.js','world.js','python.js','python-worker.js','storage.js','desktop-model.js','desktop.js','assistant.js','depth-curriculum.js','desktop.css','pipeline.js','powershell-depth.js','network-game.js','network-walkthrough.js','arcade.js','arcade.css','rescue-model.js','packet-rescue.js','packet-rescue.css','packet-delivery.css','packet-delivery.js','delivery-model.js','repair-model.js','packet-repair.js','packet-repair.css'];
const source=new Map(await Promise.all(files.map(async f=>[f,await readFile(f,'utf8')])));
const revision=createHash('sha256').update([...source.values()].join('\n')).digest('hex').slice(0,12);
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const [f,text] of source){
 const versioned=text.replace(/(["'])(\.\/)?([\w-]+\.(?:js|css))\1/g,(match,quote,prefix,name)=>files.includes(name)?`${quote}${prefix||''}${name}?v=${revision}${quote}`:match);
 await writeFile('dist/'+f,versioned);
}
async function copy(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){await mkdir('dist/'+p,{recursive:true});await copy(p);}else{await mkdir(path.dirname('dist/'+p),{recursive:true});await copyFile(p,'dist/'+p);}}}await copy('assets');
await writeFile('dist/.nojekyll','');
for(const f of files){const text=await readFile(f,'utf8');for(const m of text.matchAll(/(?:from\s+|import\()\s*['"](\.\/[^'"]+)['"]/g)){await stat(path.resolve(path.dirname(f),m[1]));}}
console.log('Built standalone Orbit Lab with local 3D models and Python runtime.');
