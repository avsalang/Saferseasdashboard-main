import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {explainVisibleRequirements} from './requirements-browser-helper.mjs'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
page.on('pageerror',error=>errors.push(error.message))
const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const field=label=>page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:new RegExp('^'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})})
const fill=(label,value)=>field(label).locator('input:visible,textarea:visible').first().fill(value)
const step=async label=>{await page.locator('.q-stepper__tab').filter({hasText:label}).click();await page.waitForTimeout(250)}
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1')))
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'MRO Reporter MRO-IV',exact:true}).click();await page.goto(base+'#/reporter/reports/new')
 await fill('Date of Incident / Accident *','2026-11-06');await fill('Location of Incident / Accident *','Fictional test anchorage')
 await step('Vessel & Operator');await fill('Name of Ship/Vessel *','MV Fictional Required Test');await fill('Gross Tonnage (GT) *','0')
 await page.getByText('Identity and registration',{exact:true}).click();assert.equal(await field('Call Sign').count(),1);assert.equal(await field('Type of Operation').count(),1)
 await step('Narrative & Timeline');await fill('Narrative of Events Leading to the Accident *','Fictional report for required field verification.')
 await step('Review & Submit');await page.getByRole('button',{name:'Submit report',exact:true}).click()
 assert.ok(await page.getByRole('alert').filter({hasText:'required reporting field'}).count());assert.ok(page.url().endsWith('/new'))
 assert.equal((await state()).events.length,30,'incomplete submission must not create a submitted record')
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.waitForURL('**/edit')
 const id=page.url().split('/').at(-2);assert.equal((await state()).events.find(e=>e.id===id).status,'draft')
 await step('Review & Submit');await explainVisibleRequirements(page)
 await page.getByRole('button',{name:'Submit report',exact:true}).click();await page.waitForURL('**/'+id)
 const data=await state(),event=data.events.find(e=>e.id===id),report=data.reports.find(r=>r.eventId===id&&r.type==='spot')
 assert.equal(event.status,'submitted');assert.equal(event.consequences.fatalities,null);assert.equal(event.vessels[0].grossTonnage,0)
 assert.ok(event.reportingExceptions.aor.reason);assert.equal(report.fields.reportingExceptions.aor.reason,event.reportingExceptions.aor.reason)
 assert.deepEqual(errors,[])
 console.log('PASS: standard MARINA labels and missing particulars, blocking required checks, partial drafts, explicit exceptions, zero/null and spot snapshot preservation')
}finally{await browser.close()}
