# SAFERSEAS MARINA platform — developer handoff

The Vue/Quasar mockup demonstrates the account-only reporting and MARINA administration workflows identified in the supplied data and forms. It uses the existing SAFERSEAS interface as its visual source. Build the production features into the existing backend and frontends using this as an interaction and data reference.

**Published demonstration:** https://avsalang.github.io/Saferseasdashboard-main/

**Source:** `prototype/`. The repository's earlier React mockup remains in the root source directories. The three production repositories were not modified.

Read the [usability rework](USABILITY_REWORK.md) for the current navigation, task-first screens and deliberately shared operational functions.

**Incident intake:** Keep the existing SAFERSEAS form and its improvements, adding missing MARINA information within the original seven sections. The [incident form additions and data contract](INCIDENT_FORM_ADDITIONS.md) supersede the earlier five-step intake simplification. MAIC is the information/output reference, while detailed investigation work remains in the investigation workspace.

## Start and review

Use Node 22 or newer. From `prototype/`:

```sh
npm ci
npm run dev
npm test
npm run build
```

Open the address printed by Vite. Select a demonstration role on the sign-in page. These buttons are presentation controls, not production authentication. Manual demo sign-in uses the email below and `Demo2026!`.

| Role | Issued demo email | Access |
|---|---|---|
| MRO Reporter | reporter@example.org | Own/assigned records with reporting, review, investigation, cases and outputs; usual focus is reporting |
| MRO Reviewer | reviewer@example.org | Regional records with reporting, review, investigation, cases and outputs; usual focus is review |
| MARINA Investigator | investigator@example.org | All functions across offices: review, investigations, cases, outputs, accounts, roles, configuration, audit and settings |

Sign out to change roles. Changes persist in local browser storage. **Reset demo** on the sign-in page restores fictional seed records. Each browser has a separate dataset. No MARINA source records, evidence files or credentials are included.

## What to walk through

1. **Report and correction cycle.** As MRO Reporter, create an incident, identify each involved vessel, leave unknown dates/counts explicitly unknown, attach fictional source metadata and save. Submit it. As MRO Reviewer, open the same reference in the review queue, request corrections and provide instructions. As MRO Reporter, open the notification, correct and resubmit. Validate as reviewer. Check the retained revisions and attributed history.
2. **Investigation.** Open the validated event in Investigations. Assign an investigator, prepare an initial Form 1B, save for review and issue a demonstration revision with the required preparer/noted-by details. Prepare repeated Form 2 progress observations and a Form 3B final investigation. Issued revisions remain immutable; create another revision to amend them. Their observations do not multiply event casualties.
3. **Enforcement.** Create a case linked to an event and involved vessel. Record the respondent, violations, responsible office and outcome. Add separate SCOs, decisions, payments, suspension and lifting entries. Preserve actual issuing office and unknown issue times. The source-recorded 72-hour category is distinct from a calculated or legally approved deadline.
4. **Historical import.** Start a synthetic import. Inspect mapping, merged event groups, missing-date blocker and duplicate candidate. Accept unknowns explicitly and approve reconciliation. Confirm the local import; inspect preserved source lineage. Reverse it when no downstream records exist. An arbitrary uploaded workbook is not parsed in this mockup.
5. **Selection to output.** Set a period and office/category selection in Analytics or GIS. Compare event and vessel-involvement denominators. Check approximate and unlocated positions. Build an output family in Report catalogue, download it, then reopen/download the retained snapshot in Output history. Pagination does not restrict downloads.
6. **Issued accounts.** As MARINA Investigator, issue a fictional invitation, assign role/office/scope and activate it using the demonstration activation page. Suspend/reactivate an account and inspect audit attribution. Invitation, recovery and email delivery remain local simulations.
7. **Configuration and handoff.** Edit active reference values, review distinct workflow states and versioned template records, export the audit register, and open Developer handoff. Official template masters and operational rules still require MARINA decisions.

## Implementation map

| Area | Main source |
|---|---|
| Existing SAFERSEAS admin layout | `src/layouts/AdminLayout.vue` |
| Existing authenticated reporter layout | `src/layouts/ReporterLayout.vue` |
| Existing SAFERSEAS theme | `src/styles/saferseas-existing.scss` |
| Route metadata and guards | `src/router.js`, each module's `routes.js` |
| Shared demo resources, permissions and mutations | `src/stores/demo.js`, `src/data/domain.js` |
| Reporter forms and tracking | `src/pages/reporter/` |
| Review, investigation, cases and registry | `src/pages/operations/` |
| MAIC field/checklist definitions | `src/pages/operations/maic.js` |
| Imports, maps, analytics and reports | `src/pages/data/` |
| Output definitions and counting rules | `src/data/catalogue.js` |
| CSV/XLSX/GeoJSON/print delivery | `src/lib/exports.js` |
| Accounts/configuration/audit | `src/pages/ManagementPage.vue`, `SettingsPage.vue` |

See [screen and output coverage](SCREEN_OUTPUT_COVERAGE.md), [domain contract](../CONTRACT.md), module READMEs and [original workflow audit](MARINA_WORKFLOW_AUDIT.md). The audit references the supplied source files; those files are intentionally not distributed with this public demonstration.

## Confirmed account model

