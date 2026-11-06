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
        <div class="page-sub">Monitor your vessel reports, review requests, and submission history</div>
      </div>
      <q-space />
      <div class="col-12 col-md-auto q-gutter-md row items-center no-wrap">
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

    <div class="row q-col-gutter-xl">
      <div class="col-12">
        <!-- High-Level Stats Cards -->
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
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StatsCards from './dashboard/StatsCards.vue'
import DashboardCharts from './dashboard/DashboardCharts.vue'
import SeverityAnalysis from './dashboard/SeverityAnalysis.vue'
import RecentIncidents from './dashboard/RecentIncidents.vue'

const router = useRouter()

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
