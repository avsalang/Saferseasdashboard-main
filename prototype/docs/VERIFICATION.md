# Verification — MARINA terminology and required information

Verified on 6 November 2026 against the current Vue/Quasar mockup and fictional records.

| Current check | Result |
|---|---|
| Unit/regression suite | 87 passed |
| Production build | Passed |
| Routes | 55 checks; no browser exceptions, viewport overflow or missing headings |
| Standard labels / required incident fields | Passed: missing required facts block submission, partial drafts save, explicit reasons persist, zero/null remain distinct |
| MAIC and case requirements | 14 browser checks passed: partial drafts, content review gate, issue-only director noting, receipt after issue, exception appendix, conditional SCO and case fields |
| Working-copy exports | Catalogue, GIS, analytics and incident register all require acknowledgement and preserve incomplete status / gaps in their files and retained snapshots |
| Correction workflows | Reporter and reviewer-authored workflows passed, 18 checks each |
| Report usability and snapshots | 22 checks passed; all 22 families reachable and exact snapshot redownload retained |
| Roles / permissions | 23 checks passed; three account types and operational overlap preserved |
| Independent review | Source/output-grain/receipt/sentinel/exception-retirement findings resolved; final bounded recheck found no remaining blocker |

[Field standards and required-stage matrix](FIELD_STANDARDS_AND_REQUIREMENTS.md) is the current developer contract. Required information is an application completion policy derived from supplied sources; no legal rule or factual value is invented. Existing issued content remains frozen, with separate audited receipt metadata. Previously saved output snapshots remain available unchanged.

The new browser scripts are `tests/required-fields.mjs`, `tests/output-completeness.mjs` and `src/pages/operations/reportRequirements.browser.mjs`. They use fictional local browser state. The new requirements unit tests are included in `npm test`.

## Previous intake release evidence


Verified on 6 November 2026. The existing seven-section incident form is retained with additive MARINA fields and digital location/weather assistance. Desktop is the priority.

| Current check | Result |
|---|---|
| Unit/regression suite | 61 passed, including 19 weather and 9 incident-to-output regressions |
| Production build | Passed |
| Live provider smoke | Recent and historical weather/sea endpoints returned matched-hour data for a fictional Philippine position (5 November 2026 and 15 June 2025) |
| Route acceptance | 55 checks; no browser exceptions, horizontal overflow or missing headings |
| Original intake and added fields | Passed: seven sections, voyage/cargo, timeline, response, findings, source notes; save, reopen and review; confirmed zero and unknown retained |
| Map/weather/attachments | Passed: actual Leaflet map click, applied zero coordinates, guarded lookup, separate per-value model provenance, manual edits, stable lookup after first save, three-file metadata |
| Correction workflows | Reporter and reviewer-authored journeys both passed, 18 checks each |
| Investigator/admin journey | 19 checks passed, including issued report amendments, cases, import/reversal, output history and accounts |
| Reports | 22 usability checks passed; existing output families, explicit incident choice and immutable snapshots |
| Independent review | Six findings resolved; nine output/snapshot regressions independently rerun; no remaining release blocker from the bounded review |

Weather browser checks use deterministic provider responses to exercise success and provenance. Unit checks additionally cover unavailable/partial responses, invalid dates, timezone boundaries and racing requests. External provider availability is not guaranteed by these tests. Files remain metadata-only in this demonstration.

Run the new desktop checks from `prototype/`:

```sh
node tests/intake-additions.mjs
node tests/intake-assistance.mjs
```

`npm test` includes the new weather and output-mapping regressions. See [incident form additions](INCIDENT_FORM_ADDITIONS.md) for the accepted direction, field contract and production boundaries.

## Published intake release

Published application source: [`13d7281`](https://github.com/avsalang/Saferseasdashboard-main/commit/13d7281d125a9a32539905da56315642d9d4fdc8). [GitHub build and Pages deployment](https://github.com/avsalang/Saferseasdashboard-main/actions/runs/42165951606) succeeded. Both new desktop journeys were rerun against the hosted site and passed, including map coordinate input and retained weather provenance. [Recorded live acceptance](intake-live-acceptance.json).

The original three production repositories remain unchanged. This release updates the dedicated mockup repository.

## Prior usability release evidence

The following records the preceding usability release; its five-step intake and compact intake measurements are superseded by the restored seven-section form above.


Verified on 6 November 2026 against the Vue/Quasar mockup and fictional data. Source UI and styling remain SAFERSEAS; task ordering, optional details and navigation were simplified.

| Check | Result |
|---|---|
| Unit/regression suite | 33 passed; counting/unknowns, exports, role migration/limits, overlap, history, queue sorting |
| Production build | Passed |
| Route/desktop/mobile acceptance | 55 checks; no page exceptions, viewport overflow or missing headings |
| Reporter correction cycle | 18 checks passed |
| Investigator/admin journeys | 19 checks passed, including MAIC issue/amendment, progress/final fields, cases, import/reversal, outputs and issued accounts |
| Three-role access | 23 checks passed, including overlapping operational functions and central-only controls |
| Reviewer-authored correction cycle | 18 checks passed; real notification navigation, correct editor/resubmit, evidence/ownership/revisions and scoped vessel picker |
| Reports usability | 22 checks passed; all 22 families, grouped search, essential/advanced filters, explicit incident choice, full snapshots and exact re-download |
| Intermediate viewport checks | 16 checks across 390/768/1024/1280px; no horizontal overflow or exceptions |
| Compact intake | 9 browser checks; first date input at y=388 on 390×844, y=418 on 1366×768; all essential occurrence fields fit the first mobile screen |
| Coverage | 49 specified IDs, 50 routes, 22 output families |

[Compact acceptance results](acceptance-results.json) records the concrete checks. Commands are in [Developer handoff](DEVELOPER_HANDOFF.md). An independent source review found five material account/workflow/scope issues; all five were fixed and the bounded follow-up review found no remaining blocker.

The three confirmed account types are MRO Reporter, MRO Reviewer and MARINA Investigator. Operational overlap is intentional for now. Regional roles cannot obtain central account/configuration/audit powers through role edits or persisted settings. Older browser state upgrades to schema 3 without deleting records and historical attribution.

Tests establish mockup behavior, not backend security, official MARINA approval, real upload/email processing, approved risk/legal rules or signed official forms. PDF remains browser print/save. All supplied MARINA files remain outside this public demonstration.

## Published desktop revision

[Deployment 42161871084](https://github.com/avsalang/Saferseasdashboard-main/actions/runs/42161871084) successfully installed locked dependencies, passed all 33 unit/regression checks, built and deployed the site. App source: `a0fe102af963ad3d91ad421ff25f6890f92964cd`.

[The live site](https://avsalang.github.io/Saferseasdashboard-main/) passed 19 desktop checks across the three account types: task-first pages, separate review/correction queues, shared operational access, explicit incident choice for documents, central-only controls and repository-subpath refresh. No page exceptions. See [live acceptance](live-acceptance-results.json).

Desktop usability is the primary target, per the user's latest instruction. Existing responsive behavior is retained without a separate mobile redesign.
