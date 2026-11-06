// Nonpersonal source vocabulary only. See docs/DROPDOWN_SOURCE_CROSSWALK.md.
// Display options never rewrite a saved value; canonicalMarinaValue is opt-in grouping.
const freezeLists = object => Object.freeze(Object.fromEntries(Object.entries(object).map(([key, values]) => [key, Object.freeze([...new Set(values)])])))

export const MARINA_OPTIONS = freezeLists({
  incidentType: [
    'Grounding', 'Hull Failure', 'Engine Trouble', 'Mechanical Failure', 'Steering Failure', 'Listing', 'Capsizing', 'Flooding', 'Sinking', 'Collision', 'Allision', 'Fire', 'Explosion', 'Man Overboard', 'Occupational Accident',
    // Additional MAIC checkbox choices (pp3/9), not inferred from severity columns.
    'Ramming', 'Near Miss Accidents', 'Damage to Pier', 'Electrical Failure', 'Drifting', 'Damage to Ship', 'Missing Person', 'Missing Passengers', 'Loss of Ship', 'Loss of Life', 'Severe Pollution', 'Other',
    // Distinct nonpersonal historical register categories; narrative variants remain raw.
    'Engine Failure', 'Engine Breakdown', 'Swamping', 'Submersion', 'Partial Submersion', 'Partial Sinking', 'Foundering', 'Girthing', 'Anchor Dragging', 'Heavy Weather Damage', 'Structural Damage', 'Minor Damage', 'Totally Damaged', 'Partially Damaged', 'Propeller Damage', 'Propeller Entanglement', 'Anchor Entanglement', 'Accidental Release of Anchor', 'Ramp Failure', 'Touched Bottom', 'Oil Spill', 'Piracy', 'Bombing Incident', 'Dynamite Throwing Incident', 'Occupational Hazard', 'Missing Crew', 'Missing Motorbanca', 'Missing Fisherman', 'Death of Crew', 'Fatality Onboard', 'Total Loss/Wreck', 'Berthing Failure', 'Hydraulic Malfunction of Cargo Ramp', 'Steering Casualty', 'Generator/Auxiliary Trouble', 'Loss of Propelling Power', 'Stranding', 'Struck by Lightning', 'Health Issue', 'Marine Casualty', 'Fire at Shipyard', 'Vehicular Fire Onboard', 'Cargo Truck Slippage Onboard', 'Rudder Malfunction', 'Propeller Shaft Failure', 'Injuries with Machinery/Equipment',
  ],
  rigType: ['BARGE', 'DREDGER', 'FB', 'FBca', 'FV', 'LCT', 'MB', 'MBca', 'ML', 'MTkr', 'MTug', 'MV', 'MY', 'RB', 'SB', 'SL', 'MT', 'RV', 'TUG'],
  shipType: [
    'Passenger', 'Passenger (Tourist Boat)', 'Passenger/RORO', 'Passenger/Cargo', 'Cargo', 'Cargo/RORO', 'Tug', 'Barge', 'Tanker', 'Dredger', 'Fishing', 'Recreational', 'Foreign Ship (Cargo)', 'Foreign Ship (Tanker)', 'Foreign Flag', 'Unregistered',
    // Historical ship/service subtypes are retained rather than silently flattened.
    'Passenger/RORO/Cargo', 'Passenger Motorbanca', 'Passenger Motorbanca (With Outriggers)', 'Passenger Service Boat', 'Passenger/Fast Craft', 'Cargo Motorbanca with Outriggers', 'Cargo/Fish Carrier', 'Cargo/Passenger', 'Fishing Carrier', 'Fishing (Foreign Vessel)', 'General Cargo', 'Bulk Carrier', 'Container Ship', 'Cargo/Container', 'Cargo/Tanker', 'Cargo/Deck Loading Cargo', 'Oil Tanker', 'Chemical Tanker', 'Water Tanker', 'Tanker Barge', 'Power Barge', 'Deck Loading Barge', 'Barge (Non-Propelled)', 'Barge (Tug)', 'Service Boat', 'Service Ship', 'Special Purpose Vessel', 'Motor Banca', 'MRRV', 'N/A',
  ],
  hullMaterial: ['Steel', 'Wood', 'FRP', 'Aluminum', 'Foreign Flag', 'Unregistered'],
  sizeClass: ['Conventional', 'Non-Conventional', 'N/A', 'Foreign Flag', 'Unregistered'],
  classificationSociety: [
    'MARINA', 'ORIENT REGISTER OF SHIPPING, INC.', 'PHILIPPINE REGISTER OF SHIPPING, INC.', 'OCEAN REGISTER OF SHIPPING, INC.', 'KOREAN REGISTER', 'NIPPON KAIJI KYOKAI (NK)', 'BUREAU VERITAS (BV)', 'AMERICAN BUREAU OF SHIPPING (ABS)', 'REGISTRO ITALIANO NAVALE (RINA)', 'EXEMPTED', 'NONE', 'N/A', 'Foreign Flag', 'Unregistered',
    'ALPHA SHIP', 'ASIA SHIPPING CERTIFICATION SERVICES (ASCS)', 'DET NORSKE VERITAS and GERMANISCHER LLOYD (DNV GL)', "Lloyd's Register", 'DNV',
  ],
  seaCondition: ['Calm', 'Moderately Rough', 'Rough', 'Very Rough'],
  weatherCondition: ['Clear', 'Foggy', 'Cloudy', 'Stormy'],
  operationType: [],
  registrationStatus: [],
  // Examples/observed report types, not exhaustive approved enumerations.
  sourceType: ['Facebook Post', 'PCG Report', 'Marine Protest', 'Other'],
  documentType: ['Spot Report', 'MAIC Form 1A', 'MAIC Form 1B', 'MAIC Form 2', 'MAIC Form 3B', 'PCG Report', 'Marine Protest', 'Facebook Post', 'Safety Certificate', 'Seafarers Records Book (SRB)', 'Show Cause Order (SCO)', 'Decision/Order'],
  impactType: ['Damage to Ship', 'Damage to Pier', 'Loss of Ship', 'Loss of Life', 'Missing Person', 'Missing Passengers', 'Injured Persons', 'Severe Pollution'],
  damageType: ['Damage to Ship', 'Damage to Pier', 'Hull Failure', 'Electrical Failure', 'Steering Failure', 'Failure of Propulsion Machinery', 'Failure of Essential Auxiliary Machinery', 'Structural Failure'],
  powerUnit: ['hp', 'kW'],
  visibility: [],
  // Additional source-backed fields used by the report workbench.
  shipCondition: ['Fit', 'Unfit', 'Total Loss'],
  accidentLevel: ['Less Serious', 'Serious', 'Very Serious'],
  office: ['MRO-NCR', 'MRO 1', 'MRO 4', 'MRO 5', 'MRO 6', 'MRO 7', 'MRO 8', 'MRO 9', 'MRO 10', 'MRO 11', 'MRO 12', 'MRO 13'],
  crewFactor: ['Fatigue', 'Stress', 'Alcohol/illegal drug', 'Prescription medicine', 'Excessive workload', 'Communication', 'Standards of personnel competence', 'Lack of familiarity or training', 'Panic and fear', 'Boredom', 'Mental and emotional disorders', 'Hearing problem', 'Visual problem', 'Injuries and illness', 'Less than adequate medical fitness'],
})

