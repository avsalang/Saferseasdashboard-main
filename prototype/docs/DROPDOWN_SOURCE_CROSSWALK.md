# MARINA dropdown source crosswalk

The source catalogue in `src/data/marinaVocabulary.js` contains nonpersonal category labels only. It was checked against all supplied workbook sheets using the local extraction inventory and the scanned MAIC form pages. It does not contain vessel names, owners, operators, masters, casualties or case records. No source file was modified.

These are capture/reference choices derived from the supplied reporting material, not a claim of current legal definitions, approved classification-society recognition or mandatory completion rules. Product validation determines which applicable reporting dimensions must be completed. Unknown and not-applicable decisions must remain explicit; a blank is not a confirmed zero.

## Source catalogue

Abbreviations below refer to the supplied files:

- **S1:** `2018-2022 Matrix Marine Accidents-Incidents.xlsx`.
- **S2:** `2023 MASTER LIST-Matrix of Marine Accident.Incident.xlsx`.
- **S3:** `2024 MASTER LIST-Marine Accidents_Incidents (2).xlsx`.
- **S4:** `2025 MASTER LIST of Marine Incidents_Accidents1.xlsx`.
- **S5:** `2026 MASTER LIST of Marine Incidents-Accidents .pdf`.
- **S6:** `MAIC FORM SAFETY INVESTIGATION.pdf`, pages numbered by their position in the 12-page file.

| API key | Evidence | Treatment |
|---|---|---|
| `incidentType` | S3 `DROPDOWN!B2:B19`; S4 `DROPDOWN!D2:D16`; S6 pp3/9; historical type columns S1/S2 | Complete 15-choice modern dropdown union, plus all additional MAIC checkbox choices and nonpersonal historical event families. Multi-event descriptions, casualty counts and vessel-specific narrative strings are not turned into standard dropdown choices. Existing raw values remain selectable. |
| `rigType` | S4 `DROPDOWN!B2:B17`; observed S3 `INVENTORY LIST!B3:B283` | Source abbreviations retained. Additional observed MT, RV and TUG are available. Case/punctuation aliases are documented below. No unsupported acronym expansion. |
| `shipType` | S3 `DROPDOWN!P2:P19`; S4 `DROPDOWN!R2:R14`; S1 service columns H/M/L and S2 H | Modern passenger, passenger/RORO, passenger/cargo, cargo, cargo/RORO, tug, barge, tanker, dredger, fishing, recreational and source special categories, with historical subtypes retained. Do not flatten passenger/RORO/cargo or cargo/passenger into another subtype. |
| `hullMaterial` | S3 `DROPDOWN!R2:R5`; S4 `DROPDOWN!T2:T7`; S1 `2022!I` | Steel, Wood, FRP, Aluminum plus explicit source reporting markers Foreign Flag and Unregistered. These markers are **not hull materials**. |
| `sizeClass` | S3 `DROPDOWN!L2:L4`; S4 `DROPDOWN!N2:N6` | Conventional, Non-Conventional, N/A, Foreign Flag, Unregistered. Last three are source applicability/registration markers, not physical sizes. Do not calculate this classification from GT alone. |
| `classificationSociety` | S3 `DROPDOWN!N2:N15`; S4 `DROPDOWN!P2:P15`; S2 `MASTER LIST!T`; S5 pp3–4 | Explicit modern list plus historical ALPHA SHIP, ASCS, DNV GL, Lloyd's Register and DNV. Includes MARINA, EXEMPTED, NONE, N/A, Foreign Flag and Unregistered because the reporting sources use them. This is not a list of currently recognized societies. |
| `seaCondition` | S6 p9 | Exact categories: Calm, Moderately Rough, Rough, Very Rough. These are MARINA form categories, not a replacement for a numeric sea-state scale or observed wave height. |
| `weatherCondition` | S6 p9 | Exact categories: Clear, Foggy, Cloudy, Stormy. Additional reported descriptions must remain possible without silently substituting a category. |
| `operationType` | S6 pp4/6, Type of Operation | Empty list: the form contains the field but supplies no controlled choices. Use searchable/reference-assisted free entry; do not invent an official Domestic/International enum. |
| `registrationStatus` | S3/S4 source markers | Empty list: Unregistered and Foreign Flag appear in other source reporting dimensions, but do not establish a complete registration-status enum. |
| `sourceType` | S6 p1, Source of Information | Printed examples Facebook Post, PCG Report, Marine Protest, plus Other. Suggestions only; not a closed enumeration. |
| `documentType` | S6 pp1–12; S4 `MAIC FORMS!C3:E3`; source/action documents S4 `MASTER LIST!X:AI` | Observed report and action-document types. Form 1A is a receipt label; its template was not supplied. Other evidence/document types remain free entry. |
| `impactType` | S6 pp3/9 type/consequence boxes | Source-grounded consequence suggestions, separate from event type and level. Injured Persons is grounded in the consequence counts. No invented Service Interruption choice. |
| `damageType` | S6 pp3/9–10 ship damage and machinery failure boxes | Source-grounded suggestions rather than an official standalone damage-code enum. Keep detailed damage narrative. |
| `powerUnit` | S6 pp4/6, Horsepower/kW | hp and kW, with Horsepower → hp as a documented display abbreviation. No unsupported engine-power unit assumptions. |
| `visibility` | No controlled visibility list supplied | Empty list. Retained SAFERSEAS observation field; searchable free description/distance is appropriate. |
| `shipCondition` | S6 pp3/9 | Fit, Unfit, Total Loss. Keep condition separate from data-review/investigation/case status. |
| `accidentLevel` | S6 pp3/9; S4 `DROPDOWN!L2:L4` | Less Serious, Serious, Very Serious. Local MARINA level; master-list heading is IMO CLASSIFICATION. Do not present this as a verified direct current IMO GISIS enum. |
| `office` | S3 `DROPDOWN!D/F/H`; S4 `DROPDOWN!F/H/J/AB` | Twelve explicit real-office codes. Non-office markers are exported separately in `SOURCE_REPORTING_MARKERS.office`. No inferred office merger. |
| `crewFactor` | S6 pp10–11, Liveware checkboxes | Exact physiological, psychological and physical factor labels, not a generic guessed behaviour list. Use only evidence-supported findings. The full report retains its stable coded fields and subgroup structure. |

