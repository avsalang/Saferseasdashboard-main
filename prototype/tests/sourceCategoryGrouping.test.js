import test from 'node:test'
import assert from 'node:assert/strict'
import {canAccess, filterEvents, summarizeEvents} from '../src/data/domain.js'
import {buildOutput} from '../src/data/catalogue.js'

const state = {cases: [], reports: [], imports: []}
const vessel = (id, overrides = {}) => ({id, name: `Fixture ${id}`, type: 'Passenger / RORO', hull: 'WOOD', sizeClass: 'Non-conventional', classificationSociety: 'PHILIPPINE REGISTER OF SHIPPING, INC', homeport: 'MRO-IV', ...overrides})
const events = [
  {id: 'a', ref: 'a', date: '2026-01-01', type: 'Engine trouble', aor: 'MRO-IV', homeport: 'MRO-IV', cpc: 'MRO-IV', issuingOffice: 'MRO-IV', vessels: [vessel('a1'), vessel('a2', {type: 'Passenger/RORO'})], consequences: {fatalities: 1, missing: null}},
  {id: 'b', ref: 'b', date: '2026-01-02', type: 'Engine Trouble', aor: 'MRO 4', homeport: 'MRO4', cpc: 'MRO 4', issuingOffice: 'MRO4', vessels: [vessel('b1', {type: 'PASSENGER/RORO', hull: 'Wood', sizeClass: 'NON-CONVENTIONAL', classificationSociety: 'PHILIPPINE REGISTER OF SHIPPING, INC.', homeport: 'MRO 4'})], consequences: {fatalities: null, missing: 0}},
]
const untouched = JSON.stringify(events)

test('office scope accepts recognized source aliases without broadening to unknown or combined offices', () => {
  const user = {id: 'regional-reviewer', role: 'reviewer', status: 'active', scope: 'office', officeId: 'MRO-IV'}
  const record = {id: 'scope-record', officeId: 'MRO-V', aor: 'MRO-V'}
  const before = JSON.stringify({user, record})
  for (const alias of ['MRO 4', 'MRO IV', 'MRO-IV']) {
    assert.equal(canAccess(user, 'review', {...record, officeId: alias}), true, `officeId ${alias}`)
    assert.equal(canAccess(user, 'review', {...record, aor: alias}), true, `AOR ${alias}`)
  }
  for (const unrelated of ['MRO 004', 'MRO IV extension', 'MRO I-II', 'MRO 1', 'MRO-V', '', undefined]) {
    assert.equal(canAccess(user, 'review', {...record, officeId: unrelated, aor: unrelated}), false, String(unrelated))
  }
  assert.equal(canAccess({...user, officeId: 'MRO-I'}, 'review', {...record, officeId: 'MRO-I-II', aor: 'MRO I & II'}), false)
  assert.equal(canAccess({...user, status: 'suspended'}, 'review', {...record, aor: 'MRO 4'}), false)
  assert.equal(canAccess({...user, scope: 'own'}, 'review', {...record, aor: 'MRO 4', ownerId: 'someone-else'}), false)
  assert.equal(JSON.stringify({user, record}), before)
})

test('source aliases filter consistently while combined offices and engine categories remain distinct', () => {
  const distinct = {...events[0], id: 'c', type: 'Engine Failure', aor: 'MRO I-II'}
  const records = [...events, distinct]
  assert.equal(filterEvents(records, {type: 'ENGINE TROUBLE'}).length, 2)
  assert.equal(filterEvents(records, {type: 'Engine Failure'}).length, 1)
  assert.equal(filterEvents(events, {vesselType: 'Passenger/RORO'}).length, 2)
  for (const key of ['aor', 'homeport', 'cpc', 'issuingOffice']) assert.equal(filterEvents(events, {[key]: 'MRO 4'}).length, 2, key)
  assert.equal(filterEvents(records, {aor: 'MRO 1'}).length, 0)
  assert.equal(filterEvents(records, {aor: 'MRO I-II'}).length, 1)
  assert.deepEqual(summarizeEvents(records).byType, [{name: 'Engine Trouble', count: 2}, {name: 'Engine Failure', count: 1}])
})

test('monthly matrices group recognized aliases at their existing event and involvement grains', () => {
  assert.deepEqual(buildOutput('O02', events, state).map(row => [row.Category, row.Total]), [['Engine / mechanical', 2]])
  for (const output of ['O03', 'O04']) assert.deepEqual(buildOutput(output, events, state).map(row => [row.Category, row.Total]), [['MRO 4', output === 'O03' ? 2 : 3]])
  assert.deepEqual(buildOutput('O05', events, state).map(row => [row.Category, row.Total]), [['Passenger/RORO', 3]])
  const physical = buildOutput('O07', events, state)
  assert.deepEqual(physical.map(row => [row.Dimension, row.Category, row.Total]), [['hull', 'Wood', 3], ['sizeClass', 'Non-Conventional', 3], ['classificationSociety', 'PHILIPPINE REGISTER OF SHIPPING, INC.', 3]])
  const extra = {...events[0], id: 'c', type: 'Engine Failure', dateUnknown: true}
  const typeRows = buildOutput('O02', [...events, extra], state)
  assert.equal(typeRows.find(row => row.Category === 'Engine Failure')['Unknown date'], 1)
  assert.equal(typeRows.reduce((sum, row) => sum + row.Total, 0), 3)
})

