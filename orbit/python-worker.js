import {loadPyodide} from './assets/python/pyodide.mjs';
let runtime;const runtimeURL=new URL('./assets/python/',import.meta.url);
try{runtime=await loadPyodide({indexURL:runtimeURL.protocol==='file:'?decodeURIComponent(runtimeURL.pathname):runtimeURL.href});postMessage({type:'ready'});}catch(e){postMessage({type:'fatal',error:'Python could not load: '+e.message});}
self.onmessage=async({data})=>{if(!runtime)return;const {id,code,files}=data;let output='',error='';const add=v=>{if(output.length<12000)output+=v+'\n';};runtime.setStdout({batched:add});runtime.setStderr({batched:v=>{if(error.length<12000)error+=v+'\n';}});
 const globals=runtime.toPy({__name__:'__main__'});
 try{
  runtime.runPython('import os, shutil\nos.chdir("/")\nif os.path.exists("/practice"): shutil.rmtree("/practice")\nos.mkdir("/practice")\nos.chdir("/practice")');
  for(const [name,text]of Object.entries(files||{})){if(/^[\w .-]{1,100}$/.test(name)&&typeof text==='string'&&text.length<=100000)runtime.FS.writeFile('/practice/'+name,text);}
  // Parse using Python itself; completion uses results plus AST node kinds, never string matching alone.
  runtime.globals.set('_lab_source',code);
  const kinds=runtime.runPython('import ast, json\njson.dumps([type(n).__name__ for n in ast.walk(ast.parse(_lab_source))])');
  await runtime.runPythonAsync(code,{globals});
  runtime.globals.set('_lab_globals',globals);
  const meta=JSON.parse(runtime.runPython('json.dumps({"vars": {k:v for k,v in _lab_globals.items() if not k.startswith("_") and isinstance(v,(str,int,float,bool,list,dict,type(None)))}, "functions":[k for k,v in _lab_globals.items() if not k.startswith("_") and callable(v)]}, default=str)'));
  const outFiles={};for(const name of runtime.FS.readdir('/practice')){if(!/^[\w .-]{1,100}$/.test(name)||name==='.'||name==='..')continue;const st=runtime.FS.stat('/practice/'+name);if(runtime.FS.isFile(st.mode)&&st.size<=100000)outFiles[name]=runtime.FS.readFile('/practice/'+name,{encoding:'utf8'});}
  postMessage({id,type:'result',ok:!error,output,error,traceKinds:JSON.parse(kinds),vars:meta.vars,functions:meta.functions,files:outFiles});
 }catch(e){postMessage({id,type:'result',ok:false,output,error:String(e.message).slice(-12000),traceKinds:[],vars:{},functions:[],files:{}});}finally{globals.destroy();}
};
