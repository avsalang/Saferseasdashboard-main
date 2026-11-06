<script setup>
import { vesselGroups, vesselFieldHints } from './fields.js'
import { REQUIRED_VESSEL_FIELDS } from '../../data/reportingRequirements.js'
const props=defineProps({model:Object,compact:Boolean,offices:Array,reporting:Boolean})
const requiredFields=new Set(REQUIRED_VESSEL_FIELDS)
const basicFields=new Set(['name','type','officialNumber','imoNumber','grossTonnage','registrationStatus'])
const optionalGroups=vesselGroups.map(group=>({...group,fields:group.fields.filter(([key])=>!basicFields.has(key))})).filter(group=>group.fields.length)
const labelFor=(field,label)=>props.reporting&&requiredFields.has(field)?`${label} *`:label
const groupCaption=group=>props.reporting&&group.fields.some(([key])=>requiredFields.has(key))?'Includes required reporting particulars (*) · open to complete':props.reporting?'Additional particulars · open to view or update':'Optional particulars · open to view or update'
</script>
<template>
  <p v-if="reporting" class="text-caption text-blue-grey-6 q-mb-md">Required reporting particulars are marked *. Drafts can be saved while information is being completed.</p>
  <div class="form-grid">
    <q-input v-model="model.name" outlined :label="labelFor('name','Name of Ship/Vessel')" />
    <q-input v-model="model.type" outlined :label="labelFor('type','Type of Ship')" :hint="vesselFieldHints.type" />
    <q-input v-model="model.officialNumber" outlined label="Official Number" :hint="reporting?'Provide Official Number or IMO Number; if neither is known, explain unknown identification in Required Reporting Information.':undefined" />
    <q-input v-model="model.imoNumber" outlined label="IMO Number" :hint="reporting?'Alternative to Official Number; both identifiers are not required.':undefined" />
    <q-input v-model.number="model.grossTonnage" type="number" step="any" min="0" outlined :label="labelFor('grossTonnage','Gross Tonnage (GT)')" hint="Decimal values accepted; leave blank if unknown" />
    <q-input v-model="model.registrationStatus" outlined label="Registration Status" />
  </div>
  <q-expansion-item v-for="group in optionalGroups" :key="group.title" :label="group.title" icon="directions_boat" :caption="groupCaption(group)" class="q-mt-sm">
    <div class="form-grid q-pa-md">
      <template v-for="[field,label,type] in group.fields" :key="field">
        <q-select v-if="['homeport','cpc'].includes(field)" v-model="model[field]" :options="offices" emit-value map-options outlined clearable :label="labelFor(field,label)" :hint="vesselFieldHints[field]" />
        <q-input v-else v-model="model[field]" :type="type || 'text'" :step="type==='number' ? 'any' : undefined" :min="type==='number' ? 0 : undefined" outlined :label="labelFor(field,label)" :hint="vesselFieldHints[field]" />
      </template>
    </div>
  </q-expansion-item>
</template>
