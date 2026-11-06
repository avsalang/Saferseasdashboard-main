<script setup>
import {REPORT_OUTPUT_NAMES} from '../data/reportingRequirements.js'
defineProps({assessment:{type:Object,required:true},exceptions:{type:Object,required:true},readonly:Boolean,title:{type:String,default:'Required Reporting Information'}})
const emit=defineEmits(['navigate'])
function entry(exceptions,key){return exceptions[key]||(exceptions[key]={status:'',reason:''})}
</script>
<template><section class="required-information q-mt-md" data-testid="required-information">
 <q-expansion-item :label="`${title} · ${assessment.unresolved.length} to complete`" icon="checklist" :default-opened="assessment.unresolved.length>0&&!readonly" header-class="text-weight-bold">
  <div class="q-pa-md"><p class="text-caption">Required fields need a value. If information is unavailable, select Unknown or Not Applicable where allowed and explain why. Drafts can be saved at any time.</p>
   <q-banner v-if="assessment.ready" dense class="bg-green-1 text-positive">Required information addressed{{assessment.explained.length?` · ${assessment.explained.length} explained exception(s)`:''}}.</q-banner>
   <section v-for="item in assessment.items.filter(item=>item.missing)" :key="item.key" class="requirement-row q-py-md">
    <div class="row items-center q-gutter-sm"><strong class="col">{{item.label}} *</strong><q-badge :color="item.status==='explained'?'orange-8':'negative'">{{item.status==='explained'?'Explained':'Required'}}</q-badge><q-btn v-if="item.step&&!readonly" flat dense no-caps color="primary" label="Go to field" @click="emit('navigate',item)"/></div>
    <div class="text-caption text-grey-7 q-mb-sm">Needed for {{item.outputs?.slice(0,3).map(id=>REPORT_OUTPUT_NAMES[id]||id).join(', ')||'the selected report'}}{{item.outputs?.length>3?' and other MARINA reports':''}}.</div>
    <div v-if="item.allowException!==false" class="requirement-controls"><q-select :model-value="exceptions[item.key]?.status||''" @update:model-value="entry(exceptions,item.key).status=$event" :options="[{label:'Unknown — information pending',value:'unknown'},...(item.allowNotApplicable===false?[]:[{label:'Not Applicable',value:'not_applicable'}])]" emit-value map-options outlined dense label="Information status" :disable="readonly"/><q-input :model-value="exceptions[item.key]?.reason||''" @update:model-value="entry(exceptions,item.key).reason=$event" outlined dense autogrow type="textarea" label="Reason / source / follow-up needed *" :readonly="readonly"/></div>
    <p v-else class="text-negative text-caption q-mb-none">Enter this information in the form before continuing.</p>
   </section>
  </div>
 </q-expansion-item>
</section></template>
<style scoped>.required-information{border:1px solid #cbd5e1;border-radius:8px;background:var(--ss-card,#fff)}.requirement-row+.requirement-row{border-top:1px solid #e2e8f0}.requirement-controls{display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:12px}@media(max-width:700px){.requirement-controls{grid-template-columns:1fr}}</style>
