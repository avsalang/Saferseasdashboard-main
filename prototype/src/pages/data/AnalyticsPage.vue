<script setup>
import {useQuasar} from 'quasar'
import {assessOutput,assessRequirements,reportingAssessmentMetadata} from '../../data/reportingRequirements.js'
import {confirmReportingExport,reportingExportRows} from '../../lib/reportingExport.js'
import { computed,ref,watch,onMounted,onBeforeUnmount,nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent,TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDemo } from '../../stores/demo.js'
import { downloadCSV } from '../../lib/exports.js'
const q=useQuasar(),store=useDemo(),tab=ref('patterns'),dimension=ref('type'),element=ref(null)
echarts.use([BarChart,GridComponent,TooltipComponent,CanvasRenderer])
const selection=computed({get:()=>store.state.selection,set:v=>{store.state.selection=v;store.persist()}})
const showFilters=ref(false),draft=ref({})
const tabs=[{id:'patterns',num:1,label:'Incident patterns'},{id:'offices',num:2,label:'Geography & vessels'},{id:'consequences',num:3,label:'Consequences'},{id:'quality',num:4,label:'Data quality'}]
const activeTabObj=computed(()=>tabs.find(item=>item.id===tab.value)||tabs[0])
const activeChips=computed(()=>Object.entries(selection.value).filter(([,value])=>value&&String(value).toLowerCase()!=='all').map(([key,value])=>({key,label:`${key}: ${value}`})))
const filterFields=[['year','Year'],['type','Type of Incident / Accident'],['seriousness','Level of Maritime Accident (MARINA)'],['aor','Area of Responsibility (AOR)'],['homeport','Homeport Office'],['cpc','CPC Issuing Office'],['issuingOffice','Actual Issuing MRO'],['positionQuality','Position Quality'],['vesselType','Type of Ship']]
function optionsFor(key){return [...new Set(store.visibleEvents.value.flatMap(event=>key==='year'?[event.dateUnknown?null:event.date?.slice(0,4)]:key==='vesselType'?(event.vessels||[]).map(v=>v.type):[event[key]]).filter(Boolean))].sort()}
function resetDraft(){draft.value=Object.fromEntries(filterFields.map(([key])=>[key,'All']))}
function openFilters(){resetDraft();Object.entries(selection.value).forEach(([key,value])=>{draft.value[key]=String(value).toLowerCase()==='all'?'All':value});showFilters.value=true}
function applyFilters(){selection.value={...draft.value};showFilters.value=false}
function removeChip(key){const next={...selection.value};delete next[key];selection.value=next}
function setActiveTab(id){tab.value=id;if(id==='offices')dimension.value='aor'}
const events=computed(()=>store.selectEvents(selection.value)),summary=computed(()=>store.summarize(events.value))
const dimensions=[{label:'Type of Incident / Accident',value:'type'},{label:'Level of Maritime Accident (MARINA)',value:'seriousness'},{label:'Occurrence month',value:'month'},{label:'Type of Ship (vessel involvements)',value:'vesselType'},{label:'Area of Responsibility (AOR)',value:'aor'},{label:'Homeport Office',value:'homeport'},{label:'CPC Issuing Office',value:'cpc'},{label:'Actual Issuing MRO',value:'issuingOffice'}]
const rows=computed(()=>{
 if(tab.value==='consequences')return ['fatalities','missing','injured','rescued','totalOnboard','crew','passengers'].map(key=>({Category:key,Count:events.value.reduce((sum,e)=>sum+(e.consequences?.[key]??0),0),Unit:'Known persons',Unknown:events.value.filter(e=>e.consequences?.[key]==null).length}))
 if(tab.value==='quality')return [{Category:'Unknown occurrence date',Count:events.value.filter(e=>!e.date).length,Unit:'Events'},{Category:'Unknown occurrence time',Count:events.value.filter(e=>!e.time).length,Unit:'Events'},{Category:'Unknown seriousness',Count:events.value.filter(e=>!e.seriousness||e.seriousness==='unknown').length,Unit:'Events'},{Category:'Approximate position',Count:events.value.filter(e=>e.positionQuality==='approximate').length,Unit:'Events'},{Category:'Unlocated',Count:events.value.filter(e=>e.positionQuality==='unknown'||e.lat==null||e.lon==null).length,Unit:'Events'},{Category:'No source lineage',Count:events.value.filter(e=>!e.sourceLineage?.row).length,Unit:'Events'},{Category:'Unknown gross tonnage',Count:events.value.flatMap(e=>e.vessels||[]).filter(v=>v.grossTonnage==null).length,Unit:'Vessel involvements'}]
 const key=dimension.value,groups=new Map()
 const items=key==='vesselType'?events.value.flatMap(e=>(e.vessels||[]).map(v=>({category:v.type}))):events.value.map(e=>({category:key==='month'?((!e.dateUnknown && e.date?.slice(0,7)) || 'Unknown date'):e[key]}))
 items.forEach(item=>{const category=item.category || 'Unknown';groups.set(category,(groups.get(category)||0)+1)})
 return [...groups].map(([Category,Count])=>({Category,Count,Unit:key==='vesselType'?'Vessel involvements':'Events'})).sort((a,b)=>b.Count-a.Count)
})
const columns=computed(()=>[{name:'category',label:'Dimension / measure',field:'Category',align:'left'},{name:'count',label:tab.value==='consequences'?'Known persons':'Count',field:'Count'},{name:'unit',label:'Unit',field:'Unit'},...(tab.value==='consequences'?[{name:'unknown',label:'Events with unknown value',field:'Unknown'}]:[])])
const analyticsReadiness=computed(()=>{
 if(tab.value==='quality')return assessOutput('O22',events.value)
 if(tab.value==='consequences')return assessOutput('O11',events.value)
 const key=dimension.value,items=[]
 for(const event of events.value){
  if(key==='vesselType')items.push(...assessOutput('O05',[event]).items.filter(item=>item.field==='type'))
  else{const field=key==='month'?'date':key;const value=field==='date'&&event.dateUnknown?null:event[field];items.push(...assessRequirements([{key:field,label:dimensions.find(d=>d.value===key)?.label||field,value,allowNotApplicable:false}],event.reportingExceptions).items.map(item=>({...item,eventId:event.id,eventRef:event.ref})))}
 }
 return {items,unresolved:items.filter(item=>item.status==='missing'),explained:items.filter(item=>item.status==='explained'),ready:items.every(item=>item.status!=='missing')}
})
async function exportAnalytics(){if(await confirmReportingExport(q,analyticsReadiness.value))downloadCSV('analytics-'+tab.value+'.csv',reportingExportRows(rows.value,analyticsReadiness.value))}
let chart,observer
async function draw(){await nextTick();if(!element.value)return;if(!chart)chart=echarts.init(element.value);chart.setOption({animationDuration:250,grid:{left:170,right:35,top:20,bottom:40,containLabel:false},tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},xAxis:{type:'value',minInterval:1,name:tab.value==='consequences'?'Known persons':'Count'},yAxis:{type:'category',data:rows.value.map(r=>r.Category).reverse(),axisLabel:{width:155,overflow:'truncate'}},series:[{type:'bar',data:rows.value.map(r=>r.Count).reverse(),itemStyle:{color:tab.value==='quality'?'#b7791f':'#2b6cb0',borderRadius:[0,5,5,0]},label:{show:true,position:'right'}}]},true)}
watch([rows,tab],draw);onMounted(()=>{draw();observer=new ResizeObserver(()=>chart?.resize());if(element.value)observer.observe(element.value)});onBeforeUnmount(()=>{observer?.disconnect();chart?.dispose()})
</script>
<template>
  <q-page class="main-page">
    <div class="main">
      <!-- Reused from Monitoring/Analytics/IndexPage.vue: breadcrumb/action ribbon. -->
      <div class="row items-center justify-between q-col-gutter-y-md q-mb-lg ribbon-header">
        <div class="col-12 col-sm-auto row items-center q-gutter-x-sm text-caption text-weight-medium" style="font-size:13px;color:#5b6478">
          <q-icon name="dashboard" color="primary" size="xs" /><router-link to="/admin" style="color:#5b6478;text-decoration:none" class="hover-primary">Dashboard</router-link><q-icon name="chevron_right" color="grey-5" size="xs" /><span style="color:#8b93a3">Monitoring</span><q-icon name="chevron_right" color="grey-5" size="xs" /><span style="color:#0e2a6e;font-weight:600">Analytics</span>
        </div>
        <div class="col-12 col-sm-auto"><div class="row q-col-gutter-x-sm"><div class="col-6 col-sm-auto"><button class="btn full-width justify-center" @click="openFilters"><q-icon name="tune" size="16px" class="q-mr-xs" />Filters<span class="filter-badge">{{activeChips.length}}</span></button></div><div class="col-6 col-sm-auto"><button v-if="store.can('export')" class="btn full-width justify-center" @click="exportAnalytics"><q-icon name="download" size="16px" class="q-mr-xs" />Export CSV</button></div></div></div>
      </div>
      <q-banner v-if="!analyticsReadiness.ready" dense class="bg-orange-1 text-dark q-mb-md">INCOMPLETE WORKING COPY · {{analyticsReadiness.unresolved.length}} required reporting field(s) remain unresolved.</q-banner><div class="notice"><b>Reported-data note —</b> metrics use fictional scoped incident records. They are not exposure-normalized. Event, vessel-involvement and person denominators remain distinct; unknown values are not observed zero.</div>
      <div class="active-chips"><span v-for="chip in activeChips" :key="chip.key" class="chip">{{chip.label}}<button @click="removeChip(chip.key)" :aria-label="'Remove '+chip.key">×</button></span><button v-if="activeChips.length" class="chip-clear" @click="selection={}">Reset filters</button></div>
      <div class="mobile-tabs-menu q-mb-md"><q-btn unelevated class="full-width mobile-tab-select-btn" no-caps><div class="row items-center justify-between full-width"><div class="row items-center q-gutter-x-sm"><span class="tab-num-badge">{{activeTabObj.num}}</span><span class="text-weight-bold">{{activeTabObj.label}}</span></div><q-icon name="menu" size="20px" class="burger-icon" /></div><q-menu fit anchor="bottom left" self="top left" class="mobile-tabs-dropdown-menu"><q-list style="min-width:200px"><q-item v-for="item in tabs" :key="item.id" clickable v-close-popup :active="tab===item.id" active-class="active-mobile-tab" @click="setActiveTab(item.id)"><q-item-section avatar class="min-width-auto q-pr-sm"><span class="tab-num-badge small-badge">{{item.num}}</span></q-item-section><q-item-section><q-item-label class="text-weight-medium">{{item.label}}</q-item-label></q-item-section></q-item></q-list></q-menu></q-btn></div>
      <div class="tabbar" role="tablist"><button v-for="item in tabs" :key="item.id" :class="['tab',{active:tab===item.id}]" role="tab" :aria-selected="tab===item.id" @click="setActiveTab(item.id)"><span class="tab-num">{{item.num}}</span>{{item.label}}</button></div>
      <div class="tab-content">
        <div class="group"><div class="group-head"><span class="group-num">{{activeTabObj.num}}</span><div><h2 class="group-title">{{activeTabObj.label}}</h2><p class="group-desc">{{summary.events}} unique events · {{summary.vesselInvolvements}} vessel involvements · {{summary.unlocated}} unlocated events in this selection.</p></div></div>
          <!-- Reused metric/card markup and CSS from Analytics/components/SelectionSummary.vue. -->
          <div class="grid-3 q-mb-md"><div class="metric-card"><div class="metric-top"><span class="metric-icon bg-blue-light text-blue"><q-icon name="description" /></span><span class="metric-label">Incident records</span></div><div class="metric-value">{{summary.events}}</div><div class="metric-caption">Unique event IDs in the current selection</div></div><div class="metric-card"><div class="metric-top"><span class="metric-icon bg-coral-light text-coral"><q-icon name="medical_services" /></span><span class="metric-label">Fatalities and injuries</span></div><div class="metric-value text-coral">{{summary.fatalities}} / {{summary.injured}}</div><div class="metric-caption">Known fatalities / injured · {{summary.unknownFatalities}} events have unknown fatalities</div></div><div class="metric-card"><div class="metric-top"><span class="metric-icon bg-red-light text-red"><q-icon name="warning" /></span><span class="metric-label">Very serious events</span></div><div class="metric-value text-red">{{events.filter(e=>e.seriousness==='very_serious').length}}</div><div class="metric-caption">Exact seriousness code; independent of risk</div></div></div>
          <div class="card"><div class="card-head row items-center justify-between q-gutter-md"><div><h3 class="card-title">Selected record distribution</h3><p class="card-desc">Current scoped population and explicit measure units</p></div><q-select v-if="tab==='patterns'||tab==='offices'" v-model="dimension" outlined dense emit-value map-options :options="tab==='offices'?dimensions.filter(d=>['aor','homeport','cpc','issuingOffice','vesselType'].includes(d.value)):dimensions" label="Group selection by" style="min-width:240px" /></div><div class="chart-wrap"><div ref="element" class="analytics-chart" aria-label="Computed count chart" /></div><p class="card-desc">{{tab==='consequences'?'One current consequence observation per event. Known persons and unknown-event coverage are separate; person measures may overlap.':tab==='quality'?'Quality flags overlap and must not be added as distinct event totals.':`Denominator: ${dimension==='vesselType'?'vessel involvements':'unique events'}. Unknown occurrence dates remain explicit.`}}</p></div>
          <div class="card q-mt-md"><div class="card-head"><h3 class="card-title">Underlying selection data</h3><p class="card-desc">CSV includes the complete table across every page</p></div><q-table flat :rows="rows" :columns="columns" row-key="Category" :pagination="{rowsPerPage:10}" /></div>
          <div class="row justify-end q-gutter-sm q-mt-md"><q-btn no-caps flat color="primary" icon="map" label="Map this selection" to="/admin/map" /><q-btn no-caps flat color="primary" icon="description" label="Build a report" to="/admin/reports" /></div>
        </div>
      </div>
      <!-- Reused AnalyticsFiltersDialog overlay/head/body/footer structure. -->
      <q-dialog v-model="showFilters" persistent maximized transition-show="fade" transition-hide="fade" class="custom-overlay"><div class="overlay-container" @click.self="showFilters=false"><div class="dialog-card"><div class="dialog-head"><div><h2 class="dialog-title">Filters</h2><p class="dialog-desc">Apply the same record filters so analytics, maps and exports stay aligned.</p></div><button class="dialog-close" @click="showFilters=false" aria-label="Close filters"><q-icon name="close" size="20px" /></button></div><div class="dialog-body"><div class="field-grid"><div v-for="[key,label] in filterFields" :key="key" class="field"><label :for="'analytics-'+key">{{label}}</label><select :id="'analytics-'+key" v-model="draft[key]"><option value="All">All</option><option v-for="option in optionsFor(key)" :key="option" :value="option">{{option}}</option></select></div><div class="field"><label for="analytics-search">Search</label><input id="analytics-search" v-model="draft.search" placeholder="Reference, vessel or place" /></div><div class="field"><label for="analytics-from">From date</label><input id="analytics-from" v-model="draft.dateFrom" type="date" /></div><div class="field"><label for="analytics-to">To date</label><input id="analytics-to" v-model="draft.dateTo" type="date" /></div></div></div><div class="dialog-footer"><button class="btn" @click="resetDraft">Reset filters</button><div class="row q-gutter-sm"><button class="btn" @click="showFilters=false">Cancel</button><button class="btn btn-primary" @click="applyFilters">Apply filters</button></div></div></div></div></q-dialog>
    </div>
  </q-page>
