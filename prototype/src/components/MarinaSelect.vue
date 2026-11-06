<script setup>
import {computed,ref} from 'vue'
import {getMarinaOptions,SOURCE_REPORTING_MARKERS} from '../data/marinaVocabulary.js'
defineOptions({inheritAttrs:false})
const props=defineProps({modelValue:[String,Number,Array,Object],category:String,options:Array,allowOther:Boolean,multiple:Boolean,label:String,readonly:Boolean,disable:Boolean})
const emit=defineEmits(['update:modelValue']),query=ref(''),typed=ref('')
const options=computed(()=>{
 const values=props.options?[...props.options]:getMarinaOptions(props.category,props.modelValue)
 for(const value of Array.isArray(props.modelValue)?props.modelValue:[props.modelValue])if(value!==null&&value!==undefined&&value!==''&&!values.some(option=>(typeof option==='object'?option.value:option)===value))values.push(value)
 return values
})
const shown=computed(()=>options.value.filter(option=>String(typeof option==='object'?option.label:option).toLowerCase().includes(query.value.toLowerCase())))
function changed(value){typed.value='';emit('update:modelValue',value)}
function commit(){if(!props.allowOther||props.readonly||props.disable)return;const value=typed.value.trim();if(!value)return;typed.value='';query.value='';emit('update:modelValue',props.multiple?[...new Set([...(Array.isArray(props.modelValue)?props.modelValue:[]),value])]:value)}
function filter(value,update){update(()=>query.value=value)}
function optionLabel(option){const value=typeof option==='object'?option.label:option;return SOURCE_REPORTING_MARKERS[props.category]?.includes(value)?`${value} (source reporting marker)`:String(value??'')}
function create(value,done){if(props.allowOther&&value.trim())done(value.trim(),'add-unique');else done()}
</script>
<template><q-select v-bind="$attrs" :model-value="modelValue" @update:model-value="changed" @input-value="typed=$event" @blur="commit" :readonly="readonly" :disable="disable" :label="label" :options="shown" :multiple="multiple" :use-chips="multiple" use-input input-debounce="0" :new-value-mode="allowOther?'add-unique':undefined" :option-label="optionLabel" @filter="filter" @new-value="create" clearable outlined/></template>
