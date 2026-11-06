import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { initialFields, initializeFields, maicGroups } from './maic.js'
import { buildOutput } from '../../data/catalogue.js'
import { buildMAICSections, buildSpotSections, selectReportRevision } from '../data/reportLogic.js'

test('initial information receipt is retained in source report context, separately from MARINA report receipt',()=>{
 const event={...fixture(),receivedDate:'2026-05-10'}
 assert.match(initialFields(event).informationSources,/Initial information received: 2026-05-10/)
 assert.ok(buildSpotSections({event}).some(section=>section.content.includes('Initial information received: 2026-05-10')))
})
test('an unavailable intake receipt date does not invent source information',()=>{
 const event={...fixture(),receivedDate:'',sourceType:'',sourceRef:'',reportingAuthority:'',sourceNotes:'',documentNotes:''}
 assert.equal(initialFields(event).informationSources,'')
})

const fixture = () => ({
  id:'mapping-event',ref:'DEMO-MAPPING',date:'2026-11-06',time:'09:15',dateUnknown:false,timeUnknown:false,type:'Grounding',secondaryTypes:[],seriousness:'serious',place:'Fictional approach',lat:0,lon:0,positionQuality:'reported',officeId:'MRO-IV',aor:'MRO-IV',homeport:'MRO-NCR',cpc:'MRO-VII',issuingOffice:'MRO-IV',status:'submitted',ownerId:'fictional-reporter',
  summary:'Initial factual account.',timeline:'09:10 alarm; 09:15 assistance requested.',crewResponse:'Crew secured the machinery and checked persons aboard.',crewFactors:['Communication','Fatigue / fitness'],potentialCauses:'A machinery problem may have contributed; not yet established.',findingsOfCause:'Records require further inspection before concluding.',damageTypes:['Hull damage','Cargo damage'],reportingAuthority:'Fictional regional operations desk',rescueRecovery:'All known persons accounted for; recovery pending.',certificates:'Survey certificate reference DEMO-CERT; validity under review.',sourceType:'Source report',sourceRef:'DEMO-SOURCE',sourceNotes:'Telephone account awaiting written confirmation.',documentNotes:'Photograph has no verified capture time.',initialActions:'Requested assistance.',recommendations:'Obtain maintenance records.',evidenceIds:[],
  vessels:[{id:'mapping-vessel',name:'MV Fictional Mapping',grossTonnage:123.45,officialNumber:'0000123',type:'Cargo',portOfRegistry:'Fictional Registry City',homeportPlace:'Fictional Homeport City',homeport:'MRO-V',propulsionType:'Twin-screw diesel',voyage:{origin:'Example A',destination:'Example B'}}],
  consequences:{fatalities:0,missing:null,injured:0,rescued:2,crew:2,passengers:0,totalOnboard:2,shipCondition:'Unfit',pollution:'Not established',observedAt:'2026-11-06T10:30',notes:'Counts from fictional muster; missing count not confirmed.'},
  environment:{observedAt:'2026-11-06T09:00',waveHeightM:0.25,windForce:0,visibility:null,weatherDescription:'Reported cloudy',seaState:'Calm',currentTide:'Unknown',source:'Manual report from master; observation time unverified',lookup:{status:'available',provider:'Fictional model provider',modelled:true,fetchedAt:'2026-11-06T03:00:00Z',query:{lat:0,lon:0,date:'2026-11-06'},values:{waveHeightM:9.25,windForce:8},attribution:'Reference model output; not an on-scene observation'}},
  maicFields:{analysis:'Explicit optional MAIC analysis.',machineryFailures:['steering'],deadCrew:null,missingCrew:0,weatherConditions:null,customReference:{source:'DEMO-EXTRA',verified:false}},
})
const state={cases:[],reports:[],imports:[]}
const contents=sections=>sections.map(s=>`${s.title}\n${s.content}`).join('\n')

