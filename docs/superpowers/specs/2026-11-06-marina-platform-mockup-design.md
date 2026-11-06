**Current update:** account/function and usability decisions are superseded by [the usability rework](2026-11-06-marina-usability-rework.md). The three confirmed account types share operational functions for now.

# SAFERSEAS complete platform mockup: design for approval

Date: 6 November 2026. Audience: MARINA reviewers and the implementation developer.

## Purpose and confirmed decisions

Build a complete, navigable and interactive mockup of the account-only reporting platform and the full MARINA administration platform. The source must be suitable for developer handoff, and the verified static build is intended for the user's existing GitHub Pages repository, `avsalang/Saferseasdashboard-main`.

The user selected **Vue/Quasar**, to align the mockup with the production SAFERSEAS frontend. Reporting requires accounts issued by MARINA. There is no public reporting, self-registration, anonymous tracking or public incident browsing in the target platform.

The existing audit, `SAFERSEAS_MARINA_WORKFLOW_AUDIT.md`, supplies domain requirements and source evidence. This design is a front-end mockup: it demonstrates screens, state transitions and generated sample outputs; it does not connect to the production backend, send invitations/emails, perform actual identity verification or import confidential MARINA files into a live system.

## Approaches considered and selection

1. Extend the old React/Vite mockup. Preserves its existing UI and tests; frontend components remain different from the production Vue/Quasar implementation.
2. Rebuild in Vue/Quasar. Shares the production component framework and gives the developer a closer implementation reference; requires rebuilding the old mockup's screen structure and interactions. **Selected by the user.**

Implementation choice proposed here: add a self-contained Vue3/Quasar2/Vite application under `prototype/` in the existing mockup repository. Retain the old React source for reference, update the root README and Pages workflow to build/deploy `prototype/dist`, and use hash routes plus relative asset URLs. This preserves the previous source without mixing React and Vue dependencies.

## Visual direction

Match the current SAFERSEAS admin rather than the earlier simplified inline form: navy primary `#1A365D`, secondary blue `#2B6CB0`, slate typography, light grey page background `#f4f5f7`, white sidebar/header/cards, pale blue borders, rounded controls/cards, Inter body and Hanken Grotesk headings. Use the existing SAFERSEAS logo assets. Include light/dark appearance and responsive mobile navigation. Use compact operational headings, tables, clear filters, status chips and contextual actions; avoid marketing banners and unsupported safety/compliance scores.

Provide a visible, restrained **Demonstration / fictional data** indicator and a reset-demo action. Demo account selection belongs on the demo sign-in screen. Once signed in, each role sees its assigned navigation and permitted actions; an ordinary reporter cannot switch into staff privileges from the app header.

## Product areas and screen inventory

Every listed screen must have populated, relevant content, working navigation and its primary demo interaction. Screen IDs below become developer coverage IDs, not labels shown to ordinary users.

### Access and shared screens

| ID | Screen | Main behavior |
| --- | --- | --- |
| S01 | Sign in | Enter a fictional issued account or choose a labelled demo account; route to reporter or staff workspace. No signup. |
| S02 | Account activation | Demonstrate accepting an issued invitation, account details and password setup. No real activation email is sent. |
| S03 | Account recovery | Recovery request and confirmation state for an issued account; explain real delivery requires backend. |
| S04 | Account/profile and preferences | Account/office/role identity, profile fields, password/session demonstration, appearance preferences. Role changes are admin-only. |
| S05 | Notifications | Read/unread, open linked record, correction/assignment/report-job notifications. |
| S06 | Help and workflow guide | Reporting guidance, MAIC stages, unknown values, office distinctions and support. |
| S07 | Access denied / unavailable record | Correct boundary state for wrong role/scope/unknown ID. |

### Reporting platform

| ID | Screen | Main behavior |
| --- | --- | --- |
| R01 | Reporter dashboard | Own/permitted counts, drafts, correction requests and recent reports, all derived from demo records. |
| R02 | My reports | Search/filter/sort, status/date, open report, continue draft, start report; clear empty state. |
| R03 | New/edit spot report | Progressive form: occurrence; multiple involved vessels; known consequences; source/evidence; review. Save draft, validate, submit; unknown dates/times/counts and optional coordinates supported. |
| R04 | Report detail and tracking | Overview, involved vessels, consequences, evidence, status timeline and submitted revisions. |
| R05 | Correction/resubmission | Reviewer comments, editable allowed fields, retained attachments and multi-value fields, resubmit creates history. |
| R06 | Drafts | Restore/update/discard own drafts with confirmation. |
| R07 | Vessel directory | Own/permitted vessels, details, add/update request, decimal GT, identifiers and registration status. |
| R08 | Evidence/documents | Typed local demo document metadata, attach/view/remove unsubmitted items, link sources to reports. |

