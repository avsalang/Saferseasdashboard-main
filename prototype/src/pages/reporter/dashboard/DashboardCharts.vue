<template>
  <div class="row q-col-gutter-lg">
    <!-- Main Trend Chart -->
    <div class="col-12 col-lg-8">
      <q-card flat class="flat-card q-pa-lg" style="height: 520px;">
        <div class="row items-center q-mb-lg">
          <div class="column">
            <div class="row items-center no-wrap">
              <span class="card-title">Operational trends</span>
              <q-btn flat round dense icon="info_outline" size="11px" color="grey-6" class="q-ml-xs info-btn"
                @click.stop="openInfo('trends')">
                <q-tooltip anchor="top middle" self="bottom middle">Click for details & formula</q-tooltip>
              </q-btn>
            </div>
            <div class="card-sub">Reported events and validation status</div>
          </div>
          <q-space />
          <div class="row items-center q-gutter-sm controls-row">
            <q-select v-model="selectedMonth" :options="monthOptions" dense flat borderless class="month-selector"
              popup-content-class="flat-popup">
              <template v-slot:prepend>
                <q-icon name="calendar_today" size="xs" color="blue-10" />
              </template>
            </q-select>
            <q-btn-toggle v-model="trendPeriod" flat dense class="period-toggle" toggle-color="white"
              toggle-text-color="blue-10" color="grey-4" text-color="grey-7" :options="[
                { label: '7D', value: '7d' },
                { label: '30D', value: '30d' }
              ]" />
          </div>
        </div>

        <div v-if="trendsLoading" style="height: 360px;" class="column justify-center q-gutter-md">
          <q-skeleton type="rect" height="260px" style="border-radius: 8px;" />
          <div class="row justify-center q-gutter-md">
            <q-skeleton type="text" width="80px" />
            <q-skeleton type="text" width="80px" />
          </div>
        </div>
        <div v-else ref="trendChartRef" style="height: 360px;"></div>
      </q-card>
    </div>

    <!-- Distribution Chart -->
    <div class="col-12 col-lg-4">
      <q-card flat class="flat-card q-pa-lg" style="height: 520px;">
        <div class="column q-mb-lg">
          <div class="row items-center no-wrap">
            <span class="card-title">Incident breakdown</span>
            <q-btn flat round dense icon="info_outline" size="11px" color="grey-6" class="q-ml-xs info-btn"
              @click.stop="openInfo('breakdown')">
              <q-tooltip anchor="top middle" self="bottom middle">Click for details & formula</q-tooltip>
            </q-btn>
          </div>
          <div class="card-sub">Distribution by category</div>
        </div>

        <div v-if="breakdownLoading" style="height: 360px;" class="column justify-center items-center q-gutter-md">
          <q-skeleton type="circle" size="140px" />
          <div class="column items-center full-width q-mt-sm q-gutter-xs">
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="50%" />
            <q-skeleton type="text" width="55%" />
          </div>
        </div>
        <div v-else ref="typeChartRef" style="height: 360px;"></div>
      </q-card>
    </div>
  </div>

  <!-- Info Dialog -->
  <q-dialog v-model="showInfoDialog">
    <q-card style="width: 440px; max-width: 90vw; border-radius: 16px;" class="q-pa-md info-popup-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 font-bold text-blue-10">{{ activeInfoTitle }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p class="text-body2 text-grey-8" style="line-height: 1.6;">{{ activeInfoDesc }}</p>
        <div class="q-mt-lg q-pa-md bg-blue-50 rounded-borders formula-box">
          <p class="text-caption font-bold text-blue-10 q-mb-sm">Formula / Calculation Logic:</p>
          <code class="text-caption text-blue-9 text-weight-medium formula-code">{{ activeInfoFormula }}</code>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {echarts} from '../../../lib/reporterCharts.js'
import { useDemo } from '../../../stores/demo.js'
const store=useDemo()

const props = defineProps({
  year: {
    type: [String, Number],
    required: true
  }
})

const trendChartRef = ref(null)
const typeChartRef = ref(null)
const trendPeriod = ref('30d')
const latestDate=store.selectEvents({year:String(props.year)}).map(e=>e.date).sort().at(-1)
const selectedMonth = ref(new Date(latestDate?latestDate+'T12:00:00':Date.now()).toLocaleString('en-US', { month: 'long' }))
const trendsLoading = ref(false)
const breakdownLoading = ref(false)
const monthOptions = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
let trendChartInstance = null
let typeChartInstance = null

const showInfoDialog = ref(false)
const activeInfoTitle = ref('')
const activeInfoDesc = ref('')
const activeInfoFormula = ref('')

const openInfo = (type) => {
  if (type === 'trends') {
    activeInfoTitle.value = 'Operational Trends'
    activeInfoDesc.value = 'Counts selected-year occurrences during the last 7 or 30 calendar days of the selected month. The second line shows events currently validated, grouped by occurrence date.'
    activeInfoFormula.value = 'Incidents = event count; Validated = subset currently validated'
  } else if (type === 'breakdown') {
    activeInfoTitle.value = 'Incident Breakdown'
    activeInfoDesc.value = 'Displays the percentage distribution of all reported maritime incidents categorized by type (e.g. Collision, Grounding, Capsizing, Fire/Explosion).'
    activeInfoFormula.value = 'Category % = (Incidents in Category / Total Incidents) × 100%'
  }
  showInfoDialog.value = true
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const monthNumber = computed(() => {
  const idx = monthOptions.indexOf(selectedMonth.value)
  return idx >= 0 ? idx + 1 : new Date().getMonth() + 1
})

const setTrendData = (payload) => {
  if (!trendChartInstance) return
  const labels = Array.isArray(payload?.labels) ? payload.labels : []
  const incidents = Array.isArray(payload?.incidents) ? payload.incidents : []
  const resolved = Array.isArray(payload?.resolved) ? payload.resolved : []

  trendChartInstance.setOption({
    xAxis: { data: labels },
    series: [
      { name: 'Incidents', data: incidents },
      { name: 'Validated', data: resolved }
    ]
  })
}

const setBreakdownData = (items) => {
  if (!typeChartInstance) return
  const palette = ['#12243a', '#378ADD', '#EF9F27', '#94a3b8', '#10b981', '#ef4444', '#64748b']
  const normalized = Array.isArray(items) ? items : []

  const total = normalized.reduce((acc, item) => acc + toNumber(item?.value), 0)

  const data = normalized.map((item, index) => ({
    value: toNumber(item?.value),
    name: String(item?.name || 'Unknown'),
    itemStyle: { color: palette[index % palette.length] }
  }))

  typeChartInstance.setOption({
    title: {
      text: String(total),
      subtext: total === 1 ? 'incident' : 'incidents',
      left: '50%',
      top: '45%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Inter, sans-serif'
      },
      subtextStyle: {
        fontSize: 10,
        color: '#9ca3af',
        fontFamily: 'Inter, sans-serif'
      }
    },
    series: [{ data }]
  })
}

const fetchTrends = async () => {
  trendsLoading.value = true
  if (trendChartInstance) {
    if (trendChartRef.value?.__resizeObserver__) {
      trendChartRef.value.__resizeObserver__.disconnect()
      delete trendChartRef.value.__resizeObserver__
    }
    trendChartInstance.dispose()
    trendChartInstance = null
  }
  try {
    const year=Number(props.year),month=monthNumber.value,totalDays=new Date(year,month,0).getDate(),windowDays=trendPeriod.value==='7d'?7:30
    const days=Array.from({length:Math.min(totalDays,windowDays)},(_,i)=>totalDays-Math.min(totalDays,windowDays)+i+1)
    const selected=store.selectEvents({year:String(props.year)}).filter(e=>Number(e.date.slice(5,7))===month)
    const response={data:{labels:days.map(day=>String(day)),incidents:days.map(day=>selected.filter(e=>Number(e.date.slice(8,10))===day).length),resolved:days.map(day=>selected.filter(e=>Number(e.date.slice(8,10))===day&&e.status==='validated').length)}}
    trendsLoading.value = false
    await nextTick()
    if (!trendChartInstance) {
      initTrendChart()
    }
    setTrendData(response.data)
  } catch (error) {
    trendsLoading.value = false
    await nextTick()
    setTrendData({ labels: [], incidents: [], resolved: [] })
  }
}

const fetchBreakdown = async () => {
  breakdownLoading.value = true
  if (typeChartInstance) {
    if (typeChartRef.value?.__resizeObserver__) {
      typeChartRef.value.__resizeObserver__.disconnect()
      delete typeChartRef.value.__resizeObserver__
    }
    typeChartInstance.dispose()
    typeChartInstance = null
  }
  try {
    const response={data:{items:store.summarize(store.selectEvents({year:String(props.year)})).byType.map(item=>({name:item.name,value:item.count}))}}
    breakdownLoading.value = false
    await nextTick()
    if (!typeChartInstance) {
      initBreakdownChart()
    }
    setBreakdownData(response.data?.items)
  } catch (error) {
    breakdownLoading.value = false
    await nextTick()
    setBreakdownData([])
  }
}


const initTrendChart = () => {
  if (!trendChartRef.value) return
  const labelStyle = { fontFamily: 'Inter, sans-serif', color: '#9ca3af', fontSize: 10 }

  trendChartInstance = echarts.init(trendChartRef.value)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (trendChartInstance) trendChartInstance.resize()
    })
    ro.observe(trendChartRef.value)
    trendChartRef.value.__resizeObserver__ = ro
  }
  trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 0.5,
      borderColor: '#e2e5ea',
      shadowBlur: 5,
      shadowColor: 'rgba(0,0,0,0.05)',
      textStyle: { color: '#111827', fontFamily: 'Inter, sans-serif', fontSize: 12 }
    },
    grid: { left: '2%', right: '2%', bottom: '15%', containLabel: true },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { fontFamily: 'Inter, sans-serif', color: '#6b7280', fontSize: 11 },
      icon: 'circle',
      itemGap: 14
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: labelStyle
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { type: 'solid', color: '#f3f4f6' } },
      axisLabel: labelStyle
    },
    series: [
      {
        name: 'Incidents',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#378ADD',
        lineStyle: { width: 3 }
      },
      {
        name: 'Validated',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        color: '#1D9E75',
        lineStyle: { width: 3, type: 'dashed' }
      }
    ]
  })
}

