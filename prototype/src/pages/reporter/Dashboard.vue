<template>
  <q-page class="q-pa-lg dashboard-bg tracking-page">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col-12 col-md-8">
        <!-- Breadcrumbs -->
        <q-breadcrumbs class="breadcrumbs q-mb-md">
          <q-breadcrumbs-el label="Dashboard" icon="home" to="/reporter" />
          <q-breadcrumbs-el label="Reporting workspace" />
        </q-breadcrumbs>

        <div class="page-title">Reporting workspace</div>
        <div class="page-sub">Complete corrections, continue a draft, or follow the progress of your reports</div>
      </div>
      <q-space />
      <div class="col-12 col-md-auto q-gutter-md row items-center no-wrap">

        <q-btn
          unelevated
          no-caps
          icon="add"
          label="New spot report"
          to="/reporter/reports/new"
          class="btn-primary-custom"
        />
      </div>
    </div>

    <div class="row q-gutter-sm q-mb-lg"><q-btn flat no-caps class="glass-btn" icon="folder_open" label="Evidence and documents" to="/reporter/documents"/><q-btn flat no-caps class="glass-btn" icon="description" label="All my reports" to="/reporter/reports"/></div>
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-6"><q-card flat class="flat-card q-pa-lg task-card">
        <div class="row items-center q-mb-md"><div><div class="card-title">Corrections to complete</div><div class="card-sub">{{ corrections.length }} report(s) need your response</div></div><q-space/><q-icon name="assignment_return" size="24px" color="orange-9"/></div>
        <q-list v-if="corrections.length" separator><q-item v-for="event in corrections.slice(0,3)" :key="event.id" class="q-px-none"><q-item-section><q-item-label class="text-weight-medium">{{ event.ref }}</q-item-label><q-item-label caption>{{ latestCorrection(event) }}</q-item-label></q-item-section><q-item-section side><q-btn no-caps unelevated class="btn-primary-custom" label="Correct report" :to="`/reporter/reports/${event.id}/edit`"/></q-item-section></q-item></q-list>
        <p v-else class="page-sub q-py-md">No corrections are waiting for you.</p><q-btn v-if="corrections.length>3" flat no-caps color="primary" label="View all correction requests" to="/reporter/reports?status=correction_requested"/>
      </q-card></div>
      <div class="col-12 col-md-6"><q-card flat class="flat-card q-pa-lg task-card">
        <div class="row items-center q-mb-md"><div><div class="card-title">Continue a draft</div><div class="card-sub">{{ drafts.length }} saved report(s) ready to continue</div></div><q-space/><q-icon name="edit_note" size="24px" color="primary"/></div>
        <q-list v-if="drafts.length" separator><q-item v-for="event in drafts.slice(0,3)" :key="event.id" class="q-px-none"><q-item-section><q-item-label class="text-weight-medium">{{ event.ref || 'Unsubmitted report' }}</q-item-label><q-item-label caption>{{ event.type || 'Incident type pending' }} · {{ event.place || 'Location not entered' }}</q-item-label></q-item-section><q-item-section side><q-btn no-caps flat class="glass-btn" label="Continue draft" :to="`/reporter/reports/${event.id}/edit`"/></q-item-section></q-item></q-list>
        <p v-else class="page-sub q-py-md">Your saved drafts will appear here. Start a new report when you are ready.</p><q-btn flat no-caps color="primary" label="View all drafts" to="/reporter/drafts"/>
      </q-card></div>
    </div>
    <div class="q-mb-lg"><RecentIncidents year="all" compact /></div>
    <StaticSection v-model="chartsOpen" class="flat-card q-mb-lg" icon="query_stats" label="Reporting overview and charts" caption="Explore counts and trends for a reporting year" header-class="q-pa-lg">
      <div v-if="chartsOpen" class="q-pa-lg">    <div class="row q-col-gutter-xl">
      <div class="col-12">
        <!-- High-Level Stats Cards -->
                <!-- Strategic Year Selection -->
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          borderless
          dense
          class="year-select glass-btn q-px-md"
          popup-content-class="glass-popup"
          prefix="Reporting year: "
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today" color="grey-7" size="xs" />
          </template>
        </q-select>

        <StatsCards :year="selectedYear" />

        <!-- Main Analytics Section -->
        <div class="q-mb-lg">
          <DashboardCharts :year="selectedYear" />
        </div>

        <!-- Bottom Grid: Severity Trend & Recent Incidents -->
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <SeverityAnalysis :year="selectedYear" />
          </div>
          <div class="col-12 col-md-6">
            <RecentIncidents :year="selectedYear" />
          </div>
        </div>
      </div>
    </div></div>
    </StaticSection>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDemo } from '../../stores/demo.js'
