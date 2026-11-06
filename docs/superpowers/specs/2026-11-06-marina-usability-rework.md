# MARINA usability rework

The user asked to rework the platform so MARINA can use it as easily as possible while it remains familiar. The existing SAFERSEAS look remains the visual reference. The confirmed account types are MRO Reporter, MRO Reviewer and MARINA Investigator; the last has every function.

## Findings

The current reporter dashboard prioritizes charts over correcting or continuing a report. Initial occurrence entry exposes seriousness, secondary categories, coordinates and four office relationships before the factual account. Staff navigation exposes many implementation modules; regional reviewers see investigation/enforcement tabs without access. The report catalogue gives equal weight to 22 technical output families, and its builder displays eight filters plus template and office controls at once. Investigation forms expand many lengthy sections by default.

## Decisions

- Keep the actual SAFERSEAS layouts, typography, colors, cards, tables and assets. This is a workflow simplification, not another visual redesign.
- Keep every approved screen/output reachable, with fewer primary destinations and more contextual actions.
- MRO Reporter: show corrections, drafts and submission tracking first. Preserve the familiar dashboard and reporting form. Expose essential occurrence/vessel details first; group optional classification, positions, office and technical particulars in clearly named sections. Unknown remains different from zero. Do not invent official geography or factual values.
- MRO Reviewer: start with the regional review queue and clear next actions. Show the occurrence, vessels, consequences, sources and history needed for review. Reporting, review, investigation and follow-up are intentionally available across all three account types for now; role-specific starting pages prioritize usual work without forcing exclusive handoffs. Keep regional analysis/outputs available.
- MARINA Investigator: keep all functions, grouped into Dashboard, Incidents, Investigations, Reports & maps, Registers and System. Put account/configuration/data-maintenance tools in System. Put cases and follow-up with investigations.
- Reports: prioritize commonly used MARINA outputs; offer all 22 through grouped/searchable choices. Put period and office selection first, advanced filters and technical/version metadata behind details. Keep full-selection downloads, immutable snapshots and saved-revision content correct.
- Investigation: retain the source MAIC fields/checklists and revision protection. Display stage/action guidance and open relevant sections before optional technical details.
- Use plain task labels. Keep implementation notes in Help/handoff when they are not needed for an operator's decision. Retain a restrained fictional-data indicator.

The user explicitly requested redundant functions for now. Operational tools overlap across all three account types; only account/system configuration remains with the MARINA Investigator. Record scope remains explicit and still applies. No new account types, official form facsimiles or unsupported risk/legal rules are introduced.

## Implementation and verification

Root owns layouts/navigation, shared domain/access integration, documentation and integration tests. Reporter, operations and reports are separate bounded modules with exclusive file ownership. Existing paths/store/output contracts stay stable unless a demonstrated usability issue requires an explicit integration change. Verify complete intake/correction/review, investigation/case, imports/outputs and account journeys, all 49 screen IDs and 22 outputs, role boundaries, desktop/mobile and published Pages behavior.