No `cargoType` array is exported: neither dropdown sheet supplies a cargo-type, port, crew-behaviour or operation-type column. The cargo-shifting, cargo-fire and stowage choices in MAIC are causes/factors, not cargo types. `crewFactor` comes from the explicit MAIC liveware checkboxes instead. Cargo type, operation type and ports require an appropriate external reference or reported free entry; arbitrary guesses are not represented as approved lists.

S3 and S4 dropdown lists are the strongest explicit category evidence. Historical detail cells provide additional observed categories, not evidence that every old description was a controlled choice. Historical composites such as Girthing/Sinking and preliminary/alleged events stay intact rather than being assigned a single unproven canonical type. The catalogue's canonical display capitalization does not replace the raw source spelling.

## Annual differences, aliases and source spelling

`MARINA_SOURCE_ALIASES` makes selected mappings inspectable. Case, whitespace and punctuation matching is separate from explicit wording aliases. Examples:

| Source spelling | Suggested analytical label | Note |
|---|---|---|
| AGROUNDING, Aground, Ran Aground | Grounding | Historical wording; raw record unchanged. |
| Allsion | Allision | Source spelling variation. |
| Singking, Sank, Sunk | Sinking | Historical spelling/tense. |
| Near Miss Collision | Near Miss Accidents | MAIC checkbox label. |
| Fire Onboard, Fire On Board | Fire | General event family; raw description retained. |
| Engine Failure, Engine Breakdown, Engine Trouble | Separate corresponding choices | Do not collapse distinct source labels merely because a summary combines them. |
| Capsized, Capsize | Capsizing | Historical wording. |
| Submerged, Submerge | Submersion | Historical wording; partial submersion remains distinct. |
| Damge to Ship or Equipment | Damage to Ship | Source text typo. |
| Patially Damaged | Partially Damaged | Source text typo; not a total-loss assertion. |
| Convenventional Size | Conventional | S1 2018 spelling. |
| Non-Connventional Size, Non-Convenventional Size | Non-Conventional | S1 2018 spelling; punctuation/case variants also match. |
| Fiber Glass, Fiberglass | FRP | S1 2022 hull terminology; original wording retained. |
| FBCA, MBCA, MTKR, MTUG, M/Y | FBca, MBca, MTkr, MTug, MY | Source code casing/punctuation. |
| MV* | MV | Observed annotated rig value; the marker remains in the saved source spelling. |
| Passenger-roro; Ro-ro/ Pasenger | Passenger/RORO | Historical format/spelling. |
| Fisshing Boat | Fishing | Source text spelling; no private registry identity included. |
| PHILIPPINE REGISTER OF SHIPPING, INC | PHILIPPINE REGISTER OF SHIPPING, INC. | S3/S4 dropdown punctuation differs from historical detail spelling. |
| KOREAN REGISTER (KR) | KOREAN REGISTER | Observed historical acronym. |
| LLOYDS REGISTRY | Lloyd's Register | Readable display normalization of the supplied historical label, not verification of present recognition. |

