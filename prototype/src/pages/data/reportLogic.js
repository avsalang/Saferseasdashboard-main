import {describeEnvironmentField} from '../../data/incidentWeather.js'
import { maicGroups,initialFields,initializeFields } from '../operations/maic.js'

const text=value=>value==null||value===''?'Unknown':Array.isArray(value)?value.length?value.join('; '):'Unknown / no selection recorded':typeof value==='object'?JSON.stringify(value,null,2):String(value)
export function selectReportRevision({event,report,evidenceRecords=[]}) {
 const saved=report?.type==='spot'?report.fields||{}:null
 const outputEvent=saved?{ref:event.ref,officeId:event.officeId,...saved,id:event.id,vessels:saved.vessels||[],consequences:saved.consequences||{}}:event
 const ids=report?(report.evidenceIds||[]):(event.evidenceIds||[])
 return {event:outputEvent,report,evidence:ids.map(id=>evidenceRecords.find(item=>item.id===id&&item.eventId===event.id)).filter(Boolean)}
}
export function buildMAICSections({type,event,report,preparedBy,asOf,evidence=[]}) {
 // A saved revision is its own snapshot. Missing legacy keys stay unknown rather than borrowing later live facts.
 const fields=report?initializeFields(JSON.parse(JSON.stringify(report.fields||{}))):initialFields(event)
 if(!Object.hasOwn(fields,'occurrenceNarrative')&&Object.hasOwn(fields,'narrative'))fields.occurrenceNarrative=fields.narrative
 const groups=maicGroups.filter(group=>group.stages.includes(type))
 const knownKeys=new Set(groups.flatMap(group=>group.fields.map(field=>field.key)))
 const sections=[{title:'Report identification and observation',content:`Event: ${text(event.ref)}\nReport: ${text(type)}\nRevision: ${report?.revision??'No saved report revision'}\nStatus: ${report?.status??'Reference preview'}\nReport date: ${text(report?.date)}\nObservation / as-of: ${text(report?.asOf||asOf)}`}]
 for(const group of groups)sections.push({title:group.title,content:group.fields.map(field=>{
   let value=fields[field.key]
   if(field.type==='checks'&&Array.isArray(value)&&value.length)value=value.map(code=>{const option=field.options?.find(option=>(typeof option==='string'?option:option.value)===code);return typeof option==='string'?option:option?.label||code})
   return `${field.label}:\n${text(value)}`
 }).join('\n\n')})
 sections.push({title:'Prepared / noted by',content:`Prepared by: ${text(report?.preparedBy||preparedBy)}\nDesignation: ${text(report?.designation)}\nNoted by: ${report?.notedBy||'Not signed'}\nNoted date: ${text(report?.notedDate)}\nSubmitting office: ${text(event.officeId)}`})
 const extras=Object.entries(report?.fields||event.maicFields||{}).filter(([key])=>!knownKeys.has(key))
 if(extras.length)sections.push({title:'Additional retained report fields',content:extras.map(([key,value])=>`${key}:\n${text(value)}`).join('\n\n')})
 sections.push({title:'Evidence appendix',content:evidence.length?evidence.map(item=>`${text(item.type)} · ${text(item.name)} · ${text(item.sourceRef)}\n${text(item.notes)}`).join('\n\n'):'No evidence metadata supplied.'})
 return sections
}