export const SOURCE_REPORTING_MARKERS = freezeLists({
  shipType: ['Foreign Flag', 'Unregistered'],
  hullMaterial: ['Foreign Flag', 'Unregistered'],
  sizeClass: ['N/A', 'Foreign Flag', 'Unregistered'],
  classificationSociety: ['MARINA', 'EXEMPTED', 'NONE', 'N/A', 'Foreign Flag', 'Unregistered'],
  office: ['INTERNATIONAL', 'Foreign Flag', 'Unregistered', 'N/A', 'NONE'],
})

export const MARINA_OPTION_NOTES = Object.freeze({
  incidentType: '2024/2025 dropdowns plus MAIC checkbox choices and observed historical categories. Historical composite narratives remain source values; no automatic severity inference.',
  shipType: 'Foreign Flag and Unregistered are source reporting categories, not ship designs or service types. Historical subtypes are available for faithful capture.',
  hullMaterial: 'Foreign Flag and Unregistered are source reporting markers, not hull materials.',
  sizeClass: 'N/A, Foreign Flag and Unregistered are source reporting markers, not physical size classes. Do not derive a legal size class from GT alone.',
  classificationSociety: 'MARINA and applicability/registration markers are source reporting categories, not all classification societies. Historical society names are retained; this is not a current recognition list.',
  operationType: 'The MAIC form names Type of Operation but supplies no fixed choices. Use searchable reference-assisted free entry.',
  registrationStatus: 'The sources contain Unregistered/Foreign Flag markers but no complete registration-status enumeration. Use reference-assisted free entry.',
  sourceType: 'Examples printed on the spot report, not an exhaustive source enumeration.',
  documentType: 'Observed forms and action documents; Form 1A receipt is tracked, but no Form 1A template was supplied.',
  impactType: 'Observed MAIC outcomes; some source type checkboxes describe consequences. Capture impacts separately without inferring level.',
  damageType: 'Suggestions from MAIC ship/technical consequence checkboxes, not a separate official damage-code list.',
  visibility: 'No controlled visibility list is supplied. Retain reported distance or description; modelled suggestions remain attributed separately.',
  powerUnit: 'MAIC Horsepower/kW; hp is the displayed abbreviation for Horsepower. Preserve the entered power and unit.',
  office: 'Explicit source office choices. INTERNATIONAL, Foreign Flag, Unregistered, N/A and NONE are separate source reporting markers, not MRO offices. Combined MRO I-II summaries are not automatically recoded to source lookup MRO 1.',
  crewFactor: 'MAIC pp10–11 liveware factor checkboxes; evidence-supported findings, not assumptions about crew or an exhaustive behaviour list. Existing coded MAIC fields remain authoritative for form rendering.',
  cargoType: 'No controlled cargo-type list is supplied. Cargo causal checkboxes are factors, not cargo types. Use searchable reference-assisted free entry.',
})

