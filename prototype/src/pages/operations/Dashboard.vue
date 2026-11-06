<script setup>
import {computed,ref} from 'vue'
import {useDemo} from '../../stores/demo.js'
import FeaturedBanner from './visual/FeaturedBanner.vue'
import StatsCards from './visual/StatsCards.vue'
import TaskCards from './visual/TaskCards.vue'
import WorkQueue from './visual/WorkQueue.vue'
import DataCoverage from './visual/DataCoverage.vue'
import WorkflowSnapshot from './visual/WorkflowSnapshot.vue'
import ComplianceChart from './visual/ComplianceChart.vue'
import RecentIncidents from './visual/RecentIncidents.vue'
import {label} from './common.js'
const store=useDemo(),filtersOpen=ref(false),selected=ref(''),error=ref('')
const user=computed(()=>store.currentUser.value)
const investigatorView=computed(()=>user.value?.role==='investigator')
const filter=computed(()=>store.state.selection)
const events=computed(()=>store.selectEvents(filter.value)),workEvents=computed(()=>store.visibleEvents.value)
const summary=computed(()=>store.summarize(events.value))
const ids=computed(()=>new Set(events.value.map(e=>e.id)))
const actions=computed(()=>store.visibleRecords('actions').filter(a=>ids.value.has(a.eventId)&&a.status!=='completed'))
const cases=computed(()=>store.visibleRecords('cases').filter(c=>ids.value.has(c.eventId)))
const reports=computed(()=>store.visibleRecords('reports').filter(r=>ids.value.has(r.eventId)))
const validated=computed(()=>events.value.filter(e=>e.status==='validated').length)
const pending=computed(()=>events.value.filter(e=>!['validated','draft'].includes(e.status)).length)
const years=computed(()=>[...new Set(store.visibleEvents.value.filter(e=>!e.dateUnknown&&e.date).map(e=>e.date.slice(0,4)))].sort().reverse())
const eventEntry=e=>({id:e.id,eventId:e.id,title:`${e.ref} · ${e.type}`,detail:(e.vessels||[]).map(v=>v.name).join(' / ')||e.place||'Vessel not recorded',note:e.status==='correction_requested'?[...(e.history||[])].reverse().find(h=>h.status==='correction_requested')?.remarks:label(e.status),href:`/admin/incidents/${e.id}`,startReview:['submitted','resubmitted'].includes(e.status)&&store.can('review',e),action:e.status==='under_review'?'Review report':'Open',icon:'description'})
const queues=computed(()=>{
 const all=workEvents.value,reportRows=store.visibleRecords('reports').filter(r=>r.type!=='spot'&&r.status==='draft'),actionRows=store.visibleRecords('actions').filter(a=>a.status!=='completed'),caseRows=store.visibleRecords('cases').filter(c=>!['closed','dismissed'].includes(c.status))
 return [
 {id:'pending',label:'New reports',icon:'inbox',link:'/admin/review',entries:all.filter(e=>e.status==='submitted').map(eventEntry)},
 {id:'resubmitted',label:'Resubmitted',icon:'assignment_return',link:'/admin/review',entries:all.filter(e=>e.status==='resubmitted').map(eventEntry)},
 {id:'corrections',label:'Awaiting corrections',icon:'edit_note',link:'/admin/review',entries:all.filter(e=>e.status==='correction_requested').map(eventEntry)},
 {id:'review',label:'In review',icon:'fact_check',link:'/admin/review',entries:all.filter(e=>e.status==='under_review').map(eventEntry)},
 {id:'incoming',label:'Incoming incidents',icon:'move_to_inbox',link:'/admin/investigations?queue=unassigned',entries:all.filter(e=>e.status!=='draft'&&!e.investigatorId).map(e=>({...eventEntry(e),href:`/admin/investigations/${e.id}`,startReview:false,action:'Assign / investigate'}))},
 {id:'assigned',label:'Assigned to me',icon:'assignment_ind',link:'/admin/investigations?queue=mine',entries:all.filter(e=>e.status!=='draft'&&e.investigatorId===user.value?.id).map(e=>({...eventEntry(e),href:`/admin/investigations/${e.id}`,startReview:false,action:'Continue'}))},
 {id:'drafts',label:'Draft MAIC reports',icon:'description',link:'/admin/investigations?queue=drafts',entries:reportRows.map(r=>({id:r.id,eventId:r.eventId,title:`Form ${r.type} · revision ${r.revision}`,detail:store.getEvent(r.eventId)?.ref||'Incident',note:r.asOf?`As of ${r.asOf}`:'As-of date not set',href:{path:`/admin/investigations/${r.eventId}`,query:{reportId:r.id}},action:'Continue draft',icon:'edit_document'}))},
 {id:'actions',label:'Follow-up actions',icon:'task_alt',link:'/admin/actions',entries:actionRows.map(a=>({id:a.id,eventId:a.eventId,title:a.title,detail:store.getEvent(a.eventId)?.ref||'Incident',note:`Due ${a.dueDate||'not set'} · ${store.state.users.find(u=>u.id===a.ownerId)?.name||'Unassigned'}`,href:{path:'/admin/actions',query:{eventId:a.eventId}},action:'Update action',icon:'task_alt'}))},
 {id:'cases',label:'Open cases',icon:'gavel',link:'/admin/cases',entries:caseRows.map(c=>({id:c.id,eventId:c.eventId,title:c.caseNumber,detail:c.party||'Party not recorded',note:label(c.status),href:`/admin/cases/${c.id}`,action:'Open case',icon:'gavel'}))},
 ].map(q=>({...q,count:q.entries.length}))
})
const priorityIds=computed(()=>investigatorView.value?['incoming','assigned','drafts','cases']:['pending','resubmitted','corrections','review'])
const priorityTasks=computed(()=>priorityIds.value.map(id=>queues.value.find(q=>q.id===id)))
const selectedId=computed({get:()=>selected.value||priorityIds.value[0],set:value=>{selected.value=value}})
const activeQueue=computed(()=>queues.value.find(q=>q.id===selectedId.value)||queues.value[0])
const queueTabs=computed(()=>priorityTasks.value)
const stats=computed(()=>({fleet_incidents:events.value.length,involved_vessels:new Set(events.value.flatMap(e=>(e.vessels||[]).map(v=>v.id||v.name))).size,validated:validated.value,pending_actions:actions.value.length}))
const coverage=computed(()=>{const vessels=events.value.flatMap(e=>e.vessels||[]),percent=(records,predicate)=>records.length?Math.round(records.filter(predicate).length/records.length*100):null;return{registry_ids:percent(vessels,v=>!!v.officialNumber||!!v.imoNumber),voyage_details:percent(vessels,v=>!!v.voyage?.origin&&!!v.voyage?.destination),weather_data:reports.value.some(r=>r.fields?.weatherConditions?.length)?percent(events.value,e=>reports.value.some(r=>r.eventId===e.id&&r.fields?.weatherConditions?.length)):null,vessel_specs:percent(vessels,v=>v.grossTonnage!==null&&v.grossTonnage!==undefined&&!!v.hull),crew_manifest:percent(events.value,e=>e.consequences?.crew!==null&&e.consequences?.crew!==undefined),cargo_log:percent(vessels,v=>!!v.voyage?.cargoType)}})
const recent=computed(()=>[...events.value].sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt))).slice(0,3).map(e=>({id:e.id,ref:e.ref,vessel:e.vessels?.map(v=>v.name).join(' / '),type:e.type,severity:label(e.seriousness),status:label(e.status)})))
const trends=computed(()=>[...summary.value.byMonth].filter(t=>t.name!=='Unknown').sort((a,b)=>a.name.localeCompare(b.name)).slice(-5))
async function startReview(id){try{store.transition(id,'under_review');error.value=''}catch(e){error.value=e.message}}
</script>
<template><div class="q-px-lg q-py-lg dashboard-bg-navy dashboard-source">
 <div class="row items-center justify-between q-mb-lg"><div class="row items-center q-gutter-x-sm"><q-icon name="dashboard" color="primary" size="sm"/><h2 class="text-h5 text-weight-bolder text-primary-theme q-my-none dashboard-title">Dashboard</h2></div><div class="row q-gutter-sm"><q-btn flat dense no-caps icon="filter_list" label="Filters" @click="filtersOpen=true"/><q-btn v-if="store.can('report')" unelevated color="primary" no-caps icon="add" label="Record incident" to="/admin/incidents/new"/></div></div>
 <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md" rounded>{{error}}</q-banner>
 <div class="row q-col-gutter-lg items-start"><div class="col-12 col-lg-8 column q-gutter-y-lg">
  <div><h3 class="source-section-title q-mb-sm">{{investigatorView?'Investigation priorities':'Review priorities'}}</h3><p class="muted q-mb-md">Choose a task to continue. The work queue shows the reports within your account and office scope.</p><TaskCards :tasks="priorityTasks" :selected="selectedId" @select="selectedId=$event"/></div>
  <WorkQueue v-model="selectedId" title="Work queue" :tabs="queueTabs" :entries="activeQueue.entries" :all-link="activeQueue.link" @start-review="startReview"/>
  <FeaturedBanner/>
  <RecentIncidents :incidents="recent"/>
  <StaticSection label="Overview and data quality" icon="analytics" class="overview-details" header-class="text-weight-bold"><div class="column q-gutter-y-lg q-pt-md"><StatsCards :stats="stats"/><DataCoverage :coverage="coverage"/><q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><h3 class="source-section-title">Known consequences</h3><div v-for="[name,count] in [['Fatalities',summary.fatalities],['Missing',summary.missing],['Injured',summary.injured],['Unknown fatality counts',summary.unknownFatalities]]" :key="name" class="row justify-between q-mt-md"><span class="muted">{{name}}</span><strong class="font-mono">{{count}}</strong></div><p class="source-footer q-mt-lg q-mb-none">Counted once per event. Unknown counts remain unknown.</p></q-card></div></StaticSection>
 </div><div class="col-12 col-lg-4 column q-gutter-y-lg">
  <q-card flat class="bg-surface border-outline-variant rounded-xl p-6"><h3 class="source-section-title">Start a task</h3><q-list class="task-links"><q-item clickable to="/admin/incidents/new" v-if="store.can('report')"><q-item-section avatar><q-icon name="add_circle_outline" color="primary"/></q-item-section><q-item-section>Record an incident</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/review" v-if="store.can('review')"><q-item-section avatar><q-icon name="fact_check" color="primary"/></q-item-section><q-item-section>Review reports</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/investigations" v-if="store.can('investigate')"><q-item-section avatar><q-icon name="assignment" color="primary"/></q-item-section><q-item-section>Investigations</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/actions"><q-item-section avatar><q-icon name="task_alt" color="primary"/></q-item-section><q-item-section>Follow-up actions</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/cases" v-if="store.can('enforce')"><q-item-section avatar><q-icon name="gavel" color="primary"/></q-item-section><q-item-section>Cases</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/reports"><q-item-section avatar><q-icon name="description" color="primary"/></q-item-section><q-item-section>Create an output</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item><q-item clickable to="/admin/map"><q-item-section avatar><q-icon name="map" color="primary"/></q-item-section><q-item-section>Reports &amp; maps</q-item-section><q-item-section side><q-icon name="chevron_right"/></q-item-section></q-item></q-list></q-card>
  <StaticSection label="Review progress" icon="donut_large" class="overview-details" header-class="text-weight-bold"><WorkflowSnapshot :verified="validated" :pending="pending" class="q-mt-md"/></StaticSection>
  <StaticSection label="Incident trends" icon="bar_chart" class="overview-details" header-class="text-weight-bold"><ComplianceChart :user-name="user?.name?.split(' ')[0]||'User'" :trends="trends" class="q-mt-md"/></StaticSection>
 </div></div>
 <q-dialog v-model="filtersOpen"><q-card style="width:560px;max-width:94vw"><q-card-section><h3 class="source-section-title">Overview selection</h3><div class="form-grid"><q-select v-model="filter.year" :options="years" clearable outlined label="Occurrence year"/><q-select v-model="filter.aor" :options="store.state.offices.map(o=>o.id)" clearable outlined label="Area of responsibility"/></div><p class="muted q-mt-md">Applies to the overview, data quality, recent records, analytics and map. Your work queue continues to show all records in your scope.</p></q-card-section><q-card-actions align="right"><q-btn flat no-caps label="Clear selection" @click="Object.keys(filter).forEach(k=>filter[k]='')"/><q-btn color="primary" no-caps label="Done" v-close-popup/></q-card-actions></q-card></q-dialog>
