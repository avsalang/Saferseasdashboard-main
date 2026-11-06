import test from 'node:test'
import assert from 'node:assert/strict'
import {assessIncident} from '../src/data/reportingRequirements.js'
globalThis.localStorage={getItem:()=>null,setItem:()=>{}}
const {useDemo}=await import('../src/stores/demo.js')
const store=useDemo()
const initial=()=>({...store.newEvent(),date:'2026-11-06',type:'Grounding',place:'Fictional test anchorage',summary:'A fictional factual account.',vessels:[{...store.newEvent().vessels[0],name:'MV Fictional Test'}]})
test('submission is atomic and rejects missing output-critical dimensions while draft remains saveable',()=>{
 store.reset();store.signIn('u-reporter');const event=initial(),before=store.state.events.length
 assert.throws(()=>store.saveEvent(event,{submit:true}),/required|reporting/i)
 assert.equal(store.state.events.length,before)
 assert.equal(store.saveEvent(event).status,'draft')
})
test('explicit, reasoned unknowns permit early submission and survive the spot snapshot',()=>{
 store.reset();store.signIn('u-reporter');const event=initial();event.reportingExceptions={}
 for(const item of assessIncident(event).unresolved){assert.notEqual(item.allowException,false);event.reportingExceptions[item.key]={status:'unknown',reason:'Awaiting verified information from the reporting authority.'}}
 const saved=store.saveEvent(event,{submit:true});assert.equal(saved.status,'submitted')
 const spot=store.state.reports.find(r=>r.eventId===saved.id)
 assert.equal(spot.fields.reportingExceptions.aor.reason,event.reportingExceptions.aor.reason)
 assert.equal(saved.consequences.fatalities,null)
})
test('validation needs additional report information and remains unchanged when requirements fail',()=>{
 store.reset();store.signIn('u-reviewer');const event=store.getEvent('e-004')
 event.status='under_review';assert.throws(()=>store.transition(event.id,'validated'),/required|reporting/i)
 assert.equal(store.getEvent(event.id).status,'under_review')
})
test('recording receipt after issue changes only receipt metadata and preserves the issued content',()=>{
 store.reset();store.signIn('u-investigator');const report=store.state.reports.find(r=>r.status==='issued'),before=JSON.parse(JSON.stringify(report))
 assert.throws(()=>store.recordReportReceipt(report.id,{receivedDate:'bad date',sourceRef:'Fictional transmittal'}),/date/i)
 const saved=store.recordReportReceipt(report.id,{receivedDate:'2026-11-06',sourceRef:'Fictional transmittal reference'})
 assert.equal(saved.receivedDate,'2026-11-06');assert.equal(saved.receiptMetadata.recordedBy,'u-investigator')
 assert.deepEqual(saved.fields,before.fields);assert.equal(saved.revision,before.revision);assert.equal(saved.status,'issued');assert.equal(saved.notedBy,before.notedBy)
 assert.throws(()=>store.update('reports',saved.id,{fields:{analysis:'overwrite'}}),/immutable/i)
})
test('reasoned date/time exceptions synchronize unknown flags; resolving a field retires its live exception',()=>{
 store.reset();store.signIn('u-reporter');const data=initial();data.date='';data.time='';data.dateUnknown=false;data.timeUnknown=false;data.reportingExceptions={}
 for(const item of assessIncident(data).unresolved)data.reportingExceptions[item.key]={status:'unknown',reason:'Source verification pending.'}
 const saved=store.saveEvent(data,{submit:true});assert.equal(saved.dateUnknown,true);assert.equal(saved.timeUnknown,true)
 const aorException=saved.reportingExceptions.aor;assert.ok(aorException)
 store.saveEvent({...saved,aor:'MRO-IV'});assert.equal(store.getEvent(saved.id).reportingExceptions.aor,undefined)
 store.saveEvent({...store.getEvent(saved.id),aor:''});assert.ok(assessIncident(store.getEvent(saved.id)).unresolved.some(item=>item.key==='aor'))
})
test('report review and recorded case requirements cannot be bypassed through local store actions',()=>{
 store.reset();store.signIn('u-investigator')
 assert.throws(()=>store.recordReport({eventId:'e-003',type:'1B',status:'review',fields:{}}),/required|reporting/i)
 const draft=store.recordReport({eventId:'e-003',type:'1B',status:'draft',fields:{}})
 assert.throws(()=>store.update('reports',draft.id,{status:'review'}),/required|reporting/i)
 assert.equal(draft.status,'draft')
 assert.throws(()=>store.recordCase({eventId:'e-003',reportingStatus:'recorded',actions:[]}),/required|case/i)
 assert.equal(store.recordCase({eventId:'e-003',reportingStatus:'draft',actions:[]}).reportingStatus,'draft')
})
test('resolved report and case unknowns cannot silently reactivate after a later edit',()=>{
 store.reset();store.signIn('u-investigator')
 const draft=store.recordReport({eventId:'e-003',type:'1B',status:'draft',fields:{fatalities:null},reportingExceptions:{'fields.fatalities':{status:'unknown',reason:'Initial muster pending.'}}})
 store.update('reports',draft.id,{fields:{fatalities:0}});assert.equal(draft.reportingExceptions['fields.fatalities'],undefined)
 store.update('reports',draft.id,{fields:{fatalities:null}});assert.equal(draft.reportingExceptions['fields.fatalities'],undefined)
 const record=store.recordCase({eventId:'e-003',reportingStatus:'draft',party:'',actions:[],reportingExceptions:{party:{status:'unknown',reason:'Operator identity pending.'}}})
 store.update('cases',record.id,{party:'Fictional Operator'});assert.equal(record.reportingExceptions.party,undefined)
 store.update('cases',record.id,{party:''});assert.equal(record.reportingExceptions.party,undefined)
})