test('digital incident baseline maps to MAIC without promoting preliminary causes or replacing observations',()=>{
  const event=fixture(),fields=initialFields(event)
  for(const marker of [event.summary,event.timeline,event.crewResponse])assert.ok(fields.occurrenceNarrative.includes(marker))
  assert.ok(fields.informationSources.includes(event.reportingAuthority))
  assert.ok(fields.informationSources.includes(event.sourceNotes))
  assert.equal(fields.rescueRecovery,event.rescueRecovery)
  assert.equal(fields.certificates,event.certificates)
  assert.ok(fields.shipParticulars.includes(event.vessels[0].portOfRegistry))
  assert.ok(fields.ownership.includes(event.vessels[0].homeportPlace))
  assert.ok(fields.ownership.includes('homeport office MRO-V'))
  assert.ok(fields.machineryParticulars.includes(event.vessels[0].propulsionType))
  assert.equal(fields.consequenceObservedAt,event.consequences.observedAt)
  assert.equal(fields.consequenceSourceNotes,event.consequences.notes)
  assert.match(fields.primaryCauseEvidence,/preliminary/i)
  assert.ok(fields.primaryCauseEvidence.includes(event.potentialCauses))
  assert.ok(!fields.causalFactors || !fields.causalFactors.includes(event.potentialCauses))
  assert.equal(fields.waveHeightM,0.25)
  assert.equal(fields.windForce,0)
  assert.equal(fields.visibility,null)
  assert.equal(fields.environmentSource,event.environment.source)
  assert.equal(fields.environmentObservedAt,event.environment.observedAt)
  assert.notEqual(fields.environmentObservedAt,fields.consequenceObservedAt)
  assert.match(fields.modelledEnvironmentLookup,/Fictional model provider/)
  assert.match(fields.modelledEnvironmentLookup,/modelled/)
  assert.deepEqual(fields.crewFactors,event.crewFactors)
  assert.deepEqual(fields.damageTypes,event.damageTypes)
  assert.equal(fields.findingsOfCause,event.findingsOfCause)
  assert.equal(fields.fatalities,0)
  assert.equal(fields.missing,null)
})

test('explicit optional MAIC values override defaults and remain independent, including null and zero',()=>{
  const event=fixture(),fields=initialFields(event)
  assert.equal(fields.analysis,event.maicFields.analysis)
  assert.equal(fields.deadCrew,null)
  assert.equal(fields.missingCrew,0)
  assert.equal(fields.weatherConditions,null)
  assert.deepEqual(fields.machineryFailures,['steering'])
  fields.machineryFailures.push('propulsion')
  fields.customReference.source='Changed in report'
  fields.environment.lookup.values.waveHeightM=1
  assert.deepEqual(event.maicFields.machineryFailures,['steering'])
  assert.equal(event.maicFields.customReference.source,'DEMO-EXTRA')
  assert.equal(event.environment.lookup.values.waveHeightM,9.25)
  for(const type of ['1B','2','3B'])assert.ok(maicGroups.some(g=>g.stages.includes(type)&&g.fields.some(f=>f.key==='modelledEnvironmentLookup')))
})

test('checkbox initialization preserves explicit unknowns while defaulting absent selections',()=>{
  const fields=initializeFields({weatherConditions:null,machineryFailures:[],missingCrew:0})
  assert.equal(fields.weatherConditions,null)
  assert.deepEqual(fields.machineryFailures,[])
  assert.deepEqual(fields.physiologicalFactors,[])
  assert.equal(fields.missingCrew,0)
})

test('reactive Vue report snapshots can build MAIC sections without cloning errors or live backfill',()=>{
  const event=reactive(fixture()),report=reactive({type:'1B',status:'issued',fields:initialFields(event)})
  const text=contents(buildMAICSections({type:'1B',event,report}))
  assert.ok(text.includes(event.timeline))
  assert.ok(text.includes('Fictional model provider'))
  assert.equal(buildOutput('O01',[event],state)[0]['Recorded wind force'],0)
  assert.ok(contents(buildSpotSections({event})).includes(event.crewResponse))
})

