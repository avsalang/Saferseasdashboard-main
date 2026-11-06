<script setup>
import { computed,reactive,ref,watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDemo } from '../../stores/demo.js'
import StatusBadge from '../../components/StatusBadge.vue'
import VesselFields from './VesselFields.vue'
import IncidentLocation from './IncidentLocation.vue'
import IncidentEnvironment from './IncidentEnvironment.vue'
import IncidentSupplement from './IncidentSupplement.vue'
import { incidentTypes,seriousnessOptions,numberOrNull,display } from './fields.js'
const props=defineProps({staff:Boolean})
const store=useDemo(),route=useRoute(),router=useRouter()
const $q=useQuasar()
const model=reactive({}),step=ref(1),error=ref(''),success=ref(''),busy=ref(false),pendingFiles=ref([]),attachmentName=ref(''),attachmentType=ref('Photograph'),attachmentSource=ref(''),selectedFile=ref(null),savedId=ref(null)
const steps=['Time & Location','Vessel & Operator','Voyage & Cargo','Narrative & Timeline','Findings & Outcomes','Attachments','Review & Submit'].map((label,index)=>({id:index+1,label}))
const completedSteps=ref([]),currentStep=computed(()=>steps.find(item=>item.id===step.value)),progress=computed(()=>completedSteps.value.length/steps.length),percent=computed(()=>Math.round(progress.value*100))
function goToStep(id){step.value=id}
function isCompleted(id){return completedSteps.value.includes(id)}
watch(step,(value,previous)=>{if(previous&&value!==previous&&!completedSteps.value.includes(previous))completedSteps.value.push(previous)})
const user=computed(()=>store.currentUser.value)
const incidentTypeOptions=computed(()=>{const active=store.state.lookups.filter(item=>item.active!==false&&item.category?.toLowerCase()==='incident type');return [...new Set([...(active.length?active.map(item=>item.label):incidentTypes),model.type,...(model.secondaryTypes||[])].filter(Boolean))]})
const severityOptions=computed(()=>{const active=store.state.lookups.filter(item=>item.active!==false&&item.category?.toLowerCase()==='seriousness').map(item=>{const normalize=value=>String(value||'').toLowerCase().replace(/[\s-]+/g,'_');const canonical=seriousnessOptions.find(option=>option.value===normalize(item.code)||option.value===normalize(item.label));return canonical?{label:item.label,value:canonical.value}:null}).filter(Boolean);const options=active.length?active:[...seriousnessOptions];if(model.seriousness&&!options.some(option=>option.value===model.seriousness))options.push(seriousnessOptions.find(option=>option.value===model.seriousness)||{label:model.seriousness,value:model.seriousness});return options})
const prefix=computed(()=>props.staff?'/admin/incidents':'/reporter/reports')
const offices=computed(()=>store.state.offices.filter(o=>o.active!==false).map(o=>({label:`${o.code} · ${o.name}`,value:o.id})))
const visibleVessels=computed(()=>store.visibleRecords('vessels').map(v=>({label:`${v.name} · ${v.officialNumber||'No official no.'}`,value:v.id})))
const chosenVessel=ref(null)
const existing=computed(()=>route.params.id?store.getEvent(route.params.id):null)
const canResubmit=computed(()=>model.status==='correction_requested'&&store.can('report',existing.value))
const allowed=computed(()=>props.staff?(store.can('review',existing.value)||store.can('investigate',existing.value)):(store.can('report',existing.value)&&(!existing.value||['draft','correction_requested'].includes(existing.value.status))))
const missing=computed(()=>!!route.params.id&&!existing.value)
const identity=computed(()=>store.state.users.find(u=>u.id===model.ownerId))
const existingEvidence=computed(()=>store.state.evidence.filter(e=>(model.evidenceIds||[]).includes(e.id)))
const correction=computed(()=>[...(model.history||[])].reverse().find(h=>h.status==='correction_requested'))
function load(){const initial=existing.value||store.newEvent();Object.keys(model).forEach(k=>delete model[k]);Object.assign(model,JSON.parse(JSON.stringify(initial)));model.vessels ||= [];model.consequences ||= {};model.evidenceIds ||= [];model.secondaryTypes ||= [];model.impactTypes ||= [];model.crewFactors ||= [];model.damageTypes ||= [];model.environment ||= {waveHeightM:null,windForce:null,visibility:'',weatherDescription:'',seaState:'',currentTide:'',source:'',observedAt:'',fieldSources:{},lookup:null};model.vessels.forEach(v=>{v.voyage={origin:'',destination:'',route:'',cargoType:'',cargoQuantity:null,cargoUnit:'',...v.voyage}});savedId.value=null;pendingFiles.value=[];step.value=1;error.value='';success.value=''}
watch(()=>route.params.id,load,{immediate:true})
function addVessel(){const source=chosenVessel.value?store.visibleRecords('vessels').find(v=>v.id===chosenVessel.value):store.newVessel();if(!source){error.value='This vessel is no longer available in your account scope.';chosenVessel.value=null;return}model.vessels.push({...JSON.parse(JSON.stringify(source)),role:'Involved vessel',voyage:{origin:'',destination:'',route:'',cargoType:'',cargoQuantity:null,cargoUnit:''}});chosenVessel.value=null}
function queueEvidence(){
 const files=Array.isArray(selectedFile.value)?selectedFile.value:selectedFile.value?[selectedFile.value]:[]
 if(!attachmentName.value.trim()&&!files.length){error.value='Enter a document name or select local files.';return}
 const entries=files.length?files:[null]
 for(const file of entries)pendingFiles.value.push({name:file?(attachmentName.value.trim()?(files.length>1?`${attachmentName.value.trim()} · ${file.name}`:attachmentName.value.trim()):file.name):attachmentName.value.trim(),type:attachmentType.value,sourceRef:attachmentSource.value,mime:file?.type||'',size:file?.size??null,status:'reference_only',notes:file?'Local file metadata only; file contents are not uploaded.':'Source reference supplied by reporter.'})
 attachmentName.value='';attachmentSource.value='';selectedFile.value=null;error.value=''
}
function normalize(){const data=JSON.parse(JSON.stringify(model));if(data.dateUnknown)data.date=null;if(data.timeUnknown)data.time=null;for(const key of ['lat','lon'])data[key]=numberOrNull(data[key]);for(const key of ['waveHeightM','windForce'])data.environment[key]=numberOrNull(data.environment[key]);if(data.positionQuality==='unknown'){if(data.lat!==null||data.lon!==null)throw Error('Choose reported or approximate coordinate quality, or clear both coordinates to keep the position unknown.');data.lat=null;data.lon=null}for(const key of ['fatalities','missing','injured','rescued','totalOnboard','crew','passengers'])data.consequences[key]=numberOrNull(data.consequences[key]);for(const vessel of data.vessels){for(const key of ['grossTonnage','netTonnage','yearBuilt','length','breadth','depth','deadweight','engineCount','enginePower'])vessel[key]=numberOrNull(vessel[key]);vessel.voyage.cargoQuantity=numberOrNull(vessel.voyage.cargoQuantity)}return data}
function validate(data){if(!data.date&&!data.dateUnknown)throw Error('Enter the occurrence date or mark it unknown.');if(!data.time&&!data.timeUnknown)throw Error('Enter the occurrence time or mark it unknown.');if(!data.type)throw Error('Select the primary event type.');if(!data.place?.trim())throw Error('Enter the reported location, including an unknown-location description when necessary.');if(!data.summary?.trim())throw Error('Add a factual account of the occurrence.');if(!data.vessels.length||data.vessels.some(v=>!v.name?.trim()))throw Error('Add at least one involved vessel and supply each vessel name.');if(data.lat!==null&&(!Number.isFinite(data.lat)||Math.abs(data.lat)>90))throw Error('Latitude must be between −90 and 90.');if(data.lon!==null&&(!Number.isFinite(data.lon)||Math.abs(data.lon)>180))throw Error('Longitude must be between −180 and 180.');if((data.lat===null)!==(data.lon===null))throw Error('Supply both coordinates or leave both unknown.');for(const [key,value] of Object.entries(data.consequences)){if(['fatalities','missing','injured','rescued','totalOnboard','crew','passengers'].includes(key)&&value!==null&&(!Number.isInteger(value)||value<0))throw Error('Known consequence counts must be non-negative whole numbers.')}if(data.environment.waveHeightM!==null&&(!Number.isFinite(data.environment.waveHeightM)||data.environment.waveHeightM<0))throw Error('Wave height must be a non-negative number or blank.');if(data.environment.windForce!==null&&(!Number.isInteger(data.environment.windForce)||data.environment.windForce<0||data.environment.windForce>12))throw Error('Wind force must be a whole number from 0 to 12 or blank.');for(const v of data.vessels)for(const key of ['grossTonnage','netTonnage','length','breadth','depth','deadweight','enginePower'])if(v[key]!==null&&(!Number.isFinite(v[key])||v[key]<0))throw Error('Vessel tonnage and dimensions must be non-negative numbers.')}
async function save(submit=false){if(!allowed.value)return;error.value='';success.value='';busy.value=true;try{const data=normalize();if(submit)validate(data);let event=store.saveEvent(data);Object.assign(model,JSON.parse(JSON.stringify(event)));savedId.value=event.id;for(const item of pendingFiles.value){const attached=store.add('evidence',{...item,eventId:event.id,uploadedBy:user.value.id,uploadedAt:new Date().toISOString()});model.evidenceIds.push(attached.id)}pendingFiles.value=[];if(submit||model.evidenceIds.length!==event.evidenceIds.length)event=store.saveEvent({...model},{submit});Object.assign(model,JSON.parse(JSON.stringify(event)));if(submit){await router.push(`${prefix.value}/${event.id}`)}else{const message=model.status==='draft'?'Draft saved. You can leave this page and return from Drafts.':'Changes saved. Your report and its attachments are retained.';if(!route.params.id){await router.replace(`${prefix.value}/${event.id}/edit`);$q.notify({type:'positive',message})}else success.value=message}}catch(e){error.value=e.message||'Unable to save this report.'}finally{busy.value=false}}
function clearCount(key,unknown){if(unknown)model.consequences[key]=null;else model.consequences[key]=''}
const aboardSum=computed(()=>{const crew=numberOrNull(model.consequences?.crew),passengers=numberOrNull(model.consequences?.passengers);return [crew,passengers].every(value=>value!==null&&Number.isInteger(value)&&value>=0)?crew+passengers:null})
</script>
<template><q-page class="q-pa-lg dashboard-bg incident-create-page">
    <div style="max-width: 1100px; margin: 0 auto; width: 100%;">
      <div class="row items-start q-mb-md intake-heading">
        <div class="col-12 col-md-8">
          <!-- <q-breadcrumbs class="text-blue-grey-4 q-mb-md text-weight-bold" active-color="blue-10">
          <q-breadcrumbs-el label="Dashboard" icon="home" to="/reporter" />
          <q-breadcrumbs-el label="Incident Reports" to="/reporter/reports" />
          <q-breadcrumbs-el label="Create" />
        </q-breadcrumbs> -->

          <div class="row items-center q-gutter-x-md q-mb-sm">
            <h1 class="intake-title text-weight-bold text-navy-900 tracking-tight" style="margin:0">
              {{ route.params.id ? 'Edit incident report' : 'New incident report' }}
            </h1>
          </div>

          <div class="intake-subtitle text-blue-grey-6">
            Enter the facts. Save a draft anytime.
          </div>
        </div>
        <div class="col-12 q-mt-sm">
          <div class="glass-card q-pa-md progress-card">
            <div class="row items-center no-wrap">
              <div
                class="text-overline text-blue-grey-4 font-space letter-spacing-2 text-weight-bold flex items-center q-gutter-x-sm">
                <span>STEPS REVIEWED</span>
                <q-btn flat round dense icon="menu" size="sm" class="text-blue-grey-6 cursor-pointer"
                  aria-label="Show Submission Steps">
                  <q-menu anchor="bottom left" self="top left" class="bg-white"
                    style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);">
                    <q-list style="min-width: 280px" class="q-py-none">
                      <div
                        class="q-px-md q-py-md text-subtitle2 text-weight-bold text-navy-900 border-bottom border-slate-100 flex items-center"
                        style="background-color: #f8fafc;">
                        <q-icon name="assignment" class="q-mr-sm" color="primary" size="xs" />
                        <span>Submission Steps</span>
                      </div>
                      <q-separator />
                      <div class="q-py-xs">
                        <q-item v-for="s in steps" :key="s.id" clickable v-close-popup @click="goToStep(s.id)"
                          :active="step === s.id" active-class="bg-blue-50 text-primary text-weight-bold"
                          class="q-mx-xs q-my-xs"
                          style="border-radius: 8px; transition: all 0.2s ease; min-height: 40px;">
                          <q-item-section avatar min-width="36px" style="min-width: 36px">
                            <q-avatar size="24px"
                              :color="step === s.id ? 'primary' : (isCompleted(s.id) ? 'teal-1' : 'grey-1')"
                              :text-color="step === s.id ? 'white' : (isCompleted(s.id) ? 'teal-9' : 'grey-6')">
                              <q-icon v-if="isCompleted(s.id) && step !== s.id" name="check" size="14px" />
                              <span v-else class="text-caption text-weight-bold">{{ s.id }}</span>
                            </q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <div class="text-body2"
                              :class="step === s.id ? 'text-navy-900 text-weight-bold' : 'text-slate-700'">{{ s.label }}
                            </div>
                          </q-item-section>
                          <q-item-section side v-if="step === s.id">
                            <q-badge color="primary" rounded />
                          </q-item-section>
                        </q-item>
                      </div>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <q-space />
              <div class="text-caption text-blue-grey-6 font-mono text-weight-bold">
                {{ percent }}%
              </div>
            </div>
            <q-linear-progress :value="progress" rounded class="q-mt-sm progress-bar" />
          </div>
        </div>
      </div>

      <div class="row create-container">
        <div class="col-12 main-column">
          <q-card flat class="glass-card q-pa-lg form-card">
            <div class="row items-center q-mb-sm current-step-heading">
              <div class="col">
