<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDemo } from '../../stores/demo.js'
import PageHeader from '../../components/PageHeader.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { downloadCSV } from '../../lib/exports.js'
import { toggleImportExclusion } from './reportLogic.js'
const store=useDemo(), route=useRoute(),router=useRouter(),q=useQuasar()
const wizard=computed(()=>route.path.endsWith('/new'))
const selected=ref(''),stage=ref(1),file=ref(null),name=ref('Fictional coastal matrix — 2026'),year=ref('2026'),template=ref('Annual matrix v1'),skipDuplicate=ref(true),accepted=ref(false),error=ref('')
const mapping=ref({date:'Occurrence date',vesselName:'Ship name',type:'Accident type',place:'Location',mergeGroup:'Event group'})
const rows=ref([])
let rawRows=[]
const columns=[{name:'row',label:'Row',field:'row',align:'left'},{name:'vesselName',label:'Fictional vessel',field:'vesselName',align:'left'},{name:'date',label:'Date',field:r=>r.date || 'Unknown'},{name:'type',label:'Type',field:'type'},{name:'mergeGroup',label:'Event group',field:'mergeGroup'},{name:'status',label:'Review',field:'status'},{name:'error',label:'Row finding',field:'error'}]
const batches=computed(()=>store.visibleRecords('imports'))
const batch=computed(()=>batches.value.find(b=>b.id===(route.params.id||selected.value)))
const source=computed(()=>{if((route.params.id||selected.value)&&!batch.value)return[];return store.visibleRecords('sourceRows').filter(r=>!batch.value || r.batchId===batch.value.id)})
const staged=computed(()=>rows.value.filter(r=>r.status!=='excluded' && !(r.duplicate && skipDuplicate.value)))
const groups=computed(()=>[...new Set(staged.value.map(r=>r.mergeGroup))])
const blockers=computed(()=>staged.value.filter(r=>r.error).length)
function loadSample(){
 rows.value=[
 {row:2,vesselName:'MV Aurora Example',date:'2026-09-14',type:'Collision',seriousness:'serious',place:'Fictional channel approach',mergeGroup:'SYN-001',status:'ready',error:''},
 {row:3,vesselName:'MT Lantern Example',date:'2026-09-14',type:'Collision',seriousness:'serious',place:'Fictional channel approach',mergeGroup:'SYN-001',status:'ready',error:''},
 {row:4,vesselName:'FB Sample Finch',date:'',type:'Engine trouble',seriousness:'less_serious',place:'Unspecified coastal waters',mergeGroup:'SYN-002',status:'needs_review',error:'Missing date — explicitly accept unknown date'},
 {row:5,vesselName:'MV Aurora Example',date:'2026-09-14',type:'Collision',seriousness:'serious',place:'Fictional channel approach',mergeGroup:'SYN-001',status:'duplicate_candidate',duplicate:true,error:''},
 {row:6,vesselName:'MV Trial Heron',date:'2026-10-03',type:'Grounding',seriousness:'less_serious',place:'Fictional shoal',mergeGroup:'SYN-003',status:'ready',error:''}
 ]; rawRows=JSON.parse(JSON.stringify(rows.value));stage.value=2
}
function applyMapping(){
 rows.value=rawRows.map(raw=>{const source={'Occurrence date':raw.date,'Ship name':raw.vesselName,'Accident type':raw.type,'Location':raw.place,'Event group':raw.mergeGroup};const mapped={...raw,...Object.fromEntries(Object.entries(mapping.value).map(([field,header])=>[field,source[header]]))};const validDate=!mapped.date || /^\d{4}-\d{2}-\d{2}$/.test(mapped.date);const validType=['Collision','Engine trouble','Grounding'].includes(mapped.type);mapped.error=!mapped.date?'Missing date — explicitly accept unknown date':!validDate?'Mapped date is invalid — remap or accept unknown':!validType?'Mapped incident type is invalid — remap or accept Unknown':'';mapped.status=mapped.error?'needs_review':raw.status;return mapped});stage.value=3
}
function resolve(row){if(!row.date||!/^\d{4}-\d{2}-\d{2}$/.test(row.date))row.date='';if(!['Collision','Engine trouble','Grounding'].includes(row.type))row.type='Unknown';row.error='';row.unknownAccepted=true;row.status='unknown_accepted';accepted.value=false}
function split(row){row.mergeGroup=`SYN-ROW-${row.row}`;accepted.value=false}
function exclude(row){toggleImportExclusion(row);accepted.value=false}
function confirm(){
 if(!accepted.value || blockers.value || !groups.value.length)return
 try {
 const now=new Date().toISOString(),created=[]
 const record=store.add('imports',{name:name.value,year:year.value,template:template.value,status:'confirmed',rows:rows.value.length,events:groups.value.length,vessels:staged.value.length,errors:0,duplicates:rows.value.filter(r=>r.duplicate).length,mapping:{...mapping.value},decisions:{duplicate:skipDuplicate.value?'Exclude candidate row 5':'Retain candidate as involvement',unknownDate:'Accepted explicitly when present',grouping:staged.value.map(r=>`${r.row} → ${r.mergeGroup}`).join('; '),variance:'5 source rows; duplicate candidates and accepted unknowns retained in lineage'},createdAt:now,confirmedAt:now,createdIds:[]})
 for(const group of groups.value){
  const members=staged.value.filter(r=>r.mergeGroup===group),r=members[0]
  const event=store.add('events',{...store.newEvent(),ref:`DEMO-IMP-${record.id.slice(-5)}-${created.length+1}`,date:r.date || null,dateUnknown:!r.date,time:null,timeUnknown:true,type:r.type,seriousness:r.seriousness,place:r.place,lat:null,lon:null,positionQuality:'unknown',status:'draft',vessels:members.map((row,i)=>({...store.newVessel(),id:`${record.id}-v${row.row}-${i}`,name:row.vesselName,type:'Unknown',grossTonnage:null})),consequences:{fatalities:null,missing:null,injured:null,rescued:null,totalOnboard:null,crew:null,passengers:null,shipCondition:'Unknown',pollution:'Unknown',notes:'No casualty counts supplied in synthetic source.'},sourceType:'Synthetic matrix import',sourceRef:record.id,sourceLineage:{file:name.value,sheet:year.value,row:r.row,mergeGroup:group},summary:'Fictional staging example. Source unknowns preserved.',createdAt:now,updatedAt:now})
  created.push(event.id)
  members.forEach(row=>{row.eventId=event.id})
 }
 rows.value.forEach(row=>store.add('sourceRows',{...row,batchId:record.id,status:row.duplicate&&skipDuplicate.value?'excluded_duplicate':row.status}))
 store.update('imports',record.id,{createdIds:created});q.notify({type:'positive',message:`Imported ${created.length} events and ${staged.value.length} vessel involvements.`});router.push(`/admin/imports/${record.id}`)
 }catch(e){error.value=e.message}
}
function reverse(){q.dialog({title:'Reverse this demo import?',message:'This removes the imported event records and keeps source rows and batch decisions for traceability. A batch with downstream reports or cases cannot be reversed.',cancel:true,persistent:true}).onOk(()=>{
 try{const ids=batch.value.createdIds || [];if(['reports','cases','actions','evidence','assessments'].some(collection=>store.state[collection].some(r=>ids.includes(r.eventId))))throw new Error('Downstream reports, cases, actions, evidence or assessments exist. Resolve these before reversing this batch.');ids.forEach(id=>store.remove('events',id));store.update('imports',batch.value.id,{status:'reversed',reversedAt:new Date().toISOString()});q.notify({type:'positive',message:'Import reversed. Source lineage retained.'})}catch(e){error.value=e.message}
})}
</script>
<template>
 <div class="page-wrap">
  <PageHeader :title="wizard?'Import synthetic source':route.path==='/admin/reconciliation'?'Source reconciliation':batch?'Import batch detail':'Import batches'" subtitle="Trace source rows, event groups and accepted differences before adding records." eyebrow="DATA OPERATIONS"><template #actions><q-btn v-if="!wizard" color="primary" no-caps icon="add" label="New demo import" to="/admin/imports/new" /></template></PageHeader>
  <q-banner rounded class="bg-blue-1 text-primary q-mb-lg"><template #avatar><q-icon name="science" /></template>Fictional staging only. Selecting a file records its name locally; this wizard loads synthetic rows and never reads or uploads its contents.</q-banner>
  <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md">{{error}}</q-banner>
  <template v-if="wizard">
   <q-stepper v-model="stage" color="primary" animated flat bordered class="q-mb-lg" :vertical="$q.screen.lt.md">
    <q-step :name="1" title="Choose source" icon="description" :done="stage>1"><div class="form-grid"><q-input v-model="name" outlined label="Batch name" /><q-select v-model="template" outlined label="Detected / selected template" :options="['Annual matrix v1','Legacy matrix v1']" /><q-input v-model="year" outlined label="Source year" /><q-file v-model="file" outlined label="Optional fictional file name" accept=".xlsx,.csv" /></div><q-btn class="q-mt-md" color="primary" no-caps label="Load synthetic preview" @click="loadSample" /></q-step>
    <q-step :name="2" title="Map and inspect" icon="table_view" :done="stage>2"><div class="form-grid"><q-select v-for="(value,key) in mapping" :key="key" :model-value="value" @update:model-value="mapping[key]=$event" outlined :label="`Map ${key}`" :options="['Occurrence date','Ship name','Accident type','Location','Event group','Unmapped']" /></div><p class="muted">Merged cells are represented by event groups. Two vessels in SYN-001 form one event.</p><q-btn no-caps color="primary" label="Review rows and grouping" :disable="Object.values(mapping).includes('Unmapped') || new Set(Object.values(mapping)).size!==5" @click="applyMapping" /></q-step>
    <q-step :name="3" title="Resolve findings" icon="fact_check" :done="stage>3"><q-toggle v-model="skipDuplicate" label="Exclude duplicate candidate row 5" /><q-table flat :rows="rows" :columns="columns" row-key="row" :rows-per-page-options="[0]" wrap-cells><template #body-cell-error="props"><q-td :props="props"><span :class="props.row.error?'text-negative':'muted'">{{props.row.error || 'No blocking finding'}}</span><div class="q-gutter-xs q-mt-xs"><q-btn v-if="props.row.error" size="sm" no-caps outline label="Accept unknown value" @click="resolve(props.row)" /><q-btn size="sm" flat no-caps label="Split event" @click="split(props.row)" /><q-btn size="sm" flat no-caps :label="props.row.status==='excluded'?'Restore':'Exclude row'" @click="exclude(props.row)" /></div></q-td></template></q-table><q-btn color="primary" no-caps class="q-mt-md" label="Reconcile selection" :disable="!!blockers" @click="stage=4" /></q-step>
    <q-step :name="4" title="Reconcile and confirm" icon="done_all"><div class="metric-grid"><div class="metric-card"><div class="metric-value">{{rows.length}}</div>Raw rows</div><div class="metric-card"><div class="metric-value">{{groups.length}}</div>Unique events</div><div class="metric-card"><div class="metric-value">{{staged.length}}</div>Vessel involvements</div><div class="metric-card"><div class="metric-value">{{rows.length-staged.length}}</div>Excluded rows</div></div><p>Accepted mapping: {{mapping}}. Unknown dates and consequences remain unknown. No casualty totals are inferred from vessel rows.</p><q-checkbox v-model="accepted" label="Accept synthetic source reconciliation and grouping decisions" /><div class="q-mt-md"><q-btn color="primary" no-caps label="Confirm demo import" :disable="!accepted || !!blockers" @click="confirm" /></div></q-step>
   </q-stepper>
  </template>
  <template v-else-if="batch || route.path==='/admin/reconciliation'">
   <q-select v-if="route.path==='/admin/reconciliation'" v-model="selected" outlined emit-value map-options :options="batches.map(b=>({label:b.name,value:b.id}))" label="Source batch (all if empty)" clearable class="q-mb-md" />
   <div v-if="batch" class="panel q-mb-md"><div class="row justify-between items-center"><h2 class="section-title">{{batch.name}}</h2><StatusBadge :status="batch.status" /></div><div class="metric-grid"><div class="metric-card"><div class="metric-value">{{batch.rows}}</div>Source rows</div><div class="metric-card"><div class="metric-value">{{batch.events}}</div>Accepted event groups</div><div class="metric-card"><div class="metric-value">{{batch.vessels}}</div>Vessel involvements</div><div class="metric-card"><div class="metric-value">{{batch.duplicates}}</div>Duplicate candidates</div></div><p>Template: {{batch.template}} · Year: {{batch.year}} · Confirmed: {{batch.confirmedAt || 'Not confirmed'}}</p><p class="muted">Mapping: {{batch.mapping}}</p><p class="muted">Accepted decisions: {{batch.decisions}}</p><q-btn v-if="batch.status==='confirmed'" color="negative" outline no-caps label="Reverse demo import" @click="reverse" /></div>
   <div class="panel"><div class="row justify-between items-center q-mb-md"><h2 class="section-title">Source row lineage</h2><q-btn no-caps outline icon="download" label="Export source reconciliation" @click="downloadCSV('synthetic-reconciliation.csv',source)" /></div><q-table flat :rows="source" :columns="[...columns,{name:'eventId',label:'Accepted event',field:'eventId'}]" row-key="id" wrap-cells><template #body-cell-eventId="props"><q-td :props="props"><router-link v-if="props.value && store.getEvent(props.value)" class="record-link" :to="`/admin/incidents/${props.value}`">Open accepted event</router-link><span v-else>{{props.value?'Reversed event':'Excluded / not linked'}}</span></q-td></template></q-table><p class="muted">Snapshot control: source rows are immutable evidence of accepted grouping. Reversals retain the batch and lineage; current live totals may differ after edits.</p></div>
  </template>
  <div v-else-if="route.params.id" class="panel">Import unavailable in your current account scope. <router-link to="/admin/imports">Return to batches</router-link>.</div>
  <div v-else class="panel"><q-table flat :rows="batches" :columns="[{name:'name',label:'Batch / source',field:'name',align:'left'},{name:'year',label:'Year',field:'year'},{name:'status',label:'Status',field:'status'},{name:'rows',label:'Source rows',field:'rows'},{name:'events',label:'Events',field:'events'},{name:'vessels',label:'Involvements',field:'vessels'}]" row-key="id" @row-click="(_,row)=>router.push(`/admin/imports/${row.id}`)"><template #body-cell-name="props"><q-td :props="props"><router-link class="record-link" :to="`/admin/imports/${props.row.id}`">{{props.value}}</router-link></q-td></template><template #body-cell-status="props"><q-td :props="props"><StatusBadge :status="props.value" /></q-td></template><template #no-data><div class="q-pa-lg text-center full-width"><q-icon name="cloud_upload" size="40px" /><p>No batches yet. Start a synthetic import to review mapping, duplicates and reconciliation.</p></div></template></q-table></div>
 </div>
</template>
