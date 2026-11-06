<script setup>
import {computed} from 'vue'
import {vesselGroups,vesselFieldHints} from './fields.js'
import {REQUIRED_VESSEL_FIELDS} from '../../data/reportingRequirements.js'
const props=defineProps({model:Object,compact:Boolean,offices:Array,officeChoices:Function,reporting:Boolean,assessment:Object,exceptions:{type:Object,default:()=>({})},referenceValues:{type:Object,default:()=>({})}})
const requiredFields=new Set(REQUIRED_VESSEL_FIELDS)
const basicFields=new Set(['name','type','officialNumber','imoNumber','grossTonnage','registrationStatus'])
const groups=vesselGroups.map(group=>({...group,fields:group.fields.filter(([key])=>!basicFields.has(key))})).filter(group=>group.fields.length)
const categories={type:'shipType',rigType:'rigType',hull:'hullMaterial',sizeClass:'sizeClass',classificationSociety:'classificationSociety',enginePowerUnit:'powerUnit'}
const referenceKeys={flag:['flag','flags'],owner:['owner','owners'],operator:['operator','operators'],operationType:['operationType','operationTypes'],registrationStatus:['registrationStatus','registrationStatuses'],masterName:['masterName','masters'],buildPlace:['buildPlace','buildPlaces'],portOfRegistry:['portOfRegistry','ports'],homeportPlace:['homeportPlace','ports'],propulsionType:['propulsionType','propulsionTypes'],engineMake:['engineMake','engineMakes'],sternType:['sternType','sternTypes']}
const prefix=computed(()=>`vessel:${props.model.reportingKey||props.model.id}:`)
const fieldKey=field=>prefix.value+field
const labelFor=(field,label)=>props.reporting&&requiredFields.has(field)?`${label} *`:label
const groupCaption=group=>props.reporting&&group.fields.some(([key])=>requiredFields.has(key))?'Required reporting particulars are marked *.':'Additional vessel particulars.'
function referenceOptions(field){return [...new Set((referenceKeys[field]||[field]).flatMap(key=>props.referenceValues[key]||[]).map(value=>typeof value==='object'?(value.label??value.name??value.value):value).filter(value=>typeof value==='string'&&value.trim()))]}
</script>
<template>
 <p v-if="reporting" class="text-caption text-blue-grey-6 q-mb-md">Required reporting particulars are marked *. Drafts can be saved while information is being completed.</p>
 <div class="form-grid">
  <div><q-input v-model="model.name" outlined :label="labelFor('name','Name of Ship/Vessel')"/><FieldException v-if="assessment" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey('name')"/></div>
  <div><MarinaSelect v-model="model.type" category="shipType" :allow-other="false" :label="labelFor('type','Type of Ship')" :hint="vesselFieldHints.type"/><FieldException v-if="assessment" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey('type')"/></div>
  <q-input v-model="model.officialNumber" outlined label="Official Number" :hint="reporting?'Provide this or IMO Number. If neither is known, explain the missing identification below.':undefined"/>
  <q-input v-model="model.imoNumber" outlined label="IMO Number" :hint="reporting?'Alternative to Official Number; both identifiers are not required.':undefined"/>
  <FieldException v-if="assessment" class="span-2" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey('identification')"/>
  <div><q-input v-model.number="model.grossTonnage" type="number" step="any" min="0" outlined :label="labelFor('grossTonnage','Gross Tonnage (GT)')" hint="Decimal values accepted; blank means not supplied."/><FieldException v-if="assessment" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey('grossTonnage')"/></div>
  <div><MarinaSelect v-model="model.registrationStatus" category="registrationStatus" :options="referenceOptions('registrationStatus')" allow-other label="Registration Status"/><FieldException v-if="assessment" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey('registrationStatus')"/></div>
 </div>
 <StaticSection v-for="group in groups" :key="group.title" :label="group.title" icon="directions_boat" :caption="groupCaption(group)" class="q-mt-md">
  <div class="form-grid q-pa-md">
   <div v-for="[field,label,type] in group.fields" :key="field">
    <MarinaSelect v-if="['homeport','cpc'].includes(field)" v-model="model[field]" :options="officeChoices?officeChoices(field,model[field]):offices" :allow-other="false" emit-value map-options :label="labelFor(field,label)" :hint="vesselFieldHints[field]"/>
    <MarinaSelect v-else-if="categories[field]" v-model="model[field]" :category="categories[field]" :allow-other="false" :label="labelFor(field,label)" :hint="vesselFieldHints[field]"/>
    <MarinaSelect v-else-if="referenceKeys[field]" v-model="model[field]" :category="['operationType','registrationStatus'].includes(field)?field:undefined" :options="referenceOptions(field)" allow-other :label="labelFor(field,label)" :hint="vesselFieldHints[field]"/>
    <q-input v-else v-model="model[field]" :type="type||'text'" :step="type==='number'?'any':undefined" :min="type==='number'?0:undefined" outlined :label="labelFor(field,label)" :hint="vesselFieldHints[field]"/>
    <FieldException v-if="assessment" :assessment="assessment" :exceptions="exceptions" :field-key="fieldKey(field)"/>
   </div>
  </div>
 </StaticSection>
</template>