const initBreakdownChart = () => {
  if (!typeChartRef.value) return

  typeChartInstance = echarts.init(typeChartRef.value)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (typeChartInstance) typeChartInstance.resize()
    })
    ro.observe(typeChartRef.value)
    typeChartRef.value.__resizeObserver__ = ro
  }
  typeChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 0.5,
      borderColor: '#e2e5ea',
      textStyle: { color: '#111827', fontFamily: 'Inter, sans-serif', fontSize: 12 }
    },
    legend: {
      bottom: '0%',
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontFamily: 'Inter, sans-serif', color: '#6b7280', fontSize: 11 },
      icon: 'circle',
      itemGap: 10
    },
    series: [{
      name: 'Incident Type',
      type: 'pie',
      radius: ['52%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: []
    }]
  })
}

const handleResize = () => {
  if (trendChartInstance) trendChartInstance.resize()
  if (typeChartInstance) typeChartInstance.resize()
}

watch([trendPeriod, selectedMonth], () => {
  fetchTrends()
})

watch(
  () => props.year,
  () => {
    fetchTrends()
    fetchBreakdown()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChartInstance) {
    if (trendChartRef.value?.__resizeObserver__) {
      trendChartRef.value.__resizeObserver__.disconnect()
    }
    trendChartInstance.dispose()
  }
  if (typeChartInstance) {
    if (typeChartRef.value?.__resizeObserver__) {
      typeChartRef.value.__resizeObserver__.disconnect()
    }
    typeChartInstance.dispose()
  }
})
</script>

