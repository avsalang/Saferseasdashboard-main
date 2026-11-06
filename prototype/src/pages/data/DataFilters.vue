<script setup>
import { computed } from 'vue'
import {seriousnessOptions} from '../reporter/fields.js'
import { useDemo } from '../../stores/demo.js'
const store=useDemo()
const props=defineProps({modelValue:{type:Object,required:true}})
const emit=defineEmits(['update:modelValue'])
const values=computed(()=>props.modelValue)
const set=(key,value)=>emit('update:modelValue',{...values.value,[key]:value})
const options=key=>['All',...new Set(store.visibleEvents.value.map(e=>e[key]).filter(Boolean))]
const years=computed(()=>['All',...new Set(store.visibleEvents.value.map(e=>e.date?.slice(0,4)).filter(Boolean))].sort().reverse())
</script>
<template>
 <div class="data-filters panel">
  <q-input outlined dense clearable :model-value="values.search" @update:model-value="set('search',$event)" label="Search selection"><template #prepend><q-icon name="search" /></template></q-input>
  <q-select outlined dense :model-value="values.year || 'All'" @update:model-value="set('year',$event)" :options="years" label="Occurrence year" />
  <q-select outlined dense :model-value="values.type || 'All'" @update:model-value="set('type',$event)" :options="options('type')" label="Type of Incident / Accident" />
  <q-select outlined dense :model-value="values.seriousness || 'All'" @update:model-value="set('seriousness',$event)" :options="options('seriousness').map(value=>({value,label:seriousnessOptions.find(option=>option.value===value)?.label||value}))" emit-value map-options label="Level of Maritime Accident (MARINA)" />
  <q-select outlined dense :model-value="values.aor || 'All'" @update:model-value="set('aor',$event)" :options="options('aor')" label="Area of Responsibility (AOR)" />
  <q-select outlined dense :model-value="values.positionQuality || 'All'" @update:model-value="set('positionQuality',$event)" :options="['All','reported','approximate','unknown']" label="Position Quality" />
  <q-input outlined dense type="date" :model-value="values.dateFrom" @update:model-value="set('dateFrom',$event)" label="From date" stack-label />
  <q-input outlined dense type="date" :model-value="values.dateTo" @update:model-value="set('dateTo',$event)" label="To date" stack-label />
  <q-btn flat no-caps icon="filter_alt_off" label="Clear filters" @click="emit('update:modelValue',{})" />
 </div>
</template>
<style scoped>.data-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}@media(max-width:900px){.data-filters{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:500px){.data-filters{grid-template-columns:1fr}}</style>