<div class="intake-step-title text-weight-bold text-blue-10 tracking-tight">
                  {{ currentStep.label }}
                </div>

              </div>
              <div class="col-auto">
                <div class="step-pill font-mono">
                  {{ String(step).padStart(2, '0') }}/{{ String(steps.length).padStart(2, '0') }}
                </div>
              </div>
            </div>


 <section v-if="missing||!allowed" class="panel empty-state"><q-icon name="lock_outline" size="42px"/><h2 class="section-title">{{missing?'Record unavailable':'Editing unavailable'}}</h2><p>{{missing?'This record is outside your scope or no longer exists.':'Your role or this report’s review status does not permit editing.'}}</p><q-btn color="primary" no-caps label="Open register" :to="prefix"/></section>
 <template v-else><q-banner v-if="error" class="bg-red-1 text-negative q-mb-md" role="alert">{{error}}</q-banner><q-banner v-if="success" class="bg-green-1 text-positive q-mb-md" role="status" aria-live="polite">{{success}}</q-banner><q-banner v-if="correction&&model.status==='correction_requested'" class="bg-orange-1 text-dark q-mb-md"><strong>Reviewer correction request</strong><div>{{correction.remarks}}</div><div class="text-caption">{{correction.actorName}} · {{new Date(correction.at).toLocaleString()}}</div></q-banner>
 <section class="summary-card report-context q-mb-sm"><q-expansion-item dense aria-label="Reporting account" class="account-summary">
  <template #header><q-item-section side><StatusBadge :status="model.status||'draft'"/></q-item-section><q-item-section><q-item-label class="context-reference">{{model.ref||'New report'}}</q-item-label><q-item-label caption>{{identity?.name||user?.name}} · {{model.officeId}} · Demo</q-item-label></q-item-section><q-item-section side class="text-caption">Account</q-item-section></template>
  <div class="form-grid q-pa-md"><q-input :model-value="identity?.name||user?.name" outlined readonly label="Issued account / report owner"/><q-input :model-value="identity?.email||user?.email" outlined readonly label="Issued email"/><q-input :model-value="identity?.organization||user?.organization" outlined readonly label="Organization"/><q-input :model-value="model.officeId" outlined readonly label="Account office"/></div>
 </q-expansion-item></section>
 <q-stepper v-model="step" color="primary" animated flat :header-nav="true" alternative-labels class="report-stepper">
  <q-step :name="1" title="Time & Location" icon="event" :done="isCompleted(1)"><p class="muted text-caption">Date and time use Philippine time (UTC+08:00). For overseas incidents, convert to Philippine time and retain the original local date, time and timezone in the source notes.</p>
    <div class="form-grid">
      <div><q-input v-model="model.date" type="date" outlined label="Occurrence date" stack-label :disable="model.dateUnknown"/><q-checkbox v-model="model.dateUnknown" label="Date unknown"/></div>
      <div><q-input v-model="model.time" type="time" outlined label="Occurrence time (Philippine time, UTC+08:00)" stack-label :disable="model.timeUnknown"/><q-checkbox v-model="model.timeUnknown" label="Time unknown"/></div>
      <q-select class="span-2" v-model="model.type" :options="incidentTypeOptions" outlined label="Primary incident type *"/>
      <q-input class="span-2" v-model="model.place" outlined label="Reported place / location *"/>

    </div>
    <q-expansion-item class="optional-section q-mt-lg" label="Classification and impacts (optional)" caption="Seriousness, additional incident types and impacts" icon="category">
      <div class="form-grid q-pa-md"><q-select v-model="model.seriousness" :options="severityOptions" emit-value map-options outlined label="Seriousness"/><q-select v-model="model.secondaryTypes" :options="incidentTypeOptions" multiple use-chips outlined label="Additional incident types"/><q-select class="span-2" v-model="model.impactTypes" :options="['Loss of life','Injury','Vessel damage','Pollution','Cargo damage','Service interruption','Unknown']" multiple use-chips outlined label="Impacts (separate from seriousness)"/></div>
    </q-expansion-item>
    <IncidentLocation :model="model"/>
    <q-expansion-item class="optional-section q-mt-sm" label="Office relationships (optional)" caption="AOR, homeport, CPC and issuing office can be different" icon="account_balance">
      <div class="form-grid q-pa-md"><q-select v-for="[key,label] in [['aor','AOR / occurrence jurisdiction'],['homeport','Homeport office'],['cpc','CPC office'],['issuingOffice','Actual issuing office']]" :key="key" v-model="model[key]" :options="offices" emit-value map-options clearable outlined :label="label"/></div>
    </q-expansion-item>
  </q-step>
  <q-step :name="2" title="Vessel & Operator" icon="directions_boat" :done="isCompleted(2)"><p class="muted">One occurrence may involve several vessels. Particulars are saved as a report snapshot; directory records remain separate.</p><div class="toolbar-row"><q-select v-model="chosenVessel" :options="visibleVessels" emit-value map-options clearable outlined dense label="Use a vessel from your directory"/><q-btn color="primary" no-caps icon="add" :label="chosenVessel?'Add selected vessel':'Add blank vessel'" @click="addVessel"/></div><div v-if="!model.vessels.length" class="empty-state"><q-icon name="directions_boat" size="40px"/><p>No vessels added. Add each involved vessel before submission.</p></div><q-card v-for="(vessel,index) in model.vessels" :key="index" flat bordered class="q-mt-md"><q-card-section><div class="row items-center justify-between"><h3 class="section-title">Vessel {{index+1}} · {{vessel.name||'New particulars'}}</h3><q-btn flat color="negative" no-caps icon="delete_outline" label="Remove vessel" @click="model.vessels.splice(index,1)"/></div><q-input v-model="vessel.role" outlined label="Role in occurrence" class="q-mb-md"/><VesselFields :model="vessel" :compact="!staff" :offices="offices"/></q-card-section></q-card></q-step>

  <q-step :name="3" title="Voyage & Cargo" icon="route" :done="isCompleted(3)">
   <p class="muted">Voyage details belong to each vessel. Record weather observations or use the incident location and time to look up supporting context.</p>
   <section v-for="(vessel,index) in model.vessels" :key="index" class="q-mb-md"><h3 class="section-title">{{vessel.name||`Vessel ${index+1}`}}</h3><q-expansion-item label="Voyage and cargo" icon="route" :default-opened="true"><div class="form-grid q-pa-md"><q-input v-for="[key,label] in [['origin','Voyage origin'],['destination','Destination'],['route','Route'],['cargoType','Cargo type'],['cargoUnit','Cargo unit']]" :key="key" v-model="vessel.voyage[key]" outlined :label="label"/><q-input v-model="vessel.voyage.cargoQuantity" type="number" step="any" min="0" outlined label="Cargo quantity (blank if unknown)"/></div></q-expansion-item></section>
   <div class="form-grid q-my-md"><div v-for="[key,label] in [['crew','Crew aboard'],['passengers','Passengers aboard'],['totalOnboard','Total persons aboard']]" :key="key"><q-input v-model="model.consequences[key]" type="number" min="0" step="1" outlined :label="label" :disable="model.consequences[key]===null||model.consequences[key]===undefined"/><q-checkbox :model-value="model.consequences[key]===null||model.consequences[key]===undefined" label="Unknown" @update:model-value="value=>clearCount(key,value)"/></div></div>
   <div class="toolbar-row q-mb-sm"><span class="muted">Crew + passengers: {{aboardSum===null?'Unknown split':aboardSum}}</span><q-btn flat no-caps color="primary" label="Use calculated total" :disable="aboardSum===null" @click="model.consequences.totalOnboard=aboardSum"/></div>
   <p class="muted">Keep an unknown split blank even when the overall number aboard is known. Counts are event totals across involved vessels.</p>
   <IncidentEnvironment :model="model"/>
  </q-step>
  <q-step :name="4" title="Narrative & Timeline" icon="history" :done="isCompleted(4)">
   <div class="form-grid">
    <q-input v-model="model.summary" class="span-2" type="textarea" outlined label="Factual account / description *" autogrow/>
    <q-input v-model="model.timeline" class="span-2" type="textarea" outlined label="Key events timeline" hint="Include times and sources where available; retain uncertain times as uncertain." autogrow/>
    <q-input v-model="model.crewResponse" class="span-2" type="textarea" outlined label="Crew behavior / response" autogrow/>
    <q-select v-model="model.crewFactors" outlined multiple use-chips :options="['Communication','Watchkeeping / lookout','Fatigue','Training / competence','Emergency response','Other','Not established']" label="Reported crew behavior factors"/>
    <q-input v-model="model.potentialCauses" type="textarea" outlined label="Potential causes (preliminary)" hint="A reported possibility is not an established investigation finding." autogrow/>
    <q-input v-model="model.initialActions" class="span-2" type="textarea" outlined label="Initial response and actions taken" autogrow/>
    <q-input v-model="model.rescueRecovery" class="span-2" type="textarea" outlined label="Rescue, recovery and salvage" autogrow/>
   </div>
  </q-step>
  <q-step :name="5" title="Findings & Outcomes" icon="health_and_safety" :done="isCompleted(5)"><q-banner rounded class="bg-blue-1 text-dark q-mb-md">A blank count means unknown. Turn off “Unknown” to enter a confirmed count, including a confirmed zero. These counts belong to the event and are not repeated for each vessel.</q-banner><div class="form-grid"><div v-for="[key,label] in [['fatalities','Fatalities'],['missing','Missing persons'],['injured','Injured persons'],['rescued','Rescued persons']]" :key="key"><q-input v-model="model.consequences[key]" type="number" min="0" step="1" outlined :label="label" :disable="model.consequences[key]===null||model.consequences[key]===undefined"/><q-checkbox :model-value="model.consequences[key]===null||model.consequences[key]===undefined" label="Unknown" @update:model-value="value=>clearCount(key,value)"/></div><q-input v-model="model.consequences.shipCondition" outlined label="Current vessel condition"/><q-input v-model="model.consequences.pollution" type="textarea" outlined label="Pollution / environmental impact" autogrow/><q-input v-model="model.consequences.notes" type="textarea" outlined label="Consequence source / clarification" autogrow/><q-input v-model="model.consequences.observedAt" type="datetime-local" outlined stack-label label="Consequence observation / as-of"/><q-input v-model="model.findingsOfCause" class="span-2" type="textarea" outlined label="Findings of cause" hint="State whether findings are preliminary or supported by an investigation." autogrow/><q-select v-model="model.damageTypes" outlined multiple use-chips :options="['Structural damage','Machinery damage','Cargo damage / loss','Property / pier damage','Pollution','No damage confirmed','Not yet assessed','Other']" label="Damage categories"/><q-input v-model="model.certificates" type="textarea" outlined label="Certificates / survey / inspection information" autogrow/><q-input v-model="model.recommendations" class="span-2" type="textarea" outlined label="Recommendations / further information" autogrow/></div></q-step>
  <q-step :name="6" title="Attachments" icon="attach_file" :done="isCompleted(6)"><div class="form-grid"><q-select v-model="model.sourceType" outlined :options="['Master report','Owner / operator report','Coast Guard report','Office referral','Email','Telephone','Other']" label="Initial source type"/><q-input v-model="model.sourceRef" outlined label="Source reference / document number"/><q-input v-model="model.receivedDate" outlined type="date" stack-label label="Date received"/></div><div class="form-grid q-mt-md"><q-input v-model="model.reportingAuthority" outlined label="Reporting authority"/><q-input v-model="model.sourceNotes" outlined type="textarea" label="Source reliability / limitations" autogrow/><q-input v-model="model.documentNotes" class="span-2" outlined type="textarea" label="Document notes" autogrow/></div><h3 class="section-title q-mt-lg">Attach evidence metadata</h3><p class="muted">Selected file contents stay on your device. This prototype retains document metadata and source references only.</p><div class="form-grid"><q-file v-model="selectedFile" multiple use-chips outlined clearable label="Select local files (metadata only)" hint="Choose or drop several files; only their metadata is retained."/><q-input v-model="attachmentName" outlined label="Document name"/><q-select v-model="attachmentType" :options="['Photograph','Master statement','Spot report','Certificate','Correspondence','Chart / position','Other']" outlined label="Document type"/><q-input v-model="attachmentSource" outlined label="Source reference"/></div><q-btn class="q-mt-md" outline color="primary" no-caps icon="attach_file" label="Add document to report" @click="queueEvidence"/><q-list bordered separator class="q-mt-md" v-if="existingEvidence.length||pendingFiles.length"><q-item v-for="e in existingEvidence" :key="e.id"><q-item-section avatar><q-icon name="description"/></q-item-section><q-item-section>{{e.name}}<q-item-label caption>{{e.type}} · retained attachment</q-item-label></q-item-section></q-item><q-item v-for="(e,i) in pendingFiles" :key="`pending-${i}`"><q-item-section avatar><q-icon name="description"/></q-item-section><q-item-section>{{e.name}}<q-item-label caption>{{e.type}} · pending save</q-item-label></q-item-section><q-item-section side><q-btn flat round icon="close" aria-label="Remove pending document" @click="pendingFiles.splice(i,1)"/></q-item-section></q-item></q-list></q-step>
  <q-step :name="7" title="Review & Submit" icon="fact_check"><h3 class="section-title">Review your report</h3><div class="form-grid"><div><div class="muted">Occurrence</div><strong>{{model.type||'Type required'}}</strong><p>{{model.dateUnknown?'Date unknown':display(model.date)}} · {{model.timeUnknown?'Time unknown':display(model.time)}}</p><p>{{display(model.place)}}</p></div><div><div class="muted">Involved vessels</div><p v-for="(v,i) in model.vessels" :key="i">{{i+1}}. {{v.name||'Vessel name required'}} · {{display(v.grossTonnage)}} GT</p><p v-if="!model.vessels.length" class="text-negative">At least one vessel required.</p></div><div class="span-2"><div class="muted">Factual account</div><p style="white-space:pre-wrap">{{display(model.summary)}}</p></div><div v-for="key in ['fatalities','missing','injured','rescued']" :key="key"><span class="muted text-capitalize">{{key}}: </span><strong>{{display(model.consequences[key])}}</strong></div></div><IncidentSupplement :event="model" include-vessels/><p>{{existingEvidence.length+pendingFiles.length}} document reference(s) will be retained with this report.</p><q-banner class="bg-blue-1 text-dark">Submission records your account identity and starts MARINA review. If a correction was requested, resubmission retains earlier history and evidence.</q-banner></q-step>
  <template #navigation><q-stepper-navigation><div class="custom-divider"></div><div class="form-navigation-footer"><q-btn flat icon="arrow_back" class="glass-btn prev-button" no-caps label="Previous" :disable="step===1" @click="step--"/><div class="action-buttons"><q-btn flat class="glass-btn cancel-button" no-caps :label="model.status==='draft'?'Save draft':'Save changes'" :loading="busy" @click="save(false)"/><q-btn v-if="step<7" unelevated class="btn-navy text-weight-bold next-button" icon-right="arrow_forward" no-caps label="Continue" @click="step++"/><q-btn v-else unelevated class="btn-navy text-weight-bold next-button" icon-right="send" no-caps :label="canResubmit?'Resubmit report':staff&&model.status!=='draft'?'Save incident changes':'Submit report'" :loading="busy" @click="save(canResubmit||!(staff&&model.status!=='draft'))"/></div></div></q-stepper-navigation></template>
 </q-stepper></template></q-card></div></div></div></q-page></template>
