<template>
  <router-view v-if="route.meta.authPage"/>
  <component v-else :is="isReporter?ReporterLayout:AdminLayout"/>
  <q-banner v-if="store.state.persistenceError" class="storage-warning bg-amber-2 text-dark" role="alert">{{store.state.persistenceError}}<template #action><q-btn flat label="Retry saving" @click="store.persist()"/></template></q-banner>
</template>
<script setup>
import{computed,watch}from'vue';import{useRoute,useRouter}from'vue-router';import{useQuasar}from'quasar';import{useDemo}from'./stores/demo.js';import AdminLayout from'./layouts/AdminLayout.vue';import ReporterLayout from'./layouts/ReporterLayout.vue';
const store=useDemo(),route=useRoute(),router=useRouter(),$q=useQuasar(),isReporter=computed(()=>store.currentUser.value?.role==='reporter'&&!route.path.startsWith('/admin'));
$q.dark.set(store.state.settings.appearance==='dark');watch(()=>store.currentUser.value,u=>{if(!u&&!route.meta.authPage)router.replace('/login')});watch(()=>route.fullPath,()=>document.title=(route.meta.title||'SAFERSEAS')+' · SAFERSEAS');
</script>
<style>.storage-warning{position:fixed;bottom:12px;left:12px;right:12px;z-index:9000;box-shadow:0 4px 20px #0003}</style>
