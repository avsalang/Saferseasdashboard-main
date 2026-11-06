import test from 'node:test'
import assert from 'node:assert/strict'
import ExcelJS from 'exceljs'
import { outputCatalogue,buildOutput } from '../../data/catalogue.js'
import { downloadCSV,downloadGeoJSON,downloadXLSX,printReport } from '../../lib/exports.js'
import { buildMAICSections,toggleImportExclusion,selectReportRevision } from './reportLogic.js'
const e={id:'e1',ref:'DEMO-001',date:'2026-03-04',type:'Collision',seriousness:'serious',aor:'MRO-IV',homeport:'MRO-NCR',positionQuality:'reported',lat:0,lon:0,vessels:[{id:'001',name:'One',type:'Cargo',officialNumber:'0000123',grossTonnage:12.75},{id:'002',name:'Two',type:'Tug'}],consequences:{fatalities:2,missing:null},sourceLineage:{row:3}}
const state={cases:[],reports:[],imports:[]}
test('saved spot revision retains narrative, consequences, table rows and evidence after live edits',()=>{
 const original={...e,summary:'Saved narrative',evidenceIds:['old'],consequences:{fatalities:0}}
 const report={type:'spot',revision:1,fields:structuredClone(original),evidenceIds:['old']}
 const live={...original,summary:'Later live edit',evidenceIds:['new'],consequences:{fatalities:9}}
 const evidenceRecords=[{id:'old',eventId:e.id,name:'Saved evidence'},{id:'new',eventId:e.id,name:'Later evidence'}]
 const selected=selectReportRevision({event:live,report,evidenceRecords})
 assert.equal(selected.event.summary,'Saved narrative');assert.equal(selected.event.consequences.fatalities,0)
 assert.deepEqual(selected.evidence.map(item=>item.id),['old'])
 const row=buildOutput('O15',[selected.event],state)[0];assert.equal(row.Summary,'Saved narrative');assert.equal(row.Fatalities,0)
 assert.deepEqual(selectReportRevision({event:live,report:{...report,type:'2'},evidenceRecords}).evidence.map(item=>item.id),['old'])
 assert.equal(selectReportRevision({event:live,evidenceRecords}).event.summary,'Later live edit')
})
test('MAIC progress and final sections preserve exact schema fields and zero observations',()=>{
 const event={...e,consequences:{fatalities:0},vessels:e.vessels}
 const progress=buildMAICSections({type:'2',event,report:{fields:{progressSummary:'Progress marker',rescueRecovery:'Rescue marker',scoActions:'Order marker',certificateActions:'Certificate marker',fatalities:0}}})
 const progressText=progress.filter(s=>s.title!=='Additional retained report fields').map(s=>s.content).join('\n')
 for(const value of ['Progress marker','Rescue marker','Order marker','Certificate marker','Fatalities (blank = unknown):\n0'])assert.ok(progressText.includes(value),value)
 const final=buildMAICSections({type:'3B',event,report:{fields:{analysis:'Analysis marker',conclusion:'Conclusion marker',lessons:'Lessons marker',machineryFailures:['steering']}}})
 const analysis=final.find(s=>s.title==='Analysis and findings').content
 for(const value of ['Analysis marker','Conclusion marker','Lessons marker'])assert.ok(analysis.includes(value),value)
 assert.ok(final.find(s=>s.title.includes('primary causes')).content.includes('Failure of steering'))
})
test('excluding and restoring a row retains its blocker until unknown explicitly accepted',()=>{
 const row={status:'needs_review',error:'Missing date — explicitly accept unknown date'}
 toggleImportExclusion(row);assert.equal(row.status,'excluded')
 toggleImportExclusion(row);assert.equal(row.status,'needs_review');assert.ok(row.error.includes('Missing date'))
 row.unknownAccepted=true;row.error='';row.status='unknown_accepted'
 toggleImportExclusion(row);toggleImportExclusion(row);assert.equal(row.status,'unknown_accepted');assert.equal(row.error,'')
})
let captured
globalThis.document={createElement:()=>({click(){}})}
URL.createObjectURL=blob=>{captured=blob;return 'blob:demo'};URL.revokeObjectURL=()=>{}
// Avoid leaving download cleanup timers alive in Node.
const timer=globalThis.setTimeout;globalThis.setTimeout=(fn,ms)=>{const t=timer(fn,ms);t.unref();return t}
test('all 22 audit families have unique IDs and generate an explicit array',()=>{
 assert.equal(outputCatalogue.length,22);assert.equal(new Set(outputCatalogue.map(o=>o.id)).size,22)
 outputCatalogue.forEach(o=>assert.ok(Array.isArray(buildOutput(o.id,[e],state))))
})
test('event monthly counts and involvement monthly counts use distinct grains',()=>{
 assert.equal(buildOutput('O02',[e],state)[0].Total,1)
 assert.equal(buildOutput('O05',[e],state).reduce((sum,r)=>sum+r.Total,0),2)
 assert.equal(buildOutput('O11',[e],state)[0].Fatalities,2)
 assert.equal(buildOutput('O11',[e],state)[0].Missing,null)
 assert.equal(buildOutput('O11',[e],state)[0].Month,'2026-03')
 assert.equal(buildOutput('O11',[e],state)[0]['Vessel type group'],'Multiple vessel types')
})
test('unknown month stays explicit rather than entering a known month',()=>{
 const row=buildOutput('O06',[{...e,date:null}],state)[0]
 assert.equal(row['Unknown date'],1);assert.equal(row.Jan,0)
})
test('CSV escapes formulas, quotes and multiline narratives while retaining zero',async()=>{
 downloadCSV('safe.csv',[{Name:' =HYPERLINK("x")',Count:0,Unknown:null,Notes:'A\nB'}])
 const csv=await captured.text();assert.ok(csv.includes('"\' =HYPERLINK(""x"")"'));assert.ok(csv.includes('"0"'));assert.ok(csv.includes('"Unknown"'));assert.ok(csv.includes('"A\nB"'))
})
test('GeoJSON keeps zero coordinates and excludes unknown or invalid positions',async()=>{
 downloadGeoJSON('points.geojson',[e,{...e,id:'e2',lat:null},{...e,id:'e3',lat:91},{...e,id:'e4',positionQuality:'unknown'}])
 const json=JSON.parse(await captured.text());assert.equal(json.features.length,1);assert.deepEqual(json.features[0].geometry.coordinates,[0,0]);assert.equal(json.metadata.excluded,3)
})
test('XLSX keeps identifiers as text and decimals as numbers, adds filters and frozen headings',async()=>{
 await downloadXLSX('data.xlsx',[{name:'Table',rows:[{'Official number':'0000123',GT:12.75,Count:0,Unknown:null,Text:'=1+1',Date:'2026-11-06'}]}])
 const book=new ExcelJS.Workbook();await book.xlsx.load(await captured.arrayBuffer());const tab=book.getWorksheet('Table')
 assert.equal(tab.getCell('A2').value,'0000123');assert.equal(tab.getCell('B2').value,12.75);assert.equal(tab.getCell('C2').value,0);assert.equal(tab.getCell('D2').value,'Unknown');assert.equal(tab.getCell('E2').value,'=1+1');assert.equal(tab.views[0].ySplit,1);assert.ok(tab.autoFilter)
 assert.ok(tab.getCell('F2').value instanceof Date);assert.equal(tab.getCell('F2').numFmt,'yyyy-mm-dd')
})
test('printable report escapes source HTML and preserves long sections',()=>{
 let html='';globalThis.window={open:()=>({document:{write:v=>{html=v},close(){}}})}
 printReport({title:'<script>alert(1)</script>',rows:[{Text:'<img onerror=1>'}],sections:[{title:'Findings',content:'A\nB & C'}],metadata:{selection:'<unsafe>'}})
 assert.ok(!html.includes('<script>alert'));assert.ok(!html.includes('<img onerror'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('A\nB &amp; C'))
})