const source = (controlled, references, note = '') => Object.freeze({ controlled, references: Object.freeze(references), note })
export const MARINA_FIELD_SOURCES = Object.freeze({
  incidentType: source(true, ['2024 DROPDOWN!B2:B19', '2025 DROPDOWN!D2:D16', 'MAIC pp3,9', '2018–2023 annual registers: type columns'], 'Explicit current lists plus historical observed categories; no closed historical enum.'),
  rigType: source(true, ['2025 DROPDOWN!B2:B17', '2024 INVENTORY LIST!B3:B283']),
  shipType: source(true, ['2024 DROPDOWN!P2:P19', '2025 DROPDOWN!R2:R14', '2018–2023 annual registers: service/type columns']),
  hullMaterial: source(true, ['2024 DROPDOWN!R2:R5', '2025 DROPDOWN!T2:T7', '2022!I3:I135']),
  sizeClass: source(true, ['2024 DROPDOWN!L2:L4', '2025 DROPDOWN!N2:N6']),
  classificationSociety: source(true, ['2024 DROPDOWN!N2:N15', '2025 DROPDOWN!P2:P15', '2023 MASTER LIST!T3:T211', '2026 PDF pp3–4']),
  seaCondition: source(true, ['MAIC p9: SEA CONDITION']),
  weatherCondition: source(true, ['MAIC p9: WEATHER CONDITION']),
  operationType: source(false, ['MAIC pp4,6: Type of Operation'], 'Field exists; no enumeration supplied.'),
  registrationStatus: source(false, ['2024/2025 DROPDOWN: Unregistered and Foreign Flag reporting markers'], 'No complete registration-status list supplied.'),
  sourceType: source(false, ['MAIC p1: Source of Information examples']),
  documentType: source(false, ['MAIC pp1–12', '2025 MAIC FORMS!C3:E3', '2025 MASTER LIST!X2:AI2']),
  impactType: source(false, ['MAIC pp3,9: types and consequences']),
  damageType: source(false, ['MAIC pp3,9–10: damage and technical failure checkboxes']),
  powerUnit: source(true, ['MAIC pp4,6: Horsepower/kW']),
  visibility: source(false, [], 'No controlled source list; retained SAFERSEAS observation field.'),
  shipCondition: source(true, ['MAIC pp3,9: Fit / Unfit / Total Loss']),
  accidentLevel: source(true, ['MAIC pp3,9', '2025 DROPDOWN!L2:L4']),
  office: source(true, ['2024 DROPDOWN!D2:D18 / F2:F18 / H2:H16', '2025 DROPDOWN!F2:F15 / H2:H17 / J2:J14 / AB2:AB13'], 'Office list excludes non-office reporting markers; combined summaries are documented separately.'),
  crewFactor: source(true, ['MAIC pp10–11: Liveware physiological / psychological / physical checkboxes']),
})

