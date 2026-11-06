<template>
  <div class="row q-col-gutter-md relative-position">
    <div v-if="loading" class="col-12 row justify-center items-center q-my-md" style="min-height: 100px;">
      <q-spinner color="primary" size="2em" />
    </div>

    <template v-else>
      <!-- Metric 1 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-surface rounded-xl p-6 border-outline-variant hover-shadow-primary hover-lift group">
          <div class="row items-center justify-between q-mb-md">
            <div class="icon-wrapper bg-surface-container-low icon-navy flex flex-center rounded-lg">
              <q-icon name="folder_open" size="20px" />
            </div>
            <span class="label-custom font-label-sm text-uppercase tracking-wider">Total</span>
          </div>
          <div>
            <h3 class="text-h4 text-weight-bolder text-primary-theme q-my-none">{{ stats.fleet_incidents }}</h3>
            <p class="label-custom text-caption q-mt-sm q-mb-none">Incident Records</p>
          </div>
        </q-card>
      </div>
      <!-- Metric 2 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-surface rounded-xl p-6 border-outline-variant hover-shadow-primary hover-lift group">
          <div class="row items-center justify-between q-mb-md">
            <div class="icon-wrapper bg-blue-light text-blue-icon flex flex-center rounded-lg">
              <q-icon name="directions_boat" size="20px" />
            </div>
            <span class="label-custom font-label-sm text-uppercase tracking-wider">Fleet</span>
          </div>
          <div>
            <h3 class="text-h4 text-weight-bolder text-primary-theme q-my-none">{{ stats.involved_vessels }}</h3>
            <p class="label-custom text-caption q-mt-sm q-mb-none">Vessels in Reports</p>
          </div>
        </q-card>
      </div>
      <!-- Metric 3 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-surface rounded-xl p-6 border-outline-variant hover-shadow-primary hover-lift group">
          <div class="row items-center justify-between q-mb-md">
            <div class="icon-wrapper bg-teal-light text-teal-icon flex flex-center rounded-lg">
              <q-icon name="verified_user" size="20px" />
            </div>
            <span class="label-custom font-label-sm text-uppercase tracking-wider">Review</span>
          </div>
          <div>
            <h3 class="text-h4 text-weight-bolder text-primary-theme q-my-none">{{ stats.validated }}</h3>
            <p class="label-custom text-caption q-mt-sm q-mb-none">Validated Reports</p>
          </div>
        </q-card>
      </div>
      <!-- Metric 4 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-surface rounded-xl p-6 border-outline-variant hover-shadow-error hover-lift group">
          <div class="row items-center justify-between q-mb-md">
            <div class="icon-wrapper bg-red-1 text-red flex flex-center rounded-lg">
              <q-icon name="warning" size="20px" />
            </div>
            <span class="label-custom font-label-sm text-uppercase tracking-wider">Actions</span>
          </div>
          <div>
            <h3 class="text-h4 text-weight-bolder text-primary-theme q-my-none">{{ stats.pending_actions }}</h3>
            <p class="label-custom text-caption q-mt-sm q-mb-none">Pending Actions</p>
          </div>
        </q-card>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({stats:{type:Object,required:true}})
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
</style>
