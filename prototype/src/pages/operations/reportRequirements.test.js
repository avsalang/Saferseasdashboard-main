import test from 'node:test'
import assert from 'node:assert/strict'
import {assessReport,reportRequirements,assessCase,caseRequirements,assessOperationalOutput} from './reportRequirements.js'
import {initialFields} from './maic.js'
import {buildMAICSections,buildSpotSections,selectReportRevision} from '../data/reportLogic.js'
import {buildOutput} from '../../data/catalogue.js'

const event={id:'event-test',ref:'DEMO-REQUIREMENTS',officeId:'MRO-IV',vessels:[],consequences:{}}
const report=(type='1B',status='review')=>({id:'report-test',eventId:event.id,type,status,date:'2026-11-06',asOf:'2026-11-06',preparedBy:'Example Investigator',designation:'Marine Casualty Investigator',officeId:'MRO-IV',evidenceIds:['source-1'],reportingExceptions:{},fields:{occurrenceDate:'2026-11-05',occurrenceTime:'08:30',place:'Fictional waters',position:'0, 0 — reported',incidentTypes:'Grounding',seriousness:'serious',occurrenceNarrative:'A fictional vessel grounded during a reported voyage.',informationSources:'Master report DEMO-001',shipParticulars:'MV Example, Official DEMO-001, cargo service.',construction:'Steel vessel, built 2010; GT 642.35.',machineryParticulars:'Two diesel engines, 400 kW each.',ownership:'Example owner and operator.',voyage:'Example port A to Example port B.',fatalities:0,missing:0,injured:0,rescued:2,crew:2,passengers:0,totalOnboard:2,damage:'Fit; hull examined with no reported damage.',pollution:'No oil or chemical release reported after inspection.',initialActions:'Persons accounted for and vessel inspected.',certificates:'Fictional survey certificate DEMO-CERT.',recommendations:'Retain inspection evidence and review the passage plan.'}})
const finalReport=()=>{const r=report('3B');Object.assign(r.fields,{backgroundSummary:'Fictional final investigation summary.',analysis:'Evidence was reviewed against the reported sequence.',conclusion:'The available evidence does not establish a causal failure.',causalFactors:'No causal factor established from the available evidence.',lessons:'Improve retention of contemporaneous information.',deadCrew:0,deadPassengers:0,deadTotal:0,missingCrew:0,missingPassengers:0,missingTotal:0,seriouslyInjuredPassengers:0,seriouslyInjuredCrew:0,casualtyLevels:['serious'],casualtyTypes:['grounding'],conditionsDetails:'Reported calm sea and clear conditions.',primaryCauseEvidence:'Reviewed inspection and witness evidence did not establish an internal, machinery, cargo or external cause.',humanFactorEvidence:'Available witness evidence did not support a human factor finding.',organizationEquipmentEnvironmentEvidence:'Available records did not support an organizational, equipment or environmental factor finding.'});return r}
const caseRecord=()=>({id:'case-test',eventId:event.id,caseNumber:'DEMO-CASE',officeId:'MRO-IV',party:'Example Operator',status:'ongoing_sco',violations:'Illustrative allegation pending consideration.',penalty:null,paid:null,reportingExceptions:{},actions:[{id:'action-1',type:'Show cause order',reference:'DEMO-SCO',issuedDate:'2026-11-06',issuedTime:'09:00',officeId:'MRO-IV',sourceRef:'DEMO-SOURCE-COPY',sourceTimeliness:'within_72h_source'}]})
const text=sections=>sections.map(section=>section.content).join('\n')

test('review requires source content and preparer metadata, while director noting is issue-only',()=>{
 const r=report();assert.equal(assessReport(r,event).ready,true)
 assert.ok(!reportRequirements(r,event).some(item=>item.key==='notedBy'))
 const issued={...r,status:'issued'};assert.equal(assessReport(issued,event).ready,false)
 issued.notedBy='Example Director';issued.notedDate='2026-11-06';assert.equal(assessReport(issued,event).ready,true)
 r.fields.occurrenceNarrative='';r.reportingExceptions['fields.occurrenceNarrative']={status:'unknown',reason:'Pending'}
 assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.occurrenceNarrative'))
})

test('known zero is complete; unknown and Not Applicable require a permitted status and reason',()=>{
 const r=report();r.fields.fatalities=null
 assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.fatalities'))
 r.reportingExceptions['fields.fatalities']={status:'unknown',reason:'Count awaiting confirmation from the master.'}
 assert.equal(assessReport(r,event).ready,true)
 r.reportingExceptions['fields.fatalities'].reason=' ';assert.equal(assessReport(r,event).ready,false)
 r.fields.fatalities=0;r.fields.occurrenceTime=null;r.reportingExceptions['fields.occurrenceTime']={status:'not_applicable',reason:'Time not recorded'}
 assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.occurrenceTime'))
 r.reportingExceptions['fields.occurrenceTime']={status:'unknown',reason:'Time not recorded in the source.'}
 assert.equal(assessReport(r,event).ready,true)
 r.fields.injured=-1;r.reportingExceptions['fields.injured']={status:'unknown',reason:'Cannot override an invalid supplied count'}
 assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.injured'))
})

