export async function explainVisibleRequirements(page,reason='Fictional initial report: verified source information is pending and must be followed up.'){
 const panel=page.locator('[data-testid="required-information"]').filter({visible:true}).last()
 if(!await panel.count())return
 const header=panel.locator('> .q-expansion-item > .q-expansion-item__container > .q-item').first()
 if(await header.getAttribute('aria-expanded')==='false')await header.click()
 const rows=panel.locator('.requirement-row')
 for(let index=0;index<await rows.count();index++){
  const row=rows.nth(index),input=row.locator('textarea')
  if(!await input.count())throw Error('Required identity/narrative must be entered in the main form: '+await row.innerText())
  if(await input.inputValue())continue
  await row.locator('.q-select').click()
  await page.getByRole('option',{name:'Unknown — information pending',exact:true}).last().click()
  await input.fill(reason)
 }
}
export async function acknowledgeWorkingCopy(page){const checkbox=page.getByRole('checkbox',{name:'I understand this download is an incomplete working copy',exact:true});if(await checkbox.isVisible())await checkbox.check()}
export async function confirmWorkingCopyDialog(page){const button=page.getByRole('button',{name:'Download working copy',exact:true});if(await button.isVisible())await button.click()}
