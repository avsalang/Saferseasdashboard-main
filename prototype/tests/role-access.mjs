import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const BASE=process.env.BASE_URL||'http://127.0.0.1:5174/';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(value,message)=>{assert.ok(value,message);checks.push(message);console.log('PASS '+message)};
const go=async path=>{await page.goto(BASE+'#'+path);await page.waitForTimeout(300)};
try{
 await page.goto(BASE);await page.locator('.auth-demo-grid').waitFor();
 const accounts=await page.locator('.auth-demo-grid .q-btn').allTextContents();
 check(accounts.length===3&&accounts.some(t=>t.includes('MRO Reporter'))&&accounts.some(t=>t.includes('MRO Reviewer'))&&accounts.some(t=>t.includes('MARINA Investigator')),'Sign-in offers exactly the three confirmed account types');
 await page.getByRole('button',{name:'MRO Reviewer MRO-IV',exact:true}).click();await page.waitForURL('**/#/admin');
 await go('/admin/review');check(page.url().endsWith('/admin/review'),'MRO Reviewer can open the review queue');
 for(const path of ['/admin/investigations/e-003','/admin/cases','/admin/accounts','/admin/settings','/admin/incidents/new']){await go(path);check(page.url().endsWith('/forbidden'),'MRO Reviewer is denied '+path)}
 await go('/login');await page.getByRole('button',{name:'MARINA Investigator MRO-NCR',exact:true}).click();await page.waitForURL('**/#/admin');
 for(const path of ['/admin/review','/admin/investigations/e-003','/admin/cases','/admin/accounts','/admin/roles','/admin/settings','/admin/imports','/admin/reports']){await go(path);check(!page.url().endsWith('/forbidden'),'MARINA Investigator can open '+path)}
 await go('/admin/incidents/e-003');await page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:/^Assigned investigator$/})}).click();
 const options=await page.getByRole('option').allTextContents();check(options.length===1&&options[0].includes('MARINA Investigator'),'Investigation assignment offers only MARINA Investigator accounts');await page.keyboard.press('Escape');
 await go('/admin/roles');check(await page.getByRole('button',{name:'Add role',exact:true}).count()===0,'Role configuration does not add a fourth account type');
 await go('/admin/accounts');await page.getByRole('button',{name:'Issue account',exact:true}).click();await page.locator('.q-field').filter({has:page.locator('.q-field__label').filter({hasText:/^Assigned role$/})}).click();const issuedOptions=await page.getByRole('option').allTextContents();check(issuedOptions.length===3&&issuedOptions.includes('MARINA Investigator'),'Account issuance is limited to the three confirmed types');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Cancel',exact:true}).click();
 check(errors.length===0,'No page exceptions in three-role workflows');await fs.mkdir('test-artifacts',{recursive:true});await fs.writeFile('test-artifacts/role-access.json',JSON.stringify({passed:true,checks,errors},null,2));console.log('COMPLETE '+checks.length+' role checks');
}catch(e){await page.screenshot({path:'test-artifacts/role-access-failure.png',fullPage:true});console.error(e.stack);console.error((await page.locator('body').innerText()).slice(-1500));process.exitCode=1}finally{await browser.close()}
