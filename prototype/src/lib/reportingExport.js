import {reportingAssessmentMetadata} from '../data/reportingRequirements.js'
export async function confirmReportingExport(q,assessment){
 if(assessment.ready)return true
 return new Promise(resolve=>q.dialog({title:'Incomplete Working Copy',message:`${assessment.unresolved.length} required reporting field(s) remain unresolved. Complete the records, or download a clearly identified working copy.`,cancel:true,persistent:true,ok:{label:'Download working copy',color:'primary'}}).onOk(()=>resolve(true)).onCancel(()=>resolve(false)).onDismiss(()=>resolve(false)))
}
export function reportingExportRows(rows,assessment){const metadata=reportingAssessmentMetadata(assessment);return rows.map(row=>({...row,'Reporting Completeness':metadata['Reporting Completeness'],'Required Information Outstanding':metadata['Required Information Outstanding'],'Declared Reporting Exceptions':metadata['Declared Reporting Exceptions']}))}
