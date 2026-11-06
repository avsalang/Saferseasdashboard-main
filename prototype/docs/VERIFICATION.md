# Verification record

Verified on 6 November 2026 using Node 24, the locked Vue/Quasar dependencies, Playwright and system Chrome. All test records are fictional.

| Check | Result |
|---|---|
| `npm test` | 24 passed, 0 failed |
| `npm run build` | Production build passed |
| `npm run test:browser` | 55 route/permission/mobile checks; no page exceptions or viewport overflow; no missing page headings |
| `node tests/reporter-journey.mjs` | 18 checks passed: multi-vessel draft, decimals, nullable counts, evidence, submission, correction, resubmission, validation and attributed history |
| `node tests/admin-journey.mjs` | 19 checks passed: issued MAIC/amendments, progress/final checklists, printable saved progress, SCO/case, blocked/confirmed/reversed import, full-selection CSV/history, issued invitation/activation/suspension |
| `node tests/coverage.mjs` | 49 unique screen IDs through 50 routes; 22 output families |
| Dependency installation/audit | 0 reported vulnerabilities in the current prototype dependency tree |
| Production repository checks | Backend/admin/reporter working trees unchanged |

See [compact acceptance results](acceptance-results.json), [coverage](SCREEN_OUTPUT_COVERAGE.md) and [implemented previews](EXISTING_UI_REUSE.md). Browser route probes cover desktop views, six main admin views at 390px, reporter mobile intake and reporter denial from staff account management. Additional source-component checks covered reporter navigation from 390–1440px and the source form completion menu.

The tests verify local prototype behavior. They do not establish backend authorization, real file/email processing, official form approval, an approved risk method or correctness of rules MARINA has not provided. Map basemaps need external tile access; exported point data and unknown-location accounting remain explicit. PDF actions use browser print/save, not a server PDF job.

## Published build

[GitHub Pages deployment 42156571634](https://github.com/avsalang/Saferseasdashboard-main/actions/runs/42156571634) passed its clean install, 24 regression tests, production build and deployment. App source: `b5d841c1637d277a037d1644327d29025dd6eb8b`.

[Live demonstration](https://avsalang.github.io/Saferseasdashboard-main/) passed 18 published-build checks: root 200, original admin banner/reporter card/form completion panel, five staff routes, repository-subpath hash refresh, 390px form and reporter denial from account administration. No page exceptions. See [live acceptance results](live-acceptance-results.json).

The first hosted install identified an unpinned Sass peer absent from the lockfile. Sass 1.93.2 is now an explicit locked dependency; a fresh local `npm ci`, tests/build and the hosted clean install all pass.
