<script setup>
defineProps({tasks:{type:Array,required:true},selected:String})
defineEmits(['select'])
</script>
<template><div class="row q-col-gutter-md"><div class="col-6 col-md-3" v-for="(task,index) in tasks" :key="task.id"><q-card flat class="bg-surface rounded-xl p-6 border-outline-variant hover-shadow-primary task-card" :class="{'task-selected':selected===task.id}" tabindex="0" role="button" :aria-label="`${task.label}: ${task.count}`" @click="$emit('select',task.id)" @keydown.enter="$emit('select',task.id)" @keydown.space.prevent="$emit('select',task.id)"><div class="row items-center justify-between q-mb-md"><div class="icon-wrapper flex flex-center rounded-lg" :class="index===0?'bg-surface-container-low icon-navy':index===1?'bg-blue-light text-blue-icon':index===2?'bg-teal-light text-teal-icon':'bg-red-1 text-red'"><q-icon :name="task.icon" size="20px"/></div><q-icon v-if="selected===task.id" name="check_circle" color="primary" size="16px"/></div><h3 class="text-h4 text-weight-bolder text-primary-theme q-my-none">{{task.count}}</h3><p class="label-custom text-caption q-mt-sm q-mb-none">{{task.label}}</p></q-card></div></div></template>
<style scoped>
.bg-surface {
  background: #ffffff;
}

.border-outline-variant {
  border: 1px solid #eaedff;
}

.rounded-xl {
  border-radius: 16px !important;
}

.p-6 {
  padding: 24px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
}

.bg-surface-container-low {
  background: #f2f3ff;
}

.icon-navy {
  color: #002147;
}

.bg-red-1 {
  background: #ffdad6;
}

.text-red {
  color: #ba1a1a;
}

.bg-blue-light {
  background-color: #e0f2f1;
}

.text-blue-icon {
  color: #00897b;
}

.bg-teal-light {
  background-color: #e0f7fa;
}

.text-teal-icon {
  color: #00acc1;
}

.font-label-sm {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.text-primary-theme {
  color: #002147;
}

.label-custom {
  color: #58657f;
}

.hover-shadow-primary {
  transition: all 0.3s ease;
}

.hover-shadow-primary:hover {
  box-shadow: 0 10px 25px -5px rgba(70, 95, 136, 0.1), 0 8px 10px -6px rgba(70, 95, 136, 0.1);
  border-color: #d3e4fe;
}

.hover-shadow-error {
  transition: all 0.3s ease;
}

.hover-shadow-error:hover {
  box-shadow: 0 10px 25px -5px rgba(186, 26, 26, 0.1), 0 8px 10px -6px rgba(186, 26, 26, 0.1);
  border-color: #ba1a1a;
}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
.rounded-lg{border-radius:8px}.tracking-wider{letter-spacing:.05em}

.task-card{height:100%;cursor:pointer}.task-selected{border-color:#8caccb;background:#f8fafc}.task-card:focus-visible{outline:3px solid #6a9cd6;outline-offset:2px}@media(max-width:599px){.task-card{padding:16px}.task-card .q-mb-md{margin-bottom:10px}}
</style>