<style scoped>
.flat-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(18, 36, 58, 0.12), 0 2px 12px rgba(18, 36, 58, 0.06) !important;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  line-height: 1.2;
}

.card-sub {
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-top: 2px;
}

.month-selector {
  min-width: 140px;
  height: 28px;
}

.month-selector:deep(.q-field__control) {
  height: 28px !important;
  min-height: 28px !important;
  border: 0.5px solid #d1d5db !important;
  border-radius: 7px !important;
  background: #ffffff !important;
  padding: 0 8px !important;
}

.month-selector:deep(.q-field__control:before),
.month-selector:deep(.q-field__control:after) {
  display: none !important;
}

.month-selector:deep(.q-field__marginal) {
  height: 28px !important;
  min-height: 28px !important;
}

.month-selector:deep(.q-field__native) {
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #374151 !important;
}

.period-toggle {
  background: #f3f4f6;
  border-radius: 6px;
  padding: 2px;
}

.period-toggle:deep(.q-btn) {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  min-height: auto;
  border-radius: 4px;
}

.period-toggle:deep(.q-btn--active) {
  background: #ffffff !important;
  color: #111827 !important;
  box-shadow: 0.5px solid #e2e5ea;
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

:deep(.flat-popup) {
  background: #ffffff !important;
  border: 0.5px solid #e2e5ea !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
}

@media (max-width: 599px) {
  .month-selector {
    min-width: 223px !important;
  }

  .controls-row {
    padding-top: 12px;
  }
}
</style>