<style scoped>
.dashboard-bg {
  background-color: #f8fafc;
  min-height: 100vh;
}

.tracking-tight {
  letter-spacing: -0.02em;
}

.text-navy-900 {
  color: #002147;
}

.font-space {
  font-family: 'Hanken Grotesk', sans-serif;
}

.letter-spacing-2 {
  letter-spacing: 0.1em;
}

.border-emerald-2 {
  border: 1px solid #bbf7d0;
}

.bg-emerald-1 {
  background: #f0fdf4;
}

.text-emerald-10 {
  color: #16a34a;
}

.glass-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.incident-create-page :deep(.q-field--outlined .q-field__control) {
  background: #ffffff;
  border-radius: 8px;
}

.incident-create-page :deep(.q-field--outlined .q-field__control:before) {
  border-color: #cbd5e1;
}

.incident-create-page :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #002147;
  border-width: 2px;
}

.incident-create-page :deep(.q-field--outlined.q-field--focused .q-field__label) {
  color: #002147;
}

.incident-create-page :deep(.q-checkbox__inner--active),
.incident-create-page :deep(.q-checkbox__inner--truthy) {
  color: #002147 !important;
}

.incident-create-page :deep(.q-radio__inner--active),
.incident-create-page :deep(.q-radio__inner--truthy) {
  color: #002147 !important;
}

