// Shared teaching state for GUI tools and command-line inspection. No host access.
export function processes(s) {
  s.processes ??= [
    {id:1040,name:s.os==='windows'?'explorer':s.os==='macos'?'Finder':'gnome-shell',cpu:2,memory:180,protected:true,running:true},
    {id:2048,name:s.os==='windows'?'pwsh':s.os==='macos'?'zsh':'bash',cpu:1,memory:60,protected:true,running:true},
    {id:3072,name:'python',cpu:4,memory:96,protected:false,running:true}
  ];
  return s.processes;
}
export function startDemo(s) {
  const all=processes(s);let p=all.find(p=>p.id===4096);
  if(!p){p={id:4096,name:'Lab Reporter',cpu:72,memory:640,protected:false,running:true};all.push(p);}
  Object.assign(p,{running:true,cpu:72,memory:640});
  s.desktopEvent={kind:'start-demo',pid:p.id};return p;
}
export function endProcess(s,id) {
  const p=processes(s).find(p=>p.id===Number(id)&&p.running);
  if(!p)throw Error('Select a running process.');
  if(p.protected)throw Error('This lesson protects the desktop and shell. Choose the Lab Reporter practice process.');
  p.running=false;s.desktopEvent={kind:'end-process',pid:p.id};return p;
}
export function usage(s){const p=processes(s).filter(p=>p.running);return {cpu:Math.min(100,p.reduce((n,p)=>n+p.cpu,0)),memory:p.reduce((n,p)=>n+p.memory,0),count:p.length};}
const home=s=>s.os==='windows'?'C:/Users/Student':s.os==='macos'?'/Users/student':'/home/student';
const equal=(s,a,b)=>s.os==='windows'?a.toLowerCase()===b.toLowerCase():a===b;
const beneath=(p,root)=>p===root||p.startsWith(root+'/');
const validName=name=>typeof name==='string'&&/^[^/\\:*?"<>|\x00-\x1F]{1,70}$/.test(name)&&!['.','..'].includes(name)&&name.trim()===name;
export function entries(s,folder=s.cwd){const prefix=folder+'/';return [...s.dirs.map(path=>({path,type:'Folder',size:0})),...Object.entries(s.files).map(([path,text])=>({path,type:'Text document',size:new TextEncoder().encode(text).length}))].filter(x=>x.path.startsWith(prefix)&&!x.path.slice(prefix.length).includes('/')).map(x=>({...x,name:x.path.slice(prefix.length)}));}
export function fileAction(s,action,{target,name,destination}={}) {
  const all=()=>[...s.dirs,...Object.keys(s.files)];
  const resolve=p=>all().find(x=>equal(s,x,p||''));
  const collision=p=>all().some(x=>equal(s,x,p));
  if(action==='create'){
    if(!validName(name))throw Error('Use a folder name without slashes or reserved characters.');
    target=s.cwd+'/'+name;if(collision(target))throw Error('That name already exists. Choose a different name.');
    if(s.dirs.length>=200)throw Error('This workspace has reached its folder limit.');
    s.dirs.push(target);
  } else if(action==='restore'){
    const item=(s.trash||[]).find(x=>x.path===target);if(!item)throw Error('Select an item in Trash.');
    if(!s.dirs.includes(item.path.slice(0,item.path.lastIndexOf('/'))))throw Error('Restore its parent folder first.');
    if([...item.dirs,...Object.keys(item.files)].some(collision))throw Error('An item already exists at the original location. Rename that item before restoring.');
    s.dirs.push(...item.dirs);Object.assign(s.files,item.files);s.trash=s.trash.filter(x=>x!==item);
  } else {
    target=resolve(target);if(!target||!beneath(target,home(s))||target===home(s))throw Error('Select a practice file or folder inside your home folder.');
    if(action==='trash'){
      const item={path:target,dirs:s.dirs.filter(p=>beneath(p,target)),files:Object.fromEntries(Object.entries(s.files).filter(([p])=>beneath(p,target)))};
      s.trash??=[];if(s.trash.length>=30)throw Error('Trash is full in this practice workspace. Restore an item first.');
      s.trash.push(item);s.dirs=s.dirs.filter(p=>!beneath(p,target));for(const p of Object.keys(item.files))delete s.files[p];
      if(beneath(s.cwd,target))s.cwd=home(s);
    } else if(action==='rename'||action==='copy'){
      if(!validName(name||target.split('/').pop()))throw Error('Use a simple name without slashes or reserved characters.');
      const parent=action==='rename'?target.slice(0,target.lastIndexOf('/')):destination;
      if(!s.dirs.includes(parent))throw Error('Open an existing destination folder.');
      const to=parent+'/'+(name||target.split('/').pop());
      if(beneath(to,target))throw Error('Choose a destination outside the source folder.');
      if(collision(to))throw Error('The destination already has that name. This lab will not overwrite it.');
      const dirs=s.dirs.filter(p=>beneath(p,target)),files=Object.entries(s.files).filter(([p])=>beneath(p,target));
      if(action==='copy'&&(s.dirs.length+dirs.length>200||Object.keys(s.files).length+files.length>200))throw Error('This practice workspace is full.');
      for(const p of dirs)s.dirs.push(to+p.slice(target.length));for(const [p,text]of files)s.files[to+p.slice(target.length)]=text;
      if(action==='rename'){s.dirs=s.dirs.filter(p=>!beneath(p,target));for(const [p]of files)delete s.files[p];if(beneath(s.cwd,target))s.cwd=to+s.cwd.slice(target.length);}
      destination=to;
    } else throw Error('Unknown file action.');
  }
  s.desktopEvent={kind:'file-'+action,path:target,destination};return s.desktopEvent;
}