</template>
<style scoped>

.main-page {
  background: #f4f5f8;
  color: #0f1730;
  min-height: 100vh;
}

.main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 32px 64px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 25px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0f1730;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.page-sub {
  font-size: 13.5px;
  color: #5b6478;
  margin: 0;
  max-width: 620px;
}
.head-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e4e7ee;
  background: #fff;
  color: #0f1730;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover {
  background: #edeff4;
}

.filter-badge {
  background: #0e2a6e;
  color: #fff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  margin-left: 6px;
}

.notice {
  background: #fff;
  border: 1px solid #e4e7ee;
  border-left: 3px solid #185fa5;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 12.5px;
  color: #5b6478;
  margin-bottom: 22px;
  line-height: 1.55;
}
.notice b {
  color: #0f1730;
  font-weight: 600;
}

.active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e6f1fb;
  color: #185fa5;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 8px 5px 11px;
  border-radius: 999px;
}
.chip button {
  border: none;
  background: rgba(24, 95, 165, 0.12);
  color: #185fa5;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
}
.chip button:hover {
  background: rgba(24, 95, 165, 0.22);
}
.chip-clear {
  font-size: 12px;
  color: #5b6478;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 4px;
}
.chip-clear:hover {
  color: #0f1730;
  text-decoration: underline;
}

