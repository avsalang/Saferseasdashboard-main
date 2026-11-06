import {MARINA_OPTIONS,canonicalMarinaValue} from './marinaVocabulary.js'
const roman={1:'I',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII',13:'XIII'}
export const MARINA_OFFICES=MARINA_OPTIONS.office.map(code=>({id:code==='MRO-NCR'?'MRO-NCR':`MRO-${roman[Number(code.match(/\d+/)?.[0])]}`,code,name:`MARINA Regional Office ${code==='MRO-NCR'?'NCR':roman[Number(code.match(/\d+/)?.[0])]}`,active:true}))
export function ensureMarinaOffices(state){
 state.offices||=[]
 for(const office of MARINA_OFFICES)if(!state.offices.some(item=>item.id===office.id))state.offices.push({...office})
 // A source summary grouping is retained, never silently equated to the source's MRO 1 office.
 const legacy=state.offices.find(office=>office.id==='MRO-I-II');if(legacy)legacy.sourceGrouping=true
 return state
}
export const OFFICE_REPORTING_MARKERS={homeport:['Foreign Flag','Unregistered'],cpc:['Foreign Flag','Unregistered','N/A','NONE'],aor:['INTERNATIONAL'],issuingOffice:[]}
export function marinaOfficeOptions(offices,current=[],role){
 const values=Array.isArray(current)?current:[current]
 const options=offices.filter(office=>(office.active!==false&&!office.sourceGrouping)||values.includes(office.id)).map(office=>({value:office.id,label:office.sourceGrouping?'MRO I & II — retained summary grouping':canonicalMarinaValue('office',office.code||office.id)}))
 for(const value of OFFICE_REPORTING_MARKERS[role]||[])options.push({value,label:value})
 for(const value of values.filter(value=>typeof value==='string'&&value.trim()))if(!options.some(option=>option.value===value))options.push({value,label:`${value} (saved value)`})
 return options
}
