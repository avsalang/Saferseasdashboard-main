import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {outputCatalogue} from '../src/data/catalogue.js';
const routes=JSON.parse(await fs.readFile('test-artifacts/all-screen-routes.json','utf8'));
const ids=new Set();for(const r of routes){const m=/^([A-Z])(\d+)–[A-Z](\d+)$/.exec(r.id);if(m){for(let n=+m[2];n<=+m[3];n++)ids.add(m[1]+String(n).padStart(2,'0'))}else ids.add(r.id)}
assert.equal(ids.size,49,'All 49 specified screen IDs');assert.equal(outputCatalogue.length,22);
const row=value=>String(value??'').replaceAll('|',' / ').replaceAll('\n',' ');
const text=`# Screen and output coverage

The application covers **${ids.size} specified screen IDs** through ${routes.length} route entries. Some views share a component: A07–A09 are investigation report stages; D03 includes import detail/reconciliation; D10 covers assessment list/detail. Routes use hash navigation, so a direct URL includes the hash fragment #/....

## Screens

| Screen | View | Route | Access |
|---|---|---|---|
${routes.sort((a,b)=>a.id.localeCompare(b.id)).map(r=>`| ${row(r.id)} | ${row(r.title)} | ${row(r.path)} | ${row(r.permission)} |`).join('\n')}

S01–S03 provide issued-account sign-in, activation and recovery. No public registration or anonymous-reporting route exists. Demo role controls on sign-in are for presentation; backend authentication remains production work.

## Outputs

| Family | Output | Counting grain | Offered formats | Template status |
|---|---|---|---|---|
${outputCatalogue.map(o=>`| ${o.id} | ${row(o.title)} | ${row(o.grain)} | ${o.formats.join(', ')} | ${row(o.template)} |`).join('\n')}

PDF means browser print/save as PDF. MAIC previews demonstrate structured content; approved official masters and signatories are required before production release. Form 1A is template-required and no document is fabricated. Selection, unknowns and counting notes accompany each output; pagination never limits downloaded rows.
`;
await fs.writeFile('docs/SCREEN_OUTPUT_COVERAGE.md',text);console.log(`Verified ${ids.size} IDs, ${routes.length} routes and ${outputCatalogue.length} output families.`);