test('progress requires an update and action assessments, without demanding an actual SCO or live case',()=>{
 const r=report('2');assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.progressSummary'))
 Object.assign(r.fields,{progressSummary:'No additional casualty identified as of the report date.',investigationActivities:'Written statement obtained.',consequenceChanges:'No change in reported counts.',rescueRecovery:'No further recovery or rescue operation reported.',scoActions:'No SCO issued as of this update.',certificateActions:'No certificate or SRB action reported.',otherInformation:'No other material update.'})
 assert.equal(assessReport(r,event).ready,true)
 const before=assessOperationalOutput('O17',[event],{reports:[r],cases:[]})
 const after=assessOperationalOutput('O17',[event],{reports:[r],cases:[{eventId:event.id,actions:[{type:'Show cause order'}]}]})
 assert.deepEqual(after,before)
 assert.ok(!assessOperationalOutput('O09',[event],{cases:[]}).items.length)
})

test('final findings may be addressed by assessment evidence or explained exceptions; no causal checkbox is compelled',()=>{
 const r=finalReport();assert.equal(assessReport(r,event).ready,true)
 r.fields.primaryCauseEvidence='Preliminary potential causes reported — not established findings: engine problem.'
 assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.machineryFailures'))
 r.fields.machineryFailures=['unsupported-code'];assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.machineryFailures'))
 for(const key of ['primaryCauseCategories','machineryFailures','cargoCauses','externalCauses'])r.reportingExceptions['fields.'+key]={status:'not_applicable',reason:'Assessment found no supported finding in this factor group.'}
 assert.equal(assessReport(r,event).ready,true)
 r.fields.softwareFactors=['other'];assert.ok(assessReport(r,event).unresolved.some(item=>item.key==='fields.softwareOther'))
 r.fields.softwareOther='Specified additional organization finding.';assert.equal(assessReport(r,event).ready,true)
})

test('generated particulars with even partly missing required details need a section explanation; explicit edited narrative remains usable',()=>{
 const e={...event,date:'2026-11-05',type:'Grounding',summary:'Fictional source narrative.',vessels:[{id:'v1',name:'MV Example',grossTonnage:642.35}],consequences:{}}
 const r=report('2');r.fields={...r.fields,...initialFields(e)}
 const rule=reportRequirements(r,event).find(item=>item.key==='fields.construction')
 assert.equal(rule.missing,true);assert.match(rule.label,/Year Built/);assert.match(rule.label,/Net Tonnage/)
 r.reportingExceptions['fields.construction']={status:'unknown',reason:'Registry file requested; known GT is retained.'}
 assert.equal(assessReport(r,event).items.find(item=>item.key==='fields.construction').status,'explained')
 r.fields.construction='Updated survey particulars entered after checking the registry documents.'
 assert.equal(reportRequirements(r,event).find(item=>item.key==='fields.construction').missing,false)
 assert.ok(reportRequirements(r,event).filter(item=>['shipParticulars','construction','machineryParticulars','ownership','voyage'].includes(item.field)).every(item=>item.step))
})

test('conditional case/action source fields and lifting details are checked without a legal deadline calculation',()=>{
 const c=caseRecord();assert.equal(assessCase(c).ready,true)
 c.actions[0].issuedTime='';c.actions[0].sourceTimeliness='unknown'
 assert.ok(assessCase(c).unresolved.some(item=>item.key==='action:action-1:issuedTime'))
 c.reportingExceptions['action:action-1:issuedTime']={status:'unknown',reason:'Source order provides only the issue date.'}
 c.reportingExceptions['action:action-1:sourceTimeliness']={status:'unknown',reason:'Timing category not recorded; no rule is inferred.'}
 assert.equal(assessCase(c).ready,true)
 c.actions.push({id:'lift',type:'Certificate lifting',reference:'LIFT-1',issuedDate:'2026-11-06',issuedTime:'10:00',officeId:'MRO-IV',sourceRef:'LIFT-COPY',conditions:'Survey completed.'})
 const keys=assessCase(c).unresolved.map(item=>item.key)
 for(const key of ['affectedDocument','relatedSuspension','surveyDetails'])assert.ok(keys.includes('action:lift:'+key),key)
 Object.assign(c.actions[1],{affectedDocument:'DEMO safety certificate',relatedSuspension:'SUSPEND-1',surveyDetails:'Survey report DEMO-SURVEY warrants lifting.'})
 assert.equal(assessCase(c).ready,true)
 c.actions[1].type='SRB lifting';assert.ok(assessCase(c).unresolved.some(item=>item.key==='action:lift:periodServed'))
})

