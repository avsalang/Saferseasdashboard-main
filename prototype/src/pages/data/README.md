# Data, geography and reporting module

This module uses the shared browser-local demo store and contains no production API integration. Every seed/staging row is fictional. Routes and action permissions are exported from `routes.js`.

Analytics and GIS reuse markup and scoped CSS directly from the existing admin application's `Monitoring/Analytics/IndexPage.vue`, `Analytics/components/SelectionSummary.vue`, `Analytics/components/AnalyticsFiltersDialog.vue` and `Monitoring/GISMap/IndexPage.vue`. The production breadcrumb/actions ribbon, notice/chips, numbered tabs/mobile menu, metric/chart cards, filter overlay and full-height tactical map controls are retained with the demo store replacing API scripts. GIS quality controls replace unsupported analytical claims while retaining the source panel treatments.

| Coverage | Routes | Implemented interaction |
|---|---|---|
| D01 | `/admin/imports` | Batch counts/history and linked detail |
| D02 | `/admin/imports/new` | Synthetic staging, actual source-column remapping, blocking row findings, accept unknowns/exclude, duplicate decision, split/retain event groups, reconciliation confirmation |
| D03 | `/admin/imports/:id`, `/admin/reconciliation` | Source-row/merge-group lineage, mapping/accepted variances, current links, CSV and reversal with retained source rows |
| D04 | `/admin/map` | Leaflet points on public OpenStreetMap tiles, source-quality legend/counts, details, shared filters, complete filtered GeoJSON and browser printing |
| D05 | `/admin/locations` | Proposed coordinate validation; explicit source, accuracy, reviewer and time; approve or reject without automatic geocoding |
| D06 | `/admin/analytics` | ECharts computed patterns, independent office dimensions, known-person/unknown-event measures and overlapping quality flags; complete underlying CSV |
| D07 | `/admin/reports` | All O01–O22 audited families, group/search, grain, format and template status |
| D08 | `/admin/reports/build/:outputId` | Shared filters plus independent homeport/CPC/issuing office, period/as-of, event/revision selection, full population preview, source/method narratives and actual artifact generation |
| D09 | `/admin/exports` | Retained local revision snapshot, metadata/rows, reopen and regenerate CSV/XLSX/print from snapshot |
| D10 | `/admin/risk`, `/admin/risk/:id` | Versioned proposed rules with zero/unknown distinctions, critical-condition trigger, human-review state, retained inputs and printable detail |
| D11 | `/admin/policy` | Live evidence counts/denominators and underlying links; recommendation owner/priority/status/decision editing and CSV |

## Output behaviour

`src/data/catalogue.js` defines 22 families and derives every preview from the selected population. O01 contains all 38 A:AL audit headings in order, followed by explicit event/vessel/source identity and supplemental ship/voyage particulars. Source within/beyond-72-hour buckets remain separate from unknown calculated timeliness. The hidden effective-office dimension is explicitly a CPC/homeport derivation; actual issuing office remains separate.

Monthly tables retain an Unknown date column. O05/O07/O12 use involvement counts. O11 groups current event observations by month and vessel-type group; mixed-service events stay unallocated, avoiding multiplying persons across vessels. Known ship-loss **events** are labelled separately from vessel-loss totals because per-vessel consequences are not supplied. O13 counts typed report revisions and states that rule, rather than implying an approved receipt/obligation rule.

`src/lib/exports.js` supplies the contract's four export functions. CSV is UTF-8 with BOM, quotes multiline fields and neutralizes leading formula characters. ExcelJS writes real XLSX workbooks with text identifiers, decimal numbers, frozen headings, wrapped narratives, filters and landscape print settings. Null/empty values render as Unknown. GeoJSON includes only valid, usable point locations, with selected/located/excluded counts. Printable HTML escapes all supplied content and breaks wide tables into seven-column groups plus a repeated identifying column; browser Print / Save as PDF is explicit. No signed/server-issued PDF is claimed.

Each generated output retains a snapshot of complete rows, narratives, fictional events, filter metadata, template and as-of. History downloads use that snapshot, independent of subsequent live edits. O21 includes a generated SVG figure and its complete underlying table; O20 includes GeoJSON.

History, import/source-row and assessment collections use the shared `visibleRecords` scope helper. Reopening/downloading a retained export checks visibility again; inaccessible direct batch/assessment IDs show an unavailable state. MAIC narrative sections reuse the operations `maicGroups` schema with exact field labels and stage filtering, including progress orders and final findings. Excluding/restoring an import row preserves its original blocker until an explicit unknown-value acceptance.

## Demonstration limits

- Optional file selection records only local metadata. File contents are never read or uploaded. Staging uses clearly labelled synthetic source rows; no real spreadsheet parser, formula cache, file hash or original workbook ingestion is claimed.
- Batch reversal prevents removal when downstream reports, cases, actions, evidence or assessments exist, keeps the source rows and records reversal status. Production requires a transactional import/reversal service and broader relational retention controls.
- Basemap tiles require network access. If unavailable, point overlays and coordinate tables remain; no offline basemap or invented AOR polygons are bundled.
- Exact official paper layouts, logos, signatures, original-year masters, age/GT rules and timeliness rules require MARINA confirmation. MAIC forms preserve structured narrative sections and fields but are reference previews. Form 1A stays source-template-required.
- O19 shows an explicit zero-record selection until fictional overseas events exist; it never invents personal-role records unavailable in the source model. O14 has no unmatched partial-year percentage claims.
- Risk rules are a proposed demonstration, not a validated predictive model or an approved operational decision rule. Policy counts describe coverage/open work, not causal effects.
- Access checks are client-side demonstration only. All persistence and job history are local to this browser.

## Verification

Run `node --test src/pages/data/data.test.js` from `prototype/`. Tests cover all22 family configurations, event-versus-involvement denominators, consequence allocation, unknown months, CSV injection/escaping, GeoJSON exclusions/zero coordinates, an actual XLSX round-trip for text IDs/decimals/frozen headings, and printable HTML escaping. Root-level store tests and browser acceptance checks cover integration. No package installation, deployment or shared-store mutations are part of this module's implementation ownership.
