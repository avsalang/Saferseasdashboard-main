# MARINA field names and required reporting information

Use this specification with the seven-section SAFERSEAS incident form. The supplied MARINA forms and workbooks determine recognizable names and output needs. Required-entry rules below are the requested application policy, not a claim that every printed blank is legally mandatory. MAIC Forms 2 and 3B expressly request applicable information only.

## Completion policy

- **Save draft:** incomplete incident, investigation and case records remain saveable.
- **Submit / resubmit incident:** required occurrence, ship, source and consequence information must contain a value or an explicit field-specific Unknown/Not Applicable reason. Untouched defaults, blank controls and placeholder text do not satisfy requirements.
- **Validate incident:** also address preliminary causes, recommendations, casualty observation date/time and environmental information. Where a case exists, address the CPC/homeport office used by the case summary.
- **Review / issue MAIC report:** address the relevant stage's content, including unknown particulars and checkbox assessments. Review requires preparer and report dates; issuing additionally requires director noting. A supported cause is never compulsory. The detailed final causal checklist is assessed at the final-report stage.
- **Record case/actions:** require the fields relevant to an actual case, SCO, decision, penalty, certificate or SRB action. No case is manufactured to fill a table. Incomplete case work can remain a draft.
- **Prepare outputs:** check the actual output population and counting grain. Unresolved requirements produce an **INCOMPLETE WORKING COPY** requiring acknowledgement, with status, gaps and exceptions retained in the file and snapshot. Historical snapshots remain available exactly as saved.

Known zero remains zero. Unknown counts remain null. An identifier that was never issued is not invented. A missing map position remains unlocated. A required unknown needs an explanation; entering the literal words “Unknown”, “Not Applicable” or “N/A” as a supposed factual value does not bypass this rule. Corrected known facts retire their live unknown explanation; earlier snapshots retain their original history.

## Recognizable terminology and source decisions

| Use in the platform | Source / interpretation |
|---|---|
| Type, Date, Time and Location of Incident / Accident | 2025 workbook, `MASTER LIST!M2:P2` |
| Initial Event / Subsequent Event(s) | MAIC p6; separate these from consequences/impacts |
| Level of Maritime Accident (MARINA) | MAIC pp3/9: Less Serious, Serious, Very Serious. Master-list equivalent: `IMO CLASSIFICATION`. Preserve these local codes; do not silently translate them into the current IMO GISIS taxonomy |
| Name of Ship/Vessel; Ex-Name of Ship; Official Number; IMO Number; Call Sign; Type of Ship; Type of Operation | MAIC pp4/6; ship type and operation are separate fields. Call Sign and Type of Operation were added explicitly |
| Flag State; Registered Owner / Company; Operator; Business Address; Name of Master/Captain; Master/Captain License | MAIC pp4/6; official and IMO numbers remain textual identifiers |
| Gross Tonnage (GT), Net Tonnage (NT), Registered Length (m), Breadth (m), Depth (m), Deadweight (tonnes) | MAIC pp4/6. GT/NT are not weights; preserve decimal tonnage and explicit power units |
| Homeport (place), Homeport Office, CPC Issuing Office, Area of Responsibility (AOR), Actual Issuing MRO | Distinct location and administrative relationships. CPC means Certificate of Public Convenience. Do not infer an issuing office from occurrence coordinates |
| Narrative of Events Leading to the Accident; Initial Actions Taken; Recommendations | MAIC pp4–5 and spot p1 |
| Survivors / Rescued Persons | 2025 `CASUALTIES!C40`; 2024 `CASUALTY SUM!C37`. Persons alive; exclude recovered deceased persons. Form 2's “recovered / rescued” question belongs to the progress narrative. Recovery of deceased persons is not another living rescue |
| Ship Condition: Fit / Unfit / Total Loss | MAIC pp3/7/9. Keep physical condition separate from review status, case outcome and certificate actions |
| Sea Condition; Weather Condition; Wind Force (Beaufort Scale); Wave Height (m) | MAIC p9 plus the existing SAFERSEAS assistance fields. Model suggestions remain separate from entered observations, with per-value provenance |
| Show Cause Order (SCO), Case No., Violations, Decision/Order, Date Issued, Amount of Penalty | Master-list case columns. Within/beyond-72H values remain source categories; no automatic legal deadline is inferred |