test('zero penalty is valid and incomplete drafts/legacy issued reports are identified honestly for outputs',()=>{
 const c=caseRecord();Object.assign(c,{status:'ongoing_penalty',penalty:0,paid:0,decision:'Fictional decision.',decisionDate:'2026-11-06',decisionReference:'DECISION-1'})
 assert.equal(assessCase(c).ready,true)
 c.reportingStatus='draft';assert.equal(assessOperationalOutput('O10',[event],{cases:[c]}).ready,false)
 const legacy={id:'old',eventId:event.id,type:'1B',status:'issued',fields:{narrative:'Historical content retained.'}}
 const result=assessOperationalOutput('O16',[event],{reports:[legacy]})
 assert.equal(result.ready,false);assert.ok(result.items.every(item=>item.historical))
 assert.equal(legacy.fields.narrative,'Historical content retained.')
 assert.equal(assessOperationalOutput('O18',[event],{reports:[]}).unresolved[0].allowException,false)
})

test('report and source-incident exceptions are printed from the retained revision without later live backfill',()=>{
 const r=report();r.fields.occurrenceTime=null;r.reportingExceptions['fields.occurrenceTime']={status:'unknown',reason:'Original time absent in the report source.'}
 r.sourceReportingExceptions={date:{status:'unknown',reason:'Original incident date pending source confirmation.'}}
 r.sourceReportingLabels={date:'Date of Incident / Accident'}
 const live={...event,reportingExceptions:{date:{status:'unknown',reason:'Later unrelated live exception.'}}}
 const body=text(buildMAICSections({type:'1B',event:live,report:r}))
 assert.ok(body.includes('Original time absent'))
 assert.ok(body.includes('Original incident date pending'))
 assert.ok(!body.includes('Later unrelated live exception'))
 const old={type:'1B',fields:{narrative:'Old immutable narrative'}}
 assert.ok(!text(buildMAICSections({type:'1B',event:live,report:old})).includes('Later unrelated live exception'))
 const spot={type:'spot',fields:{...event,reportingExceptions:{date:{status:'unknown',reason:'Saved spot exception.'}}},evidenceIds:[]}
 const selected=selectReportRevision({event:live,report:spot})
 assert.ok(text(buildSpotSections({event:selected.event,report:spot})).includes('Saved spot exception.'))
})

test('O13 uses MARINA receipt dates independently from report dates and keeps unreceived/unknown records explicit',()=>{
 const first={...report(),date:'2027-01-01',receivedDate:'2026-11-05'},second={...report(),id:'not-received',date:'2026-01-01',receivedDate:''},future={...report(),id:'future-receipt',receivedDate:'2027-01-02'}
 const rows=buildOutput('O13',[event],{reports:[first,second,future],cases:[],imports:[]},{asOf:'2026-11-06'})
 assert.equal(rows[0]['Form 1B'],1)
 assert.equal(rows[0]['Receipt date unknown / not recorded'],1)
 assert.ok(rows[0]['Receipt records / dates'].includes('2026-11-05'))
 assert.ok(!rows[0]['Receipt records / dates'].includes('2027-01-02'))
 const assessment=assessOperationalOutput('O13',[event],{reports:[first,second,future],asOf:'2026-11-06'})
 assert.ok(assessment.unresolved.some(item=>item.recordId==='not-received'&&item.requirementKey==='receivedDate'))
 second.reportingExceptions.receivedDate={status:'not_applicable',reason:'This prepared report has not yet been received by MARINA.'}
 assert.equal(assessOperationalOutput('O13',[event],{reports:[first,second],asOf:'2026-11-06'}).ready,true)
 assert.equal(assessReport(second,event).ready,true,'Receipt information must not gate review or issue')
 second.receivedDate='2026-02-31'
 assert.equal(buildOutput('O13',[event],{reports:[second],cases:[],imports:[]})[0]['Form 1B'],0)
 assert.equal(assessOperationalOutput('O13',[event],{reports:[second]}).ready,false)
})

test('case summaries address only contributing events for occurrence month and CPC/homeport attribution',()=>{
 const contributing={...event,date:null,dateUnknown:true,cpc:'',homeport:'',reportingExceptions:{}},irrelevant={id:'no-case',ref:'NO-CASE',date:null,cpc:'',homeport:''},c=caseRecord()
 const dated=assessOperationalOutput('O08',[contributing,irrelevant],{cases:[c]})
 assert.ok(dated.unresolved.some(item=>item.recordKind==='incident'&&item.requirementKey==='date'))
 assert.ok(!dated.items.some(item=>item.eventId==='no-case'))
 contributing.reportingExceptions.date={status:'unknown',reason:'Source provides no occurrence date; kept in unknown-month group.'}
 assert.equal(assessOperationalOutput('O08',[contributing,irrelevant],{cases:[c]}).ready,true)
 assert.ok(assessOperationalOutput('O09',[contributing,irrelevant],{cases:[c]}).unresolved.some(item=>item.requirementKey==='caseOffice'))
 contributing.reportingExceptions.caseOffice={status:'unknown',reason:'CPC/homeport office verification is pending.'}
 assert.equal(assessOperationalOutput('O09',[contributing,irrelevant],{cases:[c]}).ready,true)
})