export const MARINA_SOURCE_ALIASES = Object.freeze({
  incidentType: Object.freeze({
    Agrounding: 'Grounding', Aground: 'Grounding', 'Ran Aground': 'Grounding', 'Running Aground': 'Grounding', 'Ship Grounding': 'Grounding', 'Vessel Agrounding': 'Grounding', Agrouding: 'Grounding', Allsion: 'Allision', 'Near Miss Collision': 'Near Miss Accidents', 'Fire Onboard': 'Fire', 'Fire On Board': 'Fire', Capsized: 'Capsizing', Capsize: 'Capsizing', Singking: 'Sinking', Sank: 'Sinking', Sunk: 'Sinking', Submerged: 'Submersion', Submerge: 'Submersion', 'Ship Submersion': 'Submersion', 'Half-Submerge': 'Partial Submersion', 'Half Submerged': 'Partial Submersion', 'Half Submerge': 'Partial Submersion', 'Half Submersion': 'Partial Submersion', 'Partial Submerging': 'Partial Submersion', 'Steering Problem': 'Steering Failure', 'Man over board': 'Man Overboard', 'Damage to Port and Structure': 'Damage to Pier', 'Damge to Ship or Equipment': 'Damage to Ship', 'Structural Damaged': 'Structural Damage', Damaged: 'Damage to Ship', 'Dragging': 'Anchor Dragging', 'Loss of  Ship': 'Loss of Ship', 'Total Loss of Ship': 'Loss of Ship', 'Loss of Life on Board': 'Loss of Life', Flooded: 'Flooding', 'Patially Damaged': 'Partially Damaged', 'ACCIDENT RELEASED OF ANCHOR': 'Accidental Release of Anchor', 'Propeller damage/Derangement': 'Propeller Damage', 'Propeller Shafting broke down': 'Propeller Shaft Failure', 'Cargo truck slippage incident onboard': 'Cargo Truck Slippage Onboard', 'Injuries with machineries/equipment tool': 'Injuries with Machinery/Equipment',
  }),
  rigType: Object.freeze({ FBCA: 'FBca', MBCA: 'MBca', MTKR: 'MTkr', MTUG: 'MTug', 'M/Y': 'MY', 'MV*': 'MV' }),
  shipType: Object.freeze({
    'Passenger roro': 'Passenger/RORO', 'Passenger RO-RO': 'Passenger/RORO', 'Passenger-roro': 'Passenger/RORO', 'Passenger Ship/RORO': 'Passenger/RORO', 'Ro-ro/ Pasenger': 'Passenger/RORO', 'RORO Passenger': 'Passenger/RORO', 'Passenger Cargo': 'Passenger/Cargo', 'Passenger Ship/ Cargo': 'Passenger/Cargo', 'Passenger/ Cargo Ship': 'Passenger/Cargo', 'Passenger-roro/ Cargo': 'Passenger/RORO/Cargo', 'PassengerRo-ro/ Cargo': 'Passenger/RORO/Cargo', 'RO-RO PASS/CARGO SHIP': 'Passenger/RORO/Cargo', 'Ro-ro Pasenger/ Cargo': 'Passenger/RORO/Cargo', 'Ro-ro Passenger/ Cargo': 'Passenger/RORO/Cargo', 'Roro Passenger/Cargo Ship': 'Passenger/RORO/Cargo', 'RORO/ Passenger-Cargo Ship': 'Passenger/RORO/Cargo', 'PASSENGER/RORO CARGO SHIP': 'Passenger/RORO/Cargo', 'Roro/ Cargo': 'Cargo/RORO', 'Roro Cargo': 'Cargo/RORO', 'Cargo (Ro-Ro)': 'Cargo/RORO', 'Cargo Ship': 'Cargo', 'Tugboat': 'Tug', 'Tug Boat': 'Tug', Tugs: 'Tug', 'Fishing Boat': 'Fishing', 'Fishing Vessel': 'Fishing', 'Fisshing Boat': 'Fishing', 'Passenger (Tourist)': 'Passenger (Tourist Boat)', 'Tourist Boat': 'Passenger (Tourist Boat)', 'Passenger (Tourist motorbanca)': 'Passenger (Tourist Boat)', 'Passenger (motorbanca)': 'Passenger Motorbanca', 'Passenger Motor Bangca': 'Passenger Motorbanca', 'Passenger Ship/Motorbanca': 'Passenger Motorbanca', 'Passenger MBANCA (WITH OUTRIGGERS)': 'Passenger Motorbanca (With Outriggers)', 'Fishing Banca': 'Fishing', 'Fishing MBCA': 'Fishing', 'Cargo Ship Deck Loading Barge': 'Deck Loading Barge', Pasenger: 'Passenger',
  }),
  hullMaterial: Object.freeze({ 'Fiber Glass': 'FRP', Fiberglass: 'FRP' }),
  sizeClass: Object.freeze({ 'Conventional Size': 'Conventional', 'Convenventional Size': 'Conventional', 'Non-Conventional Size': 'Non-Conventional', 'Non-Connventional Size': 'Non-Conventional', 'Non-Convenventional Size': 'Non-Conventional' }),
  classificationSociety: Object.freeze({ 'KOREAN REGISTER (KR)': 'KOREAN REGISTER', 'LLOYDS REGISTRY': "Lloyd's Register" }),
  powerUnit: Object.freeze({ Horsepower: 'hp', HP: 'hp', KW: 'kW' }),
  office: Object.freeze({ 'MRO NCR': 'MRO-NCR', 'MRO I': 'MRO 1', 'MRO IV': 'MRO 4', 'MRO V': 'MRO 5', 'MRO VI': 'MRO 6', 'MRO VII': 'MRO 7', 'MRO VIII': 'MRO 8', 'MRO IX': 'MRO 9', 'MRO X': 'MRO 10', 'MRO XI': 'MRO 11', 'MRO XII': 'MRO 12', 'MRO XIII': 'MRO 13' }),
})

const comparable = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

/** Fresh display options, retaining stored scalar/multi-select spelling verbatim. */
export function getMarinaOptions(key, currentValue) {
  const values = Array.isArray(currentValue) ? currentValue : [currentValue]
  return [...new Set([...(MARINA_OPTIONS[key] || []), ...values.filter(value => typeof value === 'string' && value.trim())])]
}

/** Opt-in comparison/grouping only. Never mutates the record or invents unknown mappings. */
export function canonicalMarinaValue(key, value) {
  if (typeof value !== 'string' || !value.trim()) return value
  const target = comparable(value)
  const alias = Object.entries(MARINA_SOURCE_ALIASES[key] || {}).find(([raw]) => comparable(raw) === target)
  if (alias) return alias[1]
  return [...(MARINA_OPTIONS[key] || []),...(SOURCE_REPORTING_MARKERS[key] || [])].find(option => comparable(option) === target) ?? value
}
