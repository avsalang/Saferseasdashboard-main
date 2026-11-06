# Shared implementation contract

All files under `prototype/`. Vue3 JS `<script setup>` SFC, Quasar globally available, icons Material Icons, Vue Router hash navigation. Use `import { useDemo } from '../../stores/demo.js'` with relative path adjusted. It returns singleton **store** described below. No production API calls or real MARINA data. Do not modify this contract/store/router/main/styles from delegated page tasks.

## Store

`const store = useDemo()` returns:

- `state`: Vue reactive object with arrays: `users,roles,offices,events,vessels,parties,evidence,reports,cases,actions,imports,sourceRows,exports,notifications,auditLogs,assessments,policyItems,lookups,templates`; `settings` object; `sessionUserId` string|null; `selection` object.
- `currentUser`: **computed ref** (`store.currentUser.value` in script; avoid nested ref unwrapping assumptions in templates, assign `const user=computed(()=>store.currentUser.value)`).
- `visibleEvents`: **computed ref** of scoped events.
- `can(action, event?)`: boolean. Actions: `report`, `review`, `investigate`, `enforce`, `analyze`, `export`, `manage_accounts`, `configure`, `audit`, `admin`.
- `getEvent(id)`: event object or undefined, authorization-aware.
- `saveEvent(partialEvent, {submit=false}={})`: upserts draft/allowed edit, returns event; writes history, notification/audit; throws on denied/invalid submit.
- `transition(id,status,remarks='')`: valid statuses `draft,submitted,under_review,correction_requested,resubmitted,validated`; throws on unauthorized/invalid; stamps actor/time and notifies.
- `add(collection, data)`: adds `{...data,id}` to named array, audits/persists, returns object. `update(collection,id,patch)` returns object; `remove(collection,id)` removes. Use explicit `can` in UI where relevant; methods enforce collection actions too.
- `recordReport(data)`, `recordCase(data)`, `recordExport(data)`: convenience around add; return created record.
- `selectEvents(selection={})`: scopes events then filters `search,year,status,type,seriousness,aor,homeport,cpc,issuingOffice,vesselType,dateFrom,dateTo,positionQuality` (empty/`All`/`all` means no restriction). Unknown dates never fall into a selected known year.
- `summarize(events)`: `{events,vesselInvolvements,fatalities,missing,injured,rescued,unknownFatalities,located,approximate,unlocated,byType,bySeriousness,byMonth}`; arrays for grouped values `{name,count}`. Consequences counted once/event, not per vessel or report revision.
- `persist()`, `audit(action,recordId,details)`, `notify(userId,title,message,link)`, `signIn(userId)`, `signOut()`, `reset()`.
- `newEvent()` returns initial empty shape, owns current user/office; `newVessel()` returns blank vessel.

## Data shapes

IDs are strings. Dates ISO local YYYY-MM-DD, times HH:mm; timestamps ISO. Monetary/GT values nullable numbers. Counts nullable numbers. Do not use `||0` to overwrite unknown input.

`users`: `{id,name,email,role,officeId,status:'active'|'invited'|'suspended',scope:'own'|'office'|'all',organization,lastLogin}`. Seed demo IDs: `u-reporter` (MRO Reporter), `u-reviewer` (MRO Reviewer), `u-investigator` (MARINA Investigator). These are the only three role codes: `reporter`, `reviewer`, `investigator`. The MARINA Investigator has every function and all-office access, including account issuance/configuration. Operational functions overlap by user request. MRO Reviewer defaults to assigned office/AOR; MRO Reporter defaults to own/assigned records. Both also have review, investigation, case/follow-up and output tools; account/configuration controls remain central. Demo password `Demo2026!` only; account activation/recovery simulated. Schema version 3 migrates the earlier browser state, preserving edits and historical actor IDs while suspending retired account types. The `admin` permission is an all-functions action shortcut for the MARINA Investigator, not a fourth account type.

