// A small read-only filesystem for navigating the learning folders; never host files.
const entries={
 '/':{type:'dir',children:['Learning-Repositories','LabDrivers','README.txt']},
 '/README.txt':{type:'file',text:'HOME LAB COMPUTER\nOpen Learning-Repositories for the lessons and projects.\nTry: cd Learning-Repositories\nThen list the folder and read README.txt.\nAll files here belong to the teaching simulation.'},
 '/Learning-Repositories':{type:'dir',children:['01-Foundations','02-Practice-Projects','README.txt']},
 '/Learning-Repositories/README.txt':{type:'file',text:'LEARNING REPOSITORIES\n01-Foundations: learn the parts, addresses, services and commands.\n02-Practice-Projects: do a task and test it.\nUse Files / File Explorer for the full interactive lessons.'},
 '/Learning-Repositories/01-Foundations':{type:'dir',children:['network-basics.txt']},
 '/Learning-Repositories/01-Foundations/network-basics.txt':{type:'file',text:'A network adapter is the doorway. Its driver lets the OS use it.\nAn IP address identifies an interface. A mask defines its local network.\nA gateway carries traffic to other networks. DNS looks up names.\nA running service listens for requests on a port.\nCheck in order: adapter, cable, address, gateway, DNS, service.'},
 '/Learning-Repositories/02-Practice-Projects':{type:'dir',children:['checklist.txt']},
 '/Learning-Repositories/02-Practice-Projects/checklist.txt':{type:'file',text:'1. Read your adapter in Device Manager.\n2. Read the IPv4 address in Terminal.\n3. Test the default gateway.\n4. Look up example.com.\n5. Open the modeled page.\nChoose a guided OS task above the laptop for one step at a time.'},
 '/LabDrivers':{type:'dir',children:['Ethernet']},
 '/LabDrivers/Ethernet':{type:'dir',children:['README.txt']},
 '/LabDrivers/Ethernet/README.txt':{type:'file',text:'Supplied compatible teaching driver.\nDevice Manager > adapter Properties > Driver > Update driver > Browse my computer.\nUse C:\\LabDrivers\\Ethernet in the guided installer.\nNo installer or executable is downloaded or run.'}
};
export function displayPath(cwd='/',shell='powershell'){return shell==='bash'?'/home/student'+(cwd==='/'?'':cwd):cwd.startsWith('/LabDrivers')?'C:'+cwd.replaceAll('/','\\'):'C:\\Users\\Student'+(cwd==='/'?'':cwd.replaceAll('/','\\'));}
export function fileCommand(cmd,shell,cwd='/'){const linux=shell==='bash',ps=shell==='powershell';let m;const out=(ok,output,extra={})=>({ok,output,...extra});const resolve=raw=>{let path=raw.replace(/^['"]|['"]$/g,'').replaceAll('\\','/');path=path.replace(/^C:\/LabDrivers/i,'/LabDrivers');if(/^C:\/Users\/Student(?:\/|$)/i.test(path))path=path.replace(/^C:\/Users\/Student/i,'')||'/';if(/^\/home\/student(?:\/|$)/.test(path))path=path.replace(/^\/home\/student/,'')||'/';const parts=(path.startsWith('/')?'':cwd+'/')+path;const a=[];for(const part of parts.split('/')){if(!part||part==='.')continue;if(part==='..')a.pop();else a.push(part);}const wanted='/'+a.join('/');return Object.keys(entries).find(k=>linux?k===wanted:k.toLowerCase()===wanted.toLowerCase())||wanted;};
 if(linux&&cmd==='cat /etc/os-release')return out(true,'NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nVERSION_ID="24.04"');
 if(linux&&cmd==='pwd'||ps&&/^(pwd|Get-Location)$/i.test(cmd)||shell==='cmd'&&/^cd$/i.test(cmd))return out(true,displayPath(cwd,shell));
 if((m=cmd.match(linux?/^cd(?:\s+(.+))?$/:/^(?:cd|chdir|Set-Location)(?:\s+(.+))?$/i))){if(shell==='cmd'&&/^Set-Location/i.test(cmd))return null;const path=m[1]?resolve(m[1]):'/';if(entries[path]?.type!=='dir')return out(false,'Directory not found in the lab filesystem. List the current folder first.');return out(true,'',{cwd:path});}
 if((m=cmd.match(linux?/^ls(?:\s+(-a|-l|-la|-[al]{2}))?(?:\s+(.+))?$/:/^(?:dir|Get-ChildItem|ls)(?:\s+(.+))?$/i))){if(shell==='cmd'&&!/^dir/i.test(cmd))return null;const path=resolve(linux?(m[2]||'.'):(m[1]||'.'));const e=entries[path];if(!e)return out(false,'Path not found in the lab filesystem.');if(e.type==='file')return out(true,path.split('/').at(-1));return out(true,(linux?'':displayPath(path,shell)+'\n\n')+e.children.map(n=>(!linux&&entries[(path==='/'?'':path)+'/'+n]?.type==='dir'?'<DIR>  ':'')+n).join('\n'));}
 if((m=cmd.match(linux?/^cat\s+(.+)$/:/^(?:type|Get-Content|cat)\s+(.+)$/i))){if(shell==='cmd'&&!/^type/i.test(cmd))return null;const e=entries[resolve(m[1])];return e?.type==='file'?out(true,e.text):out(false,'File not found. Use ls / dir to see the available text files.');}
 return null;
}
