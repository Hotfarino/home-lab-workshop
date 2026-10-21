// Output belongs to one machine, lesson and language—not the shared app window.
export function createCodeResults({output, watch, values}) {
 const results = new WeakMap();
 const key = (lesson, language) => `${lesson}:${language}`;
 function show(machine, lesson, language) {
  const result = results.get(machine)?.get(key(lesson, language));
  output.textContent = result?.text ?? 'Run this lesson’s script to see its output here.';
  output.classList.toggle('error', result ? !result.ok : false);
  values.textContent = JSON.stringify(result?.variables ?? {}, null, 2);
  watch.hidden = !result?.ok || !Object.keys(result.variables).length;
 }
 return {
  show,
  record(machine, lesson, language, result, variables) {
   if (!results.has(machine)) results.set(machine, new Map());
   results.get(machine).set(key(lesson, language), {
    ok: result.ok,
    text: result.error || result.output || '(Completed with no printed output.)',
    variables: structuredClone(variables || {}),
   });
   show(machine, lesson, language);
  },
 };
}
