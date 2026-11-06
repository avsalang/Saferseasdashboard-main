<template>
  <q-card flat class="bg-surface border-outline-variant rounded-xl p-6 flex flex-col items-center justify-between h-full hover-lift relative-position">
    <div class="row items-center justify-between full-width q-mb-md">
      <h3 class="text-subtitle1 text-weight-bold text-primary-theme q-my-none" style="font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; color: #002147; font-weight: 800;">Workflow Snapshot</h3>
      <q-btn flat round dense icon="arrow_forward" style="color: #58657f;" to="/admin/incidents"><q-tooltip>Open incident register</q-tooltip></q-btn>
    </div>

    <div v-if="loading" class="row justify-center items-center q-my-md" style="min-height: 180px; flex-grow: 1;">
      <q-spinner color="primary" size="2em" />
    </div>

    <template v-else>
      <div class="progress-container q-mb-lg q-mt-sm">
        <!-- SVG Progress Circle -->
        <svg class="progress-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="38" stroke="#f2f3ff" stroke-width="8"></circle>
          <circle cx="50" cy="50" fill="none" r="38" stroke="#002147" :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset" stroke-width="8"></circle>
        </svg>
        <div class="progress-text-overlay">
          <span class="percentage-text">{{ percentage }}%</span>
          <span class="label-text">Validated</span>
        </div>
      </div>

      <div class="row full-width justify-between q-px-md mt-auto items-center" style="margin-top: 16px;">
        <div class="col text-center">
          <p class="text-weight-bolder q-my-none" style="font-size: 28px; color: #002147; font-family: 'Hanken Grotesk', sans-serif; line-height: 1.2;">{{ verified }}</p>
          <p class="q-my-none" style="font-size: 12px; color: #58657f; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em;">Validated</p>
        </div>
        <div style="width: 1px; height: 36px; background-color: #eaedff; margin: 0 16px;"></div>
        <div class="col text-center">
          <p class="text-weight-bolder q-my-none" style="font-size: 28px; color: #002147; font-family: 'Hanken Grotesk', sans-serif; line-height: 1.2;">{{ pending }}</p>
          <p class="q-my-none" style="font-size: 12px; color: #58657f; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em;">Pending</p>
        </div>
      </div>
    </template>
  </q-card>
</template>

<script setup>
import {computed} from 'vue'
const props=defineProps({verified:Number,pending:Number})
const loading=false
const circumference=2*Math.PI*38
const percentage=computed(()=>props.verified+props.pending ? Math.round(props.verified/(props.verified+props.pending)*100) : 0)
const strokeDashoffset=computed(()=>circumference-(percentage.value/100)*circumference)
</script>

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

.progress-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin-left: auto;
  margin-right: auto;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.percentage-text {
  font-size: 32px;
  font-weight: 800;
  color: #002147;
  font-family: 'Hanken Grotesk', sans-serif;
  line-height: 1.1;
}

.label-text {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #58657f;
  letter-spacing: 0.15em;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 4px;
}

.text-primary-theme {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
.flex-col{flex-direction:column}
:global(body.body--dark) .percentage-text{color:var(--ss-text)}
:global(body.body--dark) .progress-svg circle:last-child{stroke:#8eb8ef}
</style>
