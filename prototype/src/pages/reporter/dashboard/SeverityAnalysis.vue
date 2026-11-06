<template>
  <q-card flat class="flat-card q-pa-lg" style="height: 500px;">
    <div class="column q-mb-lg">
      <div class="row items-center no-wrap">
        <span class="card-title">Seriousness Trend Analysis</span>
        <q-btn flat round dense icon="info_outline" size="11px" color="grey-6" class="q-ml-xs info-btn"
          @click.stop="showInfoDialog = true">
          <q-tooltip anchor="top middle" self="bottom middle">Click for details & formula</q-tooltip>
        </q-btn>
      </div>
      <div class="card-sub">MONTHLY INCIDENT COUNTS BY SERIOUSNESS</div>
    </div>

    <div v-if="severityLoading" style="height: 340px;" class="column justify-center q-gutter-md">
      <q-skeleton type="rect" height="240px" style="border-radius: 8px;" />
      <div class="row justify-center q-gutter-md q-mt-md">
        <q-skeleton type="text" width="60px" />
        <q-skeleton type="text" width="60px" />
        <q-skeleton type="text" width="60px" />
        <q-skeleton type="text" width="60px" />
      </div>
    </div>
    <div v-else class="chart-container">
      <div ref="severityChartRef" style="height: 340px; width: 100%;"></div>
    </div>
  </q-card>

  <!-- Info Dialog -->
  <q-dialog v-model="showInfoDialog">
    <q-card style="width: 440px; max-width: 90vw; border-radius: 16px;" class="q-pa-md info-popup-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 font-bold text-blue-10">Seriousness Trend Analysis</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p class="text-body2 text-grey-8" style="line-height: 1.6;">
          Traces the monthly progression of incidents across the selected reporting year (Jan–Dec),
          grouped by seriousness (Very serious, Serious, Less serious, Unknown).
        </p>
        <div class="q-mt-lg q-pa-md bg-blue-50 rounded-borders formula-box">
          <p class="text-caption font-bold text-blue-10 q-mb-sm">Formula / Calculation Logic:</p>
          <code
            class="text-caption text-blue-9 text-weight-medium formula-code">Severity Trend = Count(Incidents per Severity Category per Month)</code>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {echarts} from '../../../lib/reporterCharts.js'
import { useDemo } from '../../../stores/demo.js'
const store=useDemo()

const props = defineProps({
  year: {
    type: [String, Number],
    required: true
  }
})

const severityChartRef = ref(null)
const severityLoading = ref(false)
let severityChartInstance = null

const showInfoDialog = ref(false)

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const setSeverityData = (payload) => {
  if (!severityChartInstance) return
  const labels = Array.isArray(payload?.labels) ? payload.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const series = payload?.series || {}
  const critical = Array.isArray(series?.['Very serious']) ? series['Very serious'] : [0, 0, 0, 0, 0, 0]
  const high = Array.isArray(series?.Serious) ? series.Serious : [0, 0, 0, 0, 0, 0]
  const medium = Array.isArray(series?.['Less serious']) ? series['Less serious'] : [0, 0, 0, 0, 0, 0]
  const low = Array.isArray(series?.Unknown) ? series.Unknown : [0, 0, 0, 0, 0, 0]

  const allValues = [...critical, ...high, ...medium, ...low]
  const maxVal = Math.max(...allValues, 1)

  severityChartInstance.setOption({
    xAxis: { data: labels },
    yAxis: {
      max: maxVal === 1 ? 1 : undefined,
      interval: maxVal === 1 ? 1 : undefined
    },
    series: [
      { name: 'Very serious', data: critical },
      { name: 'Serious', data: high },
      { name: 'Less serious', data: medium },
      { name: 'Unknown', data: low }
    ]
  })
}

