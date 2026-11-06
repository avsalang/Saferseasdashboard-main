import {assessRequirements,missingReportingValue,incidentRequirements,caseOfficeRequirement} from '../../data/reportingRequirements.js'
import {maicGroups} from './maic.js'

// Product release checks derived from supplied MAIC pp2–12 and audit §6.1–6.3.
// They require an addressed section, not fabricated knowledge or a particular causal finding.
export const REPORT_REQUIREMENTS_VERSION='marina-report-content-v1'
const outputFor={ '1B':'O16','2':'O17','3B':'O18' }
export const validReportReceiptDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(new Date(value+'T00:00:00Z').getTime())&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value
const has=value=>!missingReportingValue(value)
const fieldDefinition=key=>maicGroups.flatMap(group=>group.fields).find(field=>field.key===key)
const rule=(key,label,value,outputs,extra={})=>({key,label,value,outputs,allowException:true,allowNotApplicable:false,...extra})
const numeric=(key,label,value,outputs,extra={})=>{const invalid=has(value)&&(!Number.isFinite(Number(value))||Number(value)<0||(!extra.decimal&&!Number.isInteger(Number(value))));return rule(key,label,value,outputs,{...extra,missing:invalid||!has(value),allowException:!invalid})}
const merge=items=>({items,unresolved:items.filter(item=>item.status==='missing'),explained:items.filter(item=>item.status==='explained'),ready:items.every(item=>item.status!=='missing')})

