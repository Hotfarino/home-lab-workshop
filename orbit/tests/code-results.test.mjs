import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createCodeResults} from '../code-results.js';

test('Code output and variables stay with their machine, lesson and language', () => {
 const {document} = parseHTML('<pre id="output"></pre><section id="watch"><pre id="values"></pre></section>');
 const output=document.getElementById('output'),watch=document.getElementById('watch'),values=document.getElementById('values');
 const panel=createCodeResults({output,watch,values}),host={},guest={};
 panel.record(host,'report','powershell',{ok:true,output:'Report complete'},{count:3});
 assert.equal(watch.hidden,false);
 for(const context of [[guest,'report','powershell'],[host,'repair','powershell'],[host,'report','python']]) {
  panel.show(...context);
  assert.match(output.textContent,/Run this lesson/);
  assert.equal(watch.hidden,true);
  assert.equal(values.textContent,'{}');
 }
 panel.show(host,'report','powershell');
 assert.equal(output.textContent,'Report complete');
 assert.deepEqual(JSON.parse(values.textContent),{count:3});
 panel.record(host,'repair','python',{ok:false,error:'SyntaxError'},{stale:1});
 assert.equal(watch.hidden,true);
 assert.equal(output.classList.contains('error'),true);
 panel.show(host,'new-lesson','python');
 assert.equal(output.classList.contains('error'),false);
});
