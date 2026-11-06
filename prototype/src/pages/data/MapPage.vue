<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useDemo } from '../../stores/demo.js'
import PageHeader from '../../components/PageHeader.vue'
import DataFilters from './DataFilters.vue'
import {assessOutput,reportingAssessmentMetadata} from '../../data/reportingRequirements.js'
import {confirmReportingExport} from '../../lib/reportingExport.js'
import { downloadGeoJSON, printReport } from '../../lib/exports.js'
const store=useDemo(),route=useRoute(),q=useQuasar()
const showFilters=ref(true),showRecords=ref(false),advancedFilters=ref(false)
const mapFilterFields=[['year','Year','All Years'],['type','Type of Incident / Accident','All Types'],['seriousness','Level of Maritime Accident (MARINA)','All Classifications'],['vesselType','Type of Ship','All Vessels'],['aor','Area of Responsibility (AOR)','All Offices']]
const filterOptions=key=>['All',...new Set(store.visibleEvents.value.flatMap(e=>key==='year'?[e.dateUnknown?null:e.date?.slice(0,4)]:key==='vesselType'?(e.vessels||[]).map(v=>v.type):[e[key]]).filter(Boolean))]
const mapReadiness=computed(()=>assessOutput('O20',events.value))
const printView=async()=>{if(await confirmReportingExport(q,mapReadiness.value))window.print()}
async function exportGeoJSON(){if(await confirmReportingExport(q,mapReadiness.value))downloadGeoJSON('fictional-event-selection.geojson',events.value,reportingAssessmentMetadata(mapReadiness.value))}
const locationMode=computed(()=>route.path==='/admin/locations')
const selection=computed({get:()=>store.state.selection,set:v=>{store.state.selection=v;store.persist()}})
const events=computed(()=>store.selectEvents(selection.value))
const hasPosition=e=>e.positionQuality!=='unknown' && e.lat!=null && e.lat!=='' && e.lon!=null && e.lon!=='' && Number.isFinite(Number(e.lat)) && Number.isFinite(Number(e.lon)) && Math.abs(Number(e.lat))<=90 && Math.abs(Number(e.lon))<=180
const located=computed(()=>events.value.filter(hasPosition)),unlocated=computed(()=>events.value.filter(e=>!hasPosition(e)))
const counts=computed(()=>[{label:'Events in selection',count:events.value.length},{label:'Reported positions',count:located.value.filter(e=>e.positionQuality==='reported').length},{label:'Approximate positions',count:located.value.filter(e=>e.positionQuality==='approximate').length},{label:'Unlocated / invalid',count:unlocated.value.length}])
const mapElement=ref(null),active=ref(null),offline=ref(false),review=ref(false),target=ref(null),latitude=ref(null),longitude=ref(null),quality=ref('approximate'),source=ref(''),notes=ref(''),error=ref(''),tab=ref('all')
let map,markers,tileLayer
const zoom=direction=>direction>0?map?.zoomIn():map?.zoomOut()
const columns=[{name:'ref',label:'Reference',field:'ref',align:'left'},{name:'place',label:'Raw reported place',field:'place',align:'left'},{name:'quality',label:'Quality',field:'positionQuality'},{name:'coordinates',label:'Coordinates',field:e=>hasPosition(e)?`${e.lat}, ${e.lon}`:'Unknown'},{name:'actions',label:'Review',field:'id'}]
const locationRows=computed(()=>tab.value==='unlocated'?unlocated.value:tab.value==='approximate'?events.value.filter(e=>e.positionQuality==='approximate'):events.value)
function redraw(){if(!map)return;markers.clearLayers();located.value.forEach(e=>{
 const marker=L.circleMarker([Number(e.lat),Number(e.lon)],{radius:e.positionQuality==='approximate'?10:8,color:e.positionQuality==='approximate'?'#b7791f':'#1a365d',fillColor:e.positionQuality==='approximate'?'#f6c567':'#4299e1',fillOpacity:.8,weight:2,dashArray:e.positionQuality==='approximate'?'3 3':undefined})
 const label=document.createElement('span');label.textContent=`${e.ref} · ${e.type} · ${e.positionQuality}`;marker.bindTooltip(label).on('click',()=>{active.value=e});marker.addTo(markers)
 });if(located.value.length)map.fitBounds(markers.getBounds(),{padding:[35,35],maxZoom:9});else map.setView([12.5,122],5)}