export function reportRequirements(report={},event={}){
 const type=report.type,outputs=[outputFor[type]||'O13'],fields=report.fields||{},definitions=[]
 const header=(key,label,value,extra={})=>definitions.push(rule(key,label,value,['O13',...outputs],{step:'report-header',allowException:false,...extra}))
 header('eventId','Related Maritime Accident / Incident',report.eventId||event?.id)
 header('type','MAIC Form / Report Stage',['1B','2','3B'].includes(type)?type:null)
 header('date','Report / Submission Date',report.date)
 header('asOf','Information As Of',report.asOf)
 header('officeId','Submitting MARINA Office',report.officeId,{allowException:true})
 header('preparedBy','Submitted by — Name',report.preparedBy)
 header('designation','Submitted by — Designation',report.designation)
 if(report.status==='issued'){
  header('notedBy','Noted by — Name of Director',report.notedBy)
  header('notedDate','Date Noted — release audit record',report.notedDate)
 }
 const content=(key,label,extra={})=>definitions.push(rule('fields.'+key,label||fieldDefinition(key)?.label||key,fields[key],outputs,{step:key,field:key,...extra}))
 for(const key of ['occurrenceDate','occurrenceTime','place','incidentTypes','occurrenceNarrative','informationSources'])content(key,undefined,{allowException:!['place','occurrenceNarrative'].includes(key)})
 for(const key of ['shipParticulars','construction','machineryParticulars','ownership','voyage']){const metadata=fields.particularsAssessment?.[key],unchanged=metadata&&String(metadata.generatedValue||'').trim()===String(fields[key]||'').trim(),missingParticulars=unchanged?(metadata.vessels||[]).flatMap(v=>(v.missing||[]).filter(item=>(item.stages||[]).includes(type)).map(item=>`${v.name}: ${item.label}`)):[];const legacyPlaceholder=!metadata&&/unknown|\?\/\?|not yet assessed/i.test(String(fields[key]||''))&&/; Official:|built .* at| engines;|owner .*operator|; route |; cargo /i.test(String(fields[key]||''));content(key,(fieldDefinition(key)?.label||key)+(missingParticulars.length?` — unavailable: ${missingParticulars.join('; ')}`:''),{missing:!has(fields[key])||missingParticulars.length>0||legacyPlaceholder,allowNotApplicable:key==='voyage'})}
 content('position','Position of Accident / Casualty — Latitude and Longitude',{missing:!has(fields.position)||/^\s*(unknown|null|undefined|\?)\s*,/i.test(String(fields.position))})
 for(const [key,label] of [['fatalities','Number of Fatalities'],['missing','Number of Missing Persons'],['injured','Number of Injured Persons'],['rescued','Survivors / Rescued Persons'],['crew','Number of Crew'],['passengers','Number of Passengers'],['totalOnboard','Total Persons on Board']])definitions.push(numeric('fields.'+key,label,fields[key],outputs,{step:key,field:key}))
 content('damage','Consequences to Ship — Condition / Damage')
 content('pollution','Oil / Chemical Pollution — Substance',{allowNotApplicable:true})
 content('initialActions','Initial Actions Taken',{allowNotApplicable:true})
 content('certificates','Available Vessel Documents / Certificates',{allowNotApplicable:true})
 definitions.push(rule('sourceDocuments','Source / Vessel Document Copies or References',report.evidenceIds?.length?report.evidenceIds:null,outputs,{step:'informationSources',allowNotApplicable:true}))
 if(type==='1B'){
  content('seriousness','Level of Maritime Accident (MARINA)')
  content('recommendations','Recommendations',{allowNotApplicable:true})
 }
 if(type==='2'){
  content('progressSummary','Significant Updates Related to the Accident',{allowException:false})
  content('investigationActivities','Investigation Activities / Supporting Information',{allowNotApplicable:true})
  content('consequenceChanges','Changes to Ship Condition / Human Consequences',{allowNotApplicable:true})
  content('rescueRecovery','Missing Persons Recovered / Rescued — Progress Narrative',{allowNotApplicable:true})
  content('scoActions','Show Cause Order / Legal Proceedings',{allowNotApplicable:true})
  content('certificateActions','Safety Certificate / SRB Suspension or Lifting',{allowNotApplicable:true})
  content('otherInformation','Other Important Information',{allowNotApplicable:true})
 }
 if(type==='3B'){
  content('backgroundSummary','Background / Summary',{allowException:false})
  for(const key of ['analysis','conclusion'])content(key,undefined,{allowException:false})
  for(const key of ['causalFactors','lessons','recommendations'])content(key,undefined,{allowNotApplicable:key!=='causalFactors'})
  for(const key of ['deadCrew','deadPassengers','deadTotal','missingCrew','missingPassengers','missingTotal','seriouslyInjuredPassengers','seriouslyInjuredCrew'])definitions.push(numeric('fields.'+key,fieldDefinition(key)?.label||key,fields[key],outputs,{step:key,field:key}))
  const assessments=[
   ['casualtyLevels',null,false],['casualtyTypes',null,false],['seaConditions','conditionsDetails',true],['weatherConditions','conditionsDetails',true],['shipStatus','damage',true],['environmentConsequences','pollution',true],
   ['primaryCauseCategories','primaryCauseEvidence',true],['machineryFailures','primaryCauseEvidence',true],['cargoCauses','primaryCauseEvidence',true],['externalCauses','primaryCauseEvidence',true],
   ['physiologicalFactors','humanFactorEvidence',true],['psychologicalFactors','humanFactorEvidence',true],['physicalFactors','humanFactorEvidence',true],
   ['softwareFactors','organizationEquipmentEnvironmentEvidence',true],['hardwareFactors','organizationEquipmentEnvironmentEvidence',true],['environmentUnderlyingFactors','organizationEquipmentEnvironmentEvidence',true],
  ]
  for(const [key,evidenceKey,allowNotApplicable]of assessments){
   const definition=fieldDefinition(key),valid=new Set((definition?.options||[]).map(option=>typeof option==='string'?option:option.value)),selected=Array.isArray(fields[key])&&fields[key].some(value=>valid.has(value))
   const evidence=evidenceKey?fields[evidenceKey]:null,assessedEvidence=has(evidence)&&!(evidenceKey==='primaryCauseEvidence'&&/^\s*Preliminary potential causes reported/i.test(String(evidence)))
   content(key,(definition?.label||key)+' — Assessment',{missing:!selected&&!assessedEvidence,allowNotApplicable})
  }
  for(const [key,other]of [['casualtyTypes','casualtyTypeOther'],['casualtyTypes','seriousCasualtyTypeOther'],['softwareFactors','softwareOther']]){
   const code=other==='casualtyTypeOther'?'other_less_serious':other==='seriousCasualtyTypeOther'?'other_serious':'other'
   if(fields[key]?.includes(code))content(other,undefined,{allowException:false})
  }
 }
 return definitions
}
export const reportReceiptRequirements=report=>[rule('receivedDate','Date Received by MARINA',report?.receivedDate,['O13'],{step:'report-header',allowNotApplicable:true,missing:!validReportReceiptDate(report?.receivedDate),allowException:!has(report?.receivedDate)})]
export const assessReport=(report,event)=>assessRequirements(reportRequirements(report,event),report?.reportingExceptions)

