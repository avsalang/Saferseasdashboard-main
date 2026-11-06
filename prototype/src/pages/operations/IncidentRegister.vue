<script setup>
import {useQuasar} from 'quasar'
import {assessOutput,mergeReportingAssessments,reportingAssessmentMetadata} from '../../data/reportingRequirements.js'
import {assessOperationalOutput} from './reportRequirements.js'
import {confirmReportingExport,reportingExportRows} from '../../lib/reportingExport.js'
import { computed, ref, watch } from 'vue'
import { useDemo } from '../../stores/demo.js'
import RegistryStats from './visual/RegistryStats.vue'
import { downloadCSV } from '../../lib/exports.js'
import { eventColumns, clone } from './common.js'
import{reviewQueue}from'../../data/workQueues.js'
import { createIncidentSnapshot } from './registerExport.js'
const props = defineProps({review:Boolean})
const q=useQuasar()
const store = useDemo()
const filters = computed(()=>store.state.selection)
const years=computed(()=>[...new Set(store.visibleEvents.value.filter(e=>e.date && !e.dateUnknown).map(e=>e.date.slice(0,4)))].sort().reverse())
const queueView=ref('ready'),baseRows=computed(()=>store.selectEvents(filters.value));
const rows=computed(()=>props.review?reviewQueue(baseRows.value,queueView.value):baseRows.value)
const involved = computed(()=>rows.value.reduce((n,e)=>n+(e.vessels?.length || 0),0))
const error=ref(''), dialog=ref(false), selected=ref(null), remarks=ref('')
function transition(event,status){try{error.value='';store.transition(event.id,status,remarks.value);dialog.value=false;remarks.value=''}catch(e){error.value=e.message}}
function request(event){selected.value=event;remarks.value='';dialog.value=true}
async function csv(){try{const readiness=mergeReportingAssessments(assessOutput('O01',rows.value),assessOperationalOutput('O01',rows.value,{cases:store.visibleRecords('cases'),reports:store.visibleRecords('reports')}));if(!await confirmReportingExport(q,readiness))return;error.value='';if(!store.can('export'))throw Error('Export permission required.');const selection=clone(filters.value),snapshot=createIncidentSnapshot(rows.value,selection,{review:props.review});snapshot.rows=reportingExportRows(snapshot.rows,readiness);Object.assign(snapshot.metadata,reportingAssessmentMetadata(readiness));downloadCSV('incident-register.csv',snapshot.rows);store.recordExport({name:snapshot.title,outputId:'incident-register',format:'CSV',status:readiness.ready?'ready':'working_copy',selection:{...selection,queue:props.review?'review':'all'},snapshot,revision:store.visibleRecords('exports').filter(e=>e.outputId==='incident-register').length+1,notes:'Event-level register; browser-local demo'})}catch(e){error.value=e.message}}

const filtersOpen=ref(false),pagination=ref({rowsPerPage:10,sortBy:props.review?'received':'date',descending:true,page:1})
const activeFiltersCount=computed(()=>Object.values(filters.value).filter(v=>v!==''&&v!==null&&v!==undefined&&!['all','All'].includes(v)).length)
const registryStats=computed(()=>[
 {label:'Awaiting Review',value:rows.value.filter(e=>['submitted','resubmitted'].includes(e.status)).length,icon:'pending_actions',iconBg:'#FAEEDA',iconColor:'#854F0B'},
 {label:'Under Review',value:rows.value.filter(e=>e.status==='under_review').length,icon:'fact_check',iconBg:'#E6F1FB',iconColor:'#185FA5'},
 {label:props.review?'Awaiting Corrections':'Validated Reports',value:props.review?reviewQueue(baseRows.value,'waiting').length:rows.value.filter(e=>e.status==='validated').length,icon:'verified_user',iconBg:'#EAF3DE',iconColor:'#3B6D11'},
 {label:'Total Incident Records',value:rows.value.length,icon:'folder_open',iconBg:'rgba(24,95,165,.1)',iconColor:'#185FA5'},
])
const queueColumns=computed(()=>props.review?[eventColumns[0],{name:'received',label:'Last received / updated',field:r=>r.updatedAt||r.createdAt||r.receivedDate||'',format:value=>!value?'Unknown':value.includes('T')?new Date(value).toLocaleString('en-PH',{timeZone:store.state.settings.timezone||'Asia/Manila',dateStyle:'short',timeStyle:'short'}):value,align:'left',sortable:true,sort:(a,b)=>(Date.parse(a)||0)-(Date.parse(b)||0)},...eventColumns.slice(1)]:eventColumns);
watch(queueView,()=>pagination.value.page=1);watch(()=>props.review,value=>{queueView.value='ready';pagination.value={...pagination.value,page:1,sortBy:value?'received':'date'}});
const statusColor=status=>status==='validated'?'green':status==='correction_requested'?'red':status==='under_review'?'amber':'grey'
const formatStatus=status=>String(status||'Unknown').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())
function refresh(){pagination.value={...pagination.value,page:1};store.persist()}
</script>

