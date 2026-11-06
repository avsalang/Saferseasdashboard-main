<script setup>
defineProps({label:String,caption:String,icon:String,headerClass:[String,Array,Object],dense:Boolean,modelValue:Boolean,defaultOpened:Boolean,group:String,expandIconClass:String,expandSeparator:Boolean})
</script>
<template><section class="static-section">
 <div v-if="$slots.header||label" class="static-section__header q-item row items-center no-wrap" :class="[headerClass,{'q-item--dense':dense}]">
  <slot name="header"><q-icon v-if="icon" :name="icon" size="21px" class="q-mr-sm"/><div class="col"><h3 class="static-section__title">{{label}}</h3><p v-if="caption" class="static-section__caption">{{caption}}</p></div></slot>
 </div>
 <div class="static-section__content"><slot/></div>
</section></template>
<style scoped>.static-section{min-width:0}.static-section__header{min-height:44px;cursor:default}.static-section__title{font:inherit;font-weight:600;color:inherit;margin:0;line-height:1.4}.static-section__caption{font-size:12px;line-height:1.5;color:var(--ss-muted,#64748b);margin:3px 0 0}.static-section__content{min-width:0}</style>