export function caseRequirements(record={}){
 const definitions=[],all=['O01','O08','O09','O10'],detail=['O01','O09','O10','O17'],actions=record.actions||[]
 const add=(key,label,value,outputs=all,extra={})=>definitions.push(rule(key,label,value,outputs,{step:'case-header',...extra}))
 add('eventId','Related Maritime Accident / Incident',record.eventId,all,{allowException:false})
 add('caseNumber','Case Number',record.caseNumber,all,{allowException:false})
 add('officeId','Responsible MARINA Office',record.officeId)
 add('party','Respondent / Owner / Operator',record.party)
 add('status','Case Status / Outcome',['ongoing_sco','ongoing_penalty','dismissed','closed'].includes(record.status)?record.status:null,all,{allowException:false})
 const sco=actions.filter(action=>/show\s*cause|\bsco\b/i.test(action.type||'')),decision=actions.filter(action=>/decision/i.test(action.type||'')),penalty=record.status==='ongoing_penalty'||record.penalty!=null&&record.penalty!==''||actions.some(action=>/penalty/i.test(action.type||''))
 if(sco.length||record.status==='ongoing_sco'){
  add('violations','Alleged Violations / Relevant Provisions',record.violations,detail)
  if(!sco.length)add('scoRecord','Show Cause Order Record / Source Status',null,detail)
 }
 if(has(record.decision)||['closed','dismissed'].includes(record.status)||decision.length||penalty){
  add('decision','Decision / Order — Disposition',record.decision,detail)
  add('decisionDate','Decision / Order — Date Issued',record.decisionDate,detail)
  add('decisionReference','Decision / Order — Reference',record.decisionReference||decision.map(action=>action.reference).filter(has).join('; '),detail)
 }
 if(penalty)definitions.push(numeric('penalty','Amount of Assessed Penalty (PHP)',record.penalty,['O01','O09','O10'],{step:'case-header',decimal:true}))
 if(record.paid!=null&&record.paid!==''||actions.some(action=>/payment/i.test(action.type||'')))definitions.push(numeric('paid','Amount Paid (PHP)',record.paid,['O01','O09','O10'],{step:'case-header',decimal:true}))
 for(const [index,action]of actions.entries()){
  const id=action.id||`new-${index}`,prefix=`action:${id}:`,step=`case-action:${id}`,type=action.type||'',isSco=/show\s*cause|\bsco\b/i.test(type),sensitive=/certificate|srb/i.test(type),lifting=/lifting/i.test(type)
  const actionRule=(key,label,value,extra={})=>add(prefix+key,`${label} · ${type||`Action ${index+1}`}`,value,detail,{step,field:key,...extra})
  actionRule('type','Action Type',action.type,{allowException:false})
  actionRule('reference','Order / Document Reference',action.reference)
  actionRule('issuedDate','Date Issued',action.issuedDate)
  actionRule('issuedTime','Time Issued',action.issuedTime)
  actionRule('officeId','Actual Issuing Office',action.officeId)
  actionRule('sourceRef','Source Document / Copy Reference',action.sourceRef||action.notes)
  if(isSco)actionRule('sourceTimeliness','SCO Source Timing Category',action.sourceTimeliness,{missing:!has(action.sourceTimeliness)||/^(unknown|not_applicable)$/i.test(action.sourceTimeliness),allowNotApplicable:true})
  if(sensitive){
   actionRule('affectedDocument','Affected Certificate / SRB / Person',action.affectedDocument)
   actionRule('conditions','Conditions / Requirements',action.conditions,{allowNotApplicable:true})
   if(lifting){
    actionRule('relatedSuspension','Related Suspension Reference',action.relatedSuspension)
    if(/certificate/i.test(type))actionRule('surveyDetails','Survey Warranting Certificate Lifting',action.surveyDetails)
    if(/srb/i.test(type)){
     actionRule('periodServed','Period Lapsed / Served',action.periodServed)
     actionRule('conditionsMet','Compliance Warranting SRB Lifting',action.conditionsMet)
    }
   }
  }
  if(/penalty/i.test(type))definitions.push(numeric(prefix+'amount',`Amount (PHP) · ${type}`,action.amount,detail,{step,field:'amount',decimal:true}))
 }
 return definitions
}
export const assessCase=record=>assessRequirements(caseRequirements(record),record?.reportingExceptions)

