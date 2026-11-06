# MARINA platform mockup implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for shared implementation and superpowers:dispatching-parallel-agents for independent page modules. Steps use checkbox syntax for tracking.

**Goal:** Deliver the approved complete Vue/Quasar reporter and MARINA admin mockup and publish the verified fictional-data demonstration to the existing GitHub Pages site.

**Architecture:** A new `prototype/` SPA with hash routing, Quasar components, one persisted reactive demo store and pure domain operations. Reporter, operations, reporting and administration modules consume the same record/permission contract; old React source remains retained.

**Tech stack:** Vue3, Quasar2, Vite6, Vue Router4, Lucide Vue icons, Leaflet, ECharts, ExcelJS, Node test runner and Playwright.

**Spec:** `docs/superpowers/specs/2026-11-06-marina-platform-mockup-design.md` (approved by user 6 November2026).

## Global constraints

- MARINA-issued accounts only; no public interface or self-registration.
- No production API or email integration; fictional records and browser-local state only.
- Navy `#1A365D`, secondary blue `#2B6CB0`, page `#f4f5f7`, Inter/Hanken, white rounded panels.
- Preserve original React source and existing production repositories; all new app code under `prototype/`.
- Exact seriousness codes, null/unknown counts, optional positions, separate office roles, multi-vessel events and revision-aware casualty aggregation.
- Every declared screen and output family must have meaningful content and its primary interaction; future backend limitations must be explicit.
- Actual CSV/XLSX/GeoJSON downloads and printable MAIC/report previews; full-selection exports.

## Review focus

- Same event and several vessels: event counts and casualty totals must not multiply.
- Role changes/suspended accounts and directly opened URLs: forbidden views/actions blocked in demo.
- Unknown dates/counts/partial coordinates: retained as unknown, no synthetic zero/coordinate.
- Reporter corrections and report revisions: preserve prior evidence and attributable history.
- Pages subpath and browser refresh/mobile widths: no404 or clipped primary actions.

### Task1: Shared shell, contract and demo domain

Files: `prototype/package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`, `src/styles.css`, `src/router.js`, `src/data/seed.js`, `src/data/domain.js`, `src/stores/demo.js`, `src/components/*`, `tests/domain.test.js`.

Interfaces: store API and domain types recorded in `prototype/CONTRACT.md`; module pages use `useDemo()` and router without altering shared state structure. Shared components PageHeader, DataTable, StatusBadge, RecordLink and EmptyState.

- [x] Write failing pure tests for scoped access, status transitions, null-aware summaries, event/vessel counts and report revision preservation.
- [x] Run `node --test prototype/tests/domain.test.js` and observe missing implementation failure.
- [x] Implement domain, seed, persisted store, shell/access pages and routes; install pinned compatible dependencies.
- [x] Pass domain tests and first production build; verify signed-in routes and forbidden-state behavior.

### Task2: Reporter and record forms

Files: `prototype/src/pages/reporter/*`, `prototype/src/pages/shared/IncidentForm.vue`, `prototype/src/pages/shared/IncidentDetail.vue`.

Consumes exact store/record contract. Produces reporter route exports and reusable staff incident editor/details. Required spec screens R01-R08 and shared record views; per-step unknown handling, multiple vessels, save/submit/correct, evidence metadata, notifications and revision history.

- [x] Build own-record lists/dashboard/drafts, progressive reporting/editor/detail and vessel/evidence screens.
- [x] Exercise new draft→submit→correction→resubmit and confirm retained causes/evidence, counts, history and scope.

### Task3: MARINA operations and administration

Files: `prototype/src/pages/admin/*`, `prototype/src/pages/admin/forms/*`.

Consumes shared store, form/detail and export interfaces. Produces A01-A15 and M01-M07; reusable table/form screens require specific schema and real local mutation.

- [x] Build review/assignment, typed MAIC revisions, recommendations, cases/actions, vessels/parties/evidence.
- [x] Build issued-account lifecycle, roles/scopes, office/lookups, workflow/templates, audit/settings.
- [x] Exercise staff validation/investigation/case and account-suspension journeys; no unsupported permissions or placeholder action-only notifications.

### Task4: Imports, reports, analytics and geographic outputs

Files: `prototype/src/pages/data/*`, `prototype/src/lib/exports.js`, `prototype/src/data/catalogue.js`.

Consumes shared selection, records and store. Produces D01-D11 and all22 output configurations, downloads and snapshots.

- [x] Build staged sample import including mapping/errors/duplicates/grouping/reconciliation and reversible confirm.
- [x] Build shared-filter analytics/map/location review, risk/policy evidence screens, report catalogue/builder/print and export history.
- [x] Verify exact category counts, unknowns, full-selection CSV/XLSX/GeoJSON and printable reports; no invented AOR polygons.

### Task5: Handoff, coverage and browser acceptance

Files: `prototype/docs/*`, `prototype/tests/browser.mjs`, root `README.md`, `prototype/src/pages/HandoffPage.vue`.

- [x] Map all49 screen IDs to routes/components and all22 outputs to template/format behavior.
- [x] Run full production build and domain/browser tests; inspect screenshots at desktop/mobile and printed pages; fix observed failures.
- [x] Document completed journeys, API contracts, real/simulated functionality, outstanding MARINA choices and exact verification evidence.

### Task6: Review and GitHub Pages delivery

Files: `.github/workflows/deploy-pages.yml`, review docs as needed.

- [x] Review whole diff against approved spec; resolve material omissions.
- [x] Commit/push verified source, preserve previous commit and update Pages workflow to build `prototype/`.
- [x] Follow deployment to success; verify live URL/asset and route behavior and return source/deployment/handoff links.

## Execution ledger

Update `prototype/docs/PROGRESS.md` after each task with rulings, verification and next work. User approved build and repository/Pages update; routine reversible implementation choices do not require repeated approval.