</div></template>
<style scoped>
.dashboard-bg-navy{background:var(--dashboard-bg,#f4f5f7);min-height:100vh}.dashboard-title{font-family:'Hanken Grotesk',sans-serif;color:#002147;font-weight:800}.bg-surface{background:#fff}.border-outline-variant{border:1px solid #eaedff}.rounded-xl{border-radius:16px!important}.p-6{padding:24px}.h-full{height:100%}.source-section-title{font-family:'Hanken Grotesk',sans-serif;font-size:20px;color:#002147;font-weight:800;margin:0 0 16px}.source-highlight{border:1px solid #eaedff;border-radius:8px;padding:6px 12px}.font-mono{font-family:'JetBrains Mono',monospace}.source-footer{border-top:1px solid #eaedff;padding-top:16px;color:#8a99ad;font-size:11px}.progress-navy :deep(.q-linear-progress__model){background:#002147!important}.progress-navy :deep(.q-linear-progress__track){background:#f2f3ff!important}
:global(body.body--dark) .dashboard-source{background:var(--ss-bg)}:global(body.body--dark) .dashboard-source :deep(.bg-surface){background:var(--ss-card)}:global(body.body--dark) .dashboard-source :deep(h3),:global(body.body--dark) .dashboard-source :deep(h4),:global(body.body--dark) .dashboard-source .dashboard-title{color:var(--ss-text)!important}:global(body.body--dark) .dashboard-source .source-highlight{border-color:var(--ss-border)}
@media(max-width:700px){.dashboard-source :deep(.q-card){min-width:0;max-width:100%}}
@media(max-width:599px){.dashboard-source{padding:20px 15px}.p-6{padding:20px}}

.overview-details{border:1px solid #eaedff;border-radius:16px;background:var(--ss-card,#fff);overflow:hidden}.task-links .q-item{padding-left:0;padding-right:0;min-height:50px}.task-links .q-item__section--avatar{min-width:38px}.task-links .q-item+.q-item{border-top:1px solid var(--ss-border,#eaedff)}
</style>