const fetchSeverity = async () => {
  severityLoading.value = true
  if (severityChartInstance) {
    if (severityChartRef.value?.__resizeObserver__) {
      severityChartRef.value.__resizeObserver__.disconnect()
      delete severityChartRef.value.__resizeObserver__
    }
    severityChartInstance.dispose()
    severityChartInstance = null
  }
  try {
    const selected=store.selectEvents({year:String(props.year)})
    const labels=Array.from({length:12},(_,i)=>new Date(2026,i,1).toLocaleString('en-US',{month:'short'}))
    const series=Object.fromEntries([['very_serious','Very serious'],['serious','Serious'],['less_serious','Less serious'],['unknown','Unknown']].map(([code,label])=>[label,Array.from({length:12},(_,i)=>selected.filter(e=>e.seriousness===code&&Number(e.date.slice(5,7))===i+1).length)]))
    const response={data:{labels,series}}
    severityLoading.value = false
    await nextTick()
    if (!severityChartInstance) {
      initChart()
    }
    setSeverityData(response.data)
  } catch (error) {
    severityLoading.value = false
    await nextTick()
    setSeverityData({ labels: [], series: {} })
  }
}


const initChart = () => {
  if (!severityChartRef.value) return

  severityChartInstance = echarts.init(severityChartRef.value)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (severityChartInstance) severityChartInstance.resize()
    })
    ro.observe(severityChartRef.value)
    severityChartRef.value.__resizeObserver__ = ro
  }
  const labelStyle = { fontFamily: 'Inter, sans-serif', color: '#9ca3af', fontSize: 10 }

  severityChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 0.5,
      borderColor: '#e2e5ea',
      shadowBlur: 5,
      shadowColor: 'rgba(0,0,0,0.05)',
      textStyle: { color: '#111827', fontFamily: 'Inter, sans-serif', fontSize: 12 }
    },
    legend: {
      data: ['Very serious', 'Serious', 'Less serious', 'Unknown'],
      textStyle: { fontFamily: 'Inter, sans-serif', color: '#4b5563', fontSize: 12 },
      bottom: '0%',
      icon: 'circle',
      itemGap: 12,
      itemWidth: 10,
      itemHeight: 10
    },
    grid: { left: '4%', right: '4%', top: '8%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: labelStyle
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      interval: 1,
      splitLine: { lineStyle: { type: 'solid', color: '#f3f4f6' } },
      axisLabel: labelStyle
    },
    series: [
      {
        name: 'Very serious',
        type: 'line',
        smooth: false,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#ef4444',
        lineStyle: { width: 2 }
      },
      {
        name: 'Serious',
        type: 'line',
        smooth: false,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#f59e0b',
        lineStyle: { width: 2 }
      },
      {
        name: 'Less serious',
        type: 'line',
        smooth: false,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#eab308',
        lineStyle: { width: 2 }
      },
      {
        name: 'Unknown',
        type: 'line',
        smooth: false,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#22c55e',
        lineStyle: { width: 2 }
      }
    ]
  })
}

watch(
  () => props.year,
  () => {
    fetchSeverity()
  },
  { immediate: true }
)

onMounted(() => {
  // ECharts initialization is managed by fetchSeverity and watches to prevent undefined refs
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (severityChartInstance) {
    if (severityChartRef.value?.__resizeObserver__) {
      severityChartRef.value.__resizeObserver__.disconnect()
    }
    severityChartInstance.dispose()
  }
})

const handleResize = () => {
  if (severityChartInstance) {
    severityChartInstance.resize()
  }
}
</script>

<style scoped>
.flat-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(18, 36, 58, 0.12), 0 2px 12px rgba(18, 36, 58, 0.06) !important;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.card-sub {
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 4px;
  font-weight: 600;
}

.chart-container {
  position: relative;
  width: 100%;
}

.info-btn {
  margin: 0;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.info-btn:hover {
  opacity: 1;
}

.info-popup-card {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.formula-box {
  border: 1px solid #dbeafe;
}

.formula-code {
  display: block;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 8px;
  border: 0.5px solid #bfdbfe;
  color: #1e40af;
}
</style>
