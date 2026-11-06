import {canonicalMarinaValue,MARINA_OPTIONS} from './marinaVocabulary.js';
export const roleLabels={reporter:'MRO Reporter',reviewer:'MRO Reviewer',investigator:'MARINA Investigator'};
export const operationalPermissions=['read','report','review','investigate','enforce','analyze','export'];
// Operational overlap is intentional in this mockup, as requested by MARINA's stakeholder.
export const rolePermissions={reporter:[...operationalPermissions],reviewer:[...operationalPermissions],investigator:[...operationalPermissions,'manage_accounts','configure','audit','admin']};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function canAccess(user,action,event){
  if(!user||user.status!=='active'||!Object.hasOwn(rolePermissions,user.role))return false;
  const permissions=user.role==='investigator'?rolePermissions.investigator:(user.permissions||rolePermissions[user.role]).filter(p=>operationalPermissions.includes(p));
  if(!permissions.includes(action)&&!permissions.includes('admin'))return false;
  const officeMatches=value=>{
    if(!value||!user.officeId)return false;
    if(value===user.officeId)return true;
    const office=canonicalMarinaValue('office',value);
    return MARINA_OPTIONS.office.includes(office)&&office===canonicalMarinaValue('office',user.officeId);
  };
  if(event&&event.investigatorId!==user.id){if(user.scope==='own'&&event.ownerId!==user.id)return false;if(user.scope==='office'&&!officeMatches(event.officeId)&&!officeMatches(event.aor))return false;}
  return true;
}
const any=v=>v==null||v===''||v==='All'||v==='all';
export function filterEvents(events,selection={}){
  return events.filter(e=>{
    const s=selection;
    if(!any(s.search)&&!JSON.stringify([e.ref,e.type,e.place,e.summary,...(e.vessels||[]).map(v=>[v.name,v.officialNumber,v.owner,v.operator])]).toLowerCase().includes(String(s.search).toLowerCase()))return false;
    if(!any(s.year)&&(!e.date||e.dateUnknown||String(e.date).slice(0,4)!==String(s.year)))return false;
    for(const key of ['status','seriousness','positionQuality'])if(!any(s[key])&&e[key]!==s[key])return false;
    if(!any(s.type)&&canonicalMarinaValue('incidentType',e.type)!==canonicalMarinaValue('incidentType',s.type))return false;
    for(const key of ['aor','homeport','cpc','issuingOffice'])if(!any(s[key])&&canonicalMarinaValue('office',e[key])!==canonicalMarinaValue('office',s[key]))return false;
    if(!any(s.vesselType)&&!(e.vessels||[]).some(v=>canonicalMarinaValue('shipType',v.type)===canonicalMarinaValue('shipType',s.vesselType)))return false;
    if(s.dateFrom&&(!e.date||e.date<s.dateFrom))return false;if(s.dateTo&&(!e.date||e.date>s.dateTo))return false;
    return true;
  });
}
export const validPosition=e=>e.positionQuality!=='unknown'&&e.lat!==null&&e.lat!==''&&e.lon!==null&&e.lon!==''&&Number.isFinite(Number(e.lat))&&Number.isFinite(Number(e.lon))&&Number(e.lat)>=-90&&Number(e.lat)<=90&&Number(e.lon)>=-180&&Number(e.lon)<=180;
const group=(events,key)=>Object.entries(events.reduce((a,e)=>{const k=typeof key==='function'?key(e):e[key]||'Unknown';a[k]=(a[k]||0)+1;return a;},{})).map(([name,count])=>({name,count}));
export function summarizeEvents(events){
  const sum=key=>events.reduce((n,e)=>n+(Number.isFinite(Number(e.consequences?.[key]))&&e.consequences?.[key]!=null&&e.consequences[key]!==''?Number(e.consequences[key]):0),0);
  const positioned=events.filter(validPosition);const approximate=positioned.filter(e=>e.positionQuality==='approximate').length;
  return {events:events.length,vesselInvolvements:events.reduce((n,e)=>n+(e.vessels?.length||0),0),fatalities:sum('fatalities'),missing:sum('missing'),injured:sum('injured'),rescued:sum('rescued'),unknownFatalities:events.filter(e=>e.consequences?.fatalities==null||e.consequences.fatalities==='').length,located:positioned.length-approximate,approximate,unlocated:events.length-positioned.length,byType:group(events,e=>canonicalMarinaValue('incidentType',e.type)||'Unknown'),bySeriousness:group(events,'seriousness'),byMonth:group(events,e=>e.date&&!e.dateUnknown?e.date.slice(0,7):'Unknown')};
}
export function transitionEvent(event,status,user,remarks=''){
  const allowed={draft:['submitted'],submitted:['under_review','correction_requested','validated'],under_review:['correction_requested','validated'],correction_requested:['resubmitted'],resubmitted:['under_review','correction_requested','validated'],validated:['under_review']};
  if(!(allowed[event.status]||[]).includes(status))throw Error(`Cannot change ${event.status} to ${status}.`);
  const reporting=['submitted','resubmitted'].includes(status);
  if(!canAccess(user,reporting?'report':'review',event))throw Error('This action is outside your assigned permissions.');
  if(status==='correction_requested'&&!String(remarks).trim())throw Error('Explain the correction requested.');
  const at=new Date().toISOString();return {...clone(event),status,updatedAt:at,history:[...(event.history||[]),{id:globalThis.crypto?.randomUUID?.()||String(Date.now()),status,actorId:user.id,actorName:user.name,at,remarks}]};
}
export function appendReport(reports,data){const max=Math.max(0,...reports.filter(r=>r.eventId===data.eventId&&r.type===data.type).map(r=>r.revision||0));return [...reports,{...clone(data),revision:data.revision||max+1}];}
export function normalizedCount(value){if(value==null||value==='')return null;const n=Number(value);if(!Number.isInteger(n)||n<0)throw Error('Person counts must be whole numbers of zero or more, or unknown.');return n;}
