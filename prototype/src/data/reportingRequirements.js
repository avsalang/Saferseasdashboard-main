import {overseasEvents} from './outputPopulation.js'
// Product completion rules derived from supplied MARINA forms/tables, not a claim of statutory obligations.
export const missingReportingValue=value=>value==null||value===''||(typeof value==='number'&&!Number.isFinite(value))||(typeof value==='string'&&(!value.trim()||/^(unknown|unknown\s*\/\s*(not supplied|unlocated|under assessment)|not (yet assessed|established|applicable|available|supplied|recorded|known)|pending verification|under assessment|n\s*\/\s*a|—|-)$/i.test(value.trim())))||(Array.isArray(value)&&!value.length)
export function assessRequirements(definitions,exceptions={}){
 const items=definitions.map(definition=>{
  const missing=definition.missing??missingReportingValue(definition.value),exception=exceptions?.[definition.key]
  const explained=missing&&definition.allowException!==false&&['unknown',...(definition.allowNotApplicable===false?[]:['not_applicable'])].includes(exception?.status)&&!!exception?.reason?.trim()
  return {...definition,missing,exception,status:missing?(explained?'explained':'missing'):'complete'}
 })
 return {items,unresolved:items.filter(item=>item.status==='missing'),explained:items.filter(item=>item.status==='explained'),ready:items.every(item=>item.status!=='missing')}
}
const read=(object,path)=>path.split('.').reduce((value,key)=>value?.[key],object)
const rule=(key,label,value,step,outputs,extra={})=>({key,label,value,step,outputs,allowException:true,allowNotApplicable:false,...extra})
const eventFields=[
 ['date','Date of Incident / Accident',1,['O01','O02','O03','O04','O05','O06','O11','O12','O14','O15','O16','O17','O18','O21']],
 ['time','Time of Incident / Accident',1,['O01','O15','O16','O17','O18']],
 ['type','Type of Incident / Accident — Initial Event',1,['O01','O02','O15','O16','O17','O18','O21']],
 ['seriousness','Level of Maritime Accident (MARINA)',1,['O01','O06','O12','O16','O18']],
 ['place','Location of Incident / Accident',1,['O01','O15','O16','O17','O18','O20'],{allowException:false}],
 ['aor','Area of Responsibility (AOR)',1,['O01','O03','O12']],
 ['summary','Narrative of Events Leading to the Accident',4,['O01','O15','O16','O18'],{allowException:false}],
 ['initialActions','Initial Actions Taken',4,['O01','O15','O16','O17']],
 ['sourceType','Source of Information — Type',6,['O15','O16','O17','O18']],
 ['sourceRef','Source of Information — Reference',6,['O01','O15','O16','O17','O18']],
 ['reportingAuthority','Reporting Authority / Organization',6,['O15','O16','O17','O18']],
 ['receivedDate','Date Received',6,['O15','O16','O17','O18']],
 ...[['fatalities','Fatalities'],['missing','Missing Persons'],['injured','Injured Persons'],['rescued','Survivors / Rescued Persons'],['crew','Number of Crew'],['passengers','Number of Passengers'],['totalOnboard','Total Persons on Board'],['shipCondition','Ship Condition'],['pollution','Oil / Chemical Pollution — Substance']].map(([key,label])=>[`consequences.${key}`,label,['crew','passengers','totalOnboard'].includes(key)?3:5,['O01','O11','O15','O16','O17','O18'],{allowNotApplicable:key==='pollution'}])
]
const vesselFields=[
 ['name','Name of Ship/Vessel',['O01','O04','O05','O07','O12','O15','O16','O17','O18'],{allowException:false}],
 ['type','Type of Ship',['O01','O05','O11','O12']],['rigType','Rig Type',['O01']],
 ['flag','Flag State',['O01','O19']],['grossTonnage','Gross Tonnage (GT)',['O01','O12']],['yearBuilt','Year Built',['O01','O12']],
 ['owner','Registered Owner / Company',['O01','O12','O16','O18']],['operator','Operator',['O01','O12','O16','O18']],
 ['homeport','Homeport Office',['O01','O04']],['cpc','CPC Issuing Office',['O01','O09'],{allowNotApplicable:true}],
 ['hull','Hull Material',['O01','O07']],['sizeClass','Size Classification',['O01','O07']],['classificationSociety','Classification Society',['O01','O07'],{allowNotApplicable:true}]
]
export const REQUIRED_VESSEL_FIELDS=vesselFields.map(([field])=>field)
export const REPORT_OUTPUT_NAMES={O01:'Annual Master List',O02:'Monthly Incident / Accident Summary',O03:'AOR Matrix',O04:'Homeport Matrix',O05:'Ship Type Matrix',O06:'Maritime Accident Level Matrix',O07:'Hull / Size / Classification Matrices',O08:'Case Outcomes',O09:'SCO Summary',O10:'SCO / Case Register',O11:'Human and Ship Consequences',O12:'GT / Age / Company Figures',O13:'MAIC Report Receipt Summary',O14:'Cross-Year Comparison',O15:'Spot Report',O16:'MAIC Form 1B',O17:'MAIC Form 2',O18:'MAIC Form 3B',O19:'Overseas Persons Register',O20:'Incident Map',O21:'Statistical Figures',O22:'Data Quality Report'}
export function mergeReportingAssessments(...assessments){const items=assessments.flatMap(assessment=>assessment?.items||[]);return {items,unresolved:items.filter(item=>item.status==='missing'),explained:items.filter(item=>item.status==='explained'),ready:items.every(item=>item.status!=='missing')}}
export function reportingAssessmentMetadata(assessment){return {'Reporting Completeness':assessment.ready?(assessment.explained.length?'Required information addressed — declared exceptions':'Required information addressed'):'INCOMPLETE WORKING COPY','Unresolved Required Fields':assessment.unresolved.length,'Declared Unknown / Not Applicable':assessment.explained.length,'Required Information Outstanding':assessment.unresolved.map(item=>`${item.eventRef||item.eventId||''} · ${item.label}`).join('\n')||'None','Declared Reporting Exceptions':assessment.explained.map(item=>`${item.eventRef||item.eventId||''} · ${item.label}: ${item.exception?.status} — ${item.exception?.reason}`).join('\n')||'None'}}
const reviewFields=[['recommendations','Recommendations',5,['O01','O16','O18']],['potentialCauses','Potential Causes — Preliminary',4,['O01']],['consequences.observedAt','Casualty Information As Of',5,['O11']],['environment.waveHeightM','Wave Height (m)',3,['O16','O18']],['environment.windForce','Wind Force (Beaufort)',3,['O16','O18']],['environment.visibility','Visibility',3,['O16','O18']],['environment.weatherDescription','Weather Condition',3,['O16','O18']],['environment.seaState','Sea Condition',3,['O18']],['environment.observedAt','Environmental Observation Date/Time',3,['O16','O18']],['environment.source','Environmental Information — Source',3,['O16','O18']]]
export const caseOfficeRequirement=event=>rule('caseOffice','CPC / Homeport Reporting Office for Case Summary',event.cpc||event.homeport,1,['O09'])
export function incidentRequirements(event,{stage='submission',hasCases=false}={}){
 const fields=stage==='review'?[...eventFields,...reviewFields]:eventFields
 const result=fields.map(([key,label,step,outputs,extra])=>rule(key,label,(key==='date'&&event.dateUnknown)||(key==='time'&&event.timeUnknown)?null:read(event,key),step,outputs,extra))
 if(hasCases)result.push(caseOfficeRequirement(event))
 const located=event.positionQuality!=='unknown'&&event.lat!==''&&event.lon!==''&&event.lat!=null&&event.lon!=null&&Number.isFinite(Number(event.lat))&&Number.isFinite(Number(event.lon))&&Math.abs(Number(event.lat))<=90&&Math.abs(Number(event.lon))<=180
 result.push(rule('position','Position of Accident — Latitude and Longitude',located?[event.lat,event.lon]:null,1,['O15','O16','O17','O18','O20']))
 if(!event.vessels?.length)result.push(rule('vessels','Involved Ship(s)/Vessel(s)',null,2,['O01','O15','O16'],{allowException:false}))
 for(const [index,vessel] of (event.vessels||[]).entries()){
  const vesselKey=vessel.reportingKey||vessel.id||`new-${index}`,prefix=`vessel:${vesselKey}:`,suffix=` · ${vessel.name||`Vessel ${index+1}`}`
  for(const [field,label,outputs,extra] of vesselFields)result.push(rule(prefix+field,label+suffix,vessel[field],2,outputs,{...extra,field,vesselKey,vesselIndex:index}))
  result.push(rule(prefix+'identification','Official Number / IMO Number'+suffix,[vessel.officialNumber,vessel.imoNumber].find(value=>!missingReportingValue(value)),2,['O01','O15','O16','O17','O18'],{field:'identification',vesselKey}))
 }
 return result
}
export const assessIncident=(event,options)=>assessRequirements(incidentRequirements(event,options),event.reportingExceptions)
export function describeReportingExceptions(record,definitions){
 const assessment=assessRequirements(definitions||incidentRequirements(record||{}, {stage:'review',hasCases:!!record?.reportingExceptions?.caseOffice}),record?.reportingExceptions)
 return assessment.explained.map(item=>`${item.label}: ${item.exception.status==='not_applicable'?'Not Applicable':'Unknown'} — ${item.exception.reason.trim()}`).join('\n')||'No reporting exceptions recorded.'
}
const outputKeys={O02:{event:['date','type']},O03:{event:['date','aor']},O04:{event:['date'],vessel:['homeport']},O05:{event:['date'],vessel:['type']},O06:{event:['date','seriousness']},O07:{event:['date'],vessel:['hull','sizeClass','classificationSociety']},O11:{event:['date','consequences.fatalities','consequences.missing','consequences.injured','consequences.rescued','consequences.crew','consequences.passengers','consequences.totalOnboard','consequences.shipCondition','consequences.observedAt'],vessel:['type']},O12:{event:['date','seriousness','aor'],vessel:['grossTonnage','yearBuilt','owner']},O14:{event:['date','type','seriousness','aor','consequences.fatalities','consequences.missing','consequences.injured','consequences.rescued','consequences.crew','consequences.passengers'],vessel:['type']},O19:{event:['date','consequences.crew','consequences.passengers']},O20:{event:['position']},O21:{event:['date','type']}}
export function assessOutput(outputId,events,state={}){
 if(['O08','O09','O10','O13','O22'].includes(outputId))return {items:[],unresolved:[],explained:[],ready:true}
 const items=[]
 for(const event of outputId==='O19'?overseasEvents(events):events){
  const keys=outputKeys[outputId]
  const definitions=incidentRequirements(event,{stage:'review'}).filter(item=>keys?(item.field?keys.vessel?.includes(item.field):keys.event?.includes(item.key)):item.outputs.includes(outputId))
  if(outputId==='O12')for(const item of definitions.filter(item=>item.field==='owner')){const vessel=event.vessels?.[item.vesselIndex];item.value=vessel?.operator||vessel?.owner;item.label='Owner / Operator — Company';}
  if(outputId==='O04')for(const item of definitions.filter(item=>item.field==='homeport'))item.value=event.vessels?.[item.vesselIndex]?.homeport||event.homeport
  for(const item of assessRequirements(definitions,event.reportingExceptions).items)items.push({...item,eventId:event.id,eventRef:event.ref||event.id})
 }
 return {items,unresolved:items.filter(item=>item.status==='missing'),explained:items.filter(item=>item.status==='explained'),ready:items.every(item=>item.status!=='missing')}
}