export function assessOperationalOutput(outputId,events=[],state={}){
 const ids=new Set(events.map(event=>event.id)),items=[],reports=(state.reports||[]).filter(report=>ids.has(report.eventId)&&(!state.asOf||!report.date||report.date<=state.asOf)),cases=(state.cases||[]).filter(record=>ids.has(record.eventId))
 const append=(assessment,record,kind)=>{const event=events.find(event=>event.id===record.eventId);items.push(...assessment.items.map(item=>({...item,key:`${kind}:${record.id||record.eventId}:${item.key}`,requirementKey:item.key,recordId:record.id,eventId:record.eventId,eventRef:event?.ref||record.eventId,historical:record.status==='issued',recordKind:kind})))}
 if(['O16','O17','O18'].includes(outputId)){
  const type={O16:'1B',O17:'2',O18:'3B'}[outputId]
  for(const event of events){const report=reports.filter(report=>report.eventId===event.id&&report.type===type).sort((a,b)=>(Number(b.revision)||0)-(Number(a.revision)||0)||String(b.date||'').localeCompare(String(a.date||'')))[0]
   if(report)append(assessReport(report,event),report,'report')
   else items.push({...rule(`report:${event.id}:exists`,`MAIC Form ${type} — Saved Source Revision`,null,[outputId],{allowException:false}),status:'missing',missing:true,eventId:event.id,eventRef:event.ref})
  }
 }
 if(outputId==='O13')for(const report of (state.reports||[]).filter(report=>ids.has(report.eventId)&&(!state.asOf||!has(report.receivedDate)||report.receivedDate<=state.asOf))){const definitions=[rule('type','Report Type / MAIC Form',['spot','1A','1B','2','3B'].includes(report.type)?report.type:null,['O13'],{allowException:false}),rule('date','Report / Submission Date',report.date,['O13']),rule('officeId','Submitting MARINA Office',report.officeId,['O13']),...reportReceiptRequirements(report)];append(assessRequirements(definitions,report.reportingExceptions),report,'report')}
 if(['O01','O08','O09','O10'].includes(outputId))for(const record of cases){const definitions=caseRequirements(record).filter(item=>item.outputs.includes(outputId));if(record.reportingStatus==='draft')definitions.push(rule('reportingStatus','Case / Actions — Recorded Status',null,[outputId],{allowException:false}));append(assessRequirements(definitions,record.reportingExceptions),record,'case')}
 if(['O08','O09'].includes(outputId))for(const event of events.filter(event=>cases.some(record=>record.eventId===event.id))){
  const definition=outputId==='O08'?{...incidentRequirements(event).find(item=>item.key==='date'),outputs:['O08']}:caseOfficeRequirement(event)
  items.push(...assessRequirements([definition],event.reportingExceptions).items.map(item=>({...item,key:`incident:${event.id}:${item.key}`,requirementKey:item.key,recordId:event.id,eventId:event.id,eventRef:event.ref||event.id,recordKind:'incident'})))
 }
 return merge(items)
}

export function describeOperationalExceptions(record,definitions){
 const assessment=assessRequirements(definitions,record?.reportingExceptions),active=new Set(assessment.explained.map(item=>item.key)),labels=new Map(definitions.map(item=>[item.key,item.label]))
 const lines=assessment.explained.map(item=>`${item.label}: ${item.exception.status==='not_applicable'?'Not Applicable':'Unknown'} — ${item.exception.reason.trim()}`)
 for(const [key,exception]of Object.entries(record?.reportingExceptions||{}))if(!active.has(key)&&['unknown','not_applicable'].includes(exception?.status)&&exception.reason?.trim())lines.push(`Retained exception note${labels.has(key)?' (current value supplied or assessment addressed)':''}: ${labels.get(key)||key} — ${exception.status==='not_applicable'?'Not Applicable':'Unknown'} — ${exception.reason.trim()}`)
 return lines.join('\n')||'No reporting exceptions recorded.'
}
