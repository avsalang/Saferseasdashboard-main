# Screen and output coverage

The application covers **49 specified screen IDs** through 50 route entries. Some views share a component: A07–A09 are investigation report stages; D03 includes import detail/reconciliation; D10 covers assessment list/detail. Routes use hash navigation, so a direct URL includes the hash fragment #/....

## Screens

| Screen | View | Route | Access |
|---|---|---|---|
| A01 | Operations overview | /admin | admin, reviewer, enforcement, analyst |
| A02 | Incident register | /admin/incidents | admin, reviewer, enforcement, analyst |
| A03 | Incident workspace | /admin/incidents/:id | admin, reviewer, enforcement, analyst |
| A04 | New incident | /admin/incidents/new | review |
| A04 | Edit incident | /admin/incidents/:id/edit | review |
| A05 | Review queue | /admin/review | review |
| A06 | Investigations | /admin/investigations | investigate |
| A07–A09 | Investigation workbench | /admin/investigations/:id | investigate |
| A10 | Recommendation follow-up | /admin/actions | admin, reviewer, enforcement, analyst |
| A11 | Enforcement cases | /admin/cases | enforce |
| A12 | Enforcement case | /admin/cases/:id | enforce |
| A13 | Vessel registry | /admin/vessels | admin, reviewer, enforcement, analyst |
| A14 | Owners and operators | /admin/companies | admin, reviewer, enforcement, analyst |
| A15 | Evidence register | /admin/documents | admin, reviewer, enforcement, analyst |
| D01 | Import batches | /admin/imports | analyze |
| D02 | Import wizard | /admin/imports/new | analyze |
| D03 | Import detail | /admin/imports/:id | analyze |
| D03 | Source reconciliation | /admin/reconciliation | analyze |
| D04 | GIS workspace | /admin/map | analyze |
| D05 | Location review | /admin/locations | investigate |
| D06 | Analytics | /admin/analytics | analyze |
| D07 | Report catalogue | /admin/reports | export |
| D08 | Report builder | /admin/reports/build/:outputId | export |
| D09 | Export history | /admin/exports | export |
| D10 | Assessment detail | /admin/risk/:id | analyze |
| D10 | Risk assessments | /admin/risk | analyze |
| D11 | Policy review | /admin/policy | analyze |
| M01 | Account management | /admin/accounts | manage_accounts |
| M02 | Roles & permissions | /admin/roles | configure |
| M03 | MARINA offices | /admin/offices | configure |
| M04 | Reference data | /admin/reference-data | configure |
| M05 | Workflow & templates | /admin/workflows | configure |
| M06 | Audit trail | /admin/audit | audit |
| M07 | System settings | /admin/settings | configure |
| M08 | Developer handoff | /handoff | Issued account |
| R01 | Reporting workspace | /reporter | reporter |
| R02 | My reports | /reporter/reports | reporter |
| R03 | New spot report | /reporter/reports/new | reporter |
| R04 | Report tracking | /reporter/reports/:id | reporter |
| R05 | Edit report | /reporter/reports/:id/edit | reporter |
| R06 | Draft reports | /reporter/drafts | reporter |
| R07 | My vessels | /reporter/vessels | reporter |
| R08 | Evidence and documents | /reporter/documents | reporter |
| S01 | Sign in | /login | Issued account |
| S02 | Activate issued account | /activate | Issued account |
| S03 | Recover account | /recover | Issued account |
| S04 | My account | /profile | Issued account |
| S05 | Inbox & notifications | /notifications | Issued account |
| S06 | Help & workflow | /help | Issued account |
| S07 | Access restricted | /forbidden | Issued account |

S01–S03 provide issued-account sign-in, activation and recovery. No public registration or anonymous-reporting route exists. Demo role controls on sign-in are for presentation; backend authentication remains production work.

## Outputs

| Family | Output | Counting grain | Offered formats | Template status |
|---|---|---|---|---|
| O01 | Annual master register | Vessel involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O02 | Monthly accident-type matrix | Event | CSV, XLSX, PDF | Versioned demo table v1 |
| O03 | Monthly AOR matrix | Event | CSV, XLSX, PDF | Versioned demo table v1 |
| O04 | Monthly homeport matrix | Vessel involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O05 | Monthly vessel/service matrix | Vessel involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O06 | Monthly seriousness matrix | Event | CSV, XLSX, PDF | Versioned demo table v1 |
| O07 | Hull, size and classification matrices | Vessel involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O08 | Case outcome matrix | Case | CSV, XLSX, PDF | Versioned demo table v1 |
| O09 | SCO summary by office | Case | CSV, XLSX, PDF | Versioned demo table v1 |
| O10 | Detailed SCO/case compliance register | Case / action | CSV, XLSX, PDF | Versioned demo table v1 |
| O11 | Human and vessel consequences | Event | CSV, XLSX, PDF | Versioned demo table v1 |
| O12 | GT, age, company and AOR by seriousness | Vessel involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O13 | MAIC report-receipt summary | Report revision | CSV, XLSX, PDF | Versioned demo table v1 |
| O14 | Cross-year comparison package | Event / involvement | CSV, XLSX, PDF | Versioned demo table v1 |
| O15 | Spot report | Event | CSV, XLSX, PDF | Structured demonstration |
| O16 | MAIC Form 1B initial report | Report revision | CSV, XLSX, PDF | Structured demonstration |
| O17 | MAIC Form 2 progress report | Report revision | CSV, XLSX, PDF | Structured demonstration |
| O18 | MAIC Form 3B final report | Report revision | CSV, XLSX, PDF | Structured demonstration |
| O19 | Overseas / Filipino crew-passenger register | Event | CSV, XLSX, PDF | Versioned demo table v1 |
| O20 | Geographic output package | Located event | CSV, XLSX, GeoJSON, PDF | Proposed GIS package |
| O21 | Statistical figures | Event | CSV, XLSX, SVG, PDF | Proposed figure |
| O22 | Reconciliation and data-quality report | Event / source row | CSV, XLSX, PDF | Versioned demo table v1 |

PDF means browser print/save as PDF. MAIC previews demonstrate structured content; approved official masters and signatories are required before production release. Form 1A is template-required and no document is fabricated. Selection, unknowns and counting notes accompany each output; pagination never limits downloaded rows.
