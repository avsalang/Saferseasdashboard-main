# Existing SAFERSEAS intake with MAIC additions

**Goal:** Preserve SAFERSEAS's seven familiar intake sections and digital assistance, adding the missing MARINA information without turning an initial report into a mandatory final investigation.

**Approved direction:** User: “just modify and add the missing fields and other requirements from MAIC”. This refines the previously approved complete Vue/Quasar mockup and publication. Desktop is the priority. The three account types and overlapping operational functions remain.

**Architecture:** Extend the existing incident snapshot additively. Retain original styling and seven section names; isolate location and weather assistance in components. Reuse MAIC field definitions for optional supplementary investigation information and map collected information into report drafts and exports. Existing issued snapshots remain immutable.

**Tech Stack:** Existing Vue 3, Quasar, Leaflet, JavaScript and Playwright.

## Tasks

- [x] Restore Time & Location, Vessel & Operator, Voyage & Cargo, Narrative & Timeline, Findings & Outcomes, Attachments, Review & Submit. Keep unknowns, multiple vessels, decimal tonnage and account attribution.
- [x] Restore map picking and date/location weather assistance. Preserve manual observations, distinguish model suggestions, handle partial errors and stale requests. Add null/zero and date/time tests.
- [x] Add missing fields for locations, propulsion/registry, rescue, sources, consequence allocations and optional MAIC details. Save and display all fields, including after reopening.
- [x] Map new fields to report drafts and supplemental export columns with source context; never promote preliminary causes to established conclusions automatically.
- [ ] Verify unit tests, desktop intake journey, correction cycle, build and independent review; update developer handoff, publish to the authorized GitHub Pages repository, verify live.

## Review focus

- A missing coordinate or occurrence time must not fetch weather for an invented position/time.
- Known zero weather values and casualty counts must remain zero.
- Changed occurrence details must invalidate pending weather suggestions, preserving user entries.
- Existing saved incidents and issued revisions must retain their meaning and remain usable.
- Optional investigation fields must not prevent early submission; source categories and office responsibilities remain distinct.
