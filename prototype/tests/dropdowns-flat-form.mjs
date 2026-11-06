import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
page.on('pageerror',error=>errors.push(error.message))
const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const field=label=>page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:label})}).filter({visible:true}).first()
const choose=async(label,value)=>{await field(label).click();await page.getByRole('option',{name:value,exact:true}).last().click();await page.keyboard.press('Escape')}
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'MRO Reporter MRO-IV',exact:true}).click();await page.goto(base+'#/reporter/reports/new')
 await page.getByRole('heading',{name:'New incident report'}).waitFor()
 assert.equal(await page.locator('.q-expansion-item').count(),0,'incident form has no collapsed sections')
 assert.equal(await page.getByText(/Required Reporting Information/).count(),0,'no separate requirements panel')
 await choose('Type of Incident / Accident','Engine Failure')
 await page.locator('.q-stepper__tab').filter({hasText:'Vessel & Operator'}).click()
 await field('Name of Ship/Vessel').locator('input').fill('MV Fictional Vocabulary Test')
 for(const label of ['Call Sign','Type of Operation','Hull Material','Size Classification','Classification Society','Registered Owner / Company'])assert.equal(await field(label).isVisible(),true,label+' is visible without expanding a section')
 assert.ok(await field('Type of Ship').getAttribute('class').then(value=>value.includes('q-select')))
 await choose('Type of Ship','Cargo/RORO');await choose('Rig Type','MBca');await choose('Hull Material','FRP');await choose('Size Classification','Non-Conventional')
 await choose('Classification Society','NIPPON KAIJI KYOKAI (NK)')
 await field('Registered Owner / Company').locator('input').fill('Fictional New Owner from blur')
 await page.getByText('Identity and registration',{exact:true}).click()
 await page.locator('.q-stepper__tab').filter({hasText:'Voyage & Cargo'}).click()
 await field('Port of Departure').locator('input').fill('Fictional Unlisted Port')
 await page.getByText('Voyage and cargo',{exact:true}).click()
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.waitForURL('**/edit')
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1'))),id=page.url().split('/').at(-2),event=data.events.find(e=>e.id===id)
 assert.equal(event.type,'Engine Failure');assert.equal(event.vessels[0].type,'Cargo/RORO');assert.equal(event.vessels[0].hull,'FRP');assert.equal(event.vessels[0].rigType,'MBca')
 assert.equal(event.vessels[0].owner,'Fictional New Owner from blur');assert.equal(event.vessels[0].voyage.origin,'Fictional Unlisted Port')
 assert.deepEqual(errors,[])
 console.log('PASS: flat incident form, no separate requirements panel, source-backed searchable dropdowns, saved categories retained, no runtime exceptions')
}finally{await browser.close()}
