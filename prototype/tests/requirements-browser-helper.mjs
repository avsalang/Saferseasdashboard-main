export async function explainVisibleRequirements(page,reason='Fictional initial report: verified source information is pending and must be followed up.'){
 async function explain(){
  const rows=page.locator('[data-testid="field-exception"]').filter({visible:true})
  const keys=await rows.evaluateAll(items=>items.map(item=>item.dataset.requirementKey))
  for(const key of [...new Set(keys)]){
   const row=page.locator('[data-testid="field-exception"][data-requirement-key="'+key+'"]').filter({visible:true}).first()
   if(!await row.count())continue
   if(!await row.locator('textarea').count()){
    await row.locator('.q-select').click()
    await page.getByRole('option',{name:'Unknown — information pending',exact:true}).last().click({force:true})
    if(!await row.count())continue
   }
   const input=row.locator('textarea')
   if(!await input.inputValue())await input.fill(reason)
  }
 }
 const tabs=page.locator('.q-stepper__tab'),active=await tabs.evaluateAll(items=>items.findIndex(item=>item.classList.contains('q-stepper__tab--active')))
 if(await tabs.count()){
  for(let index=0;index<await tabs.count()-1;index++){await tabs.nth(index).click();await page.waitForTimeout(500);await explain()}
  await tabs.nth(active>=0?active:await tabs.count()-1).click();await page.waitForTimeout(500)
 }else await explain()
}
export async function acknowledgeWorkingCopy(page){const checkbox=page.getByRole('checkbox',{name:'I understand this download is an incomplete working copy',exact:true});if(await checkbox.isVisible())await checkbox.check()}
export async function confirmWorkingCopyDialog(page){const button=page.getByRole('button',{name:'Download working copy',exact:true});if(await button.isVisible())await button.click()}
