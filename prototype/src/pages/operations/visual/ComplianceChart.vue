<template>
  <q-card flat class="bg-surface border-outline-variant rounded-xl p-6 flex flex-col hover-lift">
    <h3 class="text-weight-bold text-primary-theme q-my-none" style="font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; color: #002147; font-weight: 800; line-height: 1.2;">
      {{ greeting }} {{ userName }} 👋
    </h3>
    <p class="q-my-none" style="font-size: 15px; color: #58657f; margin-top: 8px; line-height: 1.4;">
      Continue your review process. Incidents by occurrence month in this selection.
    </p>

    <svg class="compliance-svg" preserveAspectRatio="none">
      <!-- Bars -->
      <rect
        v-for="(bar, index) in chartData"
        :key="'bar-' + index"
        :x="(1 + index * (90 / chartData.length)) + '%'"
        :y="(75 - bar.value * 0.75) + '%'"
        :width="(70 / chartData.length) + '%'"
        :height="(bar.value * 0.75) + '%'"
        :fill="bar.color"
        class="chart-rect"
      ><title>{{ trendLabels[index] }}: {{ bar.count }} incidents</title></rect>
      <!-- Dynamic Labels -->
      <text
        v-for="(label, index) in trendLabels"
        :key="'label-' + index"
        :x="(1 + index * (90 / trendLabels.length) + (35 / trendLabels.length)) + '%'"
        y="92%"
        text-anchor="middle"
        fill="#58657f"
        font-family="'JetBrains Mono', monospace"
        font-size="8"
        style="letter-spacing: 0.08em; font-weight: 700;"
      >
        {{ label }}
      </text>
    </svg>
  </q-card>
</template>

<script setup>
import {computed} from 'vue'
const props=defineProps({userName:String,trends:{type:Array,default:()=>[]}})
const greeting=computed(()=>new Date().getHours()<12?'Good Morning':new Date().getHours()<18?'Good Afternoon':'Good Evening')
const trendLabels=computed(()=>props.trends.map(t=>t.name))
const chartData=computed(()=>{const max=Math.max(1,...props.trends.map(t=>t.count));return props.trends.map((t,index)=>({value:t.count/max*85,count:t.count,color:t.count===max?'#002147':index%2?'#425c8a':'#eaedff'}))})
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

.compliance-svg {
  height: 280px;
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 12px;
  /* border: 1px solid #eaedff; */
  margin-top: 24px;
  display: block;
}

/* Mobile (default) */
@media (max-width: 599px) {
  .compliance-svg {
    width: 100%;
  }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 1023px) {
  .compliance-svg {
    width: 100%;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .compliance-svg {
    width: 100%;
  }
}

.chart-rect {
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-rect:hover {
  opacity: 0.9;
}

.text-primary-theme {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}
:global(body.body--dark) .compliance-svg{background:var(--ss-card)}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
.flex-col{flex-direction:column}.compliance-svg{width:100%}
</style>