async function initialize(){await nextTick();if(locationMode.value || !mapElement.value)return;map=L.map(mapElement.value,{preferCanvas:true,zoomControl:false}).setView([12.5,122],5);markers=L.featureGroup().addTo(map);tileLayer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:18,crossOrigin:true});tileLayer.on('tileerror',()=>{offline.value=true});tileLayer.addTo(map);redraw();setTimeout(()=>map?.invalidateSize(),100)}
function openReview(e){target.value=e;latitude.value=e.lat;longitude.value=e.lon;quality.value=e.positionQuality==='reported'?'reported':'approximate';source.value='';notes.value='';error.value='';review.value=true}
function approve(){try{
 if(latitude.value==null || longitude.value==null || latitude.value==='' || longitude.value==='')throw new Error('Enter both proposed coordinates. Unknown is not zero.')
 const lat=Number(latitude.value),lon=Number(longitude.value);if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)throw new Error('Latitude must be −90 to 90; longitude −180 to 180.')
 if(!source.value.trim())throw new Error('Provide the fictional source / review basis.')
 store.update('events',target.value.id,{lat,lon,positionQuality:quality.value,locationReview:{status:'approved',rawPlace:target.value.place,source:source.value,notes:notes.value,accuracy:quality.value,reviewerId:store.currentUser.value.id,at:new Date().toISOString()}})
 store.audit('Location approved',target.value.id,`${lat}, ${lon}; ${quality.value}; source ${source.value}`);review.value=false;q.notify({type:'positive',message:'Location approved with reviewer and source attribution.'})
 }catch(e){error.value=e.message}}
