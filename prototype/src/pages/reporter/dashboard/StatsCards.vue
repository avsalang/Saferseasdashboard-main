<template>
  <div class="row q-col-gutter-lg q-mb-lg">
    <div
      v-for="(stat, idx) in stats"
      :key="stat.label"
      :class="[
        (idx === 0 || idx === 3) ? 'col-12' : 'col-6',
        'col-sm-6',
        'col-md-3'
      ]"
    >
      <q-card
        flat
        class="stat-card relative-position overflow-hidden"
        :class="{ 'gradient-card': idx === 0, 'white-card': idx !== 0 }"
      >
        <template v-if="loading">
          <div class="stat-content full-width">
            <q-skeleton type="text" width="60%" class="q-mb-sm" :dark="idx === 0" />
            <q-skeleton type="rect" height="32px" width="40%" class="q-mb-md" :dark="idx === 0" style="border-radius: 8px;" />
            <q-skeleton type="text" width="75%" :dark="idx === 0" />
          </div>
          <q-skeleton type="QAvatar" size="34px" :dark="idx === 0" style="border-radius: 8px;" />
        </template>

        <template v-else>
          <div class="stat-content">
            <div class="row items-center no-wrap stat-label-row">
              <span class="stat-label q-mr-xs" :class="{ 'text-white-muted': idx === 0 }">{{ stat.label }}</span>
              <q-btn
                flat round dense
                icon="info_outline"
                size="10px"
                :color="idx === 0 ? 'white' : 'grey-6'"
                @click.stop="openInfo(stat.type)"
                class="info-btn"
              >
                <q-tooltip anchor="top middle" self="bottom middle">Click for details & formula</q-tooltip>
              </q-btn>
            </div>
            <p class="stat-val" :class="{ 'text-white': idx === 0 }">{{ stat.value }}</p>

            <div class="stat-delta"><span :class="idx === 0 ? 'text-white-muted-sm' : 'delta-neu'">{{ stat.trendText }}</span></div>
          </div>
          <div class="stat-icon" :class="{ 'gradient-icon-bg': idx === 0 }" :style="idx !== 0 ? `background: ${stat.iconBg}` : ''">
            <q-icon :name="stat.icon" size="18px" :style="idx !== 0 ? `color: ${stat.iconColor}` : 'color: rgba(255,255,255,0.9)'" />
          </div>

          <!-- Watermark for gradient card -->
          <q-icon
            v-if="idx === 0"
            :name="stat.icon"
            class="watermark-icon absolute"
          />
        </template>
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
import { computed, ref } from 'vue'
import { useDemo } from '../../../stores/demo.js'
const props=defineProps({year:{type:[String,Number],required:true}}),store=useDemo()
const loading=false,showInfoDialog=ref(false),activeInfoTitle=ref(''),activeInfoDesc=ref(''),activeInfoFormula=ref('')
const events=computed(()=>store.selectEvents({year:String(props.year)}))
const stats=computed(()=>[
{type:'incidents',label:'Total incidents',value:events.value.length,icon:'warning',iconColor:'#A32D2D',iconBg:'#FCEBEB',trendText:'Own / permitted reports'},
{type:'vessels',label:'Vessel involvements',value:events.value.reduce((n,e)=>n+e.vessels.length,0),icon:'directions_boat',iconColor:'#185FA5',iconBg:'#E6F1FB',trendText:'Across selected-year incidents'},
{type:'corrections',label:'Corrections requested',value:events.value.filter(e=>e.status==='correction_requested').length,icon:'assignment_return',iconColor:'#854F0B',iconBg:'#FAEEDA',trendText:'Awaiting your response'},
{type:'drafts',label:'Saved drafts',value:events.value.filter(e=>e.status==='draft').length,icon:'edit_note',iconColor:'#185FA5',iconBg:'#E6F1FB',trendText:'Ready to continue'}])
function openInfo(type){const item=stats.value.find(s=>s.type===type);activeInfoTitle.value=item.label;const info={incidents:['One event is counted once, regardless of involved vessels or submitted revisions. Unknown occurrence dates are excluded from a known year.','Count(permitted incidents in selected occurrence year)'],vessels:['Each vessel snapshot attached to an event counts as one involvement. This is not a count of vessels currently at sea.','Sum(involved vessels per selected event)'],corrections:['Reports for which MARINA has requested a correction from the issued account.','Count(selected events with correction_requested status)'],drafts:['Unsubmitted reports saved locally in this browser for the selected year.','Count(selected events with draft status)']}[type];activeInfoDesc.value=info[0];activeInfoFormula.value=info[1];showInfoDialog.value=true}

</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
  height: 140px;
}

.gradient-card {
  background: linear-gradient(135deg, #002147 0%, #003366 100%) !important;
  border: none !important;
}

.gradient-icon-bg {
  background: rgba(255, 255, 255, 0.2) !important;
}

.watermark-icon {
  font-size: 110px !important;
  color: rgba(255, 255, 255, 0.06) !important;
  bottom: -25px;
  right: -25px;
  pointer-events: none;
  user-select: none;
}

.text-white-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.text-white-muted-sm {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 12px;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label-row {
  margin-bottom: 6px;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.2;
  margin: 0;
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

.stat-val {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 12px;
}

.stat-delta {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delta-up {
  color: #3B6D11;
}

.delta-dn {
  color: #A32D2D;
}

.delta-neu {
  color: #6b7280;
}

.green-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3B6D11;
  display: inline-block;
  vertical-align: middle;
  margin-right: 4px;
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

@media (max-width: 599px) {
  .stat-card {
    height: 105px !important;
    padding: 12px 14px !important;
    border-radius: 12px !important;
  }
  .stat-val {
    font-size: 24px !important;
    margin-bottom: 4px !important;
  }
  .watermark-icon {
    font-size: 70px !important;
    bottom: -15px !important;
    right: -15px !important;
  }
}
</style>
