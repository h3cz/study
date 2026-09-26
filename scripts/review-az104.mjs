import fs from 'node:fs';
import { banks, issues, references } from './review-az104-helpers.mjs';
await import('./review-az104-d1.mjs');
await import('./review-az104-d2.mjs');
await import('./review-az104-d3.mjs');
await import('./review-az104-d4.mjs');
await import('./review-az104-d5.mjs');
await import('./review-az104-additions.mjs');
await import('./review-az104-refinements.mjs');
// Avoid a learnable answer-position shortcut. Preserve every existing ID and meaning.
// Replace letter references through a callback, so no replacement can cascade.
let index = 0;
const total = banks.reduce((sum, b, i) => sum + b[`AZ104_D${i + 1}_QUESTIONS`].length, 0);
const order = Array.from({ length: total }, (_, i) => i % 4);
let randomState = 20260925;
for (let i = order.length - 1; i > 0; i--) {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  const j = Math.floor((randomState / 4294967296) * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}
for (const bank of banks) for (const [name, items] of Object.entries(bank)) {
  if (!name.endsWith('_QUESTIONS') || name.endsWith('_PERF_QUESTIONS')) continue;
  for (const q of items) {
    const target = order[index++ % order.length];
    const old = q.choices.findIndex(c=>c.correct);
    const offset = (target - old + 4) % 4;
    if (!offset) continue;
    const keyMap = Object.fromEntries(q.choices.map((c,i)=>[c.key,'ABCD'[(i+offset)%4]]));
    q.choices = q.choices.map(c=>({...c,key:keyMap[c.key]})).sort((a,b)=>a.key.localeCompare(b.key));
    // A can be an article; B/D can name VM series. These are prose, not choice labels.
    q.explanation = q.explanation.replace(/\b[A-D]\b/g, (k, offset, text) => {
      const after = text.slice(offset + 1);
      if (/^[-–]series\b/.test(after)) return k;
      if (k === 'A' && /^ (shorter|control-plane|Modify|resize|manual|region|CPU|container|Log|private|separate|supported)\b/.test(after)) return k;
      return keyMap[k];
    });
    issues.push({id:q.id,issue:'Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).'});
  }
}
const types={QUESTIONS:'Question',FLASHCARDS:'Flashcard',PERF_QUESTIONS:'PerfQuestion',ACRONYMS:'Acronym'};
for(let d=1;d<=5;d++){
  let out='import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";\n\n// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.\n';
  for(const [suffix,type] of Object.entries(types)){
    const name=`AZ104_D${d}_${suffix}`;
    out+=`\nexport const ${name}: ${type}[] = ${JSON.stringify(banks[d-1][name],null,2)};\n`;
  }
  fs.writeFileSync(`content/parts/az104-d${d}.ts`,out);
}
fs.writeFileSync('docs/az104-review/changes.json',JSON.stringify({issues,references},null,2)+'\n');
console.log(banks.map((b,i)=>({domain:i+1,mcqs:b[`AZ104_D${i+1}_QUESTIONS`].length})));

