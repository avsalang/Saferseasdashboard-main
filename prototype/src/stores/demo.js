import { reactive, computed, watch } from 'vue';
import { createSeed, blankEvent, blankVessel } from '../data/seed.js';
import { roleLabels,rolePermissions,canAccess,filterEvents,summarizeEvents,transitionEvent,appendReport,normalizedCount,clone } from '../data/domain.js';
import {migrateAccountModel} from '../data/accounts.js';
const KEY='saferseas-marina-vue-demo-v1';
const uid=prefix=>prefix+'-'+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
let loaded;try{loaded=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
const state=reactive(migrateAccountModel(loaded));
const currentUser=computed(()=>{const u=state.users.find(u=>u.id===state.sessionUserId&&u.status==='active');if(!u||!Object.hasOwn(rolePermissions,u.role))return null;const role=state.roles.find(r=>r.id===u.role);return {...u,scope:u.role==='investigator'?'all':u.scope,permissions:u.role==='investigator'?rolePermissions.investigator:role?.permissions||rolePermissions[u.role]||[]};});
const can=(action,event)=>canAccess(currentUser.value,action,event);
const visibleEvents=computed(()=>state.events.filter(e=>can('read',e)));
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({...state,persistenceError:null}));state.persistenceError=null;return true;}catch{state.persistenceError='Browser storage capacity was exceeded. Changes remain in this session but have not been saved. Export your work before closing this tab.';return false;}};
watch(state,persist,{deep:true});
function visibleRecords(collection){
  const u=currentUser.value;if(!u)return [];
  const eventIds=new Set(visibleEvents.value.map(e=>e.id));
  const ownOrOffice=r=>u.scope==='all'||(u.scope==='own'?(r.createdBy||r.uploadedBy||r.ownerId)===u.id:r.officeId===u.officeId);
  return (state[collection]||[]).filter(r=>{
    if(collection==='exports'){const events=r.snapshot?.events||[];return events.length?events.every(e=>can('read',state.events.find(live=>live.id===e.id)||e)):ownOrOffice(r);}
    if(collection==='sourceRows')return visibleRecords('imports').some(b=>b.id===(r.batchId||r.importId));
    if(collection==='cases'&&!can('enforce'))return false;
    if(collection==='reports'&&u.role==='reporter'&&(r.type!=='spot'||r.createdBy!==u.id))return false;
    if(r.eventId)return eventIds.has(r.eventId);
    if(['evidence','imports','assessments','vessels'].includes(collection))return ownOrOffice(r);
    return true;
  });
}
function audit(action,recordId,details=''){const u=currentUser.value;state.auditLogs.unshift({id:uid('audit'),actorId:u?.id||'system',actorName:u?.name||'System',action,recordId,details:typeof details==='string'?details:JSON.stringify(details),at:new Date().toISOString()});}
function notify(userId,title,message,link='/notifications'){state.notifications.unshift({id:uid('notice'),userId,title,message,link,read:false,at:new Date().toISOString()});}
const requireActive=()=>{if(!currentUser.value)throw Error('Sign in with an active MARINA-issued demonstration account.');};
function assertCollection(collection,data,existing){
  requireActive();const e=collection==='events'?(existing||data):data?.eventId||existing?.eventId?state.events.find(e=>e.id===(data?.eventId||existing?.eventId)):null;
  const needs={users:['manage_accounts'],roles:['configure'],offices:['configure'],lookups:['configure'],templates:['configure'],parties:['investigate'],cases:['enforce'],actions:['investigate','enforce'],imports:['analyze','investigate'],sourceRows:['analyze','investigate'],exports:['export','report'],assessments:['analyze'],policyItems:['analyze'],reports:['investigate','review'],events:['report','review','investigate','analyze'],vessels:['report','investigate'],evidence:['report','investigate','review','enforce'],notifications:['read'],auditLogs:['audit']}[collection];
  if(!needs||!needs.some(a=>can(a,e||undefined)))throw Error('Your assigned role cannot change this record.');
  for(const eventId of new Set([existing?.eventId,data?.eventId].filter(Boolean))){const linked=state.events.find(x=>x.id===eventId);if(!linked||!can('read',linked))throw Error('This record is outside your assigned scope.');}
  if(existing&&['exports','imports','sourceRows','assessments','evidence','cases','vessels','reports'].includes(collection)&&!visibleRecords(collection).some(r=>r.id===existing.id))throw Error('This record is outside your assigned scope.');
  if(['vessels'].includes(collection)&&currentUser.value.scope==='own'&&existing&&existing.ownerId!==currentUser.value.id)throw Error('This vessel is outside your account scope.');
  if(collection==='notifications'&&existing&&existing.userId!==currentUser.value.id&&!can('admin'))throw Error('This notification belongs to another account.');
  if(collection==='reports'&&can('report',e)&&!can('investigate',e)&&!can('review',e)&&data.type!=='spot'&&existing?.type!=='spot')throw Error('Investigation reports require an authorized MARINA role.');
}
function add(collection,data){
  if(collection==='roles')throw Error('Only MRO Reporter, MRO Reviewer and MARINA Investigator account types are supported.');
  if(collection==='users'&&!Object.hasOwn(rolePermissions,data.role))throw Error('Choose one of the three supported account types.');
  if(collection==='reports')return recordReport(data);
  assertCollection(collection,data);const at=new Date().toISOString();const item={...clone(data),id:data.id||uid(collection.slice(0,5)),createdAt:data.createdAt||at};
  if(['vessels','evidence','imports','assessments','exports'].includes(collection)){item.ownerId=item.ownerId||currentUser.value.id;item.createdBy=item.createdBy||currentUser.value.id;item.officeId=item.officeId||currentUser.value.officeId;}
  state[collection].unshift(item);audit('Created '+collection,item.id,item.name||item.title||item.ref||'');return state[collection].find(x=>x.id===item.id);
}
function update(collection,id,patch){
  const item=state[collection]?.find(x=>x.id===id);if(!item)throw Error('Record not found.');if(collection==='users'&&Object.hasOwn(patch,'role')&&!Object.hasOwn(rolePermissions,patch.role))throw Error('Choose one of the three supported account types.');assertCollection(collection,patch,item);
  if(collection==='roles')patch={...patch,name:roleLabels[id],...(id==='investigator'?{permissions:rolePermissions.investigator,scope:'all'}:{})};
  if(collection==='reports'&&item.status==='issued')throw Error('Issued report revisions are immutable. Create a new revision.');
  const before=clone(item);Object.assign(item,clone(patch),{id,updatedAt:new Date().toISOString()});audit('Updated '+collection,id,{before,after:clone(item)});return item;
}
function remove(collection,id){const item=state[collection]?.find(x=>x.id===id);if(!item)throw Error('Record not found.');assertCollection(collection,item,item);if(collection==='reports'&&item.status==='issued')throw Error('An issued report cannot be deleted.');if(collection==='events'){if(item.status!=='draft')throw Error('Only an unsubmitted draft can be discarded.');if(state.reports.some(r=>r.eventId===id&&r.status==='issued')||state.cases.some(r=>r.eventId===id)||state.actions.some(r=>r.eventId===id))throw Error('This incident has linked downstream records and cannot be discarded.');state.evidence.filter(d=>d.eventId===id).forEach(d=>d.eventId=null);state.reports=state.reports.filter(r=>r.eventId!==id);}state[collection]=state[collection].filter(x=>x.id!==id);audit('Removed '+collection,id,item.name||item.ref||'');}
function newEvent(){const e=blankEvent();e.ownerId=currentUser.value?.id||'';e.officeId=currentUser.value?.officeId||'';e.vessels=e.vessels.map(v=>({...v,ownerId:e.ownerId,officeId:e.officeId}));return e;}
function saveEvent(data,{submit=false}={}){
  requireActive();const existing=data.id?state.events.find(e=>e.id===data.id):null;
  if(!can('report',existing||undefined)&&!can('review',existing||undefined)&&!can('investigate',existing||undefined))throw Error('You cannot edit this incident.');
  if(existing&&currentUser.value.role==='reporter'&&!['draft','correction_requested'].includes(existing.status))throw Error('This report is awaiting staff review and is not editable.');
  const clean={...newEvent(),...clone(data)};clean.ownerId=existing?.ownerId||currentUser.value.id;clean.officeId=existing?.officeId||currentUser.value.officeId;clean.status=existing?.status||'draft';
  clean.consequences={...blankEvent().consequences,...clean.consequences};for(const k of ['fatalities','missing','injured','rescued','totalOnboard','crew','passengers'])clean.consequences[k]=normalizedCount(clean.consequences[k]);
  clean.vessels=(clean.vessels||[]).map(v=>({...blankVessel(),...v,id:v.id||uid('vessel')}));
  for(const key of ['lat','lon']){if(clean[key]===''||clean[key]==null)clean[key]=null;else if(!Number.isFinite(Number(clean[key])))throw Error('Coordinates must be numeric or unknown.');else clean[key]=Number(clean[key]);}
  if(clean.lat!=null&&(clean.lat< -90||clean.lat>90)||clean.lon!=null&&(clean.lon< -180||clean.lon>180))throw Error('Coordinate is outside its valid range.');
  if(submit){if(!clean.summary?.trim())throw Error('Add a brief description before submitting.');if(!clean.place?.trim())throw Error('Add a place description, or explicitly describe the location as unknown.');if(!clean.date&&!clean.dateUnknown)throw Error('Enter the occurrence date or mark it unknown.');if(!clean.vessels.length||clean.vessels.some(v=>!v.name?.trim()))throw Error('Name each involved vessel or identify it as unknown.');}
  const now=new Date().toISOString();clean.id=existing?.id||uid('event');if(!existing){state.settings.nextEventNumber=Math.max(state.settings.nextEventNumber||0,...state.events.map(e=>Number(e.ref?.split('-').at(-1))||0))+1;}clean.ref=existing?.ref||`SS-DEMO-2026-${String(state.settings.nextEventNumber).padStart(4,'0')}`;clean.createdAt=existing?.createdAt||now;clean.updatedAt=now;
  if(existing)Object.assign(existing,clean);else state.events.unshift(clean);audit(existing?'Updated incident':'Created incident',clean.id,clean.ref);
  if(submit){const status=clean.status==='correction_requested'?'resubmitted':'submitted';transition(clean.id,status,'Submitted through the issued account.');const saved=state.events.find(e=>e.id===clean.id);const report={id:uid('report'),eventId:clean.id,type:'spot',status:'review',date:now.slice(0,10),asOf:now.slice(0,10),preparedBy:currentUser.value.name,designation:currentUser.value.role,fields:clone(saved),evidenceIds:clone(saved.evidenceIds),createdBy:currentUser.value.id,createdAt:now};state.reports=appendReport(state.reports,report);}
  return state.events.find(e=>e.id===clean.id);
}
function transition(id,status,remarks=''){
  const i=state.events.findIndex(e=>e.id===id);if(i<0)throw Error('Incident not found.');const next=transitionEvent(state.events[i],status,currentUser.value,remarks);state.events[i]=next;
  audit('Incident '+status,id,remarks);if(['correction_requested','validated'].includes(status))notify(next.ownerId,status==='validated'?'Report validated':'Correction requested',remarks||'Your report has been reviewed.','/reporter/reports/'+id);
  if(['submitted','resubmitted'].includes(status))state.users.filter(u=>u.role==='reviewer'&&u.status==='active').forEach(u=>notify(u.id,'Report ready for review',next.ref,'/admin/incidents/'+id));return state.events[i];
}
function recordReport(data){
  requireActive();const e=state.events.find(e=>e.id===data.eventId);if(!e||(!can('investigate',e)&&!(data.type==='spot'&&can('report',e))))throw Error('Not authorized to prepare this report.');
  const at=new Date().toISOString(),record={...clone(data),id:data.id||uid('report'),createdBy:currentUser.value.id,createdAt:data.createdAt||at};state.reports=appendReport(state.reports,record);const result=state.reports.find(r=>r.id===record.id);audit('Created report revision',record.id,`${record.type} revision ${result.revision}`);return result;
}
function signIn(userId){const user=state.users.find(u=>u.id===userId);if(!user||user.status!=='active'||!Object.hasOwn(rolePermissions,user.role))throw Error('This account is not active. Contact your MARINA Investigator.');state.sessionUserId=user.id;user.lastLogin=new Date().toISOString();audit('Signed in',user.id,'Demonstration session');return user;}
function signOut(){if(currentUser.value)audit('Signed out',currentUser.value.id);state.sessionUserId=null;}
function reset(){const seed=createSeed();Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,seed);persist();}
const store={state,currentUser,visibleEvents,visibleRecords,can,getEvent:id=>visibleEvents.value.find(e=>e.id===id),saveEvent,transition,add,update,remove,recordReport,recordCase:data=>add('cases',data),recordExport:data=>add('exports',{status:'ready',createdBy:currentUser.value?.id,...data}),selectEvents:s=>filterEvents(visibleEvents.value,s||{}),summarize:summarizeEvents,persist,audit,notify,signIn,signOut,reset,newEvent,newVessel:blankVessel};
export const useDemo=()=>store;