function reject(){if(!source.value.trim()){error.value='Record a rejection reason in source / review basis.';return}store.update('events',target.value.id,{locationReview:{status:'rejected',source:source.value,notes:notes.value,reviewerId:store.currentUser.value.id,at:new Date().toISOString()}});review.value=false;q.notify({message:'Proposal rejected; existing coordinates retained.'})}
async function printMap(){if(!await confirmReportingExport(q,mapReadiness.value))return;printReport({title:'Geographic output package',subtitle:'Fictional positions · no official AOR boundaries supplied',metadata:{...selection.value,...Object.fromEntries(counts.value.map(c=>[c.label,c.count])),...reportingAssessmentMetadata(mapReadiness.value)},rows:events.value.map(e=>({Reference:e.ref,Type:e.type,Place:e.place,Latitude:e.lat,Longitude:e.lon,Quality:e.positionQuality})),sections:[{title:'Map and coordinate method',content:'The GIS workspace displays reported and approximate event points on OpenStreetMap. Approximate points are amber. Unlocated records are retained in this table and excluded from GeoJSON. No AOR polygons have been invented. Use Print map view to include the rendered map.'}]})}
watch(events,redraw,{deep:true});watch(locationMode,()=>{map?.remove();map=null;initialize()});onMounted(initialize);onBeforeUnmount(()=>map?.remove())
</script>
<template>
 <q-page :class="locationMode?'page-wrap':'overflow-hidden dashboard-bg-navy column no-wrap gis-page'" :style="locationMode?undefined:'height:calc(100vh - 50px)'">
  <q-banner v-if="!mapReadiness.ready" dense class="bg-orange-1 text-dark">INCOMPLETE WORKING COPY · {{mapReadiness.unresolved.length}} required position(s) need coordinates or an explicit explanation.</q-banner><template v-if="locationMode"><PageHeader title="Location review" subtitle="Review raw source positions, accuracy and attributed decisions." eyebrow="GEOGRAPHIC EVIDENCE"><template #actions><q-btn outline no-caps icon="map" label="Open GIS" to="/admin/map" /></template></PageHeader><DataFilters v-model="selection" /></template>
  <!-- Reused from Monitoring/GISMap/IndexPage.vue: full-height map, breadcrumb and tactical controls. -->
  <div v-else class="q-px-xl q-pt-lg ribbon-header flex-shrink-0"><div class="row items-center justify-between q-mb-md"><div class="row items-center q-gutter-x-sm text-caption text-weight-medium"><q-icon name="dashboard" color="primary" size="xs" /><router-link to="/admin" class="text-secondary-theme opacity-60 no-decoration hover-primary">Dashboard</router-link><q-icon name="chevron_right" color="grey-7" size="xs" /><span class="text-secondary-theme opacity-60">Monitoring</span><q-icon name="chevron_right" color="grey-7" size="xs" /><h1 class="text-primary-theme" style="font:inherit;margin:0">GIS Map</h1></div><div class="row items-center q-gutter-x-md"><div class="text-caption text-weight-bold text-primary font-mono tracking-widest text-uppercase"><span class="opacity-50 text-secondary-theme q-mr-xs">Total Incidents:</span>{{events.length.toLocaleString()}}</div></div></div></div>
  <div v-if="!locationMode" class="col relative-position overflow-hidden map-stage"><div class="map-wrapper shadow-2xl overflow-hidden glass-card-premium full-width full-height relative-position"><div ref="mapElement" class="full-width full-height map-canvas" role="img" aria-label="Interactive map of fictional incident points" /></div>
   <div class="absolute-top-left q-ma-lg map-overlay"><q-card flat class="tactical-filter-panel q-pa-md" style="width:280px"><div class="row items-center justify-between q-mb-md"><div class="row items-center q-gutter-x-sm"><q-icon name="filter_list" color="primary" size="sm" /><div class="text-caption text-weight-bold text-uppercase tracking-wider">Tactical Filters</div></div><q-btn flat round dense :icon="showFilters?'expand_less':'expand_more'" color="primary" size="xs" @click="showFilters=!showFilters" /></div><q-slide-transition><div v-show="showFilters" class="column q-gutter-y-sm"><div v-for="[key,label,placeholder] in mapFilterFields" :key="key" class="filter-group"><div class="filter-label">{{label}}</div><q-select v-model="selection[key]" :options="filterOptions(key)" :label="placeholder" dense filled square class="nise-select" clearable @update:model-value="store.persist()" /></div><q-btn color="primary" text-color="white" label="Search" icon="search" class="full-width q-mt-sm" push @click="redraw" /><q-btn no-caps flat dense color="primary" label="Advanced filters" @click="advancedFilters=true" /></div></q-slide-transition></q-card></div>
   <div class="absolute-top-right q-ma-lg map-overlay column q-gutter-sm"><q-btn round icon="add" color="white" text-color="primary" size="xs" class="glass-btn-navy" aria-label="Zoom in" @click="zoom(1)" /><q-btn round icon="remove" color="white" text-color="primary" size="xs" class="glass-btn-navy" aria-label="Zoom out" @click="zoom(-1)" /><q-btn round icon="table_rows" color="white" text-color="primary" size="xs" class="glass-btn-navy" aria-label="Show selected location records" @click="showRecords=!showRecords"><q-tooltip>Selected records</q-tooltip></q-btn><q-btn round icon="print" color="white" text-color="primary" size="xs" class="glass-btn-navy" aria-label="Print map" @click="printView" /><q-btn v-if="store.can('export')" round icon="download" color="white" text-color="primary" size="xs" class="glass-btn-navy" aria-label="Download filtered GeoJSON" @click="exportGeoJSON"><q-tooltip>Filtered GeoJSON</q-tooltip></q-btn><q-btn v-if="store.can('investigate')" round icon="fact_check" color="white" text-color="primary" size="xs" class="glass-btn-navy" to="/admin/locations" aria-label="Review locations" /></div>
   <div class="absolute-bottom-left q-ma-md map-overlay coordinate-overlay"><q-card flat class="tactical-overlay q-pa-md"><div class="row items-center justify-between q-mb-sm"><div class="row items-center q-gutter-x-sm"><q-icon name="analytics" color="primary" /><div class="text-caption text-weight-bold text-primary text-uppercase tracking-wider">Coordinate Quality</div></div><q-btn no-caps dense flat color="primary" label="Printable table" @click="printMap" /></div><div class="row q-col-gutter-md"><div v-for="item in counts" :key="item.label" class="col-6 col-sm-3"><div class="text-caption text-secondary-theme">{{item.label}}</div><div class="text-h6 text-weight-bold font-mono">{{item.count}}</div></div></div><div class="text-caption text-secondary-theme q-mt-sm"><i class="legend-dot reported" />Reported <i class="legend-dot approximate q-ml-md" />Approximate · Unlocated records excluded from GeoJSON. No official AOR polygons supplied.</div><div v-if="offline" class="text-caption text-amber-9 q-mt-xs">Basemap unavailable. Point overlays and the coordinate table remain usable.</div></q-card></div>
   <q-card v-if="active" flat class="tactical-overlay q-pa-md selected-map-event map-overlay"><div class="row justify-between items-center"><span class="text-weight-bold">{{active.ref}} · {{active.type}}</span><q-btn flat round dense icon="close" @click="active=null" /></div><p class="q-mt-sm">{{active.place}} · {{active.lat}}, {{active.lon}} · {{active.positionQuality}}</p><p class="text-caption">{{active.summary}}</p><div class="q-gutter-sm"><q-btn no-caps color="primary" label="Open event" :to="'/admin/incidents/'+active.id" /><q-btn v-if="store.can('investigate')" no-caps outline label="Review position" @click="openReview(active)" /></div></q-card>
  </div>
  <div v-if="locationMode" class="metric-grid q-mb-lg"><div v-for="item in counts" :key="item.label" class="metric-card"><div class="metric-value">{{item.count}}</div><div class="muted">{{item.label}}</div></div></div>