Only these three account types are supported. Operational functions intentionally overlap across all three types for now, as requested by the user. MRO Reporter defaults to own/assigned records; MRO Reviewer defaults to the assigned regional office/AOR. MARINA Investigator has all functions and all-office scope, including account issuance and configuration. Investigation assignment supports all three operational account types. Separate Administrator, Analyst, Enforcement Officer and combined Investigator/Reviewer accounts are removed. The older five-role mockup is superseded; upgrading it preserves records and historical attribution while suspending the retired demo accounts.

## Data rules to preserve

- An occurrence is one event with one or more incident-time vessel snapshots. An involvement table has one row per involved vessel. Never sum event casualty totals across those rows or across report revisions.
- `null` means unknown/not supplied. Zero is a reported value. Person counts are whole non-negative numbers; GT and financial values retain decimals. Identifiers remain strings, including leading zeros.
- Incident seriousness uses exact `less_serious`, `serious`, `very_serious` and `unknown` codes. Secondary incident types and impacts are separate dimensions.
- AOR, homeport, CPC office and actual issuing office are separate relationships. No civil-region boundary or office name creates an authoritative AOR polygon.
- Unlocated, partial, invalid and explicitly unknown positions remain in registers and quality totals. They are excluded from plotted/exported point geometry. Approximate positions are distinguished from reported ones. Zero coordinates are valid.
- Spot and investigation reports retain revisions, report date/as-of, preparer, evidence references and status independently of incident review and enforcement outcome. Historical previews use saved report observations.
- Output history retains a deep snapshot of rows, event population, narrative sections, selection, template, revision and method. Later event edits or reversal of imported live records must not rewrite the captured artifact. Access still follows current account scope.
- Import lineage retains source file/sheet/row and grouping/duplicate/unknown decisions, including exclusions and reversal. Never silently fill unknown dates or infer casualties from vessel rows.

## Production API work

Replace the local store behind the current interfaces. The schema is illustrative; production migrations must reconcile existing Django models and historical data before deployment.

| Resource / operation | Backend responsibility |
|---|---|
| Accounts, invitations, activation, recovery, sessions | MARINA-controlled issuance, token lifecycle, actual notifications, suspension/revocation and authentication |
| Events and involved vessels | Scoped list/detail/create/update, validated attributes, attribution, incident-time vessel snapshots and deduplication |
| Review transition | Explicit allowed transition, required correction text, actor/time and owner notification in one transaction |
| MAIC reports/revisions | Stage-specific schema, observation snapshots, protected issued revisions, reviewer/signatory permissions and approved template rendering |
| Evidence | Actual upload, scanning/validation, protected object storage, metadata, revision links, retention and scoped download |
| Cases and actions | Linked respondent/vessel, many dated legal/document actions, independent outcome, valid monetary values and office attribution |
| Imports | Real XLSX/CSV parser, source-preserving staging, mapping validation, duplicate/grouping decisions, atomic confirmation and controlled reversal |
| Analytics/GIS | Shared population query, explicit grain/as-of, null-aware aggregation, validated coordinates and approved geographic layers |
| Report jobs and artifacts | Approved templates, immutable population/selection, background processing where needed, scoped artifact download and reproducibility |
| Configuration/audit | Versioned controlled terms, enforceable workflow rules, immutable audit events, retention and authorized administration |

All authorization must be enforced on the server for lists, direct IDs, linked records, transitions, export history and artifact download. The static Pages role guards illustrate the intended experience; they do not secure data.

## Output status and limits

The catalogue covers O01–O22. CSV, XLSX, GeoJSON and SVG actions generate actual browser files where offered. Print opens a browser document that can be saved as PDF. Wide tables are divided into smaller column groups with a repeated row identifier. XLSX includes selection/method and narrative sheets.

MAIC forms are structured content previews based on supplied forms, not approved facsimiles or digitally signed documents. Form 1A is explicitly marked **source template required**. Official page size, exact column order, signatures, logos, pagination and editable masters require MARINA approval before implementing official output rendering.

The map uses OpenStreetMap tiles and needs network access; no official AOR polygons or authoritative hotspot/risk algorithm were fabricated. Risk and policy screens retain review notes and evidence selections. Their labelled prototype rule score is illustrative and is not an approved MARINA risk method. Imports use a fixed fictional sample. Attachments are metadata only. Deadlines, email, shared storage and scheduled/background jobs are not implemented.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
node tests/reporter-journey.mjs
node tests/admin-journey.mjs
node tests/role-access.mjs
node tests/reviewer-corrections.mjs
node tests/reports-ux.mjs
```

Keep `npm run dev` running for browser tests. Set `CHROME_PATH` to a system Chrome executable if using that instead of Playwright's browser. Browser artifacts are written to ignored `test-artifacts/`. The route test imports development route metadata and is intended for the local Vite server. See [verification record](VERIFICATION.md) for the delivered run evidence.

## MARINA decisions before production

Confirm final role/office scopes and approval rules after the temporary operational overlap; official form masters and signatories; source snapshots and reconciliation/counting rules for each recurring output; report timeliness basis; GT bands and age reference date; authoritative AOR geometry and spatial methods; risk method; requiredness/unknown handling; retention and sharing/export authority.
