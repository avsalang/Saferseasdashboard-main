<template>
  <div class="table-card relative-position column no-wrap" style="height: 500px;">
    <div class="table-hd">
      <div style="display:flex;align-items:center;gap:10px;">
        <p style="font-size:15px;font-weight:500;color:#111827;margin:0;">Recent incident records</p>
        <q-btn
          flat round dense
          icon="info_outline"
          size="11px"
          color="grey-6"
          class="info-btn"
          @click.stop="showInfoDialog = true"
        >
          <q-tooltip anchor="top middle" self="bottom middle">Click for details & formula</q-tooltip>
        </q-btn>
        <span class="live-badge">Demo records</span>
      </div>
      <a class="view-all" href="#/reporter/reports" @click="router.push('/reporter/reports')">View all</a>
    </div>

    <div class="col overflow-auto">
      <!-- Desktop/Tablet Table View -->
      <table class="tbl gt-xs">
        <thead>
          <tr>
            <th>Vessel</th>
            <th>Casualty</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr v-for="i in 3" :key="i">
            <td><q-skeleton type="text" width="70%" /></td>
            <td><q-skeleton type="text" width="50%" /></td>
            <td><q-skeleton type="rect" height="20px" width="60px" style="border-radius: 12px;" /></td>
            <td><q-skeleton type="rect" height="20px" width="60px" style="border-radius: 12px;" /></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="row in recentIncidents" :key="row.id" role="link" tabindex="0" style="cursor:pointer" @click="openRecord(row)" @keydown.enter="openRecord(row)">
            <td style="font-weight:500;color:#111827;">{{ row.vessel || 'Unknown Vessel' }}</td>
            <td style="color:#6b7280;">{{ row.type || 'None' }}</td>
            <td>
              <span class="status" :class="getSeverityBadgeClass(row.severity).bg">
                <span class="sdot" :style="{ background: getSeverityBadgeClass(row.severity).dot }"></span>
                {{ row.severity || 'Unknown' }}
              </span>
            </td>
            <td>
              <span class="status" :class="getStatusBadgeClass(row.status).bg">
                <span class="sdot" :style="{ background: getStatusBadgeClass(row.status).dot }"></span>
                {{ row.status || 'Draft' }}
              </span>
            </td>
          </tr>
          <tr v-if="recentIncidents.length === 0">
            <td colspan="4" class="text-center text-grey-6 py-4">No recent incident records found</td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile List View -->
      <div class="mobile-list lt-sm q-py-sm">
        <div v-if="loading" class="q-px-md q-py-sm column q-gutter-sm">
          <div v-for="i in 3" :key="i" class="mobile-item q-py-md">
            <q-skeleton type="text" width="60%" class="q-mb-xs" />
            <q-skeleton type="text" width="40%" class="q-mb-md" />
            <div class="row q-gutter-sm">
              <q-skeleton type="rect" height="20px" width="60px" style="border-radius: 12px;" />
              <q-skeleton type="rect" height="20px" width="60px" style="border-radius: 12px;" />
            </div>
          </div>
        </div>
        <div v-else>
          <div v-for="row in recentIncidents" :key="row.id" class="mobile-item q-px-md q-py-md" role="link" tabindex="0" @click="openRecord(row)" @keydown.enter="openRecord(row)">
            <div class="row items-center justify-between no-wrap">
              <div class="column">
                <span class="vessel-name">{{ row.vessel || 'Unknown Vessel' }}</span>
                <span class="casualty-type">{{ row.type || 'None' }}</span>
              </div>
              <div class="column items-end q-gutter-xs">
                <span class="status" :class="getSeverityBadgeClass(row.severity).bg">
                  <span class="sdot" :style="{ background: getSeverityBadgeClass(row.severity).dot }"></span>
                  {{ row.severity || 'Unknown' }}
                </span>
                <span class="status" :class="getStatusBadgeClass(row.status).bg">
                  <span class="sdot" :style="{ background: getStatusBadgeClass(row.status).dot }"></span>
                  {{ row.status || 'Draft' }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="recentIncidents.length === 0" class="text-center text-grey-6 q-py-lg">
            No recent incident records found
          </div>
        </div>
      </div>
    </div>

    <div class="table-footer">
      <span class="footer-text">
        <template v-if="loading">
          <q-skeleton type="text" width="120px" />
        </template>
        <template v-else>
          Showing {{ recentIncidents.length }} of {{ totalCount }} records
        </template>
      </span>
      <button class="btn-outline-small" @click="router.push('/reporter/reports')">View comprehensive registry</button>
    </div>
  </div>

  <!-- Info Dialog -->
  <q-dialog v-model="showInfoDialog">
    <q-card style="width: 440px; max-width: 90vw; border-radius: 16px;" class="q-pa-md info-popup-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 font-bold text-blue-10">Recent Incident Records</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p class="text-body2 text-grey-8" style="line-height: 1.6;">
          Lists the most recent incident logs submitted to the fleet registry, displaying the reporting vessel, incident type (casualty), severity classification, and submission status.
        </p>
        <div class="q-mt-lg q-pa-md bg-blue-50 rounded-borders formula-box">
          <p class="text-caption font-bold text-blue-10 q-mb-sm">Formula / Calculation Logic:</p>
          <code class="text-caption text-blue-9 text-weight-medium formula-code">Recent Records = Fetch(Latest Incidents, Limit = 3)</code>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDemo } from '../../../stores/demo.js'