<div v-if="locationMode||showRecords" class="panel location-records" :class="locationMode?null:'map-records'"><div v-if="!locationMode" class="row justify-between items-center q-mb-sm"><span class="text-weight-bold">Selected location records</span><q-btn flat round dense icon="close" @click="showRecords=false" /></div><q-tabs v-model="tab" align="left" dense active-color="primary" class="q-mb-md"><q-tab name="all" no-caps label="All selected locations" /><q-tab name="unlocated" no-caps :label="`Unlocated (${unlocated.length})`" /><q-tab name="approximate" no-caps label="Approximate" /></q-tabs><q-table flat :rows="locationRows" :columns="columns" row-key="id" wrap-cells><template #body-cell-ref="props"><q-td :props="props"><router-link class="record-link" :to="`/admin/incidents/${props.row.id}`">{{props.value}}</router-link></q-td></template><template #body-cell-actions="props"><q-td :props="props"><q-btn v-if="store.can('investigate')" no-caps outline size="sm" :label="props.row.locationReview?.status==='approved'?'Review again':'Review position'" @click="openReview(props.row)" /><span v-else class="muted">{{props.row.locationReview?.status || 'Pending review'}}</span></q-td></template></q-table></div>
  <q-dialog v-model="advancedFilters"><q-card style="width:960px;max-width:96vw"><q-card-section><div class="row justify-between items-center q-mb-md"><h2 class="section-title">Map filters</h2><q-btn v-close-popup flat round dense icon="close" /></div><DataFilters v-model="selection" /></q-card-section><q-card-actions align="right"><q-btn v-close-popup color="primary" no-caps label="Show selected events" /></q-card-actions></q-card></q-dialog>
