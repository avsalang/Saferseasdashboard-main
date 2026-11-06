# Verification — usability rework

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
