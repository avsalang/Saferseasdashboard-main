<script setup>
import FieldException from '../../../components/FieldException.vue'
import {MARINA_OPTIONS,getMarinaOptions} from '../../../data/marinaVocabulary.js'
const props=defineProps({definitions:{type:Array,required:true},values:{type:Object,required:true},editable:Boolean,requiredKeys:{type:Array,default:()=>[]},assessment:{type:Object,default:()=>({items:[],unresolved:[],explained:[],ready:true})},exceptions:{type:Object,default:()=>({})}})
const keyFor=field=>'fields.'+field.key
const isRequired=field=>props.requiredKeys.includes(field.key)||props.assessment.items.some(item=>item.key===keyFor(field))
const labelFor=field=>field.label+(isRequired(field)?' *':'')
const levels=[{label:'Less Serious',value:'less_serious'},{label:'Serious',value:'serious'},{label:'Very Serious',value:'very_serious'},{label:'Unknown',value:'unknown'}]
function levelOptions(value){return value!=null&&value!==''&&!levels.some(option=>option.value===value)?[...levels,{label:String(value),value}]:levels}
const multipleTypes=value=>Array.isArray(value)?value:typeof value==='string'?value.split(/,\s*/).filter(Boolean):[]
function setTypes(value){props.values.incidentTypes=Array.isArray(props.values.incidentTypes)?value:value.join(', ')}
function vocabulary(field){return {weatherDescription:'weatherCondition',seaState:'seaCondition'}[field.key]}
</script>
<template><div class="form-grid"><section v-for="f in definitions" :key="f.key" :class="f.type==='textarea'||f.type==='checks'?'span-2':''" :data-requirement-key="keyFor(f)" :data-report-field="f.key">
 <template v-if="f.type==='checks'"><div class="text-weight-medium q-mb-sm">{{labelFor(f)}}</div><p v-if="isRequired(f)" class="text-caption muted q-mb-xs">Select applicable findings or record the assessment evidence. If unavailable or not applicable, explain it here.</p><q-option-group :model-value="Array.isArray(values[f.key])?values[f.key]:[]" @update:model-value="values[f.key]=$event" :options="f.options.map(o=>typeof o==='string'?{label:o,value:o}:o)" type="checkbox" inline :disable="!editable"/></template>
 <q-select v-else-if="f.key==='seriousness'" v-model="values[f.key]" outlined :options="levelOptions(values[f.key])" emit-value map-options :label="labelFor(f)" :readonly="!editable"/>
 <q-select v-else-if="f.key==='incidentTypes'" :model-value="multipleTypes(values[f.key])" @update:model-value="setTypes" outlined multiple use-chips :options="getMarinaOptions('incidentType',multipleTypes(values[f.key]))" :label="labelFor(f)" :readonly="!editable"/>
 <MarinaSelect v-else-if="vocabulary(f)" v-model="values[f.key]" :category="vocabulary(f)" :allow-other="f.key==='weatherDescription'" :label="labelFor(f)" :readonly="!editable"/>
 <q-input v-else v-model="values[f.key]" outlined :type="f.type" :min="f.type==='number'?0:undefined" :step="f.type==='number'?1:undefined" :label="labelFor(f)" :stack-label="['date','time'].includes(f.type)" :autogrow="f.type==='textarea'" :readonly="!editable"/>
 <FieldException :assessment="assessment" :exceptions="exceptions" :field-key="keyFor(f)" :readonly="!editable"/>
 </section></div></template>
<style scoped>.form-grid{min-width:0}.form-grid>section{min-width:0}.form-grid :deep(.q-option-group){display:flex;flex-wrap:wrap;gap:4px 0}.form-grid :deep(.q-checkbox__label){overflow-wrap:anywhere}@media(max-width:599px){.form-grid :deep(.q-checkbox){max-width:100%}}</style>