<q-dialog v-model="review"><q-card style="width:650px;max-width:94vw"><q-card-section><h2 class="section-title">Review {{target?.ref}}</h2><p>Raw place: {{target?.place}}</p><p class="muted">Enter fictional proposed coordinates from your review. This demonstration does not geocode place names or infer precise positions.</p><div class="form-grid"><q-input v-model="latitude" type="number" step="any" outlined label="Proposed latitude" /><q-input v-model="longitude" type="number" step="any" outlined label="Proposed longitude" /><q-select v-model="quality" outlined :options="['reported','approximate']" label="Position accuracy" /><q-input v-model="source" outlined label="Source / review basis (required)" /><q-input v-model="notes" outlined type="textarea" label="Reviewer notes" class="span-2" /></div><q-banner v-if="error" class="bg-red-1 text-negative q-mt-md">{{error}}</q-banner></q-card-section><q-card-actions align="right"><q-btn v-close-popup flat no-caps label="Cancel" /><q-btn outline no-caps color="negative" label="Reject proposal" @click="reject" /><q-btn no-caps color="primary" label="Approve coordinates" @click="approve" /></q-card-actions></q-card></q-dialog>

</q-page>
</template>
<style scoped>

.map-wrapper {
  height: 100% !important;
  width: 100% !important;
  border-radius: 0;
  border: none;
  background: #041021; /* Fallback */
}

.tactical-overlay, .tactical-filter-panel {
  background: var(--sidebar-bg) !important; /* Solid Theme Connection */
  border: 1px solid var(--card-border) !important;
  border-radius: 0;
  color: var(--text-primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tactical-filter-panel {
  width: 220px !important;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.nise-select :deep(.q-field__control) {
  background: var(--input-bg) !important;
  border-radius: 4px !important;
  border: 1px solid var(--card-border) !important;
  height: 34px;
  min-height: 34px;
}

.nise-select :deep(.q-field__native), .nise-select :deep(.q-field__prefix), .nise-select :deep(.q-field__suffix), .nise-select :deep(.q-field__input) {
  color: var(--text-primary) !important;
  font-weight: 600;
  font-size: 0.8rem;
}

.nise-select :deep(.q-field__append) {
  height: 34px;
}

.tactical-overlay .text-primary-theme, .tactical-filter-panel .text-primary-theme {
  color: var(--text-primary);
}

.tactical-overlay .text-secondary-theme, .tactical-filter-panel .text-secondary-theme {
  color: var(--text-secondary);
}

.glass-btn-navy {
  background: var(--status-box-bg) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
}

.text-primary-theme { color: var(--text-primary); }

.shadow-cyan {
  box-shadow: 0 8px 25px rgba(43, 108, 176, 0.4) !important;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.tracking-wider { letter-spacing: 0.12em; }
.font-mono { font-family: 'Space Mono', monospace; }

.gis-page{position:relative}.map-stage{min-height:400px}.map-overlay{z-index:800}.map-canvas{z-index:1;background:#e3ebf1}.coordinate-overlay{width:700px;max-width:calc(100% - 32px)}.selected-map-event{position:absolute;right:24px;bottom:180px;width:380px;max-width:calc(100% - 48px)}.map-records{position:absolute;right:24px;top:100px;width:650px;max-width:calc(100% - 48px);max-height:65vh;overflow:auto;z-index:850}.legend-dot{width:10px;height:10px;display:inline-block;border-radius:50%;margin-right:5px}.reported{background:#4299e1}.approximate{background:#f6c567}.no-decoration{text-decoration:none}.text-secondary-theme{color:var(--text-secondary,#64748b)}.opacity-60{opacity:.6}.opacity-50{opacity:.5}.flex-shrink-0{flex-shrink:0}@media(max-width:600px){.ribbon-header{padding-left:16px;padding-right:16px}.tactical-filter-panel{max-height:50vh;overflow:auto}.coordinate-overlay .tactical-overlay{padding:10px}.coordinate-overlay{max-width:calc(100% - 24px)}.selected-map-event{bottom:210px}.map-records{right:12px;max-width:calc(100% - 24px)}}@media print{.gis-page{height:190mm!important}.map-stage{height:160mm!important}.tactical-filter-panel,.absolute-top-right{display:none}.map-canvas{height:160mm!important}.location-records{break-before:page}}
</style>