### MARINA operations

| ID | Screen | Main behavior |
| --- | --- | --- |
| A01 | Operational dashboard | Counts by event/vessel/case/report, review queue, assigned actions and data quality; shared filtered dataset. |
| A02 | Incident register | Search, filter, pagination, date/seriousness/AOR/status selection, event-versus-vessel counts and CSV. |
| A03 | Incident case workspace | Overview, vessels, consequences, evidence, chronology, reports, enforcement, actions and source lineage; contextual role actions. |
| A04 | Staff incident editor | Full mapped particulars including rig, official/IMO, GT, build/hull, service/size/classification society, voyage, office roles and narratives. |
| A05 | Review queue | Start review, request corrections with reason, approve/validate; actor/time/history and reporter notifications. |
| A06 | Investigation workbench | Assigned incidents, stage/status, investigator, due/as-of dates and source evidence. |
| A07 | MAIC Form1B initial report | Supplied factual/ship/consequence/narrative/action/recommendation sections and preparer/director dates. Draft/revision, preview and issue demonstration. |
| A08 | MAIC Form2 progress report | Repeatable progress updates, recovery/rescue changes, SCO/certificate/SRB actions and other information; preserve revisions. |
| A09 | MAIC Form3B final report | Full factual/causal factors, conditions, analysis, conclusion, lessons and recommendations; draft/review/issued states. |
| A10 | Recommendations and follow-up | Assigned owner/office, due date, outcome/evidence and completion history. |
| A11 | Enforcement case register | Cases/parties/vessels, responsible office, outcomes and case details. |
| A12 | Enforcement case/action editor | Multiple SCOs/orders/actions, issue dates/times, within/beyond72H source category, violations, decisions, penalties, certificate/SRB suspension/lifting. Do not infer definite timeliness from unknown timestamps. |
| A13 | Vessel registry | Search, vessel detail, decimal GT and historical involvement list, identity match/alias editing. |
| A14 | Owner/operator registry | Real local demo CRUD, distinct party roles, company aliases/contact and linked vessels/incidents. |
| A15 | Evidence register | Typed document metadata, related incident/case/report, source reference, status and preview. |

### Data, maps and reporting

| ID | Screen | Main behavior |
| --- | --- | --- |
| D01 | Import batches | Batch history, counts, source year/template and processing status. |
| D02 | Import wizard | Fictional file selection, template detection, field mapping and preview, merge/event-vessel review, row errors, duplicate candidates, reconciliation and confirm/reverse demo import. |
| D03 | Source/reconciliation detail | Trace a row or table total to synthetic source row/merge group and accepted mapping; compare event/involvement counts and snapshot differences. |
| D04 | GIS workspace | Event points, marker details, shared filters, coordinate-quality counts, uncertain/unlocated records, printable map and filtered GeoJSON download. No invented AOR boundaries. |
| D05 | Location review | Raw place, proposed coordinates, accuracy/source/reviewer and approve/reject demonstration. |
| D06 | Analytics | Period/type/seriousness/vessel/office/consequence patterns and quality tabs, derived from selected demo records with explicit units and unknowns. |
| D07 | Report catalogue | All22 audited output families, grouped register/monthly/case/casualty/MAIC/map/quality; template availability and relevant format. |
| D08 | Report builder/preview | Saved selection, counting grain, period/as-of, office dimensions, template, table/figure preview, full-selection exports and source notes. |
| D09 | Export jobs and issued history | Generate/reopen/download sample outputs with snapshot/filter metadata and revision. Jobs simulated locally; actual artifacts are downloadable. |
| D10 | Risk assessments | Existing indicator/rule approach represented as a proposed versioned methodology, input form, zero/unknown/manual-review states, saved assessment detail. No assertion of MARINA approval or validated predictive risk. |
| D11 | Policy review | Evidence-linked recommendations/priority register and underlying counts, with coverage and methodology; no unsupported fixed statistical claims. |

### Administration

| ID | Screen | Main behavior |
| --- | --- | --- |
| M01 | Account administration | MARINA issues/invites accounts, assigns office/role, updates/suspends/reactivates; confirmation and audit trail. |
| M02 | Roles and permissions | Action/resource permissions and own/office/all scope, role editor and access preview. |
| M03 | Offices and organization | Separate AOR/homeport/CPC/actual issuing office reference codes and aliases; office directory. |
| M04 | Reference data | Editable incident/service/rig/hull/size/classification/impact/cause/document/outcome/lookups with code, label, active state and aliases. |
| M05 | Workflow and report templates | Review/investigation/enforcement states kept separate, configured stage requirements, templates and reminder rules marked proposed where MARINA has not decided. |
| M06 | Audit trail | Filterable actor/time/record/action log with before/after summary, record link and CSV. |
| M07 | System settings | Reporting defaults, timezone, file rules, notification settings and demonstration reset. No real secrets or claims of live delivery/backup. |
| M08 | Developer handoff | Screen coverage index, representative user journeys, data dictionary, API mapping, output catalogue, unresolved MARINA decisions and demo limitations. |

