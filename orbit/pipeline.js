// A small, documented object-pipeline subset. Parses data, never evaluates shell code.
export function runPipeline(s,parts,{execute,tokens,write,depth}){
 if(parts.length>6)throw Error('This teaching shell supports up to six pipeline commands.');
 let result=execute(s,parts[0],{record:false,depth:depth+1});if(!result.ok)throw Error(result.output);
 for(const part of parts.slice(1)){
  const t=tokens(part),cmd=t.shift()?.toLowerCase();let rows=result.rows;
  if(s.os!=='windows'){
   if(cmd!=='grep'||t.length!==1)throw Error('This Unix pipeline supports grep word after a text command.');
   result={ok:true,output:result.output.split('\n').filter(line=>line.includes(t[0])).join('\n')};continue;
  }
  if(!rows)throw Error('This command needs PowerShell objects from Get-Process or Get-Service.');
  const columns=result.columns||Object.keys(rows[0]||{});
  const property=name=>{const key=columns.find(k=>k.toLowerCase()===name?.toLowerCase());if(!key)throw Error('Unknown property: '+name+'. Available: '+columns.join(', '));return key;};
  if(cmd==='select-object'){
   const keys=t.join('').split(',').map(property);rows=rows.map(row=>Object.fromEntries(keys.map(k=>[k,row[k]])));result={ok:true,rows,columns:keys,output:rows.map(r=>keys.map(k=>r[k]).join('  ')).join('\n')};
  }else if(cmd==='where-object'){
   if(t.length!==3||!['-eq','-ne','-gt','-lt'].includes(t[1].toLowerCase()))throw Error('Use Where-Object Property -eq value (also -ne, -gt, -lt).');
   const key=property(t[0]),op=t[1].toLowerCase(),wanted=t[2];rows=rows.filter(row=>{const left=row[key],right=typeof left==='number'?Number(wanted):wanted;if(typeof left==='number'&&!Number.isFinite(right))throw Error('Use a numeric value for '+key);if(op==='-eq'||op==='-ne'){const same=typeof left==='number'?left===right:String(left).toLowerCase()===String(right).toLowerCase();return op==='-eq'?same:!same;}return op==='-gt'?left>right:left<right;});result={ok:true,rows,columns,output:rows.map(r=>columns.map(k=>r[k]).join('  ')).join('\n')};
  }else if(cmd==='sort-object'){
   if(!t.length||t.length>2||t[1]&&t[1].toLowerCase()!=='-descending')throw Error('Use Sort-Object Property, optionally followed by -Descending.');const key=property(t[0]),sign=t[1]?-1:1;rows=[...rows].sort((a,b)=>sign*(typeof a[key]==='number'?a[key]-b[key]:String(a[key]).localeCompare(String(b[key]))));result={ok:true,rows,columns,output:rows.map(r=>columns.map(k=>r[k]).join('  ')).join('\n')};
  }else if(cmd==='measure-object'){
   if(t.length!==3||t[0].toLowerCase()!=='-property'||t[2].toLowerCase()!=='-sum')throw Error('Use Measure-Object -Property numericProperty -Sum.');const key=property(t[1]);if(rows.some(r=>typeof r[key]!=='number'))throw Error('Choose a numeric property.');rows=[{Count:rows.length,Sum:rows.reduce((n,r)=>n+r[key],0)}];result={ok:true,rows,columns:['Count','Sum'],output:'Count  Sum\n'+rows[0].Count+'  '+rows[0].Sum};
  }else if(cmd==='export-csv'){
   if(t.length!==2||t[1].toLowerCase()!=='-notypeinformation'||t[0].startsWith('-'))throw Error('Use Export-Csv report.csv -NoTypeInformation.');
   const quote=value=>'"'+String(value).replaceAll('"','""')+'"';const csv=[columns.map(quote).join(','),...rows.map(r=>columns.map(k=>quote(r[k])).join(','))].join('\n')+'\n';write(s,t[0],csv);result={ok:true,output:'',exported:t[0]};
  }else throw Error('Supported object pipeline commands: Select-Object, Where-Object, Sort-Object, Measure-Object and Export-Csv.');
 }
 const event={kind:'pipeline',command:parts.join(' | '),output:result.output};s.events.push(event);s.events=s.events.slice(-200);return {...result,event};
}
