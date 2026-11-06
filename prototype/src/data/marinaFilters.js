import {getMarinaOptions,canonicalMarinaValue} from './marinaVocabulary.js'
import {marinaOfficeOptions} from './marinaOffices.js'
const levels={less_serious:'Less Serious',serious:'Serious',very_serious:'Very Serious',unknown:'Unknown / not yet assessed'}
export function marinaFilterOptions(key,events,offices=[]){
 const observed=events.flatMap(event=>key==='year'?[event.dateUnknown?null:event.date?.slice(0,4)]:key==='vesselType'?(event.vessels||[]).map(vessel=>vessel.type):[event[key]]).filter(value=>value!==null&&value!==undefined&&value!=='')
 let choices
 if(key==='type'||key==='vesselType'){const category=key==='type'?'incidentType':'shipType';choices=getMarinaOptions(category,observed.map(value=>canonicalMarinaValue(category,value))).map(value=>({value,label:value}))}
 else if(['aor','homeport','cpc','issuingOffice'].includes(key)){const mapped=marinaOfficeOptions(offices,observed,key).map(option=>{const value=canonicalMarinaValue('office',option.value);return {value,label:value}});choices=[...new Map(mapped.map(option=>[option.value,option])).values()]}
 else if(key==='seriousness')choices=[...new Set(['less_serious','serious','very_serious',...observed])].map(value=>({value,label:levels[value]||value}))
 else if(key==='positionQuality')choices=[{value:'reported',label:'Reported position'},{value:'approximate',label:'Approximate position'},{value:'unknown',label:'Unknown / unlocated'}]
 else choices=[...new Set(observed)].sort().reverse().map(value=>({value,label:String(value)}))
 return [{value:'All',label:'All'},...choices]
}