import { useRouter } from 'vue-router'
import StatsCards from './dashboard/StatsCards.vue'
import DashboardCharts from './dashboard/DashboardCharts.vue'
import SeverityAnalysis from './dashboard/SeverityAnalysis.vue'
import RecentIncidents from './dashboard/RecentIncidents.vue'

const router = useRouter(), store = useDemo(), chartsOpen = ref(false)
const scoped = computed(() => [...store.visibleEvents.value].sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')))
const corrections = computed(() => scoped.value.filter(event=>event.status==='correction_requested'))
const drafts = computed(() => scoped.value.filter(event=>event.status==='draft'))
function latestCorrection(event){return [...(event.history||[])].reverse().find(item=>item.status==='correction_requested')?.remarks || 'Open the report to review the requested corrections.'}

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear.toString())
const yearOptions = Array.from({ length: 11 }, (_, i) => (currentYear - 10 + i).toString()).reverse()
</script>

<style scoped>
.dashboard-bg {
  background: #f8fafc;
  min-height: 100vh;
}

.breadcrumbs {
  font-size: 12px;
  color: #6b7280;
}
.breadcrumbs :deep(a) {
  color: #378ADD;
  text-decoration: none;
}
.breadcrumbs :deep(.q-breadcrumbs__separator) {
  color: #9ca3af;
}

.page-title {
  font-size: 22px;
  font-weight: 500;
  color: #111827;
  line-height: 1.2;
}

.page-sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 3px;
}

.glass-btn {
  background: #ffffff !important;
  border: 0.5px solid #d1d5db !important;
  border-radius: 7px !important;
  font-size: 13px !important;
  height: 36px !important;
  box-shadow: none !important;
}

.year-select {
  min-width: 200px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.year-select:deep(.q-field__prefix) {
  color: #374151 !important;
  font-size: 13px !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  padding-right: 4px;
}

.year-select:deep(.q-field__native) {
  color: #111827 !important;
  font-size: 13px !important;
}

:deep(.glass-popup) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
}

.btn-primary-custom {
  background: #185FA5 !important;
  color: #ffffff !important;
  border-radius: 7px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: 36px !important;
  padding: 0 16px !important;
}

@media (max-width: 599px) {
  .year-select {
    width: 100% !important;
    min-width: 100% !important;
    margin-top: 12px;
  }
}
</style>

<style scoped>
.flat-card{background:#fff;border:.5px solid #e2e5ea;border-radius:10px;box-shadow:0 12px 32px rgba(18,36,58,.12),0 2px 12px rgba(18,36,58,.06)!important}.card-title{font-size:15px;font-weight:500;color:#111827;line-height:1.2}.card-sub{font-size:12px;color:#6b7280;margin-top:4px}.task-card{height:100%;min-height:170px}.task-card .q-item{min-height:72px}.task-card .q-item__label--caption{line-height:1.5!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}@media(max-width:599px){.task-card .q-item{align-items:flex-start}.task-card .q-item__section--side{padding-left:10px}.task-card .q-btn{font-size:12px;padding:0 9px}}
</style>
