# Existing SAFERSEAS interface reuse

The user's final direction was to use the existing SAFERSEAS UI and adjust its elements for MARINA. The delivered mockup therefore reuses source layouts, page markup, scoped styles and imagery rather than introducing another design system.

| Existing source | Mockup location | Adaptation |
|---|---|---|
| Admin `src/layouts/DashboardLayout_v2.vue` | `src/layouts/AdminLayout.vue` | Original drawer/header/profile/notification treatment; mock account bindings, scoped MARINA destinations and working search |
| Reporter `src/layouts/DashboardLayout_v2.vue` | `src/layouts/ReporterLayout.vue` | Original top navigation/profile/mobile overlay; issued reporter links and Help replace public/anonymous destinations |
| Admin `src/css/app.scss` | `src/styles/saferseas-existing.scss` | Copied theme, typography and control rules |
| Admin `src/pages/Login_v2.vue` and command background | `src/pages/LoginPage.vue`, `AccountAccessPage.vue` | Original split layout, imagery, email/password steps and input treatment; local issued-account flows and explicit demo controls |
| Admin `Dashboard/HomePage/IndexPage.vue` and components | `src/pages/operations/Dashboard.vue`, `visual/` | Original 8/4 composition, image banner, stat cards, coverage, workflow and recent records; API data replaced with fictional counts |
| Admin `Dashboard/Incidents/IndexPage.vue`, `sections/StatCards.vue`, `sections/IncidentTable.vue` | `src/pages/operations/IncidentRegister.vue`, `visual/RegistryStats.vue` | Source header, filters, split stat cards, table/status rules and mobile cards; MARINA register columns/actions |
| Reporter `Dashboard/HomePage/IndexPage.vue` and four components | `src/pages/reporter/Dashboard.vue`, `dashboard/` | Original gradient metrics, chart and table composition; data bindings and labels changed for reporter workflow |
| Reporter `Dashboard/Incidents/Create.vue` | `src/pages/reporter/IncidentForm.vue` | Source completion card/menu, current-step heading, step pill, form card, navigation and scoped CSS; five MARINA steps and multi-vessel fields |
| Admin `Dashboard/Monitoring/Analytics/IndexPage.vue`, `SelectionSummary.vue`, `AnalyticsFiltersDialog.vue` | `src/pages/data/AnalyticsPage.vue` | Source breadcrumb/actions, notices, numbered tabs, mobile selector, cards and filter overlay; audited measures and shared selection |
| Admin `Dashboard/Monitoring/GISMap/IndexPage.vue` | `src/pages/data/MapPage.vue` | Source full-height map, tactical filters, map controls and bottom overlay; coordinate-quality review and filtered artifacts |

New MARINA screens use the reused SAFERSEAS theme, breadcrumb/header and table treatment. Necessary responsive fixes prevent overflow; copied page styling does not imply retention of obsolete public routes or unsupported safety-score formulas.

Browser-local store bindings replace production API/authentication code. Original source CSS is kept with components where practical; supplemental selectors adapt new fields and table structures. Small chart imports replace the source's full ECharts import without changing its visual options.

## Delivered previews

- [Admin dashboard](screenshots/admin-dashboard.png)
- [Reporter dashboard](screenshots/reporter-dashboard.png)
- [Incident form](screenshots/incident-form.png)
- [Analytics](screenshots/analytics.png)
- [GIS workspace](screenshots/map.png)
- [Printed progress-report content](screenshots/progress-print.png)

All preview data is fictional. These show the implemented mockup, not the older React version or the live production repositories.