`roles`: `{id,name,description,permissions:string[],scope}`; IDs same role codes. `offices`: `{id,code,name,aliases:string[],active}`; IDs `MRO-IV`,`MRO-NCR`,`MRO-VII`, etc.

`events`: `{id,ref,date,time,dateUnknown,timeUnknown,type,secondaryTypes:[],seriousness,impactTypes:[],place,lat,lon,positionQuality:'reported'|'approximate'|'unknown',aor,homeport,cpc,issuingOffice,status,ownerId,officeId,vessels:[],consequences:{fatalities,missing,injured,rescued,totalOnboard,crew,passengers,shipCondition,pollution,notes},summary,initialActions,recommendations,sourceType,sourceRef,receivedDate,evidenceIds:[],investigatorId,sourceLineage:{file,sheet,row,mergeGroup},history:[{id,status,actorId,actorName,at,remarks}],createdAt,updatedAt}`.

`vessels`: `{id,name,formerNames,officialNumber,imoNumber,registrationStatus,rigType,type,flag,grossTonnage,yearBuilt,hull,sizeClass,classificationSociety,owner,operator,ownerContact,operatorAddress,homeport,cpc,length,breadth,depth,netTonnage,deadweight,buildPlace,engineCount,engineMake,enginePower,enginePowerUnit,sternType,masterName,masterLicense,ownerId,officeId}`. Event.vessels are snapshots using same shape plus role, voyage `{origin,destination,route,cargoType,cargoQuantity,cargoUnit}`.

Codes: seriousness `less_serious,serious,very_serious,unknown`; type `Grounding,Collision,Allision,Engine trouble,Mechanical failure,Hull failure,Steering failure,Capsizing,Listing,Flooding,Sinking,Fire,Explosion,Man overboard,Occupational accident,Other,Unknown`. Office relationships use office IDs. Source types plain labels.

`parties`: `{id,name,type:'owner'|'operator'|'company',address,email,phone,aliases:[],active}`.
`evidence`: `{id,eventId,name,type,sourceRef,url,mime,size,uploadedBy,uploadedAt,notes,status:'available'|'reference_only',reportId,caseId}`. Never use arbitrary text/html URLs as trusted markup. File selection only metadata; sample generated text/PDF-like preview can be local; no upload server.
`reports`: `{id,eventId,type:'spot'|'1B'|'2'|'3B',revision,status:'draft'|'review'|'issued',date,asOf,preparedBy,designation,notedBy,notedDate,fields:{},evidenceIds:[],createdBy,createdAt}`. Each record is a distinct revision; draft may be updated; issued revision retained.
`cases`: `{id,eventId,caseNumber,vesselId,party,officeId,status:'ongoing_sco'|'ongoing_penalty'|'dismissed'|'closed',violations,decision,decisionDate,penalty,paid,actions:[{id,type,issuedDate,issuedTime,officeId,reference,sourceTimeliness,conditions,notes}],createdAt,updatedAt}`. Scope all staff with enforce permission; reporter cannot see cases.
`actions`: `{id,eventId,reportId,title,description,ownerId,officeId,dueDate,status:'open'|'in_progress'|'completed',outcome,evidenceIds:[],history:[]}`.
`imports`: `{id,name,year,template,status,rows,events,vessels,errors,duplicates,mapping,decisions,createdAt,confirmedAt,createdIds:[]}`.
`sourceRows`: `{id,batchId,row,vesselName,date,type,seriousness,place,mergeGroup,status,error,eventId}` synthetic staging rows.
`exports`: `{id,name,outputId,format,status:'ready',selection,snapshot:{},createdAt,createdBy,revision,notes}`. Job history browser-local; downloadable artifacts generated client-side.
`assessments`: `{id,vesselId,eventId,methodology:'Prototype rules v1',inputs:{},score,band,manualReview,hardStop,createdBy,createdAt}`.
`policyItems`: `{id,title,evidence,priority,status,ownerId,notes}`.
`lookups`: `{id,category,code,label,aliases:[],active}`. `templates`: `{id,name,type,version,status,requiredFields:[],notes}`.
`notifications`: `{id,userId,title,message,link,read,at}`; `auditLogs`: `{id,actorId,actorName,action,recordId,details,at}`.

