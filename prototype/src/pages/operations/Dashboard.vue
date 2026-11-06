<script setup>
import {computed,ref} from 'vue'
import {useDemo} from '../../stores/demo.js'
import StatusBadge from '../../components/StatusBadge.vue'
import FeaturedBanner from './visual/FeaturedBanner.vue'
import StatsCards from './visual/StatsCards.vue'
import DataCoverage from './visual/DataCoverage.vue'
import WorkflowSnapshot from './visual/WorkflowSnapshot.vue'
import ComplianceChart from './visual/ComplianceChart.vue'
import RecentIncidents from './visual/RecentIncidents.vue'
import {eventColumns,label} from './common.js'
const store=useDemo(),filtersOpen=ref(false)
const filter=computed(()=>store.state.selection)
const events=computed(()=>store.selectEvents(filter.value))
const summary=computed(()=>store.summarize(events.value))
const ids=computed(()=>new Set(events.value.map(e=>e.id)))
const review=computed(()=>events.value.filter(e=>['submitted','resubmitted','under_review'].includes(e.status)))
const actions=computed(()=>store.visibleRecords('actions').filter(a=>ids.value.has(a.eventId)&&a.status!=='completed'))
const cases=computed(()=>store.visibleRecords('cases').filter(c=>ids.value.has(c.eventId)))
const reports=computed(()=>store.visibleRecords('reports').filter(r=>ids.value.has(r.eventId)))
const validated=computed(()=>events.value.filter(e=>e.status==='validated').length)
const pending=computed(()=>events.value.filter(e=>!['validated','draft'].includes(e.status)).length)
const years=computed(()=>[...new Set(store.visibleEvents.value.filter(e=>!e.dateUnknown&&e.date).map(e=>e.date.slice(0,4)))].sort().reverse())
const stats=computed(()=>({fleet_incidents:events.value.length,involved_vessels:new Set(events.value.flatMap(e=>(e.vessels||[]).map(v=>v.id||v.name))).size,validated:validated.value,pending_actions:actions.value.length}))
const coverage=computed(()=>{const vessels=events.value.flatMap(e=>e.vessels||[]),percent=(records,predicate)=>records.length?Math.round(records.filter(predicate).length/records.length*100):null;return {registry_ids:percent(vessels,v=>!!v.officialNumber||!!v.imoNumber),voyage_details:percent(vessels,v=>!!v.voyage?.origin&&!!v.voyage?.destination),weather_data:reports.value.some(r=>r.fields?.weatherConditions?.length)?percent(events.value,e=>reports.value.some(r=>r.eventId===e.id&&r.fields?.weatherConditions?.length)):null,vessel_specs:percent(vessels,v=>v.grossTonnage!==null&&v.grossTonnage!==undefined&&!!v.hull),crew_manifest:percent(events.value,e=>e.consequences?.crew!==null&&e.consequences?.crew!==undefined),cargo_log:percent(vessels,v=>!!v.voyage?.cargoType)}})
const recent=computed(()=>[...events.value].sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt))).slice(0,3).map(e=>({id:e.id,ref:e.ref,vessel:e.vessels?.map(v=>v.name).join(' / '),type:e.type,severity:label(e.seriousness),status:label(e.status)})))
const trends=computed(()=>[...summary.value.byMonth].filter(t=>t.name!=='Unknown').sort((a,b)=>a.name.localeCompare(b.name)).slice(-5))
const topTypes=computed(()=>[...summary.value.byType].sort((a,b)=>b.count-a.count).slice(0,3))
const sources=computed(()=>Object.entries(events.value.reduce((a,e)=>{const key=e.sourceType||'Source unknown';a[key]=(a[key]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]).slice(0,3))
</script>
<template>
 <div class="q-px-lg q-py-lg dashboard-bg-navy dashboard-source">
  <div class="row items-center justify-between q-mb-lg"><div class="row items-center q-gutter-x-sm"><q-icon name="dashboard" color="primary" size="sm"/><h2 class="text-h5 text-weight-bolder text-primary-theme q-my-none dashboard-title">Dashboard</h2></div><div class="row q-gutter-sm"><q-btn flat dense no-caps icon="filter_list" label="Filters" @click="filtersOpen=true"/><q-btn v-if="store.can('review')" unelevated color="primary" no-caps icon="add" label="Record incident" to="/admin/incidents/new"/></div></div>
  <div class="row q-col-gutter-lg items-start">
   <div class="col-12 col-lg-8 column q-gutter-y-lg">
    <FeaturedBanner/>
    <StatsCards :stats="stats"/>
    <DataCoverage :coverage="coverage"/>
    <div class="row q-col-gutter-lg"><div class="col-12 col-md-6"><q-card flat class="bg-surface border-outline-variant rounded-xl p-6 h-full"><h3 class="source-section-title">Top 3 most reported incident types</h3><div v-for="(t,i) in topTypes" :key="t.name" class="row items-center justify-between source-highlight q-mt-sm"><div class="row items-center"><q-avatar size="32px" :class="i===0?'bg-red-1 text-red':i===1?'bg-teal-1 text-teal':'bg-blue-1 text-blue'"><q-icon :name="t.name==='Grounding'?'waves':t.name.includes('Engine')?'build':'directions_boat'" size="15px"/></q-avatar><span class="q-ml-sm text-weight-bold">{{t.name}}</span></div><strong class="font-mono">{{t.count}}</strong></div><p v-if="!topTypes.length" class="muted q-mt-md">No incidents in this selection.</p></q-card></div><div class="col-12 col-md-6"><q-card flat class="bg-surface border-outline-variant rounded-xl p-6 h-full"><h3 class="source-section-title">Location Capture</h3><div v-for="[name,count] in [['Reported position',summary.located],['Approximate position',summary.approximate],['Unlocated',summary.unlocated]]" :key="name" class="q-mt-md"><div class="row justify-between q-mb-xs"><span class="font-mono text-weight-bold">{{name}}</span><strong>{{count}}</strong></div><q-linear-progress :value="summary.events?count/summary.events:0" class="progress-navy" size="8px" rounded/></div><q-btn flat dense no-caps color="primary" label="Open map" to="/admin/map" class="q-mt-md"/></q-card></div></div>
    <RecentIncidents :incidents="recent"/>
    <q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><div class="row justify-between items-center q-mb-md"><h3 class="source-section-title q-mb-none">Review Priorities</h3><q-btn v-if="store.can('review')" flat no-caps label="Review queue" icon-right="arrow_forward" to="/admin/review" color="primary"/></div><q-table flat :rows="review" :columns="eventColumns.filter(c=>['ref','date','status','actions'].includes(c.name))" row-key="id" :pagination="{rowsPerPage:5}" no-data-label="No incidents await review"><template #body-cell-ref="p"><q-td :props="p"><router-link class="record-link" :to="`/admin/incidents/${p.row.id}`">{{p.row.ref}}</router-link></q-td></template><template #body-cell-status="p"><q-td :props="p"><StatusBadge :status="p.row.status"/></q-td></template><template #body-cell-actions="p"><q-td :props="p"><q-btn flat dense no-caps label="Open" :to="`/admin/incidents/${p.row.id}`"/></q-td></template></q-table></q-card>
   </div>
   <div class="col-12 col-lg-4 column q-gutter-y-lg">
    <WorkflowSnapshot :verified="validated" :pending="pending"/>
    <ComplianceChart :user-name="store.currentUser.value?.name?.split(' ')[0]||'User'" :trends="trends"/>
    <q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><h3 class="source-section-title">Information Sources</h3><div v-for="[name,count] in sources" :key="name" class="row items-center source-highlight q-mt-sm"><q-avatar size="40px" color="primary" text-color="white" class="font-mono text-caption text-weight-bold">{{name.slice(0,3).toUpperCase()}}</q-avatar><div class="q-ml-md"><h4 class="q-my-none text-weight-bold">{{name}}</h4><p class="q-my-none text-caption muted font-mono">{{count}} incident records</p></div></div><p v-if="!sources.length" class="muted q-mt-md">No sources recorded.</p></q-card>
    <q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><h3 class="source-section-title">Known Consequences</h3><div v-for="[name,count] in [['Fatalities',summary.fatalities],['Missing',summary.missing],['Injured',summary.injured],['Unknown fatality counts',summary.unknownFatalities]]" :key="name" class="row justify-between q-mt-md"><span class="muted">{{name}}</span><strong class="font-mono">{{count}}</strong></div><div class="source-footer q-mt-lg"><q-icon name="info_outline" class="q-mr-xs"/>Counted once per event. Unknown counts remain unknown.</div></q-card>
    <q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><h3 class="source-section-title">Investigation &amp; Follow-up</h3><q-list separator><q-item><q-item-section>MAIC revisions</q-item-section><q-item-section side>{{reports.length}}</q-item-section></q-item><q-item><q-item-section>Issued revisions</q-item-section><q-item-section side>{{reports.filter(r=>r.status==='issued').length}}</q-item-section></q-item><q-item v-if="store.can('enforce')"><q-item-section>Enforcement cases</q-item-section><q-item-section side>{{cases.length}}</q-item-section></q-item></q-list><q-btn flat no-caps color="primary" label="Recommendation actions" to="/admin/actions" class="q-mt-md"/></q-card>
   </div>
  </div>
  <q-dialog v-model="filtersOpen"><q-card style="width:560px;max-width:94vw"><q-card-section><h3 class="source-section-title">Dashboard Selection</h3><div class="form-grid"><q-select v-model="filter.year" :options="years" clearable outlined label="Occurrence year"/><q-select v-model="filter.aor" :options="store.state.offices.map(o=>o.id)" clearable outlined label="Area of responsibility"/></div><p class="muted q-mt-md">This selection is shared with the registry, analytics and map. Unknown dates are excluded when a year is selected.</p></q-card-section><q-card-actions align="right"><q-btn flat no-caps label="Clear selection" @click="Object.keys(filter).forEach(k=>filter[k]='')"/><q-btn color="primary" no-caps label="Done" v-close-popup/></q-card-actions></q-card></q-dialog>
 </div>
</template>
<style scoped>
.dashboard-bg-navy{background:var(--dashboard-bg,#f4f5f7);min-height:100vh}.dashboard-title{font-family:'Hanken Grotesk',sans-serif;color:#002147;font-weight:800}.bg-surface{background:#fff}.border-outline-variant{border:1px solid #eaedff}.rounded-xl{border-radius:16px!important}.p-6{padding:24px}.h-full{height:100%}.source-section-title{font-family:'Hanken Grotesk',sans-serif;font-size:20px;color:#002147;font-weight:800;margin:0 0 16px}.source-highlight{border:1px solid #eaedff;border-radius:8px;padding:6px 12px}.font-mono{font-family:'JetBrains Mono',monospace}.source-footer{border-top:1px solid #eaedff;padding-top:16px;color:#8a99ad;font-size:11px}.progress-navy :deep(.q-linear-progress__model){background:#002147!important}.progress-navy :deep(.q-linear-progress__track){background:#f2f3ff!important}
:global(body.body--dark) .dashboard-source{background:var(--ss-bg)}:global(body.body--dark) .dashboard-source :deep(.bg-surface){background:var(--ss-card)}:global(body.body--dark) .dashboard-source :deep(h3),:global(body.body--dark) .dashboard-source :deep(h4),:global(body.body--dark) .dashboard-source .dashboard-title{color:var(--ss-text)!important}:global(body.body--dark) .dashboard-source .source-highlight{border-color:var(--ss-border)}
@media(max-width:700px){.dashboard-source :deep(.q-card){min-width:0;max-width:100%}}
@media(max-width:599px){.dashboard-source{padding:20px 15px}.p-6{padding:20px}}
</style>
