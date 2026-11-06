<template>
  <div>
    <div class="row items-center justify-between q-mb-lg">
      <h3 class="text-subtitle1 text-weight-bold text-primary-theme q-my-none" style="font-family: 'Hanken Grotesk', sans-serif; font-size: 18px;">Recent Incident Records</h3>
      <q-btn flat color="primary" label="View All" icon-right="arrow_forward" no-caps class="text-weight-bold text-caption" to="/admin/incidents" />
    </div>

    <div v-if="loading" class="row justify-center items-center q-my-lg" style="min-height: 160px;">
      <q-spinner color="primary" size="2.5em" />
    </div>

    <div v-else class="row q-col-gutter-lg">
      <!-- Dynamic Incident Cards -->
      <div
        v-for="(incident, index) in incidents"
        :key="incident.id"
        class="col-12 col-md-4 flex"
      >
        <q-card
          flat
          class="bg-surface rounded-2xl border-outline-variant overflow-hidden hover-shadow-primary hover-lift cursor-pointer column full-width"
          @click="viewIncident(incident.id)"
        >
          <div class="h-40 relative-position">
            <img :src="getIncidentImage(index)" alt="Illustrative maritime setting" class="full-width full-height object-cover" style="height: 160px; width: 100%; object-fit: cover;" />
          </div>
          <q-card-section class="flex-1 column q-pa-md">
            <span
              class="inline-block self-start px-2 py-0.5 rounded text-micro text-weight-bold uppercase q-mb-sm"
              :class="getSeverityBadgeClass(incident.severity)"
            >
              {{ incident.severity || 'Incident' }}
            </span>
            <h4 class="text-subtitle2 text-weight-bold q-my-none text-primary-theme leading-tight hover-text-tint transition-colors">
              {{ incident.vessel || 'Unknown Vessel' }} - {{ incident.type || 'General Incident' }}
            </h4>
            <div class="row items-center q-gutter-x-sm q-pt-md border-t-variant mt-auto">
              <div class="w-6 h-6 rounded bg-surface-container flex flex-center text-secondary text-micro text-weight-bold">PH</div>
              <div>
                <p class="text-micro text-weight-bold text-primary-theme q-my-none">{{ incident.status || 'Draft' }}</p>
                <p class="text-micro text-secondary q-my-none">{{ incident.ref }}</p>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="incidents.length === 0" class="col-12 text-center text-secondary q-py-lg">
        No recent incidents recorded.
      </div>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
import batangasPortImg from './assets/batangas_port.png'
import manilaBayImg from './assets/manila_bay.png'
import davaoGulfImg from './assets/davao_gulf.png'
defineProps({incidents:{type:Array,default:()=>[]}})
const router=useRouter(),loading=false
const imagePlaceholders=[batangasPortImg,manilaBayImg,davaoGulfImg]
const getIncidentImage=index=>imagePlaceholders[index%imagePlaceholders.length]
const getSeverityBadgeClass=severity=>String(severity).includes('very serious')?'bg-red-1 text-red':'bg-tint-10 text-tint'
const viewIncident=id=>router.push(`/admin/incidents/${id}`)
</script>

<style scoped>
.bg-surface {
  background: #ffffff;
}

.border-outline-variant {
  border: 1px solid #dae2fd;
}

.rounded-2xl {
  border-radius: 16px !important;
}

.p-md {
  padding: 16px;
}

.h-40 {
  height: 160px;
}

.bg-black-20 {
  background: rgba(0, 0, 0, 0.2);
}

.bg-tint-10 {
  background: rgba(70, 95, 136, 0.1);
}

.text-tint {
  color: #465f88;
}

.text-red {
  color: #ba1a1a;
}

.bg-red-1 {
  background: #ffdad6;
}

.border-t-variant {
  border-top: 1px solid rgba(218, 226, 253, 0.5);
}

.hover-shadow-primary {
  transition: all 0.3s ease;
}

.hover-shadow-primary:hover {
  box-shadow: 0 10px 25px -5px rgba(70, 95, 136, 0.1), 0 8px 10px -6px rgba(70, 95, 136, 0.1);
  border-color: #465f88;
}

.hover-text-tint:hover {
  color: #465f88 !important;
}

.text-primary-theme {
  color: var(--text-primary);
}

.text-secondary {
  color: #58657f;
}

.text-micro {
  font-size: 10px;
}

:global(body.body--dark) .bg-surface{background:var(--ss-card)}
:global(body.body--dark) .border-outline-variant{border-color:var(--ss-border)}
:global(body.body--dark) .text-primary-theme{color:var(--ss-text)!important}
:global(body.body--dark) .label-custom{color:var(--ss-muted)}
</style>
