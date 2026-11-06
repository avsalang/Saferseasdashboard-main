import test from 'node:test'
import assert from 'node:assert/strict'
import {MARINA_OFFICES,ensureMarinaOffices,marinaOfficeOptions} from '../src/data/marinaOffices.js'
test('source offices are selectable without equating MRO 1 to the legacy I-II summary group',()=>{
 const state={offices:[{id:'MRO-I-II',code:'MRO I-II',active:true}],events:[{aor:'MRO-I-II'}]}
 ensureMarinaOffices(state)
 assert.equal(MARINA_OFFICES.length,12);assert.ok(marinaOfficeOptions(state.offices).some(item=>item.value==='MRO-I'&&item.label==='MRO 1'))
 assert.equal(marinaOfficeOptions(state.offices).some(item=>item.value==='MRO-I-II'),false)
 assert.equal(marinaOfficeOptions(state.offices,'MRO-I-II').some(item=>item.value==='MRO-I-II'),true)
 assert.equal(state.events[0].aor,'MRO-I-II')
})
test('only the matching source office role receives its non-office reporting categories',()=>{
 assert.ok(marinaOfficeOptions(MARINA_OFFICES,[],'aor').some(item=>item.value==='INTERNATIONAL'))
 assert.ok(!marinaOfficeOptions(MARINA_OFFICES,[],'issuingOffice').some(item=>item.value==='INTERNATIONAL'))
 assert.ok(marinaOfficeOptions(MARINA_OFFICES,[],'cpc').some(item=>item.value==='NONE'))
 assert.ok(!marinaOfficeOptions(MARINA_OFFICES,[],'homeport').some(item=>item.value==='NONE'))
})
