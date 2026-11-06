import {validReportReceiptDate} from '../pages/operations/reportRequirements.js'
import {overseasEvents} from './outputPopulation.js'
import {describeEnvironmentField} from './incidentWeather.js'
export const outputCatalogue = [
 ['O01','Annual master register','Registers','Vessel involvement','All mapped vessel, event, consequence, office, action and source particulars.'],
 ['O02','Monthly accident-type matrix','Monthly matrices','Event','Proposed family mapping; retain raw type and Other / Unknown.'],
 ['O03','Monthly AOR matrix','Monthly matrices','Event','AOR attribution; independent of homeport and issuing office.'],
 ['O04','Monthly homeport matrix','Monthly matrices','Vessel involvement','Vessel homeport; foreign and unknown retained.'],
 ['O05','Monthly vessel/service matrix','Monthly matrices','Vessel involvement','Detailed service category denominator.'],
 ['O06','Monthly seriousness matrix','Monthly matrices','Event','Exact seriousness codes including Unknown.'],
 ['O07','Hull, size and classification matrices','Monthly matrices','Vessel involvement','Separate hull, size class and classification society dimensions.'],
 ['O08','Case outcome matrix','Cases and compliance','Case','Occurrence month, with enforcement status distinct from review.'],
 ['O09','SCO summary by office','Cases and compliance','Case','CPC / homeport attribution shown beside actual issuing office; measures may overlap.'],
 ['O10','Detailed SCO/case compliance register','Cases and compliance','Case / action','Source 72-hour bucket retained; unknown timestamps yield Unknown calculation.'],
 ['O11','Human and vessel consequences','Casualties and comparisons','Event','Latest event consequences counted once; revisions excluded.'],
 ['O12','GT, age, company and AOR by seriousness','Casualties and comparisons','Vessel involvement','Proposed bands; age at occurrence year and exact decimal GT.'],
 ['O13','MAIC report-receipt summary','MAIC documents','Report revision','Typed report records; revision rule and as-of explicit.'],
 ['O14','Cross-year comparison package','Casualties and comparisons','Event / involvement','Selected period only; unmatched partial years carry no percentage claim.'],
 ['O15','Spot report','MAIC documents','Event','Factual, consequence, source and submitter sections; draft demonstration.'],
 ['O16','MAIC Form 1B initial report','MAIC documents','Report revision','Particulars, facts, consequences, actions, recommendations and signoffs.'],
 ['O17','MAIC Form 2 progress report','MAIC documents','Report revision','Dated progress observations, rescue/recovery, SCO and certificate/SRB actions.'],
 ['O18','MAIC Form 3B final report','MAIC documents','Report revision','Facts, causal factors, conditions, analysis, conclusions, lessons and recommendations.'],
 ['O19','Overseas / Filipino crew-passenger register','Registers','Event','Overseas events and known person categories; no fabricated individual identities.'],
 ['O20','Geographic output package','Maps and quality','Located event','Filtered points and matching table; unlocated exclusions explicit.'],
 ['O21','Statistical figures','Maps and quality','Event','Selected event distribution with underlying table and exportable SVG.'],
 ['O22','Reconciliation and data-quality report','Maps and quality','Event / source row','Raw rows, events, involvements, unknowns, exclusions and accepted decisions.']
].map(([id,title,group,grain,notes])=>({id,title,group,grain,notes,template:id==='O20'?'Proposed GIS package':id==='O21'?'Proposed figure':id>='O15'&&id<='O18'?'Structured demonstration':'Versioned demo table v1',formats:id==='O20'?['CSV','XLSX','GeoJSON','PDF']:id==='O21'?['CSV','XLSX','SVG','PDF']:['CSV','XLSX','PDF']}))
export const catalogue = outputCatalogue
const known = x => x == null || x === '' ? 'Unknown' : x
const retained=value=>value===undefined?null:JSON.parse(JSON.stringify(value))
export function supplementalIncidentColumns(event,vessel){
 const environment=event.environment||{}
 return {
  'Occurrence timeline':retained(event.timeline),'Crew response':retained(event.crewResponse),'Crew factors (reported)':retained(event.crewFactors),'Potential causes (preliminary)':retained(event.potentialCauses),'Findings of cause (reported)':retained(event.findingsOfCause),'Damage types (reported)':retained(event.damageTypes),'Reporting authority':retained(event.reportingAuthority),'Rescue / recovery':retained(event.rescueRecovery),'Certificates / inspections':retained(event.certificates),'Consequence observation (local)':retained(event.consequences?.observedAt),'Consequence source notes':retained(event.consequences?.notes),'Source notes':retained(event.sourceNotes),'Document notes':retained(event.documentNotes),
  'Environment observation (local)':retained(environment.observedAt),'Recorded wave height (m)':retained(environment.waveHeightM),'Recorded wind force':retained(environment.windForce),'Recorded visibility':retained(environment.visibility),'Recorded weather description':retained(environment.weatherDescription),'Recorded sea state':retained(environment.seaState),'Recorded current / tide':retained(environment.currentTide),'Environment source notes':retained(environment.source),'Environment field sources (metadata)':retained(environment.fieldSources),'Environment values with provenance':Object.fromEntries(['waveHeightM','windForce','visibility','weatherDescription','seaState','currentTide'].map(key=>[key,describeEnvironmentField(environment,key)])),'Modelled lookup reference (provenance retained)':retained(environment.lookup),'Additional MAIC fields':retained(event.maicFields),
  ...(vessel?{'Port of registry (place)':retained(vessel.portOfRegistry),'Homeport (place)':retained(vessel.homeportPlace),'Propulsion type':retained(vessel.propulsionType),'Call sign':retained(vessel.callSign),'Type of operation':retained(vessel.operationType??vessel.typeOfOperation)}:{'Additional vessel particulars':retained((event.vessels||[]).map(v=>({id:v.id,name:v.name,portOfRegistry:v.portOfRegistry??null,homeportPlace:v.homeportPlace??null,propulsionType:v.propulsionType??null,callSign:v.callSign??null,operationType:v.operationType??v.typeOfOperation??null,homeportOffice:v.homeport??null,cpcOffice:v.cpc??null})))})
 }
}
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Unknown date']
const family = type => ({'Engine trouble':'Engine / mechanical','Mechanical failure':'Engine / mechanical',Listing:'Listing / capsizing',Capsizing:'Listing / capsizing',Collision:'Collision / allision',Allision:'Collision / allision',Fire:'Fire / explosion',Explosion:'Fire / explosion','Man overboard':'Man overboard / occupational','Occupational accident':'Man overboard / occupational'}[type] || known(type))
function matrix(items, dimension) {
 const groups = new Map()
 items.forEach(item=> { const label = known(dimension(item)); if(!groups.has(label)) groups.set(label,{Category:label,...Object.fromEntries(monthNames.map(m=>[m,0])),Total:0}); const row=groups.get(label); const m=item.date && /^\d{4}-\d{2}/.test(item.date)?Number(item.date.slice(5,7))-1:12; row[monthNames[m] || 'Unknown date']++; row.Total++ })
 return [...groups.values()]
}
export function buildOutput(outputId, events, state, selection = {}) {
 events=events.map(e=>e.dateUnknown?{...e,date:null}:e)
 const ids = new Set(events.map(e=>e.id)); const involvements = events.flatMap(e=>(e.vessels || []).map(v=>({...v,event:e,date:e.date})))
 const cases = state.cases.filter(c=>ids.has(c.eventId)); const reports=state.reports.filter(r=>ids.has(r.eventId) && (!selection.asOf || !r.date || r.date<=selection.asOf))
 const eventRow = e => ({Reference:e.ref,Date:e.date,Time:e.time,Type:e.type,Seriousness:e.seriousness,Place:e.place,AOR:e.aor,Homeport:e.homeport,CPC:e.cpc,'Issuing office':e.issuingOffice,Status:e.status,Vessels:e.vessels?.length ?? 0,Fatalities:e.consequences?.fatalities,Missing:e.consequences?.missing,Injured:e.consequences?.injured,Rescued:e.consequences?.rescued,'Total onboard':e.consequences?.totalOnboard,'Source file':e.sourceLineage?.file,'Source sheet':e.sourceLineage?.sheet,'Source row':e.sourceLineage?.row,'Merge group':e.sourceLineage?.mergeGroup,Summary:e.summary,'Initial Information Received':e.receivedDate,'Initial actions':e.initialActions,Recommendations:e.recommendations})
 let rows=[]
 switch(outputId) {
 case 'O01': rows=involvements.map((v,index)=>{
   const e=v.event,linked=cases.filter(c=>c.eventId===e.id&&(!c.vesselId||c.vesselId===v.id)),actions=linked.flatMap(c=>(c.actions||[]).filter(a=>/SCO|Show Cause/i.test(a.type)).map(a=>({...a,caseNumber:c.caseNumber})))
   const within=actions.filter(a=>/within/i.test(a.sourceTimeliness||'')),beyond=actions.filter(a=>/beyond/i.test(a.sourceTimeliness||''))
   const join=(items,key)=>items.length?items.map(item=>known(item[key])).join('\n'):null
   const effective=v.cpc&&!/^(n\/a|none|unknown)$/i.test(v.cpc)?v.cpc:v.homeport||e.homeport
   return {'NO':index+1,'RIG TYPE':v.rigType,'NAME OF SHIP/VESSEL':v.name,'NAME OF OPERATOR / OWNER':[v.operator,v.owner].filter(Boolean).join(' / ')||null,'OFFICIAL NO. / IMO NO.':[v.officialNumber,v.imoNumber].filter(Boolean).join(' / ')||null,'YEAR BUILT':v.yearBuilt,'GT':v.grossTonnage,'HOMEPORT / FLAG':[v.homeport||e.homeport,v.flag].filter(Boolean).join(' / ')||null,'CPC':v.cpc||e.cpc,'EFFECTIVE OFFICE (derived)':effective,'TYPE OF SHIP/VESSEL':v.type,'HULL':v.hull,'TYPE OF INCIDENT / ACCIDENT':[e.type,...(e.secondaryTypes||[])].join('; '),'DATE OF INCIDENT / ACCIDENT':e.date,'TIME OF INCIDENT / ACCIDENT':e.time,'LOCATION OF INCIDENT / ACCIDENT':e.place,'AOR':e.aor,'IMO CLASSIFICATION':e.seriousness,'SIZE CLASSIFICATION':v.sizeClass,'CLASSIFICATION SOCIETY':v.classificationSociety,'POTENTIAL CAUSE/S':e.potentialCauses??null,'CONSEQUENCES TO SHIP / HUMAN CASUALTY':e.consequences,'RECOMMENDATIONS':e.recommendations,'IMAGE/LINK OF MCMC':(e.evidenceIds||[]).join('; ')||null,'ACTIONS TAKEN / STATUS':e.initialActions,'SCO within 72H':join(within,'reference'),'CASE No. for within72H':join(within,'caseNumber'),"MROs issued within72H":join(within,'officeId'),'Issued Date within72H':join(within,'issuedDate'),'SCO beyond 72H':join(beyond,'reference'),'CASE No. for beyond72H':join(beyond,'caseNumber'),"MROs issued beyond72H":join(beyond,'officeId'),'Issued Date beyond72H':join(beyond,'issuedDate'),'VIOLATIONS':join(linked,'violations'),'DECISION / ORDER':join(linked,'decision'),'Decision/order Issued Date':join(linked,'decisionDate'),'AMOUNT OF PENALTY':linked.some(c=>c.penalty!=null)?linked.reduce((sum,c)=>sum+(c.penalty??0),0):null,'REMARKS':join(linked,'status'),'Event reference':e.ref,'Vessel ID':v.id,'Official number (text)':v.officialNumber,'IMO number (text)':v.imoNumber,'Source annual item':e.sourceLineage?.item??null,'Source file':e.sourceLineage?.file,'Source sheet':e.sourceLineage?.sheet,'Source row':e.sourceLineage?.row,'Merge group':e.sourceLineage?.mergeGroup,'Actual issuing office':e.issuingOffice,'SCO unknown-timing references':join(actions.filter(a=>!/within|beyond/i.test(a.sourceTimeliness||'')),'reference'),'Review status':e.status,'Former names':v.formerNames,Registration:v.registrationStatus,Length:v.length,Breadth:v.breadth,Depth:v.depth,'Net tonnage':v.netTonnage,Deadweight:v.deadweight,Master:v.masterName,'Master license':v.masterLicense,Origin:v.voyage?.origin,Destination:v.voyage?.destination,Cargo:v.voyage?.cargoType,'Cargo quantity':v.voyage?.cargoQuantity,'Cargo unit':v.voyage?.cargoUnit,...supplementalIncidentColumns(e,v)}
 }); break
 case 'O02': rows=matrix(events,e=>family(e.type)); break
 case 'O03': rows=matrix(events,e=>e.aor); break
 case 'O04': rows=matrix(involvements,v=>v.homeport || v.event.homeport); break
 case 'O05': rows=matrix(involvements,v=>v.type); break
 case 'O06': rows=matrix(events,e=>e.seriousness); break
 case 'O07': rows=['hull','sizeClass','classificationSociety'].flatMap(d=>matrix(involvements,v=>v[d]).map(r=>({Dimension:d,...r}))); break
 case 'O08': rows=matrix(cases.map(c=>({...c,date:events.find(e=>e.id===c.eventId)?.date})),c=>c.status); break
 case 'O09': rows=[...new Set(cases.map(c=>events.find(e=>e.id===c.eventId)?.cpc || events.find(e=>e.id===c.eventId)?.homeport || 'Unknown'))].map(office=>{const group=cases.filter(c=>(events.find(e=>e.id===c.eventId)?.cpc || events.find(e=>e.id===c.eventId)?.homeport || 'Unknown')===office); return {Attribution:office,Cases:group.length,'Ships involved':new Set(group.map(c=>c.vesselId)).size,'Issued SCO':group.filter(c=>c.actions?.some(a=>/SCO|Show Cause/i.test(a.type))).length,Decision:group.filter(c=>c.decision).length,Penalized:group.filter(c=>c.penalty>0).length,'Ongoing penalty':group.filter(c=>c.status==='ongoing_penalty').length,Dismissed:group.filter(c=>c.status==='dismissed').length,Closed:group.filter(c=>c.status==='closed').length,'Ongoing SCO':group.filter(c=>c.status==='ongoing_sco').length,'Actual issuing offices':[...new Set(group.flatMap(c=>(c.actions||[]).map(a=>a.officeId)))].join('; ')}}); break
 case 'O10': rows=cases.flatMap(c=>(c.actions?.length?c.actions:[{}]).map(a=>({'Case number':c.caseNumber,'Event reference':events.find(e=>e.id===c.eventId)?.ref,'Vessel ID':c.vesselId,Party:c.party,Status:c.status,Action:a.type,Reference:a.reference,'Issue date':a.issuedDate,'Issue time':a.issuedTime,'Issuing office':a.officeId,'Source timeliness':a.sourceTimeliness,'Calculated timeliness':'Unknown — approved rule required',Violations:c.violations,Decision:c.decision,'Decision date':c.decisionDate,Penalty:c.penalty,Paid:c.paid,Conditions:a.conditions,Notes:a.notes,'Source reference':a.sourceRef,'Affected document / person':a.affectedDocument,'Related suspension':a.relatedSuspension,'Survey warranting lifting':a.surveyDetails,'SRB period served':a.periodServed,'SRB compliance for lifting':a.conditionsMet,'Action amount (PHP)':a.amount}))); break
 case 'O11': {
   const groups=new Map(),measures=['fatalities','missing','injured','rescued','crew','passengers','totalOnboard']
   events.forEach(e=>{const Month=e.date?.slice(0,7)||'Unknown date',types=[...new Set((e.vessels||[]).map(v=>v.type||'Unknown'))],type=types.length>1?'Multiple vessel types':types[0]||'Unknown',key=`${Month}|${type}`
    if(!groups.has(key))groups.set(key,{Month,'Vessel type group':type,Events:0,...Object.fromEntries(measures.flatMap(m=>[[m,0],[`${m} known events`,0],[`${m} unknown events`,0]])),'Confirmed ship-loss events':0,'Ship condition unassessed events':0,'Source references':[]})
    const row=groups.get(key);row.Events++;row['Source references'].push(e.ref)
    measures.forEach(m=>{const v=e.consequences?.[m];if(v==null||v==='')row[`${m} unknown events`]++;else {row[m]+=Number(v);row[`${m} known events`]++}})
    if(/total loss|sunk|sinking/i.test(e.consequences?.shipCondition||''))row['Confirmed ship-loss events']++
    if(!e.consequences?.shipCondition||/unknown|not.*assessed/i.test(e.consequences.shipCondition))row['Ship condition unassessed events']++
   });rows=[...groups.values()].map(row=>{const mapped={Month:row.Month,'Vessel type group':row['Vessel type group'],Events:row.Events};measures.forEach(m=>{const label=m[0].toUpperCase()+m.slice(1);mapped[label]=row[`${m} known events`]?row[m]:null;mapped[`${label} unknown events`]=row[`${m} unknown events`]});return {...mapped,'Confirmed ship-loss events':row['Confirmed ship-loss events'],'Ship condition unassessed events':row['Ship condition unassessed events'],'Source references':row['Source references'].join('; '),'Person allocation':'One event observation; multi-service events unallocated; ship-loss events are not vessel-loss totals'}});break
 }
 case 'O12': rows=['GT','Age','Company','AOR'].flatMap(d=>{
   const groups=new Map()
   involvements.forEach(v=>{let band;const age=v.yearBuilt&&v.date?Number(v.date.slice(0,4))-Number(v.yearBuilt):null
    if(d==='GT')band=v.grossTonnage==null?'Unknown':v.grossTonnage<500?'Below 500':v.grossTonnage<3000?'500 to below 3000':'3000 and above'
    if(d==='Age')band=age==null||age<0?'Unknown':age<10?'Below 10':age<20?'10 to below 20':'20 and above'
    if(d==='Company')band=v.operator||v.owner
    if(d==='AOR')band=v.event.aor
    band=known(band);if(!groups.has(band))groups.set(band,{Dimension:d,Category:band,less_serious:0,serious:0,very_serious:0,unknown:0,Total:0,'Band methodology':'Proposed v1; age at occurrence year; GT decimal bounds','Source references':[]})
    const row=groups.get(band),severity=['less_serious','serious','very_serious'].includes(v.event.seriousness)?v.event.seriousness:'unknown';row[severity]++;row.Total++;row['Source references'].push(`${v.event.ref} / ${v.id}`)
   });return [...groups.values()].map(row=>({...row,'Source references':row['Source references'].join('; ')}))
 }); break
 case 'O13': {
  const records=(state.reports||[]).filter(report=>ids.has(report.eventId)&&(!selection.asOf||!validReportReceiptDate(report.receivedDate)||report.receivedDate<=selection.asOf))
  rows=[...new Set(records.map(report=>report.officeId||'Unknown'))].map(office=>{const group=records.filter(report=>(report.officeId||'Unknown')===office),received=group.filter(report=>validReportReceiptDate(report.receivedDate));return {Office:office,Spot:received.filter(report=>report.type==='spot').length,'Form 1A':received.filter(report=>report.type==='1A').length,'Form 1B':received.filter(report=>report.type==='1B').length,'Form 2':received.filter(report=>report.type==='2').length,'Form 3B':received.filter(report=>report.type==='3B').length,'Receipt date unknown / not recorded':group.length-received.length,'Receipt records / dates':group.map(report=>`${report.type} revision ${report.revision??'Unknown'}: ${report.receivedDate||'Unknown / not recorded'}`).join('; '),'Counting rule':'Saved typed revisions with a recorded MARINA receipt date; undated/unreceived records are separate. Submission date is not substituted.','As of':selection.asOf}});break
 }
 case 'O14': rows=[...new Set(events.map(e=>e.date?.slice(0,4) || 'Unknown'))].flatMap(year=>{
   const group=events.filter(e=>(e.date?.slice(0,4)||'Unknown')===year),result=[],base={Year:year,'Period basis':'Selected occurrence range; no unmatched year percentage'}
   result.push({...base,Dimension:'Overall',Category:'Unique events',Count:group.length,Unit:'Events','Unknown observations':0})
   ;['type','seriousness','aor'].forEach(key=>{const buckets=new Map();group.forEach(e=>{const label=key==='type'?family(e.type):known(e[key]);buckets.set(label,(buckets.get(label)||0)+1)});buckets.forEach((Count,Category)=>result.push({...base,Dimension:key,Category,Count,Unit:'Events','Unknown observations':0}))})
   const services=new Map();group.flatMap(e=>e.vessels||[]).forEach(v=>services.set(known(v.type),(services.get(known(v.type))||0)+1));services.forEach((Count,Category)=>result.push({...base,Dimension:'Vessel service',Category,Count,Unit:'Vessel involvements','Unknown observations':0}))
   ;['fatalities','missing','injured','rescued','crew','passengers'].forEach(key=>{const observations=group.filter(e=>e.consequences?.[key]!=null);result.push({...base,Dimension:'Consequences',Category:key,Count:observations.length?observations.reduce((sum,e)=>sum+Number(e.consequences[key]),0):null,Unit:'Known persons','Unknown observations':group.length-observations.length})})
   return result
 }); break
 case 'O15': rows=events.map(e=>({...eventRow(e),Time:e.timeUnknown?null:e.time,...supplementalIncidentColumns(e)})); break
 case 'O16': case 'O17': case 'O18': { const type={O16:'1B',O17:'2',O18:'3B'}[outputId]; rows=reports.filter(r=>r.type===type).map(r=>({Reference:events.find(e=>e.id===r.eventId)?.ref,Type:r.type,Revision:r.revision,Status:r.status,Date:r.date,'As of':r.asOf,'Prepared by':r.preparedBy,Designation:r.designation,'Noted by':r.notedBy,'Noted date':r.notedDate,...r.fields})); break }
 case 'O19': rows=overseasEvents(events).map(e=>({...eventRow(e),Crew:e.consequences?.crew,Passengers:e.consequences?.passengers,'Foreign local timezone':'Unknown','Individual person roles':'Not supplied in fictional event seed'})); break
 case 'O20': rows=events.map(e=>({...eventRow(e),Latitude:e.lat,Longitude:e.lon,'Position quality':e.positionQuality,'Included in GeoJSON':e.positionQuality!=='unknown'&&e.lat!=null&&e.lon!=null?'Yes':'No'})); break
 case 'O21': rows=matrix(events,e=>e.type); break
 case 'O22': rows=events.map(e=>({Reference:e.ref,'Unique event':1,'Vessel involvements':e.vessels?.length ?? 0,'Unknown date':e.date?0:1,'Unknown fatalities':e.consequences?.fatalities==null?1:0,'Position quality':e.positionQuality,'Source file':e.sourceLineage?.file,'Source sheet':e.sourceLineage?.sheet,'Source row':e.sourceLineage?.row,'Merge group':e.sourceLineage?.mergeGroup,'Batch decisions':state.imports.find(b=>b.createdIds?.includes(e.id))?.decisions})); break
 }
 return rows
}