test('master register retains the first 38 original headings and appends complete supplemental baseline fields',()=>{
  const event=fixture(),row=buildOutput('O01',[event],state)[0]
  assert.deepEqual(Object.keys(row).slice(0,38),['NO','RIG TYPE','NAME OF SHIP/VESSEL','NAME OF OPERATOR / OWNER','OFFICIAL NO. / IMO NO.','YEAR BUILT','GT','HOMEPORT / FLAG','CPC','EFFECTIVE OFFICE (derived)','TYPE OF SHIP/VESSEL','HULL','TYPE OF INCIDENT / ACCIDENT','DATE OF INCIDENT / ACCIDENT','TIME OF INCIDENT / ACCIDENT','LOCATION OF INCIDENT / ACCIDENT','AOR','IMO CLASSIFICATION','SIZE CLASSIFICATION','CLASSIFICATION SOCIETY','POTENTIAL CAUSE/S','CONSEQUENCES TO SHIP / HUMAN CASUALTY','RECOMMENDATIONS','IMAGE/LINK OF MCMC','ACTIONS TAKEN / STATUS','SCO within 72H','CASE No. for within72H','MROs issued within72H','Issued Date within72H','SCO beyond 72H','CASE No. for beyond72H','MROs issued beyond72H','Issued Date beyond72H','VIOLATIONS','DECISION / ORDER','Decision/order Issued Date','AMOUNT OF PENALTY','REMARKS'])
  assert.equal(row['POTENTIAL CAUSE/S'],event.potentialCauses)
  assert.equal(row['Occurrence timeline'],event.timeline)
  assert.equal(row['Crew response'],event.crewResponse)
  assert.deepEqual(row['Crew factors (reported)'],event.crewFactors)
  assert.equal(row['Recorded wave height (m)'],0.25)
  assert.equal(row['Recorded wind force'],0)
  assert.equal(row['Recorded visibility'],null)
  assert.equal(row['Environment observation (local)'],event.environment.observedAt)
  assert.equal(row['Port of registry (place)'],event.vessels[0].portOfRegistry)
  assert.equal(row['Homeport (place)'],event.vessels[0].homeportPlace)
  assert.equal(row['Propulsion type'],event.vessels[0].propulsionType)
  assert.equal(row['Consequence observation (local)'],event.consequences.observedAt)
  assert.equal(row['Consequence source notes'],event.consequences.notes)
  assert.equal(row['Modelled lookup reference (provenance retained)'].values.waveHeightM,9.25)
  assert.deepEqual(row['Additional MAIC fields'],event.maicFields)
})

test('spot table and printable sections round-trip the saved baseline and provenance after live edits',()=>{
  const original=fixture(),report={type:'spot',revision:1,status:'review',preparedBy:'Fictional Reporter',fields:structuredClone(original),evidenceIds:[]}
  const live=structuredClone(original);live.timeline='Later live timeline';live.environment.waveHeightM=7;live.environment.lookup.provider='Later provider';live.maicFields.analysis='Later live analysis'
  const selected=selectReportRevision({event:live,report}),row=buildOutput('O15',[selected.event],state)[0],text=contents(buildSpotSections({event:selected.event,report,preparedBy:report.preparedBy}))
  assert.equal(row['Occurrence timeline'],original.timeline)
  assert.equal(row['Recorded wave height (m)'],0.25)
  for(const marker of [original.timeline,original.crewResponse,original.potentialCauses,original.findingsOfCause,original.reportingAuthority,original.rescueRecovery,original.certificates,original.sourceNotes,original.documentNotes,original.consequences.observedAt,original.environment.observedAt,original.consequences.notes,original.vessels[0].portOfRegistry,original.vessels[0].homeportPlace,original.vessels[0].propulsionType,'Fictional model provider','DEMO-EXTRA','Failure of steering'])assert.ok(text.includes(marker),marker)
  assert.match(text,/preliminary/i)
  assert.match(text,/recorded environment/i)
  assert.match(text,/modelled.*reference/i)
  assert.ok(!text.includes('Later live timeline'))
  assert.ok(!text.includes('Later provider'))
  assert.ok(!text.includes('Later live analysis'))
})

