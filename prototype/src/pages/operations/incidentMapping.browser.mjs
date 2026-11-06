import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})})
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
 page.setDefaultTimeout(10000)
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto(base)
 await page.getByRole('button',{name:'MARINA Investigator MRO-NCR',exact:true}).click()
 await page.waitForURL('**/#/admin')
 // Isolated fictional browser state; production APIs and seed source files are untouched.
 const ids=await page.evaluate(()=>{
  const key='saferseas-marina-vue-demo-v1',state=JSON.parse(localStorage.getItem(key)),data=JSON.parse(JSON.stringify(state.events[0]))
  Object.assign(data,{id:'qa-mapping-browser',ref:'QA-MAPPING-BROWSER',ownerId:state.sessionUserId,officeId:'MRO-NCR',date:'2026-11-06',time:'09:15',timeUnknown:false,type:'Grounding',place:'Fictional mapping test waters',summary:'Mapping browser baseline.',timeline:'Mapping browser timeline.',crewResponse:'Mapping browser crew response.',potentialCauses:'Unconfirmed machinery issue.',reportingAuthority:'Fictional mapping authority',environment:{waveHeightM:0.25,windForce:0,visibility:null,source:'Manual master report',lookup:{provider:'Fictional mapping model',modelled:true,values:{waveHeightM:9.25}}}})
  data.vessels[0].name='MV Fictional Mapping Browser'
  state.events.unshift(data)
  state.reports.unshift({id:'qa-mapping-spot',eventId:data.id,type:'spot',revision:1,status:'review',date:'2026-11-06',preparedBy:'Fictional Investigator',fields:JSON.parse(JSON.stringify(data)),evidenceIds:[]})
  const report={id:'qa-mapping-report',eventId:data.id,type:'3B',revision:1,status:'draft',date:'2026-11-06',preparedBy:'Fictional Investigator',fields:{occurrenceNarrative:'Explicit unknown checklist regression',weatherConditions:null,missingCrew:0},evidenceIds:[]}
  state.reports.unshift(report)
  localStorage.setItem(key,JSON.stringify(state))
  return {eventId:data.id,reportId:report.id}
 })
 await page.reload()
 await page.goto(base+'#/admin/investigations/'+ids.eventId+'?reportId='+ids.reportId)
 await page.getByRole('button',{name:'Save draft',exact:true}).click()
 await page.waitForTimeout(150)
 const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1')).reports.find(report=>report.id===id),ids.reportId)
 assert.equal(saved.fields.weatherConditions,null,'Loading and saving a report must retain an explicit unknown checklist')
 assert.equal(saved.fields.missingCrew,0)
 console.log('PASS workbench retains explicit null checklist and confirmed zero after load/save')
 await page.evaluate(eventId=>{location.hash='/admin/reports/build/O15?eventId='+eventId},ids.eventId)
 await page.waitForTimeout(350)
 const popup=page.waitForEvent('popup')
 await page.getByRole('button',{name:'Print / Save as PDF',exact:true}).click()
 const printed=await popup
 await printed.waitForLoadState('domcontentloaded')
 const text=await printed.locator('body').innerText()
 for(const marker of ['Mapping browser timeline.','Mapping browser crew response.','Fictional mapping authority','Wave height (m): 0.25','Fictional mapping model','Preliminary potential causes'])assert.ok(text.includes(marker),marker)
 await printed.close()
 console.log('PASS spot printable output includes additive baseline and distinct model provenance')
 await page.evaluate(()=>{location.hash='/admin/reports/build/O16?eventId=e-003'})
 await page.waitForTimeout(350)
 assert.equal(await page.locator('h1').filter({hasText:'Form 1B'}).count(),1)
 assert.deepEqual(errors,[])
 console.log('PASS saved reactive MAIC revision renders without browser exceptions')
} finally {
 await browser.close()
}