.incident-create-page :deep(.q-field__native),
.incident-create-page :deep(.q-field__input) {
  color: #1e293b;
}

.incident-create-page :deep(.q-field__label) {
  color: #64748b;
}

.professional-badge {
  padding: 4px 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 4px;
  font-size: 0.75rem;
  background: #002147 !important;
}

.progress-card {
  width: 100%;
  min-width: 0;
  border-radius: 12px;
}

.progress-bar {
  color: #002147 !important;
  height: 8px;
  border-radius: 4px;
}

.progress-bar :deep(.q-linear-progress__track) {
  background: #f1f5f9;
  opacity: 1;
}

.sidebar-column {
  width: 340px;
  min-width: 340px;
  height: calc(100vh - 190px);
  position: sticky;
  top: -25px;
}

.stepper-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.stepper-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.step-list-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  margin-right: -8px;
}

.step-list-scroll::-webkit-scrollbar {
  width: 4px;
}

.step-list-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.step-list-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.step-list-scroll.is-mobile {
  overflow-y: hidden;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-left: 0;
  padding-right: 0;
  margin-left: 0;
  margin-right: 0;
}

.step-list {
  border-radius: 12px;
}

.step-item {
  border-radius: 12px;
  padding: 14px;
  transition: all 0.2s ease;
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  position: relative;
}