<template><div class="q-pa-lg dashboard-bg tracking-page">
 <div class="row items-center q-mb-md"><div class="col-12 col-md-6"><q-breadcrumbs class="breadcrumbs q-mb-md"><q-breadcrumbs-el label="Dashboard" icon="home" to="/admin"/><q-breadcrumbs-el :label="review?'Review Queue':'Incidents'"/></q-breadcrumbs><h1 class="page-title">{{review?'Review queue':'Incident register'}}</h1><div class="page-sub">{{review?'Review reported events and coordinate correction requests':'National maritime incident registry and safety coordination platform'}}</div></div><q-space/><div class="col-12 col-md-auto q-gutter-sm row items-center header-actions-wrapper"><q-btn outline no-caps icon="filter_list" label="Filters" @click="filtersOpen=true" class="btn-filter-trigger text-weight-medium"><q-badge v-if="activeFiltersCount" color="red" floating rounded>{{activeFiltersCount}}</q-badge></q-btn><q-btn outline no-caps icon="refresh" label="Refresh" @click="refresh" class="btn-refresh-custom"/><q-btn v-if="store.can('export')" outline no-caps icon="download" label="Export CSV" @click="csv" class="btn-filter-trigger"/><q-btn v-if="store.can('report')" unelevated color="primary" no-caps icon="add" label="New incident" to="/admin/incidents/new"/></div></div>
 <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md" rounded>{{error}}</q-banner>
 <RegistryStats :stats="registryStats"/>
 <div v-if="review" class="panel q-mb-md"><div class="row items-center justify-between q-gutter-md"><q-btn-toggle v-model="queueView" no-caps unelevated toggle-color="primary" :options="[{label:'Needs review',value:'ready'},{label:'Awaiting corrections',value:'waiting'},{label:'All open',value:'all'}]"/><q-btn v-if="activeFiltersCount" flat no-caps label="Clear filters" icon="filter_alt_off" @click="Object.keys(filters).forEach(k=>delete filters[k])"/></div><p class="text-caption muted q-mt-md q-mb-none">{{queueView==='waiting'?'Open a report to add the requested corrections or follow its progress.':'Check the occurrence, vessels, consequences and sources, then validate or request corrections.'}} New and updated reports appear first, including reports about older occurrences.</p></div>
 <q-card flat class="table-card overflow-hidden"><div class="row items-center justify-between q-px-lg q-py-md"><div class="text-h6 text-weight-bold registry-table-title">{{review?'Reports to review':'Incident register'}}</div><span class="text-caption text-grey-6">{{rows.length}} events · {{involved}} vessel involvements</span></div>
 <q-table flat class="bg-transparent premium-table" :grid="$q.screen.lt.md" :rows="rows" :columns="queueColumns" row-key="id" v-model:pagination="pagination" :rows-per-page-options="[10,25,50,0]" no-data-label="No incidents match this selection">
 <template #body-cell-ref="p"><q-td :props="p"><router-link class="record-link" :to="`/admin/incidents/${p.row.id}`">{{p.row.ref}}</router-link><div class="text-caption text-grey-6">{{p.row.vessels?.map(v=>v.name).join(' · ') || 'Vessel unknown'}}</div></q-td></template>
 <template #body-cell-status="p"><q-td :props="p"><div class="status row items-center no-wrap" :class="'s-'+statusColor(p.row.status)"><div class="sdot q-mr-xs"/>{{formatStatus(p.row.status)}}</div></q-td></template>
 <template #body-cell-actions="p"><q-td :props="p"><div class="row no-wrap justify-center q-gutter-xs"><q-btn flat round dense color="primary" icon="visibility" size="sm" class="action-btn" :to="`/admin/incidents/${p.row.id}`" aria-label="View incident"><q-tooltip>View Details</q-tooltip></q-btn><q-btn v-if="store.can('review',p.row)" flat round dense color="grey-6" icon="edit" size="sm" class="action-btn-edit" :to="`/admin/incidents/${p.row.id}/edit`" aria-label="Edit incident"><q-tooltip>Edit Case File</q-tooltip></q-btn><template v-if="review && store.can('review',p.row)"><q-btn v-if="['submitted','resubmitted'].includes(p.row.status)" flat dense no-caps label="Start review" @click="transition(p.row,'under_review')"/><q-btn v-if="p.row.status==='under_review'" flat dense no-caps label="Corrections" @click="request(p.row)"/><q-btn v-if="p.row.status==='under_review'" flat dense color="positive" no-caps label="Validate" @click="transition(p.row,'validated')"/></template></div></q-td></template>
 <template #item="p"><div class="col-12 col-sm-6 q-pa-sm"><q-card flat class="incident-mobile-card overflow-hidden"><div class="incident-card-header q-px-md q-py-sm row justify-between items-center"><span class="text-caption text-weight-bold text-primary font-mono">{{p.row.ref}}</span><div class="status row items-center no-wrap" :class="'s-'+statusColor(p.row.status)"><div class="sdot q-mr-xs"/>{{formatStatus(p.row.status)}}</div></div><div class="q-pa-md"><div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-md">{{p.row.type}}</div><div class="q-gutter-y-sm"><div class="row items-center justify-between"><div class="row items-center text-grey-6 text-caption"><q-icon name="directions_boat" size="16px" class="q-mr-xs text-grey-5"/>Vessel Name</div><span class="text-caption text-weight-bold text-grey-8 text-right" style="max-width:60%">{{p.row.vessels?.map(v=>v.name).join(' / ')||'Unknown Vessel'}}</span></div><div class="row items-center justify-between"><div class="row items-center text-grey-6 text-caption"><q-icon name="place" size="16px" class="q-mr-xs text-grey-5"/>Incident Location</div><span class="text-caption text-weight-bold text-grey-8 text-right" style="max-width:60%">{{p.row.place||'Unknown'}}</span></div><div class="row items-center justify-between"><div class="row items-center text-grey-6 text-caption"><q-icon name="event" size="16px" class="q-mr-xs text-grey-5"/>Occurrence Date</div><span class="text-caption text-weight-bold text-grey-8">{{p.row.dateUnknown?'Unknown date':p.row.date||'Unknown date'}}</span></div></div></div><q-separator/><div class="q-px-md q-py-sm bg-grey-50 row justify-end q-gutter-xs"><q-btn v-if="store.can('review',p.row)" flat no-caps color="grey-7" icon="edit" label="Edit" size="sm" class="btn-edit-mobile text-weight-bold" :to="`/admin/incidents/${p.row.id}/edit`"/><q-btn flat no-caps color="primary" icon="visibility" label="View Details" size="sm" class="btn-view-mobile text-weight-bold" :to="`/admin/incidents/${p.row.id}`"/><template v-if="review && store.can('review',p.row)"><q-btn v-if="['submitted','resubmitted'].includes(p.row.status)" flat dense no-caps label="Start review" @click="transition(p.row,'under_review')"/><q-btn v-if="p.row.status==='under_review'" flat dense no-caps label="Corrections" @click="request(p.row)"/><q-btn v-if="p.row.status==='under_review'" flat dense color="positive" no-caps label="Validate" @click="transition(p.row,'validated')"/></template></div></q-card></div></template>
 <template #no-data><div class="full-width column flex-center q-py-xl text-grey-6"><q-icon name="warning" size="40px" color="grey-4" class="q-mb-sm"/><div class="text-subtitle2 text-weight-bold text-grey-8">No Incidents Found</div><div class="text-caption text-grey-5 q-mt-xs text-center">Try adjusting your filters or keyword query to find results.</div><q-btn flat no-caps color="primary" label="Reset active filters" @click="Object.keys(filters).forEach(k=>filters[k]='')"/></div></template>
 </q-table></q-card>
 <q-dialog v-model="filtersOpen" backdrop-filter="blur(4px)"><q-card style="width:860px;max-width:95vw;border-radius:20px"><div class="row items-center justify-between q-px-lg q-py-md filter-dialog-header"><div><div class="text-subtitle1 text-weight-bold">Filter Incident Registry</div><div class="text-caption text-grey-5">Refine results by specifying time, seriousness, type, and office.</div></div><q-btn icon="close" flat round dense v-close-popup class="text-grey-4" aria-label="Close filters"/></div><q-card-section class="q-px-lg q-py-md scroll filter-dialog-content" style="max-height:65vh"><div class="form-grid"><q-input v-model="filters.search" outlined dense clearable label="Search reference, vessel or place" class="span-2 filter-dialog-input"><template #prepend><q-icon name="search" size="18px" color="primary"/></template></q-input><q-select v-model="filters.year" outlined dense clearable label="Occurrence year" :options="years" class="filter-dialog-input"/><q-select v-model="filters.type" outlined dense clearable label="Type of Incident / Accident" :options="[...new Set(store.visibleEvents.value.map(e=>e.type))]" class="filter-dialog-input"/><q-select v-model="filters.status" outlined dense clearable label="Review status" :options="['draft','submitted','under_review','correction_requested','resubmitted','validated']" class="filter-dialog-input"/><q-select v-model="filters.seriousness" outlined dense clearable label="Level of Maritime Accident (MARINA)" :options="['less_serious','serious','very_serious','unknown']" class="filter-dialog-input"/><q-select v-model="filters.aor" outlined dense clearable label="Area of Responsibility (AOR)" :options="store.state.offices.map(o=>o.id)" class="filter-dialog-input"/><q-select v-model="filters.homeport" outlined dense clearable label="Homeport Office" :options="store.state.offices.map(o=>o.id)" class="filter-dialog-input"/><q-select v-model="filters.cpc" outlined dense clearable label="CPC Issuing Office" :options="store.state.offices.map(o=>o.id)" class="filter-dialog-input"/><q-select v-model="filters.issuingOffice" outlined dense clearable label="Actual Issuing MRO" :options="store.state.offices.map(o=>o.id)" class="filter-dialog-input"/><q-input v-model="filters.dateFrom" type="date" outlined dense label="Occurrence from" stack-label class="filter-dialog-input"/><q-input v-model="filters.dateTo" type="date" outlined dense label="Occurrence to" stack-label class="filter-dialog-input"/></div></q-card-section><q-card-actions align="between" class="q-px-lg q-py-md"><q-btn flat no-caps label="Reset Filters" color="grey-6" @click="Object.keys(filters).forEach(k=>filters[k]='')"/><q-btn unelevated no-caps label="Apply Filters" color="primary" class="btn-primary-custom" @click="pagination.page=1;filtersOpen=false"/></q-card-actions></q-card></q-dialog>
 <q-dialog v-model="dialog"><q-card style="width:560px;max-width:94vw"><q-card-section><div class="text-h6">Request corrections · {{selected?.ref}}</div><p class="muted">The reporter receives this reason and can resubmit the corrected record.</p><q-input v-model="remarks" outlined type="textarea" label="Required correction instructions" autofocus/></q-card-section><q-card-actions align="right"><q-btn flat no-caps label="Cancel" v-close-popup/><q-btn color="primary" no-caps label="Send correction request" :disable="!remarks.trim()" @click="transition(selected,'correction_requested')"/></q-card-actions></q-card></q-dialog>