Foreign/unregistered are not silently converted to hull, size or society values. `SOURCE_REPORTING_MARKERS` and `MARINA_OPTION_NOTES` provide explanatory text for those source choices. NONE, N/A, EXEMPTED and blank are not interchangeable.

The S4 list differs from S3: rig dropdown added; N/A and Foreign Flag appear under size; Foreign Flag/Unregistered appear under hull; modern ship list has a broad Foreign Flag category where S3 had Foreign Ship (Cargo)/(Tanker). Both year-specific categories remain available. S2 adds historical society labels absent from later dropdowns. S1 includes specialized cargo/passenger types absent from the modern lookup sheets.

## Office references and existing prototype IDs

S3 prints `MRO NCR`; S4 prints `MRO-NCR`. Both print `MRO 1`, then `MRO 4` through `MRO 13`; no MRO 2 or MRO 3 is a separate choice in these dropdowns. S4 issuing-office column AB prints `MRO1`, `MRO4` and so on. S3/S4 summaries use combined `MRO 1&2`, `MRO I & II` or similar headings. A combined summary heading is not by itself proof that an individually recorded MRO 2 can be recoded to MRO 1.

| Existing prototype ID / code | Source lookup / safe display reference |
|---|---|
| `MRO-NCR` / MRO NCR | MRO-NCR |
| `MRO-I-II` / MRO I-II | Keep the combined ID/label. Help text: Source dropdown: MRO 1; combined summary: MRO I & II. Directory correspondence requires review; no automatic alias in `canonicalMarinaValue`. |
| `MRO-IV` / MRO IV | MRO 4 (IV) |
| `MRO-V` / MRO V | MRO 5 (V) |
| `MRO-VI` / MRO VI | MRO 6 (VI) |
| `MRO-VII` / MRO VII | MRO 7 (VII) |
| `MRO-VIII` / MRO VIII | MRO 8 (VIII) |
| `MRO-IX` / MRO IX | MRO 9 (IX) |
| `MRO-X` / MRO X | MRO 10 (X) |
| `MRO-XI` / MRO XI | MRO 11 (XI) |
| `MRO-XII` / MRO XII | MRO 12 (XII) |
| `MRO-XIII` / MRO XIII | MRO 13 (XIII) |

These are display/reference suggestions, not state migration. Existing stable IDs remain valid. Numeric/roman notation aliases are explicit; combined region aliases are not guessed. Source marker applicability varies: S3 Homeport has Unregistered/Foreign Flag, CPC has N/A/NONE, while S4 Homeport/CPC also have Foreign Flag/Unregistered and AOR adds INTERNATIONAL. Do not offer every marker as every type of office.

## MAIC checklists and factors

The complete coded factor checklists remain in `src/pages/operations/maic.js`; this string-options module does not replace their stable codes or flatten them into a generic human-error menu. Source-backed sections are:

