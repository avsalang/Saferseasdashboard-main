import test from 'node:test'
import assert from 'node:assert/strict'

const vocabulary = await import('../src/data/marinaVocabulary.js').catch(() => null)

test('source catalogue supplies the modern workbook and MAIC-only incident choices', () => {
  assert.ok(vocabulary, 'MARINA vocabulary module must be available')
  for (const value of ['Grounding', 'Hull Failure', 'Engine Trouble', 'Mechanical Failure', 'Steering Failure', 'Listing', 'Capsizing', 'Flooding', 'Sinking', 'Collision', 'Allision', 'Fire', 'Explosion', 'Man Overboard', 'Occupational Accident', 'Ramming', 'Near Miss Accidents', 'Damage to Pier', 'Electrical Failure', 'Drifting']) {
    assert.ok(vocabulary.MARINA_OPTIONS.incidentType.includes(value), `Missing source choice: ${value}`)
  }
  assert.deepEqual(vocabulary.MARINA_OPTIONS.seaCondition, ['Calm', 'Moderately Rough', 'Rough', 'Very Rough'])
  assert.deepEqual(vocabulary.MARINA_OPTIONS.weatherCondition, ['Clear', 'Foggy', 'Cloudy', 'Stormy'])
})

test('uncontrolled particulars remain open and every supplied category is a unique string list', () => {
  assert.ok(vocabulary)
  for (const key of ['incidentType', 'rigType', 'shipType', 'hullMaterial', 'sizeClass', 'classificationSociety', 'seaCondition', 'weatherCondition', 'operationType', 'registrationStatus', 'sourceType', 'documentType', 'impactType', 'damageType', 'powerUnit', 'visibility']) {
    const options = vocabulary.MARINA_OPTIONS[key]
    assert.ok(Array.isArray(options), key)
    assert.ok(options.every(value => typeof value === 'string' && value.trim()), key)
    assert.equal(new Set(options).size, options.length, key)
  }
  for (const key of ['operationType', 'registrationStatus', 'visibility']) assert.deepEqual(vocabulary.MARINA_OPTIONS[key], [])
  assert.ok(vocabulary.MARINA_OPTIONS.shipType.includes('Passenger (Tourist Boat)'))
  assert.ok(vocabulary.MARINA_OPTIONS.classificationSociety.includes('ASIA SHIPPING CERTIFICATION SERVICES (ASCS)'))
})

test('legacy values survive verbatim without changing source options or alias recoding', () => {
  assert.ok(vocabulary)
  const before = [...vocabulary.MARINA_OPTIONS.shipType]
  const legacy = ['PASSENGER-RORO/CARGO', 'Passenger (existing spelling)', 'PASSENGER-RORO/CARGO', null, '']
  const options = vocabulary.getMarinaOptions('shipType', legacy)
  assert.ok(options.includes('PASSENGER-RORO/CARGO'))
  assert.ok(options.includes('Passenger (existing spelling)'))
  assert.equal(options.filter(value => value === 'PASSENGER-RORO/CARGO').length, 1)
  options.push('caller-only value')
  assert.deepEqual(vocabulary.MARINA_OPTIONS.shipType, before)
  assert.deepEqual(vocabulary.getMarinaOptions('operationType', 'International'), ['International'])
  assert.deepEqual(vocabulary.getMarinaOptions('notConfigured', ['Legacy category']), ['Legacy category'])
})

test('provenance separates explicit lists, observed labels, aliases and unsupported lists', () => {
  assert.ok(vocabulary)
  assert.equal(vocabulary.MARINA_FIELD_SOURCES.operationType.controlled, false)
  assert.equal(vocabulary.MARINA_FIELD_SOURCES.seaCondition.controlled, true)
  assert.equal(vocabulary.MARINA_SOURCE_ALIASES.sizeClass['Convenventional Size'], 'Conventional')
  assert.equal(vocabulary.MARINA_SOURCE_ALIASES.incidentType.Agrounding, 'Grounding')
  assert.ok(vocabulary.MARINA_OPTIONS.shipCondition.includes('Total Loss'))
})

test('analysis can normalize explicit source aliases without rewriting unknown or stored values', () => {
  assert.ok(vocabulary)
  assert.equal(vocabulary.canonicalMarinaValue('incidentType', 'ENGINE TROUBLE'), 'Engine Trouble')
  assert.equal(vocabulary.canonicalMarinaValue('incidentType', 'Agrounding'), 'Grounding')
  assert.equal(vocabulary.canonicalMarinaValue('incidentType', 'ENGINE FAILURE'), 'Engine Failure')
  assert.equal(vocabulary.canonicalMarinaValue('incidentType', 'GIRTHING/SINKING'), 'GIRTHING/SINKING')
  assert.equal(vocabulary.canonicalMarinaValue('incidentType', 'Totally damaged'), 'Totally Damaged')
  assert.equal(vocabulary.canonicalMarinaValue('shipType', 'Passenger-RORO'), 'Passenger/RORO')
  assert.equal(vocabulary.canonicalMarinaValue('classificationSociety', 'PHILIPPINE REGISTER OF SHIPPING, INC'), 'PHILIPPINE REGISTER OF SHIPPING, INC.')
  assert.equal(vocabulary.canonicalMarinaValue('shipType', 'Undocumented historical type'), 'Undocumented historical type')
  assert.equal(vocabulary.canonicalMarinaValue('sizeClass', null), null)
  assert.ok(vocabulary.SOURCE_REPORTING_MARKERS.hullMaterial.includes('Foreign Flag'))
  assert.match(vocabulary.MARINA_OPTION_NOTES.hullMaterial, /not.*material/i)
})

test('office and crew references come from explicit lists without inventing cargo or combined-office equivalence', () => {
  assert.ok(vocabulary)
  assert.deepEqual(vocabulary.MARINA_OPTIONS.office, ['MRO-NCR', 'MRO 1', 'MRO 4', 'MRO 5', 'MRO 6', 'MRO 7', 'MRO 8', 'MRO 9', 'MRO 10', 'MRO 11', 'MRO 12', 'MRO 13'])
  assert.equal(vocabulary.canonicalMarinaValue('office', 'MRO IV'), 'MRO 4')
  assert.equal(vocabulary.canonicalMarinaValue('office', 'MRO4'), 'MRO 4')
  assert.equal(vocabulary.canonicalMarinaValue('office', 'MRO I-II'), 'MRO I-II')
  assert.ok(vocabulary.MARINA_OPTIONS.crewFactor.includes('Fatigue'))
  assert.ok(vocabulary.MARINA_OPTIONS.crewFactor.includes('Lack of familiarity or training'))
  assert.equal(vocabulary.MARINA_OPTIONS.cargoType, undefined)
  assert.equal(vocabulary.MARINA_FIELD_SOURCES.sourceType.controlled, false)
  assert.equal(vocabulary.MARINA_FIELD_SOURCES.documentType.controlled, false)
})
