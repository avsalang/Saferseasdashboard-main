<template><header class="page-heading row items-center q-mb-lg"><div><q-breadcrumbs class="breadcrumbs q-mb-md"><q-breadcrumbs-el label="Dashboard" icon="home" :to="home"/><q-breadcrumbs-el :label="eyebrow||title"/></q-breadcrumbs><h1 class="page-title">{{title}}</h1><p v-if="subtitle" class="page-sub">{{subtitle}}</p></div><div class="heading-actions"><slot name="actions"/></div></header></template>
<script setup>import{computed}from'vue';import{useDemo}from'../stores/demo.js';defineProps({title:String,subtitle:String,eyebrow:String});const store=useDemo(),home=computed(()=>store.currentUser.value?.role==='reporter'?'/reporter':'/admin')</script>
<style scoped>
/* Reused from SAFERSEAS Dashboard/HomePage/IndexPage.vue. */
.breadcrumbs{font-size:12px;color:#6b7280}.breadcrumbs :deep(a){color:#378add;text-decoration:none}.breadcrumbs :deep(.q-breadcrumbs__separator){color:#9ca3af}
.page-title{font-size:22px;font-weight:500;color:#111827;line-height:1.2;letter-spacing:normal}.page-sub{font-size:13px;color:#6b7280;margin-top:3px;margin-bottom:0}
</style>
