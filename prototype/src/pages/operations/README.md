# MARINA operations module

This module implements A01–A15 in the approved November 2026 mockup design. Routes are exported by `routes.js`; shared browser-local data, permissions, persistence, audit records and notifications come from `useDemo()`.

| Coverage | Route | Interaction |
| --- | --- | --- |
| A01 | `/admin` | Filtered event/vessel/revision/case metrics, review and quality |
| A02/A05 | `/admin/incidents`, `/admin/review` | Shared selection with analytics/maps, filter/sort/page, CSV, attributed review transitions and correction instructions |
| A03 | `/admin/incidents/:id` | Nine contextual record sections, assignment and review actions |
| A04 | `/admin/incidents/new`, `/:id/edit` | Staff-enabled shared reporter editor |
| A06 | `/admin/investigations` | Search/assignment filters and stage revision counts |
| A07–A09 | `/admin/investigations/:id` | Form 1B / 2 / 3B groups, evidence, snapshots, review and issued states, retained revisions, print |
| A10 | `/admin/actions` | Create/update/delete, accountable owner/office, due/outcome/evidence, status history |
| A11/A12 | `/admin/cases`, `/:id` | Case creation/update, multiple orders, penalties, certificate/SRB suspension/lifting, source timing and history |
| A13 | `/admin/vessels` | Identity/aliases, full particulars including decimal GT, CRUD and historical involvement |
| A14 | `/admin/companies` | Owner/operator/company CRUD, aliases/contacts, linked vessels/incidents |
| A15 | `/admin/documents` | Evidence metadata CRUD, incident/report/case links, local-file metadata and printable preview |

## Choices and constraints

- MAIC report revisions are independent records. Issued revisions have a read-only form; a new revision copies the retained fields and evidence into a draft. Prepared-by/designation/noted-by/noted-date demonstrate sign-off, without signatures. An explicit review state precedes issue.
- Ship particulars are copied into report narratives from all involved vessel snapshots, then may be edited for that revision. The report field taxonomy is defined in `maic.js`, including machinery, human and environmental factor checkboxes and full final analysis/conclusions/lessons. Final 3B covers every supplied checkbox in scanned source pp9–11: accident nature, sea/weather, ship/environment consequences, separately unknown crew/passenger casualty allocations, machinery/cargo/external causes, physiological/psychological/physical liveware, software, hardware and environmental underlying factors. New options use stable codes with original source labels; earlier broad factor keys remain available when populated in an older revision. Initial 1B retains the shorter factual/consequence/narrative fields.
- Event consequences are never changed by saving a cumulative report. Corrections to the source event require the permitted staff editor, avoiding repeated casualty aggregation.
- Case action `sourceTimeliness` is a source category: unknown, within/beyond 72H as recorded, or not applicable. There is no invented deadline or calculation from incomplete dates/times.
- Empty numeric values normalize to `null`; zero is retained. Vessel particulars are directory records; historical involvement snapshots remain unchanged when directory records change.
- File selection stores only metadata. Evidence previews print escaped metadata and provenance, not original file contents. Issued report evidence cannot be deleted through this module.
- Office dimensions remain separate: AOR, homeport, CPC, reporting/responsible office and actual issuing office.
- Cases, evidence, reports, actions, vessels and related lookups read through `visibleRecords()`. Case direct-detail lookup uses the same scoped collection as its register. Open case and registry details clear when a scope change removes their record.
- Register CSV jobs retain cloned `rows`, `events`, `metadata` and `sections`, matching the report-builder artifact shape. Output history can reopen, print and download the original population after current records or filters change.
- Client-side route and button guards illustrate permissions only. All persistence is browser-local fictional data, with shared store enforcement; production authorization, file storage, signature workflows, official templates and concurrent-edit handling require backend integration.

## Self-review and verification

Module review checks: all declared routes resolve to populated components, tables have stable row keys, review transitions call the shared store, editing actions are gated, data mutations show errors, unknown values are preserved, no arbitrary source URL is rendered as markup, and issued revisions are retained. All eight SFCs passed Vue compiler parse/script/template compilation. Focused MAIC assertions passed for unknown date/time, null versus confirmed zero, decimal GT, multiple-vessel particulars, independent factor arrays and final-stage analysis. Integration build/browser verification is performed by the root implementation task after shared files are ready.

`node --test src/pages/operations/registerExport.test.js` passes three regression tests: complete history/redownload artifact shape with precise unknowns and event/vessel counts; immutable nested snapshots after later event/selection edits; and explicit empty-population exports.

## Production interface reuse

Dashboard composition follows `saferseas-frontend-admin/src/pages/Dashboard/HomePage/IndexPage.vue`: wide eight-column banner/stats/data/recent content and narrow four-column workflow/trend content. `visual/` directly reuses the supplied `FeaturedBanner`, `StatsCards`, `DataCoverage`, `WorkflowSnapshot`, `ComplianceChart`, and `RecentIncidents` templates and scoped styles, along with their original hero/harbor assets. The component scripts bind fictional local records instead of production API calls. The source safety index is replaced with the actual validated-report count; coverage/trends derive from records and unavailable weather observations stay unavailable.

The incident registry directly reuses the production `Dashboard/Incidents/IndexPage.vue` header/breadcrumb treatment and scoped styles, `sections/StatCards.vue` split-card template/styles, and `sections/IncidentTable.vue` table/status/mobile-card styles. Filtering, review transitions, scope guards, pagination and retained CSV outputs remain functional. Browser checks at 1440px and 390px found no viewport overflow or page exceptions, and the registry filter dialog/mobile cards worked.
