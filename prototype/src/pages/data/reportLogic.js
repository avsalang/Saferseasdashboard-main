import { maicGroups,initialFields } from '../operations/maic.js'

const text=value=>value==null||value===''?'Unknown':Array.isArray(value)?value.length?value.join('; '):'Unknown / no selection recorded':typeof value==='object'?JSON.stringify(value,null,2):String(value)
export function selectReportRevision({event,report,evidenceRecords=[]}) {
 const saved=report?.type==='spot'?report.fields||{}:null
 const outputEvent=saved?{ref:event.ref,officeId:event.officeId,...saved,id:event.id,vessels:saved.vessels||[],consequences:saved.consequences||{}}:event
 const ids=report?(report.evidenceIds||[]):(event.evidenceIds||[])
 return {event:outputEvent,report,evidence:ids.map(id=>evidenceRecords.find(item=>item.id===id&&item.eventId===event.id)).filter(Boolean)}
}
export function buildMAICSections({type,event,report,preparedBy,asOf,evidence=[]}) {
 const fields={...initialFields(event),...(report?.fields||{})}
 const groups=maicGroups.filter(group=>group.stages.includes(type))
 const knownKeys=new Set(groups.flatMap(group=>group.fields.map(field=>field.key)))
 const sections=[{title:'Report identification and observation',content:`Event: ${text(event.ref)}\nReport: ${text(type)}\nRevision: ${report?.revision??'No saved report revision'}\nStatus: ${report?.status??'Reference preview'}\nReport date: ${text(report?.date)}\nObservation / as-of: ${text(report?.asOf||asOf)}`}]
 for(const group of groups)sections.push({title:group.title,content:group.fields.map(field=>{
   let value=fields[field.key]
   if(field.type==='checks'&&Array.isArray(value)&&value.length)value=value.map(code=>{const option=field.options?.find(option=>(typeof option==='string'?option:option.value)===code);return typeof option==='string'?option:option?.label||code})
   return `${field.label}:\n${text(value)}`
 }).join('\n\n')})
 sections.push({title:'Prepared / noted by',content:`Prepared by: ${text(report?.preparedBy||preparedBy)}\nDesignation: ${text(report?.designation)}\nNoted by: ${report?.notedBy||'Not signed'}\nNoted date: ${text(report?.notedDate)}\nSubmitting office: ${text(event.officeId)}`})
 const extras=Object.entries(report?.fields||{}).filter(([key])=>!knownKeys.has(key))
 if(extras.length)sections.push({title:'Additional retained report fields',content:extras.map(([key,value])=>`${key}:\n${text(value)}`).join('\n\n')})
 sections.push({title:'Evidence appendix',content:evidence.length?evidence.map(item=>`${text(item.type)} · ${text(item.name)} · ${text(item.sourceRef)}\n${text(item.notes)}`).join('\n\n'):'No evidence metadata supplied.'})
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