- S6 p9: accident level/type; Sea Condition; Weather Condition; ship fit/unfit/total loss; dead/missing crew/passenger totals; seriously injured crew/passengers; oil in bunkers/cargo and chemicals in bulk.
- S6 p10: internal/structural/technical causes; propulsion/essential auxiliary/steering/closing seals/navigation/bilge/electrical/communications/lifesaving/design failure; cargo shifting, fire/explosion, stowage, spontaneous combustion and liquefaction; external ship/tug/shore/environment/navigation-infrastructure causes.
- S6 pp10–11: physiological, psychological and physical liveware factors; company policy/procedures/management; hardware availability, ergonomics, design and maintenance; ship movement, weather, vibration, noise and temperature/humidity.

Their source choices are evidence-supported investigation findings, not mandatory guesses at initial intake. The separate compatibility factor summary in `maic.js` is labelled compatibility and is not claimed to be the exact supplied form checklist.

The source's rescued/recovered progress question does not combine deceased recoveries with survivors. The separate living-person count uses Survivors / Rescued Persons; record recovery of deceased persons in progress narrative and fatalities without adding them to survivors.

## API and integration contract

```js
import {
  MARINA_OPTIONS, getMarinaOptions, canonicalMarinaValue,
  MARINA_FIELD_SOURCES, MARINA_OPTION_NOTES, SOURCE_REPORTING_MARKERS,
} from './data/marinaVocabulary.js'

getMarinaOptions('incidentType', saved.type)
// New display choices + saved text verbatim, including legacy spelling.

canonicalMarinaValue('incidentType', 'ENGINE TROUBLE') // 'Engine Trouble'
canonicalMarinaValue('incidentType', 'Agrounding')     // 'Grounding'
// Opt-in analytical grouping only: no assignment back into saved records.
```

`getMarinaOptions` accepts a scalar or string array, returns a fresh array, drops empty values, deduplicates exact duplicates, and never silently recodes a saved value. Unknown keys yield just supplied current values. Lists and source metadata are frozen. `canonicalMarinaValue` matches explicit source aliases or catalogue choices case/punctuation-insensitively; unknown values pass through unchanged. It does not split composite events, infer severity, overwrite records or certify report counting rules. Summary-family mappings remain a separate output concern.

Searchable selects must allow adding a reported value for open/reference-assisted fields and retain historical current choices. No public catalogue of vessel/person/company identities is provided. Offices continue using the configured MARINA office directory; civil ports/geography continue using existing reference sources rather than invented port options in this module.

Verification: `node --test tests/marinaVocabulary.test.js` checks modern/MAIC coverage, historical society presence, uncontrolled fields, legacy preservation, no shared-list mutation, explicit alias grouping and marker warnings.

## Delivered UI and consistency rules

`MarinaSelect.vue` provides searchable source choices and retains saved legacy values. Open reference fields commit an unlisted value on Enter or blur; controlled lists do not accept arbitrary new choices. Ship/person names, identifiers, numbers, dates, and narrative/damage evidence remain appropriate inputs. Full MAIC damage narrative and reported weather descriptions remain editable. Configured incident-type extensions remain selectable.

`StaticSection.vue` replaces content accordions across the platform, including the navigation groups, filters, record particulars, investigation forms, cases and report details. The original seven reporting steps and normal tabs/dialogs remain. `FieldException.vue` places permitted unavailable-information status and reason beside its field, with no separate requirements block. Source N/A size classification accepts an explicit Not Applicable reason. Required validation, draft saving and protected issued content are preserved.

`marinaOffices.js` adds the twelve real source-office choices using stable prototype IDs, including a separate MRO-I for source MRO 1. Existing MRO-I-II stays a retained summary grouping and is offered only when already saved; it is never equated with MRO 1. Homeport, CPC, AOR and issuing-office controls use their own source markers. Recognized real-office notation aliases match for comparison/scope; non-office markers never broaden access.

Canonical grouping applies to summaries, filters, matrices and office aggregates while annual raw registers and issued snapshots retain recorded values. Engine Failure remains distinct from Engine Trouble/Breakdown. N/A/NONE CPC falls back to known homeport in the SCO office summary; Foreign Flag/Unregistered remain meaningful source categories.