const props=defineProps({year:{type:[String,Number],required:true}}),store=useDemo(),router=useRouter()
const loading=false,showInfoDialog=ref(false)
const selected=computed(()=>store.selectEvents({year:String(props.year)})),totalCount=computed(()=>selected.value.length)
const recentIncidents=computed(()=>[...selected.value].sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0,3).map(e=>({...e,vessel:e.vessels.map(v=>v.name).join(' / '),severity:(e.seriousness||'unknown').replaceAll('_',' '),status:e.status.replaceAll('_',' ')})))
function openRecord(row){router.push('/reporter/reports/'+row.id)}
function getSeverityBadgeClass(value){return value==='very serious'?{bg:'s-red',dot:'#A32D2D'}:value==='serious'?{bg:'s-amber',dot:'#854F0B'}:value==='less serious'?{bg:'s-green',dot:'#3B6D11'}:{bg:'s-blue',dot:'#185FA5'}}
function getStatusBadgeClass(value){return value==='validated'?{bg:'s-green',dot:'#3B6D11'}:['under review','correction requested','submitted','resubmitted'].includes(value)?{bg:'s-amber',dot:'#854F0B'}:{bg:'s-blue',dot:'#185FA5'}}

</script>

<style scoped>
.table-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(18, 36, 58, 0.12), 0 2px 12px rgba(18, 36, 58, 0.06) !important;
  overflow: hidden;
}

.table-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 0.5px solid #f3f4f6;
}

.live-badge {
  font-size: 11px;
  font-weight: 500;
  background: #EAF3DE;
  color: #3B6D11;
  padding: 3px 8px;
  border-radius: 20px;
  line-height: 1;
}

.view-all {
  font-size: 12px;
  color: #378ADD;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.tbl th {
  text-align: left;
  padding: 9px 16px;
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 0.5px solid #e2e5ea;
}

.tbl td {
  padding: 11px 16px;
  color: #374151;
  border-bottom: 0.5px solid #f3f4f6;
  vertical-align: middle;
}

.tbl tr:last-child td {
  border-bottom: none;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 20px;
}

.s-red {
  background: #FCEBEB;
  color: #A32D2D;
}

.s-amber {
  background: #FAEEDA;
  color: #854F0B;
}

.s-green {
  background: #EAF3DE;
  color: #3B6D11;
}

.s-blue {
  background: #E6F1FB;
  color: #185FA5;
}

.sdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.table-footer {
  padding: 12px 16px;
  border-top: 0.5px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-text {
  font-size: 12px;
  color: #9ca3af;
}

.btn-outline-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 0.5px solid #d1d5db;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-outline-small:hover {
  background: #f9fafb;
  border-color: #c0c4cc;
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

.mobile-item {
  border-bottom: 0.5px solid #f3f4f6;
}
.mobile-item:last-child {
  border-bottom: none;
}
.vessel-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.casualty-type {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
</style>
