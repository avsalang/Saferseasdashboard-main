import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {acknowledgeWorkingCopy,confirmWorkingCopyDialog} from './requirements-browser-helper.mjs'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'})
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
page.on('pageerror',error=>errors.push(error.message))
const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const go=async path=>{await page.goto(base+'#'+path);await page.waitForTimeout(300)}
const contents=async promise=>fs.readFile(await(await promise).path(),'utf8')
try{
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('button',{name:'MARINA Investigator MRO-NCR',exact:true}).click()
 await go('/admin/reports/build/O20')
 assert.ok(await page.getByText('Incomplete Working Copy',{exact:true}).isVisible())
 assert.equal(await page.getByRole('button',{name:'Download CSV',exact:true}).isDisabled(),true)
 await acknowledgeWorkingCopy(page);let download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click()
 assert.match(await contents(download),/INCOMPLETE WORKING COPY/)
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1')).exports[0])
 assert.equal(snapshot.status,'working_copy');assert.ok(snapshot.snapshot.metadata['Unresolved Required Fields']>0)
 await go('/admin/map');download=page.waitForEvent('download');await page.getByRole('button',{name:'Download filtered GeoJSON',exact:true}).click();await page.getByRole('button',{name:'Download working copy',exact:true}).waitFor();await confirmWorkingCopyDialog(page)
 const geo=JSON.parse(await contents(download));assert.equal(geo.metadata['Reporting Completeness'],'INCOMPLETE WORKING COPY')
 await go('/admin/incidents');download=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();await page.getByRole('button',{name:'Download working copy',exact:true}).waitFor();await confirmWorkingCopyDialog(page)
 assert.match(await contents(download),/INCOMPLETE WORKING COPY/)
 await page.evaluate(()=>{const key='saferseas-marina-vue-demo-v1',state=JSON.parse(localStorage.getItem(key));for(const event of state.events)event.type='Unknown';localStorage.setItem(key,JSON.stringify(state))})
 await go('/admin/analytics');await page.reload();download=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();await page.getByRole('button',{name:'Download working copy',exact:true}).waitFor();await confirmWorkingCopyDialog(page)
 assert.match(await contents(download),/INCOMPLETE WORKING COPY/)
 assert.deepEqual(errors,[])
 console.log('PASS: catalogue, GIS, incident register and analytics consistently acknowledge and label incomplete working copies; metadata retained; no runtime exceptions')
}finally{await browser.close()}
