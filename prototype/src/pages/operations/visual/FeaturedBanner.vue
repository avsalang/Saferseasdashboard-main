<template>
  <q-card flat class="featured-banner text-white q-pa-xl relative-position overflow-hidden border-primary-fixed-dim">
    <div class="banner-bg-image absolute-full" :style="{ backgroundImage: `url(${heroBg})` }"></div>
    <div class="banner-gradient-overlay absolute-full"></div>
    <div class="relative-position z-10">
      <div class="inline-flex items-center bg-white-10 px-3 py-1 rounded-full text-caption text-weight-bold text-secondary-fixed mb-4 border-white-20 backdrop-blur-sm q-px-md" style="display: inline-flex; gap: 8px; border-radius: 20px;">
        <q-icon name="insights" size="14px" />
        Strategic Priority
      </div>
      <h2 class="text-h4 text-weight-bolder mb-4 text-white tracking-tight" style="font-family: 'Hanken Grotesk', sans-serif; font-size: 32px; line-height: 1.2;">Elevating Maritime Safety Protocols</h2>
      <p class="text-secondary-fixed text-body1 q-mb-lg max-w-2xl" style="opacity: 0.9; color: #d3e4fe; font-size: 16px; line-height: 1.5; margin-bottom: 28px;">
        Analyzing incident data to optimize response strategies and prevent future occurrences across critical navigational zones in the archipelago.
      </p>
      <q-btn
        unelevated
        color="white"
        label="View Incident Reports"
        to="/admin/incidents"
        icon-right="arrow_forward"
        class="text-weight-bold text-caption q-px-xl"
        style="color: #002147 !important; border-radius: 24px; height: 44px;"
        no-caps
      />
    </div>
  </q-card>
</template>

<script setup>
import heroBg from './assets/maritime-hero-bg.png'
</script>

<style scoped>
.featured-banner {
  border-radius: 24px !important;
  background: linear-gradient(135deg, #00122e 0%, #002147 100%);
  min-height: 220px;
}

.banner-bg-image {
  background-size: cover;
  background-position: center;
  opacity: 0.4;
}

.banner-gradient-overlay {
  background-image: radial-gradient(circle at top right, #3b82f6 0%, transparent 60%);
  opacity: 0.25;
}

.bg-white-10 {
  background: rgba(255, 255, 255, 0.08);
}

.border-white-20 {
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.text-secondary-fixed {
  color: #d3e4fe;
}

.max-w-2xl {
  max-width: 42rem;
}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
.mb-4{margin-bottom:16px}.z-10{z-index:10}.tracking-tight{letter-spacing:-.025em}
</style>
