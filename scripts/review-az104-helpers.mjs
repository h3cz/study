// Reproducible editorial corrections to PR #1 (original snapshots in docs/az104-review).
import fs from 'node:fs';
export const banks = Array.from({ length: 5 }, (_, i) => JSON.parse(fs.readFileSync(`docs/az104-review/original-d${i + 1}.json`, 'utf8')));
export const issues = [];
export const references = {};
export function source(ids, url) {
  for (const id of ids.split(' ')) (references[id] ??= []).push(url.startsWith('https:') ? url : `https://learn.microsoft.com/en-us/${url}`);
}
export function get(id) {
  const item = banks.flatMap(b => Object.values(b).flat()).find(q => q.id === id);
  if (!item) throw new Error(`Unknown ID ${id}`);
  return item;
}
export function fix(id, issue, changes) {
  Object.assign(get(id), changes);
  issues.push({ id, issue });
}
export function mcq(id, issue, stem, answers, right, explanation, difficulty = 3) {
  fix(id, issue, { stem, choices: answers.map((text, i) => ({ key: 'ABCD'[i], text, correct: i === right })), explanation, difficulty });
}
export function add(d, obj, serial, stem, answers, right, explanation, url, difficulty = 3) {
  const id = `az104-${d}-${obj}-${String(serial).padStart(3, '0')}`;
  banks[d - 1][`AZ104_D${d}_QUESTIONS`].push({id,certId:'az-104',domainId:`az-104:domain:${d}`,objectiveId:`az-104:obj:${obj}`,stem,choices:answers.map((text,i)=>({key:'ABCD'[i],text,correct:i===right})),explanation,difficulty});
  issues.push({id,issue:'Coverage gap: added an original scenario for an objective that was absent or thin.'});
  source(id,url);
}