.step-list-scroll.is-mobile .step-list {
  gap: 10px;
}

.step-list-scroll.is-mobile .step-item {
  margin-bottom: 0;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-item.step-pending {
  background: #ffffff;
  border-color: #e2e8f0;
  opacity: 0.85;
}

.step-item.step-pending:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  opacity: 1;
}

.step-item.step-done {
  background: #ffffff;
  border-color: #e2e8f0;
}

.step-item.step-active {
  background: #002147 !important;
  border-color: #002147 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.step-item.step-active :deep(.q-item__section),
.step-item.step-active :deep(.q-item__label) {
  color: white;
}

.step-item.step-active .text-blue-10 {
  color: white !important;
}

.step-item.step-active .text-blue-grey-4 {
  color: rgba(255, 255, 255, 0.7) !important;
}

.step-item.step-active::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 32px;
  background: #002147;
  border-radius: 4px 0 0 4px;
}

.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 1px solid #cbd5e1;
}

.step-badge.step-pending {
  background: #f8fafc;
  color: #002147;
  border-color: #e2e8f0;
}

.step-badge.step-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: transparent;
}

.step-badge.step-done {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.turnstile-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.cf-turnstile-mount {
  min-height: 65px;
  display: inline-block;
}

.form-card {
  border-radius: 16px;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.step-pill {
  background: #f1f5f9;
  color: #002147;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
}

.glass-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  transition: all 0.2s ease;
}

.glass-btn:hover {
  background: #f8fafc;
  color: #002147;
  border-color: #94a3b8;
}

.btn-navy {
  background: #002147;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 700;
  transition: background-color 0.2s ease;
}

.btn-navy:hover {
  background: #0a1f38;
}

.form-navigation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-buttons :deep(.q-btn),
.prev-button {
  min-width: 120px;
}

@media (max-width: 599px) {
  .form-navigation-footer {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .form-navigation-footer .prev-button {
    order: 1;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0;
  }

  .form-navigation-footer .next-button {
    order: 2;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0;
  }

  .form-navigation-footer .action-buttons {
    order: 3;
    display: contents !important;
  }

  .form-navigation-footer .cancel-button {
    order: 3;
    grid-column: span 2;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0;
  }
}

.summary-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.summary-row {
  padding: 10px 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  min-height: 56px;
}

.summary-label {
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
  font-size: 11px;
}

.summary-value {
  word-break: break-word;
  white-space: pre-wrap;
  color: #0f172a;
}

@media (max-width: 1023px) {
  .create-container {
    flex-direction: column;
    flex-wrap: wrap;
  }

  .stepper-body {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .form-card {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .form-card :deep(> .q-pa-md) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .sidebar-column {
    width: 100%;
    min-width: 100%;
    height: auto;
    position: relative;
    top: 0;
  }

  .progress-card {
    width: 100%;
    min-width: 0;
  }
}

:global(.body--dark) .glass-card {
  background: #0f172a;
  border-color: #1e293b;
}

:global(.body--dark) .incident-create-page .form-card {
  color: #f1f5f9;
}

:global(.body--dark) .incident-create-page :deep(.q-field--outlined .q-field__control) {
  background: #0f172a;
}

:global(.body--dark) .incident-create-page :deep(.q-field--outlined .q-field__control:before) {
  border-color: #334155;
}

:global(.body--dark) .incident-create-page :deep(.q-field__native),
:global(.body--dark) .incident-create-page :deep(.q-field__input) {
  color: #f1f5f9;
}

:global(.body--dark) .incident-create-page :deep(.q-field__label) {
  color: #94a3b8;
}

:global(.body--dark) .step-pending {
  background: #0f172a;
  border-color: #1e293b;
}

:global(.body--dark) .step-pill,
:global(.body--dark) .glass-btn {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

:global(.body--dark) .summary-card {
  background: #0f172a;
  border-color: #1e293b;
}

:global(.body--dark) .summary-row {
  background: #1e293b;
  border-color: #334155;
}

.custom-divider {
  height: 1px;
  background-color: #e2e8f0;
  width: 100%;
  margin: 32px 0;
  border: none;
}

:global(.body--dark) .custom-divider {
  background-color: #334155;
}
</style>


<style scoped>
.report-stepper :deep(.q-stepper__step-inner){padding:24px 0 0}.report-stepper :deep(.q-stepper__title){font-size:13px}.report-stepper :deep(.q-stepper__header){box-shadow:none}.report-stepper :deep(.q-stepper__nav){padding:0}.incident-create-page .summary-card .form-grid{margin-top:14px}@media(max-width:650px){.report-stepper :deep(.q-stepper__label){display:none}.report-stepper :deep(.q-stepper__tab){padding:12px 5px;min-height:58px}}
</style>

<style scoped>.optional-section{border:1px solid #e2e8f0;border-radius:8px;background:#fff}.optional-section :deep(.q-item__label){font-size:14px}.optional-section :deep(.q-item__label--caption){font-size:12px}.optional-section :deep(.q-item){min-height:64px}</style>

<style scoped>
.incident-create-page{padding:16px!important}.intake-title{font-family:'Hanken Grotesk',sans-serif;font-size:26px;line-height:1.2}.intake-subtitle{font-size:13px;line-height:1.5;margin-top:4px}.intake-heading .q-mb-sm{margin-bottom:4px}.intake-heading .progress-card{padding:10px 14px!important}.progress-card .text-overline{font-size:10px;line-height:20px}.progress-card .progress-bar{height:6px}.form-card{padding-top:16px!important;padding-bottom:16px!important}.intake-step-title{font-size:21px;line-height:1.3}.current-step-heading .step-pill{padding:5px 9px;font-size:12px}.report-context{padding:0;background:#f8fafc}.account-summary :deep(.q-item){min-height:48px;padding:7px 10px}.account-summary :deep(.q-item__section--side){padding-right:8px}.account-summary :deep(.q-item__section--side:last-child){padding-left:4px;padding-right:0}.account-summary :deep(.q-item__label--caption){font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.context-reference{font-size:12px;font-weight:600}.report-stepper :deep(.q-stepper__step-inner){padding-top:14px}.report-stepper :deep(.q-stepper__tab){min-height:58px;padding:10px}.report-stepper :deep(.q-stepper__nav .custom-divider){margin:22px 0}@media(max-width:650px){.intake-title{font-size:23px}.intake-step-title{font-size:20px}.report-stepper :deep(.q-stepper__tab){min-height:44px;padding:8px 5px}.report-stepper :deep(.q-stepper__step-inner){padding-top:12px}.account-summary :deep(.q-item__section--side){font-size:11px}}
</style>
