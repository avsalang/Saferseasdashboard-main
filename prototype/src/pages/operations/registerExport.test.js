import test from 'node:test'
import assert from 'node:assert/strict'
import { createIncidentSnapshot } from './registerExport.js'

const sample = () => ({ id:'event-demo',ref:'DEMO-001',date:'2026-01-02',dateUnknown:true,time:'12:30',timeUnknown:true,type:'Collision',seriousness:'serious',status:'submitted',aor:'MRO-IV',homeport:'MRO-NCR',cpc:'MRO-VII',issuingOffice:'MRO-IV',place:'Fictional waters',vessels:[{id:'v1',name:'Example Alpha'},{id:'v2',name:'Example Beta'}],consequences:{fatalities:0,missing:null,injured:2,rescued:null} })

test('incident CSV snapshot is complete for history redownload and preserves counting/unknown precision', () => {
  const snapshot = createIncidentSnapshot([sample()], {year:'2026'}, {review:true,asOf:'2026-11-06'})
  assert.equal(snapshot.rows.length,1)
  assert.equal(snapshot.events.length,1)
  assert.ok(snapshot.sections.every(s => typeof s.title==='string' && typeof s.content==='string'))
  assert.equal(snapshot.metadata['As of'],'2026-11-06')
  assert.equal(snapshot.metadata['Selected events'],1)
  assert.equal(snapshot.metadata['Vessel involvements'],2)
  assert.equal(snapshot.metadata['Queue filter'],'Review queue')
  assert.equal(snapshot.rows[0].Vessels,2)
  assert.equal(snapshot.rows[0].Fatalities,0)
  assert.equal(snapshot.rows[0].Missing,'Unknown')
  assert.equal(snapshot.rows[0].Date,'Unknown')
  assert.equal(snapshot.rows[0].Time,'Unknown')
  assert.equal(snapshot.rows[0].Injured,2)
  assert.equal(snapshot.rows[0].Homeport,'MRO-NCR')
  assert.equal(snapshot.rows[0].CPC,'MRO-VII')
})

test('later incident or selection edits cannot alter retained rows, events or metadata', () => {
  const event=sample(),selection={year:'2026',aor:'MRO-IV'}
  const snapshot=createIncidentSnapshot([event],selection)
  event.consequences.fatalities=8
  event.vessels[0].name='Changed later'
  event.vessels.push({id:'v3'})
  selection.aor='MRO-NCR'
  assert.equal(snapshot.rows[0].Fatalities,0)
  assert.equal(snapshot.rows[0].Vessels,2)
  assert.equal(snapshot.events[0].consequences.fatalities,0)
  assert.equal(snapshot.events[0].vessels[0].name,'Example Alpha')
  assert.equal(snapshot.events[0].vessels.length,2)
  assert.equal(JSON.parse(snapshot.metadata.Selection).aor,'MRO-IV')
})

test('an empty selection retains a downloadable zero-row artifact', () => {
  const snapshot=createIncidentSnapshot([],{search:'no matching record'})
  assert.deepEqual(snapshot.rows,[])
  assert.deepEqual(snapshot.events,[])
  assert.equal(snapshot.metadata['Selected events'],0)
  assert.equal(snapshot.metadata['Vessel involvements'],0)
})
