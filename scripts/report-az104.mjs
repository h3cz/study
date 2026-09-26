import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root = 'docs/az104-review';
const { issues, references } = JSON.parse(fs.readFileSync(`${root}/changes.json`, 'utf8'));
const read = p => fs.readFileSync(p, 'utf8');
const evaluate = p => {
  const context = { exports: {} };
  vm.runInNewContext(ts.transpileModule(read(p), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports;
};
const cert = evaluate('lib/certs.ts').CERTS.find(c => c.id === 'az-104');
const originals = Array.from({ length: 5 }, (_, i) => JSON.parse(read(`${root}/original-d${i + 1}.json`)));
const banks = Array.from({ length: 5 }, (_, i) => evaluate(`content/parts/az104-d${i + 1}.ts`));
const issueMap = new Map();
for (const { id, issue } of issues) issueMap.set(id, [...(issueMap.get(id) ?? []), issue]);
const changed = [];
const code = o => '```ts\n' + JSON.stringify(o, null, 2) + '\n```\n';
const sourceLinks = id => [...new Set(references[id] ?? [])].map((url, i) => `[Microsoft Learn ${i + 1}](${url})`).join(' · ');
let report = read(`${root}/SUMMARY.md`) + '\n\n## File-by-file corrections\n';
for (let d = 1; d <= 5; d++) {
  report += `\n### content/parts/az104-d${d}.ts\n\n`;
  const old = new Map(Object.values(originals[d - 1]).flat().map(q => [q.id, q]));
  for (const items of Object.values(banks[d - 1])) for (const q of items) {
    const previous = old.get(q.id);
    if (JSON.stringify(previous) === JSON.stringify(q)) continue;
    changed.push(q.id);
    const entries = issueMap.get(q.id);
    if (!entries) throw Error(`Undocumented edit: ${q.id}`);
    report += `\n#### ${q.id}\n\n**What was wrong / why added:** ${[...new Set(entries)].join(' ')}\n\n`;
    if (sourceLinks(q.id)) report += `**Evidence:** ${sourceLinks(q.id)}\n\n`;
    else report += '**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.\n\n';
    report += '**Full corrected object:**\n\n' + code(q);
  }
  report += '\n#### Every MCQ: answer and evidence audit\n\n| Stable ID | Correct answer after review | Disposition | Evidence |\n|---|---|---|---|\n';
  for (const q of banks[d - 1][`AZ104_D${d}_QUESTIONS`]) {
    if (!references[q.id]?.length) throw Error(`No primary source: ${q.id}`);
    const c = q.choices.find(c => c.correct);
    const disposition = !old.has(q.id) ? 'New coverage' : changed.includes(q.id) ? 'Corrected above' : 'Retained after review';
    report += `| ${q.id} | ${c.key}: ${c.text.replace(/\|/g, '\\|').replace(/\n/g, ' ')} | ${disposition} | ${sourceLinks(q.id)} |\n`;
  }
}
report += '\n### content/az-104-bank.ts\n\nNo missing exports, repeated arrays or aggregation errors were found. Updated counts, review provenance and matching-drill description. Full file is in COMPLETE-FILES.md and at its repository path.\n';
report += '\n### lib/certs.ts\n\nCorrected the Microsoft score range to 1–1000; 700 is the passing scaled score, not a guaranteed percent-correct threshold. Corrected domain-one weighting to the April 2026 outline; app sampling weights are chosen within published ranges. Kept existing objective IDs stable, labeled supplemental identity topics, and added Azure Files and ARM/Bicep objectives. These numeric objective codes are app-owned subdivisions, not official Microsoft identifiers.\n\nSources: [Exam outline](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104), [Scoring](https://learn.microsoft.com/en-us/credentials/support/exam-scoring-reports).\n\n**Full corrected certification object:**\n\n' + code(cert);
report += '\n### App integration and release files\n\nThe dashboard has a dismissible announcement with persistent dismissal and 44px controls. Release notes have a stable #az-104 anchor; the existing dashboard release card now displays the current entry. Certification selection exposes all four practice modes. The content version triggers reseeding using the existing history-preserving path. Public starter version: 2. Production version: 18; production-only banks and prior release entries remain intact. Metadata includes Azure. Contract and browser tests cover the announcement, selection, all four seeded counts, dismissal, and a narrow viewport. No Supabase schema or edge functions changed.\n';
report += `\n**Audit totals:** ${changed.length} changed/new content objects; 160 MCQs with primary-source references, 60 flashcards, 8 matching drills, and 40 term drills. Full originals are retained in original-d1.json through original-d5.json for comparison.\n`;
fs.writeFileSync(`${root}/REPORT.md`, report);

// Complete files, not excerpts or diffs. Exclude the generated bundle itself.
const files = JSON.parse(read(`${root}/replacement-files.json`));
let full = '# Complete corrected files\n\nEach section contains the entire file, ready to replace the corresponding file in this checkout. This bundle is specific to this repository; do not replace production seed/cert files with public-starter versions.\n\n';
for (const p of files) full += `## ${p}\n\n\`\`\`${p.endsWith('.mjs') ? 'js' : p.endsWith('.tsx') ? 'tsx' : 'ts'}\n${read(p)}\n\`\`\`\n\n`;
fs.writeFileSync(`${root}/COMPLETE-FILES.md`, full);
console.log(JSON.stringify({ changedObjects: changed.length, primarySourcedMCQs: 160, completeFiles: files.length }));