test('consequence and cross-year service groups recognize aliases without multiplying people', () => {
  const consequences = buildOutput('O11', events, state)
  assert.equal(consequences.length, 1)
  assert.equal(consequences[0]['Vessel type group'], 'Passenger/RORO')
  assert.equal(consequences[0].Events, 2)
  assert.equal(consequences[0].Fatalities, 1)
  assert.equal(consequences[0]['Fatalities unknown events'], 1)
  assert.equal(consequences[0].Missing, 0)
  assert.equal(consequences[0]['Missing unknown events'], 1)
  const comparison = buildOutput('O14', events, state)
  assert.deepEqual(comparison.filter(row => row.Dimension === 'type').map(row => [row.Category, row.Count]), [['Engine / mechanical', 2]])
  assert.deepEqual(comparison.filter(row => row.Dimension === 'Vessel service').map(row => [row.Category, row.Count]), [['Passenger/RORO', 3]])
  assert.deepEqual(comparison.filter(row => row.Dimension === 'aor').map(row => [row.Category, row.Count]), [['MRO 4', 2]])
})

test('raw annual exports, issued report fields, unknowns and input records stay unchanged', () => {
  const raw = buildOutput('O01', events, state)
  assert.equal(raw[0]['TYPE OF INCIDENT / ACCIDENT'], 'Engine trouble')
  assert.equal(raw[0]['TYPE OF SHIP/VESSEL'], 'Passenger / RORO')
  assert.equal(raw[0].HULL, 'WOOD')
  assert.equal(raw[0].AOR, 'MRO-IV')
  const issued = {eventId: 'a', type: '1B', revision: 1, status: 'issued', fields: {incidentTypes: 'ENGINE TROUBLE', homeport: 'MRO-IV'}}
  assert.equal(buildOutput('O16', events, {...state, reports: [issued]})[0].incidentTypes, 'ENGINE TROUBLE')
  const unknown = {...events[0], type: null, aor: null, vessels: [vessel('unknown', {type: '', hull: null})]}
  assert.equal(buildOutput('O02', [unknown], state)[0].Category, 'Unknown')
  assert.equal(buildOutput('O05', [unknown], state)[0].Category, 'Unknown')
  const unrecognized = {...events[0], type: 'Historical unclassified wording'}
  assert.equal(buildOutput('O02', [unrecognized], state)[0].Category, unrecognized.type)
  assert.equal(JSON.stringify(events), untouched)
})

test('case summaries use canonical effective offices while preserving meaningful source markers', () => {
  const records = [
    {...events[0], cpc: 'N/A'}, {...events[1], cpc: 'NONE'},
    {...events[0], id: 'combined', cpc: 'MRO I-II'},
    {...events[0], id: 'foreign', cpc: 'FOREIGN FLAG'},
    {...events[0], id: 'unregistered', cpc: 'Unregistered'},
  ]
  const cases = records.map((event, index) => ({id: `case-${index}`, eventId: event.id, vesselId: `ship-${index}`, status: 'ongoing_sco', actions: [{type: 'Show Cause Order', officeId: index === 1 ? 'MRO4' : 'MRO-IV'}]}))
  const before = JSON.stringify({records, cases})
  const rows = buildOutput('O09', records, {...state, cases})
  assert.deepEqual(rows.map(row => [row.Attribution, row.Cases]), [['MRO 4', 2], ['MRO I-II', 1], ['Foreign Flag', 1], ['Unregistered', 1]])
  assert.equal(rows[0]['Ships involved'], 2)
  assert.equal(rows[0]['Issued SCO'], 2)
  assert.equal(rows[0]['Actual issuing offices'], 'MRO 4')
  assert.equal(rows.reduce((sum, row) => sum + row.Cases, 0), cases.length)
  assert.equal(JSON.stringify({records, cases}), before)
})

test('AOR involvement and receipt summaries group office aliases without changing revisions or unknown dates', () => {
  const reports = [
    {eventId: 'a', type: '1B', revision: 1, officeId: 'MRO-IV', receivedDate: '2026-01-03', fields: {homeport: 'MRO-IV'}},
    {eventId: 'a', type: '2', revision: 2, officeId: 'MRO4', receivedDate: '2026-01-04'},
    {eventId: 'b', type: '2', revision: 3, officeId: 'MRO 4', receivedDate: ''},
    {eventId: 'b', type: '1B', revision: 1, officeId: 'MRO I-II', receivedDate: '2026-01-04'},
  ]
  const before = JSON.stringify(reports)
  const aor = buildOutput('O12', events, state).filter(row => row.Dimension === 'AOR')
  assert.equal(aor.length, 1)
  assert.equal(aor[0].Category, 'MRO 4')
  assert.equal(aor[0].Total, 3)
  const receipts = buildOutput('O13', events, {...state, reports})
  assert.equal(receipts.length, 2)
  const region = receipts.find(row => row.Office === 'MRO 4')
  assert.equal(region['Form 1B'], 1)
  assert.equal(region['Form 2'], 1)
  assert.equal(region['Receipt date unknown / not recorded'], 1)
  assert.equal(receipts.find(row => row.Office === 'MRO I-II')['Form 1B'], 1)
  assert.equal(buildOutput('O16', events, {...state, reports})[0].homeport, 'MRO-IV')
  assert.equal(JSON.stringify(reports), before)
  assert.equal(JSON.stringify(events), untouched)
})