test('MAIC-specific overrides do not replace the spot report manual observation or its lookup provenance',()=>{
  const event=fixture();event.maicFields.waveHeightM=null;event.maicFields.modelledEnvironmentLookup='Explicit MAIC-only assessment note'
  assert.equal(initialFields(event).waveHeightM,null)
  assert.match(initialFields(event).environmentValueProvenance,/Wave height \(m\): Unknown/)
  const sections=buildSpotSections({event}),manual=sections.find(s=>s.title==='Recorded environment and value sources').content,lookup=sections.find(s=>s.title==='Modelled environmental lookup — reference only').content
  assert.ok(manual.includes('Wave height (m): 0.25'))
  assert.ok(lookup.includes('Fictional model provider'))
  assert.ok(!lookup.includes('Explicit MAIC-only assessment note'))
  assert.ok(sections.find(s=>s.title==='Additional MAIC fields supplied with the spot report').content.includes('Explicit MAIC-only assessment note'))
})

test('applied model sources remain distinct from entered values and later lookup history in every output',()=>{
  const event=fixture()
  event.environment.waveHeightM=1.7
  event.environment.fieldSources={waveHeightM:{kind:'modelled',provider:'Open-Meteo',appliedValue:1.7,appliedAt:'2026-11-06T03:00:00Z',modelTime:'2026-11-06T01:00:00',request:{localDateTime:'2026-11-06T09:15',timezone:'Asia/Manila'},returnedLocation:{lat:0,lon:0},providerUrl:'https://example.org/fictional-source'}}
  event.environment.lookup.provider='Different later lookup provider'
  const fields=initialFields(event),row=buildOutput('O01',[event],state)[0],spot=buildSpotSections({event}).find(section=>section.title==='Recorded environment and value sources').content
  assert.ok(fields.environmentValueProvenance.includes('1.7 (modelled context; Open-Meteo'))
  assert.ok(fields.environmentValueProvenance.includes('0 (entered value)'))
  assert.ok(fields.modelledEnvironmentLookup.includes('Different later lookup provider'))
  assert.deepEqual(fields.environmentFieldSources,event.environment.fieldSources)
  assert.ok(row['Environment values with provenance'].waveHeightM.includes('modelled context; Open-Meteo'))
  assert.ok(row['Environment values with provenance'].windForce.includes('entered value'))
  assert.equal(row['Modelled lookup reference (provenance retained)'].provider,'Different later lookup provider')
  assert.ok(spot.includes('1.7 (modelled context; Open-Meteo'))
  assert.ok(!spot.includes('Manually observed'))
  event.environment.waveHeightM=2
  assert.ok(initialFields(event).environmentValueProvenance.includes('2 (entered value)'))
  assert.ok(!initialFields(event).environmentValueProvenance.includes('2 (modelled context'))
})

test('MAIC saved revisions keep additive mappings and never backfill later live values into an issued report',()=>{
  const original=fixture(),report={type:'3B',revision:2,status:'issued',fields:initialFields(original)}
  const live=structuredClone(original);live.timeline='Later timeline';live.environment.waveHeightM=7;live.environment.lookup.provider='Later model';live.maicFields.analysis='Later analysis'
  const text=contents(buildMAICSections({type:'3B',event:live,report}))
  for(const marker of [original.timeline,original.rescueRecovery,original.certificates,'Fictional model provider','Explicit optional MAIC analysis.','Failure of steering'])assert.ok(text.includes(marker),marker)
  assert.ok(!text.includes('Later model'))
  assert.ok(!text.includes('Later analysis'))
  const legacy=contents(buildMAICSections({type:'1B',event:live,report:{type:'1B',status:'issued',fields:{narrative:'Original legacy narrative',fatalities:0}}}))
  assert.ok(legacy.includes('Original legacy narrative'))
  assert.ok(!legacy.includes('Later timeline'))
  assert.ok(!legacy.includes('Later model'))
  assert.ok(!legacy.includes('Later analysis'))
})
