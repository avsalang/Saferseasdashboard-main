# MARINA usability rework

The platform keeps the SAFERSEAS visual language and changes the order in which people encounter work. Familiar layouts, colors, typography, source page components, cards and tables remain. The original seven-section incident form is restored with MAIC additions; see [incident form additions](INCIDENT_FORM_ADDITIONS.md). The next useful action appears before optional information.

## The three accounts

| Account type | Starting point | Operational functions |
|---|---|---|
| MRO Reporter | Reporting desk: corrections, drafts and tracking | Reporting, review, investigations, cases/follow-up and outputs on permitted records |
| MRO Reviewer | Review queue: new/updated submissions first | The same operational tools, with regional records prioritized |
| MARINA Investigator | Workspace: review, investigations and follow-up | Every operational function, all-office access, account management, configuration, audit and settings |

**Operational overlap is intentional for now**, as requested by the user. These starting pages are shortcuts, not exclusive handoffs. Regional accounts do not receive central system privileges. Default record scopes remain own/assigned for Reporter, office/AOR/assigned for Reviewer, and all offices for MARINA Investigator. Final production scope and approval rules remain for MARINA to confirm.

## What changed and why

| Earlier friction | Delivered change |
|---|---|
| Reporter charts preceded work needing attention | Corrections and drafts appear first, followed by tracking. Familiar charts are available in a secondary overview. |
| Initial reporting showed classifications, office relationships and coordinates alongside basic facts | Date/time, incident type, place and factual account appear first. Named optional sections retain every classification, position, office and response field. |
| Vessel identifiers appeared in both basic and expanded sections | Basics appear once. Detailed technical/voyage particulars remain expandable. |
| A save could navigate away before its feedback was visible | New-draft save feedback survives navigation. Subsequent edits show saved state. |
| Progress implied factual completeness after simply visiting steps | The indicator says “Steps reviewed”; submission still validates required facts and explicit unknowns. |
| Regional reviewers had to find their next action among many pages | Reviewer sign-in opens the review queue. Needs review, Awaiting corrections and All open are separate views, ordered by receipt/update rather than occurrence date. |
| Staff workspaces had nine equally prominent tabs | Five core review sections cover facts, vessels, consequences, sources and history. Investigation, cases and follow-up are contextual links for the same incident. |
| Long investigation forms opened every technical section | Stage guidance and jump actions expose relevant sections first. Every MAIC field/checklist and issued revision remains available. |
| Twenty-two report families had equal visual weight and technical labels | Four common report tasks lead the page. All 22 remain searchable and grouped. |
| The report builder opened with a wall of filters | Choose records → preview → download. Advanced filters, version and counting notes are available when needed. |
| A document preview silently selected the first incident | Spot/MAIC outputs require an explicit incident choice or valid incident context. No implicit first-record report can be downloaded. |
| Shared capabilities were hard to discover | Reporter Work tools and grouped staff navigation reach the same operational functions. The labeled staff menu can be pinned or collapsed. |

## Checks that protect the workflow

The rework preserves multi-vessel events, decimal GT, unknown versus zero counts, evidence links, source lineage, saved report observations, immutable issued revisions, full-selection exports and retained snapshots. Historical occurrence dates do not push newly received reports to the back of the review queue.

Both Reporter and Reviewer authored-report correction cycles are exercised. Reviewer notifications open the correct workspace and resubmission retains the original owner, evidence and previous revision. Shared vessel pickers respect the directory scope. Older browser states migrate to the shared operational functions without deleting edits or attribution; regional role settings cannot grant central powers.

See [developer handoff](DEVELOPER_HANDOFF.md), [verification](VERIFICATION.md) and [screen/output coverage](SCREEN_OUTPUT_COVERAGE.md).

## Updated previews

- [Reporter desk](screenshots/reporter-dashboard.png)
- [Mobile incident intake](screenshots/reporter-mobile.png)
- [MARINA Investigator workspace](screenshots/admin-dashboard.png)
- [Regional review workspace](screenshots/review-workspace.png)
- [Investigation workbench](screenshots/investigation-workbench.png)
- [Reports](screenshots/reports.png)
- [Mobile report preparation](screenshots/report-builder-mobile.png)
