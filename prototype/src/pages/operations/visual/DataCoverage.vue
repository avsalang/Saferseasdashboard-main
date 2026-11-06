<template>
  <q-card flat class="bg-surface border-outline-variant rounded-xl p-6 hover-lift q-mb-md relative-position">
    <div class="row items-center justify-between q-mb-lg">
      <h3 class="text-subtitle1 text-weight-bold text-primary-theme q-my-none" style="font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; color: #002147; font-weight: 800;">Data Capture Coverage</h3>
      <q-btn flat round dense icon="open_in_new" style="color: #58657f;" to="/admin/analytics"><q-tooltip>View data quality</q-tooltip></q-btn>
    </div>

    <div v-if="loading" class="row justify-center items-center q-my-md" style="min-height: 100px;">
      <q-spinner color="primary" size="2em" />
    </div>

    <div v-else class="row q-col-gutter-lg">
      <!-- Coverage Item 1 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Registry IDs</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.registry_ids === null ? 'Unavailable' : coverage.registry_ids + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.registry_ids / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
      <!-- Coverage Item 2 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Voyage Details</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.voyage_details === null ? 'Unavailable' : coverage.voyage_details + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.voyage_details / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
      <!-- Coverage Item 3 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Weather Data</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.weather_data === null ? 'Unavailable' : coverage.weather_data + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.weather_data / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
      <!-- Coverage Item 4 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Vessel Specs</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.vessel_specs === null ? 'Unavailable' : coverage.vessel_specs + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.vessel_specs / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
      <!-- Coverage Item 5 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Crew Counts</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.crew_manifest === null ? 'Unavailable' : coverage.crew_manifest + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.crew_manifest / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
      <!-- Coverage Item 6 -->
      <div class="col-12 col-sm-4">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-weight-bold" style="font-size: 14px; color: #58657f; font-family: 'Hanken Grotesk', sans-serif;">Cargo Log</span>
          <span class="text-weight-bolder" style="font-size: 14px; color: #002147; font-family: 'JetBrains Mono', monospace;">{{ coverage.cargo_log === null ? 'Unavailable' : coverage.cargo_log + '%' }}</span>
        </div>
        <q-linear-progress :value="coverage.cargo_log / 100" class="rounded-full progress-navy" style="height: 8px;" />
      </div>
    </div>
  </q-card>
</template>

<script setup>
defineProps({coverage:{type:Object,required:true}})
const loading=false
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

.text-primary-theme {
  color: var(--text-primary);
}

.rounded-full {
  border-radius: 9999px !important;
}

.progress-navy :deep(.q-linear-progress__model) {
  background-color: #002147 !important;
}

.progress-navy :deep(.q-linear-progress__track) {
  background-color: #f2f3ff !important;
}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
:global(body.body--dark) .text-weight-bolder{color:var(--ss-text)!important}
</style>
