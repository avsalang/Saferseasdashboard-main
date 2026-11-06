# Existing SAFERSEAS incident form: MARINA additions

The existing SAFERSEAS digital form is the baseline. MAIC forms define information and document requirements; they do not prescribe the intake screen layout. This decision supersedes the earlier five-step simplification. Preserve the original typography, cards, controls, seven sections and assistance features when implementing in the production reporter frontend.

| Existing section | Retain | Modify / add for MARINA |
|---|---|---|
| Time & Location | Date/time, incident types, coordinates, map picker, region/province/nearest ports | Independent unknown date/time, position quality, multiple event types, separate seriousness and impacts; AOR, homeport, CPC and actual issuing office are separate office relationships |
| Vessel & Operator | Identity, technical particulars, owner/operator, propulsion | Multiple vessel snapshots and involvement roles; textual official/IMO numbers, exact decimal GT; registry/homeport place distinct from office, NT/DWT, build place, hull/size/classification, engine make/count/power unit, master/licence |
| Voyage & Cargo | Origin, destination, intended route, cargo, persons aboard; wave height, Beaufort wind, visibility and weather lookup | Cargo quantity/unit per vessel; unknown counts distinct from confirmed zero; sea/weather observations, current/tide and source; model suggestions and lookup provenance distinct from observations |
| Narrative & Timeline | Factual account, key events timeline, crew response/factors and potential causes | Immediate actions, rescue/recovery/salvage; identify potential causes as preliminary, retaining evidence limitations |
| Findings & Outcomes | Findings, damage categories, fatalities/injuries and recommendations | Missing/rescued counts, ship condition, pollution/substance description, consequence observation date/time and source; certificate/survey/inspection information |
| Attachments | Document references, file selection, document notes | Reporting authority, source type/reference/received date and reliability/limitations; evidence remains linked across corrections |
| Review & Submit | Review and accountable submission | Review added fields; keep earlier report revisions and history on correction/resubmission |

Full progress and final investigation content remains in the existing investigation workspace: repeated Form 2 observations, SCO and certificate/SRB actions, consequence allocations, coded Form 3B factors, analysis, conclusions, lessons, recommendations and formal preparer/noted-by signoffs. All three account types retain their overlapping operational functions. Initial submission does not require a completed final investigation.

## Data contract

New incident properties are additive: `region`, `province`, `nearestPorts`, `timeline`, `crewResponse`, `crewFactors[]`, `potentialCauses`, `findingsOfCause`, `damageTypes[]`, `rescueRecovery`, `certificates`, `reportingAuthority`, `sourceNotes`, `documentNotes`, `environment`; consequence metadata adds `consequences.observedAt`. New vessel properties: `portOfRegistry`, `homeportPlace`, `propulsionType`. Existing stored incidents remain editable; missing optional values render as not supplied.

`environment` retains editable observations (`waveHeightM`, `windForce`, `visibility`, `weatherDescription`, `seaState`, `currentTide`, `source`, `observedAt`) separately from `lookup`, the saved model suggestion and provenance. A confirmed calm/zero value is not unknown. Unknown or invalid occurrence date/time/position must never trigger a lookup using a substituted present time or default map centre. An unlocated event remains unlocated until the user applies a position.

Use an explicit lookup and explicit application of suggestions; keep existing manual entries. If the date/time/position changes while a request is pending, discard its result. `fieldSources` retains per-value model provenance even after later lookups; manual edits clear that value’s model attribution. Weather API failure must leave the manually editable form usable. API-derived values describe modelled context and do not establish the observed incident conditions. No automatic finding of causation or MRO jurisdiction follows from weather or map position.

For implementation, retain a licensed weather-provider integration with explicit units, event timezone, source request location/time, provider timestamps and returned model grid context. The mockup explicitly asks for occurrence date/time in Philippine time (UTC+08:00), including conversion of overseas occurrences, with original local time retained in source notes. Add selectable incident timezone capture in production to avoid manual conversion. Provider availability can differ by date and variable. Official references: [forecast](https://open-meteo.com/en/docs), [historical forecasts](https://open-meteo.com/en/docs/historical-forecast-api), [marine data](https://open-meteo.com/en/docs/marine-weather-api). Keep unavailable fields unknown. Confirm provider terms and deployment configuration when connecting production services.

Reports prefill from the incident without overwriting explicit saved report values. Potential causes remain preliminary. Model context keeps its provenance. Supplemental master-list columns preserve the established columns. Existing issued reports and saved output snapshots remain immutable.

## Prototype boundaries

This is a browser-local handoff mockup. File contents are not uploaded, source documents are not issued officially, and sign-in/account delivery is simulated. Location text is editable; production locality/port catalogues and reverse-geocoding integration require their existing backend endpoints. Category choices must use the production controlled reference values and MAIC codes rather than treating demonstration labels as a newly approved taxonomy.

## Desktop references

- [Seven-section incident form](screenshots/incident-form.png)
- [Coordinate map picker](screenshots/incident-map-picker.png)
- [Weather assistance and source separation](screenshots/incident-weather.png)

The picker uses the standard OpenStreetMap tile URL with visible attribution. The original CARTO URL returned API-key placeholder tiles during visual QA and was replaced. Production should configure its map provider and comply with its service terms; see the [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).
