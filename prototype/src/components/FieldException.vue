<script setup>
import {computed} from 'vue'
const props=defineProps({assessment:Object,exceptions:Object,fieldKey:String,readonly:Boolean})
const item=computed(()=>props.assessment?.items?.find(item=>item.key===props.fieldKey))
const exception=computed(()=>props.exceptions?.[props.fieldKey])
function set(key,value){if(!props.exceptions)return;props.exceptions[props.fieldKey]||={status:'',reason:''};props.exceptions[props.fieldKey][key]=value}
</script>
<template><div v-if="item?.missing&&item.allowException!==false" class="field-exception q-mt-xs" data-testid="field-exception" :data-requirement-key="fieldKey">
 <template v-if="readonly"><p class="text-caption q-mb-xs">{{exception?.status==='not_applicable'?'Not Applicable':'Unknown / not supplied'}}{{exception?.reason?` — ${exception.reason}`:''}}</p></template>
 <template v-else><q-select :model-value="exception?.status||''" @update:model-value="set('status',$event)" :options="[{label:'Unknown — information pending',value:'unknown'},...(item.allowNotApplicable===false?[]:[{label:'Not Applicable',value:'not_applicable'}])]" emit-value map-options dense outlined label="If unavailable" :aria-label="`${item.label} — information status`"/><q-input v-if="exception?.status" :model-value="exception?.reason||''" @update:model-value="set('reason',$event)" outlined dense autogrow type="textarea" label="Reason / source / follow-up *" class="q-mt-xs" :aria-label="`${item.label} — reason`"/></template>
</div></template>
<style scoped>.field-exception{min-width:0}.field-exception :deep(.q-field__control){min-height:36px}.field-exception :deep(.q-field__label){font-size:12px}.field-exception :deep(.q-field__native){font-size:12px}</style>