## Shared model and interactions

Use one persisted browser-local demo store for users, roles, offices, events, event-vessel involvements, reports/revisions, consequences, evidence metadata, review history, actions, enforcement cases, import batches, source rows, saved selections, export snapshots, notifications and audit entries.

Use fictional vessel/company/person names and example.org emails. Do not upload the original MARINA files, raw records, personal names, evidence URLs or credentials to this public repository/Pages deployment. The domain structure and template headings may be represented using fictional examples. Use local static sample attachments generated for the demo; real selected files remain in the browser and must not be uploaded anywhere.

Reporter scope initially means own reports, with MRO IV sample organization; staff examples include reviewer/investigator, enforcement, analyst and administrator. Exact production scope remains configurable/documented. Validate route access and action permissions in the demo for illustration; the handoff must state that client-side access checks are not production security.

Required complete journeys:

1. Issued-account sign-in → create multi-vessel draft → attach source metadata → submit → review queue.
2. Staff requests correction → reporter notification → edit/resubmit → staff validates with attributed history.
3. Staff assigns investigation → initial report → two progress revisions → final report → recommendation follow-up.
4. Link enforcement case → SCO → decision/penalty → certificate action → current outcome and case history.
5. Import sample source → map/inspect rows → resolve duplicate/grouping → review reconciliation → confirm batch.
6. Filter a register → matching analytics/map/counts → report preview → download complete sample output → issued snapshot history.
7. Administrator issues/suspends account → reporter sign-in behavior reflects state and existing historical attribution remains.

Unknown is represented as null/unknown, never fabricated zero. Date-only/time-unknown are supported. Seriousness has exact codes for less/serious/very serious plus unknown and is distinct from impact and risk. AOR, homeport, CPC and issuing office remain distinct. One event can involve several vessels and enforcement cases; cumulative report revisions are not added repeatedly as new casualties.

## Outputs and handoff behavior

The report catalogue exposes all22 audit families, not22 disconnected dashboards. A generic builder may render several templates using defined configuration, but each must have the correct fields/grain/headings and a meaningful preview.

Implement actual local CSV, XLSX and GeoJSON downloads where applicable, and printable paginated HTML previews for PDF through browser printing. Include sample MAIC1B/2/3B sections and spot-report layout, without fabricating signatures. Retain Form1A as template-required because no source was supplied. The handoff distinguishes browser-print PDF from a future server-generated official PDF. Long narratives, page breaks, selection metadata and unknowns must survive output.

Provide developer documentation in the repository: setup/build commands, architecture, screen/route matrix, demonstration accounts and journeys, shared data schema, proposed API integration points, output/template matrix, acceptance checks, limitations, retained old-source location and deployment instructions.

## Delivery and verification

Work in a dedicated mockup checkout/branch, keeping the production backend/admin/reporter repositories unchanged. Build and verify the Vue app before any deployment. Use an isolated branch and reviewable commit history; preserve existing React source and the previous deployed commit in Git history.

Verification: production build; focused store/aggregation/permissions/transition tests; browser checks for representative full journeys and every declared route; desktop/mobile layout; no console exceptions or empty stub routes; CSV/XLSX/GeoJSON downloads and printable report opening; no external data writes. Record exact verification results in the handoff.

Publish the verified static build to the existing GitHub Pages site using the repository workflow. The Pages URL is a public design demonstration with fictional data and simulated account sessions; the real production system remains account-only. No Sites-hosted copy is necessary because the user requested Pages. If repository settings require an administrative action not available through the connector/CLI, prepare the complete build/workflow and report the specific missing action rather than claim deployment.

## Builder discretion and decisions still for MARINA

Builder may choose route/file organization, table/dialog reuse, exact sample data and icon/chart libraries consistent with Vue/Quasar, local persistence versioning, and responsive breakpoints. Preserve a coherent current SAFERSEAS appearance rather than pixel-copying every production layout.

MARINA must ultimately approve exact roles/office scope, report counting baselines,72-hour timing rules, official editable templates/Form1A, signatures, age/GT band rules and operational retention. The mockup should make these choices visible as proposed defaults without blocking the demonstrated flow or presenting them as legal determinations.

## Approval boundary

Approve this specification to build the complete Vue/Quasar mockup and the developer handoff, then verify and update the existing GitHub Pages repository. Actual production backend implementation or handling live MARINA data is outside this mockup request.