/* Tabs */
.tabbar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e4e7ee;
  margin-bottom: 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tabbar::-webkit-scrollbar {
  display: none;
}
.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #5b6478;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s ease;
}
.tab:hover {
  color: #0f1730;
}
.tab.active {
  color: #0e2a6e;
  border-bottom-color: #0e2a6e;
}
.tab-num {
  font-size: 10.5px;
  font-weight: 700;
  color: #8b93a3;
  background: #edeff4;
  border-radius: 5px;
  padding: 1px 6px;
  flex-shrink: 0;
}
.tab.active .tab-num {
  background: #e6f1fb;
  color: #0e2a6e;
}

/* Mobile responsive tabs layout */
.mobile-tabs-menu {
  display: none;
}
.mobile-tab-select-btn {
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 10px;
  color: #0f1730;
  padding: 10px 16px;
  text-align: left;
}
.tab-num-badge {
  font-size: 11px;
  font-weight: 700;
  color: #0e2a6e;
  background: #e6f1fb;
  border-radius: 5px;
  padding: 2px 7px;
  display: inline-block;
}
.tab-num-badge.small-badge {
  padding: 1px 6px;
}
.active-mobile-tab {
  background: #e6f1fb;
  color: #0e2a6e;
}
.min-width-auto {
  min-width: auto !important;
}
.burger-icon {
  color: #5b6478;
}

