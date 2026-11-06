import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[]
page.on('pageerror',error=>errors.push(error.message))
const field=label=>page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:new RegExp('^'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})})
const fill=(label,value)=>field(label).locator('input:visible,textarea:visible').first().fill(value)
const step=async label=>{await page.locator('.q-stepper__tab').filter({hasText:label}).click();await page.waitForTimeout(350)}
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1')))
await page.route('https://**.open-meteo.com/**',async route=>{
 const url=new URL(route.request().url());requests.push(url.href)
 const epoch=Date.parse(url.searchParams.get('start_date')+'T08:30:00+08:00')/1000
 const marine=url.searchParams.get('hourly')==='wave_height'
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({latitude:0,longitude:0,timezone:'Asia/Manila',utc_offset_seconds:28800,hourly_units:marine?{wave_height:'m'}:{wind_speed_10m:'km/h',visibility:'m'},hourly:{time:[epoch],...(marine?{wave_height:[2]}:{wind_speed_10m:[0],visibility:[0],weather_code:[0]})}})})
})
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'MRO Reporter MRO-IV',exact:true}).click();await page.goto(base+'#/reporter/reports/new')
 await page.getByRole('heading',{name:'New incident report'}).waitFor()
 await step('Voyage & Cargo');assert.equal(await page.getByRole('button',{name:'Look up conditions',exact:true}).isDisabled(),true)
 assert.equal(requests.length,0,'unknown occurrence must not fetch model conditions')
 await step('Time & Location');await fill('Occurrence date','2026-11-05')
 await field('Occurrence time (Philippine time, UTC+08:00)').locator('..').getByRole('checkbox',{name:'Time unknown',exact:true}).uncheck()
 await fill('Occurrence time (Philippine time, UTC+08:00)','08:30')
 await page.getByRole('button',{name:'Select Location on Map',exact:true}).click()
 await page.locator('.map-canvas').waitFor();assert.equal(await page.getByRole('button',{name:'Apply Coordinates',exact:true}).isDisabled(),true)
 await page.locator('.map-canvas').click({position:{x:380,y:180}})
 assert.equal(await page.getByRole('button',{name:'Apply Coordinates',exact:true}).isEnabled(),true)
 await fs.mkdir('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/intake-map-picker.png',fullPage:true})
 await fill('Selected latitude','0');await fill('Selected longitude','0')
 await page.getByRole('button',{name:'Apply Coordinates',exact:true}).click();await page.waitForTimeout(300)
 assert.equal(await field('Latitude').locator('input').inputValue(),'0');assert.equal(await field('Longitude').locator('input').inputValue(),'0')
 await fs.mkdir('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/intake-location.png',fullPage:true})
 await step('Voyage & Cargo');await fill('Wave Height (m)','0');await fill('Source of environmental information','Master eyewitness statement')
 await page.getByRole('button',{name:'Look up conditions',exact:true}).click();await page.getByRole('button',{name:'Apply suggestions to blank fields',exact:true}).waitFor()
 await page.getByRole('button',{name:'Apply suggestions to blank fields',exact:true}).click()
 assert.equal(await field('Wave Height (m)').locator('input').inputValue(),'0','model wave must not overwrite manual calm value')
 assert.equal(await field('Wind Force (Beaufort)').locator('input').inputValue(),'0','model zero must remain a real value')
 assert.equal(await field('Source of environmental information').locator('input').inputValue(),'Master eyewitness statement')
 assert.equal(requests.length,2);assert.ok(requests.every(url=>new URL(url).searchParams.get('timezone')==='Asia/Manila'))
 await page.screenshot({path:'test-artifacts/intake-weather.png',fullPage:true})
 await step('Attachments');await page.locator('input[type=file]').setInputFiles([{name:'fictional-photo-a.jpg',mimeType:'image/jpeg',buffer:Buffer.from('sample-a')},{name:'fictional-photo-b.jpg',mimeType:'image/jpeg',buffer:Buffer.from('sample-b')},{name:'fictional-statement.pdf',mimeType:'application/pdf',buffer:Buffer.from('sample-c')}])
 await page.getByRole('button',{name:'Add document to report',exact:true}).click();await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.waitForURL('**/edit')
 const id=page.url().split('/').at(-2);let data=await state(),event=data.events.find(e=>e.id===id)
 assert.equal(event.lat,0);assert.equal(event.lon,0);assert.equal(event.positionQuality,'approximate');assert.equal(event.aor,'')
 assert.equal(event.evidenceIds.length,3,'multi-file metadata queues and persists all selected files')
 assert.equal(event.environment.fieldSources.windForce.kind,'modelled');assert.equal(event.environment.fieldSources.waveHeightM?.kind,undefined)
 await page.reload();await step('Voyage & Cargo')
 assert.equal(await page.getByText('These suggestions belong to a different incident time or position.',{exact:false}).count(),0,'first save does not invalidate same-time/place lookup')
 await fill('Wind Force (Beaufort)','3');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.waitForTimeout(300)
 data=await state();event=data.events.find(e=>e.id===id);assert.notEqual(event.environment.fieldSources.windForce?.kind,'modelled','manual correction removes only that field model attribution')
 assert.equal(event.environment.lookup.suggestions.windForce,0,'model lookup history stays separate from edited value')
 assert.deepEqual(errors,[])
 console.log('PASS: map picking/zero coordinates, guarded weather lookup, manual/model provenance, draft-save stability, three-file metadata, manual correction, no runtime errors')
}finally{await browser.close()}
