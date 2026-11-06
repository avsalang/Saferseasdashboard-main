<template><q-badge rounded :class="['status-badge','status-'+String(status).toLowerCase().replaceAll(' ','_')]">{{label||display}}</q-badge></template>
<script setup>import{computed}from'vue';const props=defineProps({status:[String,Number],label:String});const display=computed(()=>String(props.status??'Unknown').replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()));</script>