export function buildSpotSections({event,report,preparedBy,evidence=[]}) {
 // The spot baseline remains distinct from separately supplied MAIC-specific assessments.
 const fields=initialFields({...event,maicFields:undefined})
 const fieldDefinitions=new Map(maicGroups.flatMap(group=>group.fields).map(field=>[field.key,field]))
 const explicitExtras=Object.entries(event.maicFields||{})
 const extraValue=(key,value)=>{const field=fieldDefinitions.get(key);if(field?.type==='checks'&&Array.isArray(value))return value.map(code=>{const option=field.options?.find(o=>(typeof o==='string'?o:o.value)===code);return typeof option==='string'?option:option?.label||code});return value}
 const sections=[
  {title:'Occurrence and source',content:`Reference: ${text(event.ref)}\nOccurrence: ${event.dateUnknown?'Unknown date':text(event.date)} ${event.timeUnknown?'Unknown time':text(event.time)}\nPlace: ${text(event.place)}\n${text(event.summary)}\nSource: ${text(fields.informationSources)}`},
  {title:'Involved vessels',content:(event.vessels||[]).map(v=>`${text(v.name)} · ${text(v.type)} · Official ${text(v.officialNumber)} · IMO ${text(v.imoNumber)} · GT ${text(v.grossTonnage)}\nPort of registry (place): ${text(v.portOfRegistry)}\nHomeport (place): ${text(v.homeportPlace)} · Homeport office: ${text(v.homeport)} · CPC office: ${text(v.cpc)}\nOwner: ${text(v.owner)} · Operator: ${text(v.operator)}\nPropulsion type: ${text(v.propulsionType)}`).join('\n\n')||'No involved vessel particulars supplied.'},
  {title:'Occurrence timeline and crew response',content:`Reported timeline:\n${text(event.timeline)}\n\nReported crew response:\n${text(event.crewResponse)}\n\nReported crew behavior factors:\n${text(event.crewFactors)}`},
  {title:'Reported causes, findings and damage',content:`Preliminary potential causes — not established findings:\n${text(event.potentialCauses)}\n\nReported findings of cause — as supplied:\n${text(event.findingsOfCause)}\n\nReported damage types:\n${text(event.damageTypes)}`},
  {title:'Human and vessel consequences',content:JSON.stringify(event.consequences||{},(_key,value)=>value==null?'Unknown':value,2)},
  {title:'Consequence observation and source',content:`Observed as of (local): ${text(event.consequences?.observedAt)}\nSource / clarification: ${text(event.consequences?.notes)}`},
  {title:'Initial actions, rescue and recovery',content:`Initial actions:\n${text(event.initialActions)}\n\nRescue / recovery:\n${text(event.rescueRecovery)}`},
  {title:'Certificates and inspection records',content:text(event.certificates)},
  {title:'Recorded environment and value sources',content:`Environment observed as of (local): ${text(event.environment?.observedAt)}\nWave height (m): ${describeEnvironmentField(event.environment||{},'waveHeightM')}\nWind force: ${describeEnvironmentField(event.environment||{},'windForce')}\nVisibility / unit: ${describeEnvironmentField(event.environment||{},'visibility')}\nWeather description: ${describeEnvironmentField(event.environment||{},'weatherDescription')}\nSea state: ${describeEnvironmentField(event.environment||{},'seaState')}\nCurrent / tide: ${describeEnvironmentField(event.environment||{},'currentTide')}\nEntered / reported environment source notes:\n${text(fields.environmentSource)}`},
  {title:'Modelled environmental lookup — reference only',content:text(fields.modelledEnvironmentLookup)},
  {title:'Recommendations',content:text(event.recommendations)},
  {title:'Source and document provenance',content:`Reporting authority: ${text(event.reportingAuthority)}\nSource notes:\n${text(event.sourceNotes)}\nDocument notes:\n${text(event.documentNotes)}`},
  {title:'Prepared by / submitting office',content:`Prepared by: ${text(report?.preparedBy||preparedBy)}\nOffice: ${text(event.officeId)}\nRevision: ${report?.revision??'No saved report revision'}`},
 ]
 if(explicitExtras.length)sections.push({title:'Additional MAIC fields supplied with the spot report',content:explicitExtras.map(([key,value])=>`${fieldDefinitions.get(key)?.label||key}:\n${text(extraValue(key,value))}`).join('\n\n')})
 sections.push({title:'Preserved spot fields and evidence appendix',content:JSON.stringify({fields:report?.fields||event,evidence},(_key,value)=>value==null?'Unknown':value,2)})
 return sections
}

export function toggleImportExclusion(row) {
 if(row.status==='excluded') {
  row.status=row.statusBeforeExclusion||'ready'
  row.error=row.unknownAccepted?'':row.errorBeforeExclusion||row.error||''
  if(row.error)row.status='needs_review'
 }else{
  row.statusBeforeExclusion=row.status
  row.errorBeforeExclusion=row.error||''
  row.status='excluded'
 }
 return row
}
