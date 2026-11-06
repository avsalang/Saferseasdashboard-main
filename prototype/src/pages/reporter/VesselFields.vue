<script setup>
import { vesselGroups } from './fields.js'
defineProps({model:Object,compact:Boolean,offices:Array})
</script>
<template>
  <div class="form-grid">
    <q-input v-model="model.name" outlined label="Vessel name *" />
    <q-input v-model="model.type" outlined label="Vessel / service type" />
    <q-input v-model="model.officialNumber" outlined label="Official number" />
    <q-input v-model="model.imoNumber" outlined label="IMO number" />
    <q-input v-model.number="model.grossTonnage" type="number" step="any" min="0" outlined label="Gross tonnage (GT)" hint="Decimal values accepted; leave blank if unknown" />
    <q-input v-model="model.registrationStatus" outlined label="Registration status" />
  </div>
  <q-expansion-item v-for="group in vesselGroups" :key="group.title" :label="group.title" icon="directions_boat" :default-opened="!compact" class="q-mt-sm">
    <div class="form-grid q-pa-md">
      <template v-for="[field,label,type] in group.fields" :key="field">
        <q-select v-if="['homeport','cpc'].includes(field)" v-model="model[field]" :options="offices" emit-value map-options outlined clearable :label="label" />
        <q-input v-else v-model="model[field]" :type="type || 'text'" :step="type==='number' ? 'any' : undefined" :min="type==='number' ? 0 : undefined" outlined :label="label" />
      </template>
    </div>
  </q-expansion-item>
</template>
