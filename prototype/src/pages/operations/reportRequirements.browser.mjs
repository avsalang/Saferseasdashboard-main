import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const base=process.env.BASE_URL||'http://127.0.0.1:5174/'
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})})
const out='test-artifacts/requirements'
await fs.mkdir(out,{recursive:true})
const checks=[],errors=[]
const check=(condition,message)=>{assert.ok(condition,message);checks.push(message);console.log('PASS '+message)}
const field=(page,prefix)=>page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:new RegExp('^'+prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))})}).first()
const fill=async(page,prefix,value)=>field(page,prefix).locator('input:visible,textarea:visible').first().fill(value)
const state=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('saferseas-marina-vue-demo-v1')))
const go=async(page,path)=>{await page.evaluate(path=>location.hash=path,path);await page.waitForTimeout(250)}
async function explain(page,selector){
 const rows=page.locator(selector+' .requirement-row')
 for(let index=0;index<await rows.count();index++){
  const row=rows.nth(index)
  if(!await row.locator('.q-select').count())continue
  await row.locator('.q-select').click()
  await page.getByRole('option',{name:'Unknown — information pending',exact:true}).last().click()
  await row.locator('textarea').fill('Source information requested; retained as unknown without substituting a factual value.')
 }
}
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}})
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.goto(base)
 await page.getByRole('button',{name:'MARINA Investigator MRO-NCR',exact:true}).click()
 await page.waitForURL('**/#/admin')
 await go(page,'/admin/investigations/e-003')
 await page.getByRole('button',{name:'Create draft',exact:true}).click()
 await page.getByRole('button',{name:'Save draft',exact:true}).click()
 let saved=(await state(page)).reports.find(report=>report.eventId==='e-003'&&report.type==='1B'&&report.status==='draft')
 check(!!saved,'Partial MAIC draft saves without completing release requirements')
 await page.getByRole('button',{name:'Save for review',exact:true}).click()
 check((await state(page)).reports.find(report=>report.id===saved.id).status==='draft','Incomplete MAIC content is not sent for review')
 await explain(page,'#report-required-information')
 await page.getByRole('button',{name:'Save for review',exact:true}).click()
 saved=(await state(page)).reports.find(report=>report.id===saved.id)
 check(saved.status==='review'&&!saved.notedBy&&!saved.notedDate,'Reasoned unavailable content permits review before director noting')
 await page.getByRole('button',{name:'Issue demonstration revision',exact:true}).click()
 check((await state(page)).reports.find(report=>report.id===saved.id).status==='review','Issue is blocked until the noting metadata is supplied')
 await fill(page,'Noted by / director','Example Director')
 await fill(page,'Noted date','2026-11-06')
 await page.getByRole('button',{name:'Issue demonstration revision',exact:true}).click()
 const issued=(await state(page)).reports.find(report=>report.id===saved.id)
 check(issued.status==='issued','Addressed source content and noting metadata permit issue')
 const before=JSON.stringify({fields:issued.fields,status:issued.status,revision:issued.revision,notedBy:issued.notedBy,notedDate:issued.notedDate})
 await page.getByRole('button',{name:'Record receipt',exact:true}).click()
 await fill(page,'Date Received by MARINA *','2026-11-06')
 await fill(page,'Receipt Source / Reference','DEMO receiving register entry')
 await page.getByRole('button',{name:'Save receipt',exact:true}).click()
 const received=(await state(page)).reports.find(report=>report.id===saved.id)
 check(received.receivedDate==='2026-11-06'&&!!received.receiptMetadata?.recordedBy,'Receipt date and source are recorded after issue')
 check(JSON.stringify({fields:received.fields,status:received.status,revision:received.revision,notedBy:received.notedBy,notedDate:received.notedDate})===before,'Receipt recording does not rewrite issued content or sign-off')
 const printing=page.waitForEvent('popup')
 await page.getByRole('button',{name:'Preview / print',exact:true}).click()
 const printed=await printing;await printed.waitForLoadState('domcontentloaded')
 check((await printed.locator('body').innerText()).includes('Source information requested; retained as unknown'),'Issued MAIC print retains reporting-exception explanations')
 await printed.close();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/required-maic-issued-receipt.png',fullPage:false})
 await go(page,'/admin/cases?new=1&eventId=e-003')
 await page.getByRole('button',{name:'Save draft',exact:true}).click()
 const draftCase=(await state(page)).cases.find(record=>record.eventId==='e-003'&&record.reportingStatus==='draft')
 check(!!draftCase,'Incomplete case can be retained as a draft')
 await page.getByRole('button',{name:'Save case and actions',exact:true}).click()
 check((await state(page)).cases.find(record=>record.id===draftCase.id).reportingStatus==='draft','Incomplete case cannot become a recorded operational case')
 await fill(page,'Case number','QA-REQUIREMENTS-CASE')
 await fill(page,'Respondent / owner / operator','Example Fictional Operator')
 await fill(page,'Alleged violations','Illustrative allegation for demonstration.')
 await page.getByRole('button',{name:'Add action',exact:true}).click()
 await fill(page,'Order / certificate / SRB reference','DEMO-SCO-REQ')
 await fill(page,'Issue date','2026-11-06')
 await fill(page,'Source Document / Copy Reference','DEMO order source copy')
 await explain(page,'#case-required-information')
 await page.getByRole('button',{name:'Save case and actions',exact:true}).click()
 const recorded=(await state(page)).cases.find(record=>record.id===draftCase.id)
 check(recorded.reportingStatus==='recorded'&&recorded.actions[0].issuedTime==='','SCO records retain date-only precision with explicit unknown-time reason')
 check(Object.values(recorded.reportingExceptions).some(exception=>exception.reason?.includes('without substituting')),'Case/action source exceptions persist with the case')
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/required-case-actions.png',fullPage:false})
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400)
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)){console.log('OVERFLOW',await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(element=>element.getBoundingClientRect().right>innerWidth+2).slice(0,12).map(element=>({tag:element.tagName,cls:element.className,right:element.getBoundingClientRect().right,width:element.getBoundingClientRect().width}))));await page.screenshot({path:out+'/required-case-mobile.png',fullPage:false})}
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Case requirement controls fit the mobile viewport')
 check(errors.length===0,'No browser exceptions in requirement, receipt and case workflows')
 console.log(JSON.stringify({passed:checks.length,errors}))
}finally{await browser.close()}
