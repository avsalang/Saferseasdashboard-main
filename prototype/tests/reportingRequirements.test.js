import test from 'node:test'
import assert from 'node:assert/strict'
import {assessRequirements,incidentRequirements,assessIncident,assessOutput,describeReportingExceptions,reportingAssessmentMetadata} from '../src/data/reportingRequirements.js'
import {blankEvent} from '../src/data/seed.js'
test('a required zero is complete; untouched unknowns and blank explanations are incomplete',()=>{
 const definitions=[{key:'fatalities',label:'Fatalities',value:0},{key:'missing',label:'Missing Persons',value:null}]
 assert.equal(assessRequirements(definitions,{}).unresolved.length,1)
 assert.equal(assessRequirements(definitions,{missing:{status:'unknown',reason:' '}}).ready,false)
 const result=assessRequirements(definitions,{missing:{status:'unknown',reason:'Awaiting the master’s verified count.'}})
 assert.equal(result.ready,true);assert.equal(result.explained.length,1)
})
test('hard requirements and inapplicable exceptions cannot be bypassed',()=>{
 const defs=[{key:'name',label:'Name of Ship/Vessel',value:'',allowException:false},{key:'date',label:'Date of Incident / Accident',value:'',allowNotApplicable:false}]
 const result=assessRequirements(defs,{name:{status:'unknown',reason:'Not known'},date:{status:'not_applicable',reason:'No date'}})
 assert.equal(result.unresolved.length,2)
})
test('canonical unknown and not-applicable placeholders never count as concrete facts',()=>{
 for(const value of ['Not Applicable','Unknown / not supplied','Not recorded','N/A','unknown','—'])assert.equal(assessRequirements([{key:'name',label:'Name of Ship/Vessel',value,allowException:false}],{}).ready,false,value)
 assert.equal(assessRequirements([{key:'summary',label:'Narrative',value:'The position is unknown because the master has not supplied a fix.'}],{}).ready,true)
})
test('event charts, involvement matrices and overseas registers use only their own populations',()=>{
 const event={...blankEvent(),date:'2026-11-06',type:'Collision',place:'Fictional domestic harbor',vessels:[{id:'v',name:'Fictional Ship',type:'Unknown'}]}
 assert.equal(assessOutput('O02',[event]).ready,true)
 assert.equal(assessOutput('O21',[event]).ready,true)
 assert.equal(assessOutput('O05',[event]).ready,false)
 event.type='Unknown';event.vessels[0].type='Cargo';assert.equal(assessOutput('O05',[event]).ready,true)
 assert.equal(assessOutput('O19',[event]).items.length,0)
})
test('initial submission needs source-based dimensions, not a completed final investigation',()=>{
 const event=blankEvent(),requirements=incidentRequirements(event)
 assert.ok(requirements.some(r=>r.key==='seriousness'))
 assert.ok(requirements.some(r=>r.key==='aor'))
 assert.ok(requirements.some(r=>r.key.includes('grossTonnage')))
 assert.ok(requirements.some(r=>r.key==='consequences.fatalities'))
 assert.ok(!requirements.some(r=>r.key==='analysis'))
 assert.equal(assessIncident(event).ready,false)
})
test('unknown time and coordinate flags require an explicit explanation',()=>{
 const event=blankEvent();event.timeUnknown=true;event.positionQuality='unknown';event.lat=13;event.lon=121
 const assessment=assessIncident(event)
 assert.ok(assessment.unresolved.some(r=>r.key==='time'))
 assert.ok(assessment.unresolved.some(r=>r.key==='position'))
})
test('vessel exception keys survive reordering and cannot transfer after removal',()=>{
 const event=blankEvent();event.vessels=[{id:'v-a',name:'A',grossTonnage:null},{id:'v-b',name:'B',grossTonnage:null}]
 const key=incidentRequirements(event).find(r=>r.vesselKey==='v-a'&&r.field==='grossTonnage').key
 event.reportingExceptions={[key]:{status:'unknown',reason:'Certificate for A not yet received.'}}
 event.vessels.reverse();assert.equal(assessIncident(event).items.find(r=>r.key===key).status,'explained')
 event.vessels=event.vessels.filter(v=>v.id!=='v-a');assert.ok(!assessIncident(event).items.some(r=>r.key===key))
})
test('output completeness uses the dimensions of that output and preserves explanations',()=>{
 const event={...blankEvent(),id:'e',date:'2026-11-06',dateUnknown:false,type:'Grounding',seriousness:'serious',aor:'MRO-IV',vessels:[{id:'v',name:'Fictional Ship',type:'Cargo',grossTonnage:null}]}
 assert.equal(assessOutput('O02',[event],{}).ready,true)
 assert.equal(assessOutput('O12',[event],{}).ready,false)
 assert.equal(assessOutput('O20',[event],{}).ready,false)
 event.reportingExceptions={position:{status:'unknown',reason:'Position is awaiting verification.'}}
 assert.match(describeReportingExceptions(event),/Position is awaiting verification/)
 assert.equal(assessOutput('O20',[event],{}).ready,true)
 assert.equal(assessOutput('O02',[],{}).ready,true)
})
test('export metadata marks working copies and stops repeating superseded unknown explanations',()=>{
 const event={...blankEvent(),aor:''};event.reportingExceptions={aor:{status:'unknown',reason:'Office verification pending.'}}
 assert.match(describeReportingExceptions(event),/Office verification pending/)
 event.aor='MRO-IV';assert.doesNotMatch(describeReportingExceptions(event),/Office verification pending/)
 const metadata=reportingAssessmentMetadata(assessRequirements([{key:'aor',label:'Area of Responsibility',value:null}],{}))
 assert.equal(metadata['Reporting Completeness'],'INCOMPLETE WORKING COPY')
 assert.equal(metadata['Unresolved Required Fields'],1)
})

test('source N/A size classification accepts a reasoned not-applicable declaration',()=>{
 const event={...blankEvent(),vessels:[{id:'v',name:'Fictional Ship',sizeClass:'N/A'}],reportingExceptions:{'vessel:v:sizeClass':{status:'not_applicable',reason:'Source lists size classification as N/A.'}}}
 const size=assessIncident(event).items.find(item=>item.key==='vessel:v:sizeClass')
 assert.equal(size.status,'explained');assert.equal(event.vessels[0].sizeClass,'N/A')
})
test('case office requirement falls back to known homeport for no applicable CPC',()=>{
 for(const cpc of ['N/A','NONE']){const event={...blankEvent(),cpc,homeport:'MRO-IV'};assert.equal(assessIncident(event,{hasCases:true}).items.find(item=>item.key==='caseOffice').value,'MRO-IV')}
 for(const cpc of ['Foreign Flag','Unregistered']){const event={...blankEvent(),cpc,homeport:'MRO-IV'};assert.equal(assessIncident(event,{hasCases:true}).items.find(item=>item.key==='caseOffice').value,cpc)}
})