</div></template>

<style scoped>
.dashboard-bg {
  background: #f8fafc;
  min-height: 100vh;
}

.tracking-page {
  font-family: 'Inter', sans-serif;
}

.page-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.page-sub {
  font-size: 13px;
  color: #64748b;
}

.btn-filter-trigger {
  border-radius: 8px;
  border-color: #cbd5e1;
  color: #475569;
  background: #ffffff;
  transition: all 0.2s ease;
}

.btn-filter-trigger:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-refresh-custom {
  border-radius: 8px;
  border-color: #cbd5e1;
  color: #475569;
  background: #ffffff;
  transition: all 0.2s ease;
}

.btn-refresh-custom:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.recent-list-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02) !important;
  overflow: hidden;
}

.incident-list-item {
  transition: all 0.2s ease;
}

.incident-list-item:hover {
  background: rgba(30, 58, 138, 0.02);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.status-verified {
  background: #EAF3DE;
  color: #3B6D11;
}

.status-review {
  background: #FAEEDA;
  color: #854F0B;
}

.status-invalid {
  background: #FCEBEB;
  color: #A32D2D;
}

.status-submitted {
  background: #f1f5f9;
  color: #475569;
}

.status-resubmitted {
  background: #E6F1FB;
  color: #185FA5;
}

.btn-primary-custom {
  background: #185FA5 !important;
  color: #ffffff !important;
}

.filter-dialog-input :deep(.q-field__control) {
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.divide-y > * {
  border-bottom: 1px solid #f1f5f9;
}
.divide-y > *:last-child {
  border-bottom: none;
}


.table-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(18, 36, 58, 0.12), 0 2px 12px rgba(18, 36, 58, 0.06) !important;
  overflow: hidden;
}

.premium-table :deep(thead tr th) {
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
  border-bottom: 0.5px solid #e2e5ea;
  padding: 12px 16px;
  background: #f9fafb;
}

.premium-table :deep(tbody tr td) {
  padding: 11px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #374151;
  border-bottom: 0.5px solid #f3f4f6;
  vertical-align: middle;
}

.premium-table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.premium-table :deep(tbody tr) {
  transition: all 0.3s ease;
}

.premium-table :deep(tbody tr:hover) {
  background: rgba(30, 58, 138, 0.02) !important;
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

.s-grey {
  background: #f3f4f6;
  color: #64748b;
}

.sdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.action-btn {
  color: #185FA5 !important;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(24, 95, 165, 0.08) !important;
}

.action-btn-edit {
  color: #4b5563 !important;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.action-btn-edit:hover {
  opacity: 1;
  background: rgba(75, 85, 99, 0.08) !important;
}

.premium-table :deep(.q-table__bottom) {
  border-top: 0.5px solid #f3f4f6 !important;
  padding: 12px 20px !important;
  font-size: 12px !important;
  color: #9ca3af !important;
}

.premium-table :deep(.q-table__bottom .q-btn) {
  color: #374151 !important;
  border: 0.5px solid #d1d5db !important;
  border-radius: 7px !important;
  font-size: 12px !important;
  padding: 4px 10px !important;
  background: #ffffff !important;
}

.premium-table :deep(.q-table__bottom .q-pagination .q-btn) {
  color: #4b5563 !important;
  border: none !important;
  background: transparent !important;
  border-radius: 6px !important;
  min-width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
}

.premium-table :deep(.q-table__bottom .q-pagination .q-btn--active) {
  background: #185FA5 !important;
  color: #ffffff !important;
  font-weight: bold !important;
}

:deep(.glass-tooltip) {
  background: rgba(15, 23, 42, 0.9) !important;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-weight: 700;
  font-size: 11px;
}

@media (min-width: 1024px) {
  .table-card {
    min-height: 520px;
    max-height: 680px;
    display: flex;
    flex-direction: column;
  }

  .premium-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .premium-table :deep(.q-table__middle) {
    flex: 1;
    overflow-y: auto;
  }
}

.incident-mobile-card {
  background: #ffffff;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.incident-mobile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important;
}

.incident-card-header {
  background: #f8fafc;
  border-bottom: 0.5px solid #e2e8f0;
}

.bg-grey-50 {
  background: #f8fafc;
}

.btn-view-mobile, .btn-edit-mobile {
  border-radius: 6px;
  font-size: 12px !important;
}

.registry-table-title{font-family:'Hanken Grotesk',sans-serif;color:#0f172a}.header-actions-wrapper{flex-wrap:wrap}.filter-dialog-header{border-bottom:1px solid #f1f5f9;background:#fff}.filter-dialog-content{background:#fafbfe}.font-mono{font-family:'JetBrains Mono',monospace}.table-card{max-height:none}
:global(body.body--dark) .tracking-page{background:var(--ss-bg)}:global(body.body--dark) .tracking-page .page-title,:global(body.body--dark) .registry-table-title{color:var(--ss-text)}:global(body.body--dark) .tracking-page :deep(.stat-card),:global(body.body--dark) .tracking-page .table-card,:global(body.body--dark) .tracking-page .incident-mobile-card{background:var(--ss-card);border-color:var(--ss-border)}:global(body.body--dark) .tracking-page :deep(.stat-val),:global(body.body--dark) .tracking-page :deep(.premium-table tbody tr td){color:var(--ss-text)}:global(body.body--dark) .tracking-page :deep(.premium-table thead tr th),:global(body.body--dark) .tracking-page .incident-card-header,:global(body.body--dark) .tracking-page .bg-grey-50{background:var(--ss-bg)}
@media(max-width:700px){.tracking-page{padding:20px 15px}.header-actions-wrapper{margin-top:16px}.table-card{min-height:0}}
:global(body.body--dark) .tracking-page :deep(.text-grey-8),:global(body.body--dark) .tracking-page :deep(.text-grey-9){color:var(--ss-text)!important}
</style>