@media (max-width: 600px) {
  .tabbar {
    display: none !important;
  }
  .mobile-tabs-menu {
    display: block !important;
  }
}

/* Tab Transition */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}


/* Reusable styling scoped to match the HTML design exactly */
.group {
  margin-bottom: 34px;
}
.group-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}
.group-num {
  font-size: 11px;
  font-weight: 700;
  color: #185fa5;
  background: #e6f1fb;
  border-radius: 6px;
  padding: 2px 7px;
}
.group-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #0f1730;
}
.group-desc {
  font-size: 12.5px;
  color: #5b6478;
  margin: 2px 0 0;
}

/* Grids */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (max-width: 980px) {
  .grid-3, .grid-2 {
    grid-template-columns: 1fr;
  }
}

/* Metric Cards */
.metric-card {
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 14px;
  padding: 16px 18px;
}
.metric-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.metric-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.metric-label {
  font-size: 12px;
  color: #5b6478;
  font-weight: 600;
}
.metric-value {
  font-size: 25px;
  font-weight: 700;
  line-height: 1.1;
}
.metric-caption {
  font-size: 11.5px;
  color: #8b93a3;
  margin-top: 4px;
}

/* Color classes from design system tokens */
.bg-blue-light { background: #e6f1fb; }
.text-blue { color: #185fa5; }
.bg-coral-light { background: #faece7; }
.text-coral { color: #993c1d; }
.bg-red-light { background: #fcebeb; }
.text-red { color: #a32d2d; }

/* Standard Cards */
.card {
  background: #ffffff;
  border: 1px solid #e4e7ee;
  border-radius: 14px;
  padding: 18px 20px;
}
.card-head {
  margin-bottom: 14px;
}
.card-title {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0;
  color: #0f1730;
}
.card-desc {
  font-size: 11.5px;
  color: #8b93a3;
  margin: 3px 0 0;
  line-height: 1.5;
}

.chart-wrap {
  position: relative;
  width: 100%;
}

.chart-legend {
  display: flex;
  gap: 14px;
  font-size: 11.5px;
  color: #5b6478;
  margin-bottom: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.legend-box {
  width: 9px;
  height: 9px;
  border-radius: 2px;
}
.bg-red { background: #a32d2d; }
.bg-amber { background: #ef9f27; }


/* Full screen overlay container matching the HTML design */
.custom-overlay :deep(.q-dialog__inner) {
  padding: 0;
  background: transparent;
}
.overlay-container {
  width: 100vw;
  height: 100vh;
  background: rgba(10, 16, 40, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
  overflow-y: auto;
}
.dialog-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 760px;
  box-shadow: 0 24px 60px rgba(10, 16, 40, 0.25);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
}

.dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e7ee;
}
.dialog-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0f1730;
}
.dialog-desc {
  font-size: 12.5px;
  color: #5b6478;
  margin: 0;
  max-width: 520px;
}
.dialog-close {
  border: none;
  background: #edeff4;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5b6478;
  flex-shrink: 0;
  padding: 0;
}
.dialog-close:hover {
  background: #e4e7ee;
  color: #0f1730;
}

.dialog-body {
  padding: 20px 24px;
  overflow-y: auto;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 16px;
}
@media (max-width: 700px) {
  .field-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.field label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: #5b6478;
  margin-bottom: 5px;
}
.field select {
  width: 100%;
  border: 1px solid #e4e7ee;
  border-radius: 8px;
  padding: 8px 9px;
  font-size: 12.5px;
  color: #0f1730;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}
.field select:focus {
  border-color: #185fa5;
  box-shadow: 0 0 0 2px rgba(24, 95, 165, 0.15);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ee;
}
.footer-count {
  font-size: 12.5px;
  color: #5b6478;
}
.footer-count b {
  color: #0f1730;
}
.footer-btns {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e4e7ee;
  background: #fff;
  color: #0f1730;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: 9px;
  cursor: pointer;
}
.btn:hover {
  background: #edeff4;
}
.btn-primary {
  background: #0e2a6e;
  color: #fff;
  border-color: #0e2a6e;
}
.btn-primary:hover {
  background: #0a1f52;
}

@media (max-width: 600px) {
  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 16px;
  }
  .footer-count {
    text-align: center;
  }
  .footer-btns {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
  }
  .footer-btns .btn {
    flex: 1;
    justify-content: center;
  }
}

.analytics-chart{height:380px;width:100%}.field input{width:100%;padding:9px 11px;border:1px solid #e4e7ee;border-radius:8px;background:#fff;color:#0f1730}.main{min-width:0}@media(max-width:600px){.main{padding:24px 16px 48px}.analytics-chart{height:330px}}
</style>