Official primary references: [IMO casualty reporting procedures](https://wwwcdn.imo.org/localresources/en/OurWork/MSAS/Documents/MSC-MEPC3/MSC-MEPC.3-Circ.4%20Rev%201%20%20Revised%20harmonized%20reporting%20procedures%20-%20Reports%20required%20under%20SOLAS%20regulations%20I21.pdf), [IMO identification schemes](https://www.imo.org/en/ourwork/iiis/pages/imo-identification-number-schemes.aspx), [MARINA Franchising Service](https://marina.gov.ph/service-office/franchising-service-fs/). The local supplied MAIC PDF and 2024/2025 workbooks remain the primary source for MARINA's displayed labels; their raw records are not published.

## Dates and immutability

Occurrence date, source-information receipt date, report/submission date, information-as-of date, date noted and **Date Received by MARINA** are distinct. A report's issue date must not stand in for a receipt date. New incident receipt dates start blank. Report receipt may be recorded after issue through a dedicated receipt-metadata action, with account attribution, source reference and history; it does not rewrite the issued report's fields, revision or signoffs. O13 counts dated receipts and separately discloses unreceived/unknown-date records.

The mockup's occurrence date/time use Philippine time (UTC+08:00), stated on the form. Overseas original local date/time and timezone belong in source notes until production adds selectable incident timezone capture.

## Implementation contract

`src/data/reportingRequirements.js` holds the incident and output-dimension rules; `src/pages/operations/reportRequirements.js` holds MAIC and conditional case rules. The UI, submission/validation checks and output quality assessment use these definitions. `RequiredInformation.vue` gathers explicit exceptions. Implement equivalent server-side enforcement in production.

Exceptions persist as `reportingExceptions[key] = { status: 'unknown' | 'not_applicable', reason }`. Involved vessels have stable `reportingKey` identifiers so explanations cannot transfer when vessels are reordered or removed. Report/case exceptions belong to their own records. Frozen issued content and retained output snapshots are not backfilled from later incident changes. Receipt metadata is separate from frozen document content.

Each generated output carries its completeness status. CSV appends audit columns; XLSX/PDF retain requirement metadata and sections; GeoJSON retains completeness metadata; figures identify an incomplete working copy. All entry points, including direct GIS, analytics and incident-register exports, use the same working-copy policy.

## Field-level incident matrix

The following table is generated from the shared requirement definitions. All entries permit an explicit Unknown reason except minimum identity/narrative fields; Not Applicable is available only where the rule permits it. Final-report and case rules are additionally enforced by their stage-specific definitions.

| Stable field key | Recognizable label | Required stage | Output consumers | Exception allowance |
|---|---|---|---|---|
| date | Date of Incident / Accident | Incident submission | Annual Master List; Monthly Incident / Accident Summary; AOR Matrix; Homeport Matrix; Ship Type Matrix; Maritime Accident Level Matrix; Human and Ship Consequences; GT / Age / Company Figures; Cross-Year Comparison; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B; Statistical Figures | Unknown, with reason |
| time | Time of Incident / Accident | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| type | Type of Incident / Accident — Initial Event | Incident submission | Annual Master List; Monthly Incident / Accident Summary; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B; Statistical Figures | Unknown, with reason |
| seriousness | Level of Maritime Accident (MARINA) | Incident submission | Annual Master List; Maritime Accident Level Matrix; GT / Age / Company Figures; MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| place | Location of Incident / Accident | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B; Incident Map | Enter a factual value |
| aor | Area of Responsibility (AOR) | Incident submission | Annual Master List; AOR Matrix; GT / Age / Company Figures | Unknown, with reason |
| summary | Narrative of Events Leading to the Accident | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 3B | Enter a factual value |
| initialActions | Initial Actions Taken | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 2 | Unknown, with reason |
| sourceType | Source of Information — Type | Incident submission | Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| sourceRef | Source of Information — Reference | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| reportingAuthority | Reporting Authority / Organization | Incident submission | Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| receivedDate | Date Received | Incident submission | MAIC Report Receipt Summary; Spot Report; MAIC Form 1B; MAIC Form 2 | Unknown, with reason |
| consequences.fatalities | Fatalities | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.missing | Missing Persons | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.injured | Injured Persons | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.rescued | Survivors / Rescued Persons | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.crew | Number of Crew | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.passengers | Number of Passengers | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.totalOnboard | Total Persons on Board | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.shipCondition | Ship Condition | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |
| consequences.pollution | Oil / Chemical Pollution — Substance | Incident submission | Annual Master List; Human and Ship Consequences; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown or Not Applicable, with reason |
| recommendations | Recommendations | Incident validation / conditional case | Annual Master List; MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| potentialCauses | Potential Causes — Preliminary | Incident validation / conditional case | Annual Master List | Unknown, with reason |
| consequences.observedAt | Casualty Information As Of | Incident validation / conditional case | Human and Ship Consequences | Unknown, with reason |
| environment.waveHeightM | Wave Height (m) | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| environment.windForce | Wind Force (Beaufort) | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| environment.visibility | Visibility | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| environment.weatherDescription | Weather Condition | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| environment.seaState | Sea Condition | Incident validation / conditional case | MAIC Form 3B | Unknown, with reason |
| environment.observedAt | Environmental Observation Date/Time | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| environment.source | Environmental Information — Source | Incident validation / conditional case | MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| caseOffice | CPC / Homeport Reporting Office for Case Summary | Incident validation / conditional case | SCO Summary | Unknown, with reason |
| position | Position of Accident — Latitude and Longitude | Incident submission | Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B; Incident Map | Unknown, with reason |
| vessels[].name | Name of Ship/Vessel | Incident submission | Annual Master List; Homeport Matrix; Ship Type Matrix; Hull / Size / Classification Matrices; GT / Age / Company Figures; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Enter a factual value |
| vessels[].type | Type of Ship | Incident submission | Annual Master List; Ship Type Matrix; Human and Ship Consequences; GT / Age / Company Figures | Unknown, with reason |
| vessels[].rigType | Rig Type | Incident submission | Annual Master List | Unknown, with reason |
| vessels[].flag | Flag State | Incident submission | Annual Master List; Overseas Persons Register | Unknown, with reason |
| vessels[].grossTonnage | Gross Tonnage (GT) | Incident submission | Annual Master List; GT / Age / Company Figures | Unknown, with reason |
| vessels[].yearBuilt | Year Built | Incident submission | Annual Master List; GT / Age / Company Figures | Unknown, with reason |
| vessels[].owner | Registered Owner / Company | Incident submission | Annual Master List; GT / Age / Company Figures; MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| vessels[].operator | Operator | Incident submission | Annual Master List; GT / Age / Company Figures; MAIC Form 1B; MAIC Form 3B | Unknown, with reason |
| vessels[].homeport | Homeport Office | Incident submission | Annual Master List; Homeport Matrix | Unknown, with reason |
| vessels[].cpc | CPC Issuing Office | Incident submission | Annual Master List; SCO Summary | Unknown or Not Applicable, with reason |
| vessels[].hull | Hull Material | Incident submission | Annual Master List; Hull / Size / Classification Matrices | Unknown, with reason |
| vessels[].sizeClass | Size Classification | Incident submission | Annual Master List; Hull / Size / Classification Matrices | Unknown, with reason |
| vessels[].classificationSociety | Classification Society | Incident submission | Annual Master List; Hull / Size / Classification Matrices | Unknown or Not Applicable, with reason |
| vessels[].identification | Official Number / IMO Number | Incident submission | Annual Master List; Spot Report; MAIC Form 1B; MAIC Form 2; MAIC Form 3B | Unknown, with reason |

## Desktop references

- [Standard incident fields](screenshots/incident-form.png)
- [MAIC requirements and receipt metadata](screenshots/required-maic-issued-receipt.png)
- [Required case and action information](screenshots/required-case-actions.png)