## Shared UI

`PageHeader.vue`: props `title,subtitle,eyebrow`; slot `actions` (not default). `StatusBadge.vue`: prop `status`; optional `label`. `EmptyState.vue`: props `title,message,icon`; slot default. Quasar tables/dialogs directly; use table row-key id and responsive wrappers.

Global CSS: `.page-wrap`, `.panel`, `.section-title`, `.muted`, `.metric-grid`, `.metric-card`, `.metric-value`, `.form-grid`, `.span-2`, `.toolbar-row`, `.content-grid`, `.eyebrow`, `.record-link`, `.timeline`, `.empty-state`. Do not depend on Tailwind. All secondary actions `no-caps`, primary color primary. Global root background/theme handles dark.

## Routes / module ownership

Reporter module exports `reporterRoutes` array from `src/pages/reporter/routes.js`: `/reporter` dashboard; `/reporter/reports`; `/reporter/reports/new`; `/reporter/reports/:id`; `/reporter/reports/:id/edit`; `/reporter/drafts`; `/reporter/vessels`; `/reporter/documents`. Metadata `{roles:['reporter'],title,screenId}`. Staff record form/detail route entries owned root or operations can import shared reporter components `IncidentForm.vue` / `IncidentDetail.vue` with props `{staff:true}`. Form/details use route.params.id and route.query.tab for sections; no reliance on route names.

Operations module exports `operationsRoutes` from `src/pages/operations/routes.js`: `/admin` dashboard; `/admin/incidents`; `/admin/incidents/new`; `/admin/incidents/:id`; `/admin/incidents/:id/edit`; `/admin/review`; `/admin/investigations`; `/admin/investigations/:id` (event id); `/admin/actions`; `/admin/cases`; `/admin/cases/:id`; `/admin/vessels`; `/admin/companies`; `/admin/documents`. meta `roles:['admin','reviewer','enforcement','analyst']` plus `permission` where needed. Reporter components reused/imported but not edited by operations worker.

Data module exports `dataRoutes` from `src/pages/data/routes.js`: `/admin/imports`, `/admin/imports/new`, `/admin/imports/:id`, `/admin/reconciliation`, `/admin/map`, `/admin/locations`, `/admin/analytics`, `/admin/reports`, `/admin/reports/build/:outputId`, `/admin/exports`, `/admin/risk`, `/admin/risk/:id`, `/admin/policy`. `meta.permission` analyze/export/investigate as appropriate.

Root owns `/login`,`/activate`,`/recover`,`/profile`,`/notifications`,`/help`,`/forbidden`,`/admin/accounts`,`/admin/roles`,`/admin/offices`,`/admin/reference-data`,`/admin/workflows`,`/admin/audit`,`/admin/settings`,`/handoff`. All authenticated use App shell; auth pages standalone.

Exports module owned data worker: `src/lib/exports.js` exports `downloadCSV(filename,rows)`, `downloadXLSX(filename,sheets)` where sheets array `{name,rows}`, `downloadGeoJSON(filename,events)`, `printReport({title,subtitle,columns,rows,sections,metadata})`. Synchronous except XLSX async. `rows` are arrays of objects; columns optional array `{label,field}`. Inputs escaped; printReport opens browser print preview, never claimed server PDF.

## Agent boundaries

Root owns store/domain/seed/router/shell/shared components/styles/access/admin-management/tests/docs/deploy. Reporter owns only reporter folder; operations owns only operations folder; data owns only data folder plus `lib/exports.js` and `data/catalogue.js`. Do not commit, push, install packages, edit shared files or publish from delegated tasks. Send interface suggestions to root; work with contract now while root implements it.
