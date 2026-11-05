import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const folder='docs/screenshots/lens-story';mkdirSync(folder,{recursive:true});
test('the lens travels across the same photograph with an enlarged optical crop',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-state','playing');
 const scene=page.getByTestId('opening-investigation');
 await scene.evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=1000;});
 const first=await page.getByTestId('opening-magnifier').boundingBox();
 await expect(scene.locator('.opening-lens-photo')).toHaveAttribute('src','/sample-desk.jpg');
 expect(await scene.locator('.opening-lens-photo').evaluate(el=>el.getBoundingClientRect().width/innerWidth)).toBeCloseTo(1.22,1);
 await page.screenshot({path:`${folder}/opening-lens.png`});
 await scene.evaluate(el=>{el.getAnimations()[0].currentTime=2100;});
 const second=await page.getByTestId('opening-magnifier').boundingBox();expect(second!.x).toBeGreaterThan(first!.x+80);
 await page.keyboard.press('Escape');await expect(page.getByTestId('sample-start')).toBeFocused();
});
test('story plays a complete loop, pauses, resumes and closes without delayed navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.addInitScript(()=>localStorage.setItem('kirock:opening-seen:v2','1'));await page.goto('/');
 await page.clock.install();await page.getByTestId('story-open').click();
 await expect(page.locator('.story-real-photo')).toHaveJSProperty('complete',true);
 await page.clock.runFor(3500);await expect(page.getByTestId('story-bubble')).toContainText('I want a lawyer.');
 await page.getByTestId('story-pause').click();await page.clock.runFor(6000);await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-story-beat','2');
 await page.getByTestId('story-pause').click();await page.clock.runFor(2600);await expect(page.getByTestId('story-bubble')).toContainText('You need a coaster.');
 await page.clock.runFor(3000);await expect(page.getByTestId('story-question')).toContainText('Who took the last biscuit?');
 await page.clock.runFor(3200);await expect(page.locator('.story-handoff')).toBeVisible();
 await page.clock.runFor(3500);await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-story-beat','0');
 await page.keyboard.press('Escape');await page.clock.runFor(16000);await expect(page.getByTestId('story-open')).toBeFocused();await expect(page.getByTestId('sample-start')).toBeVisible();
});
for(const locale of ['en','ko','es','fr','de','pt','ja','zh','ar','hi'])test(`story at 360px in ${locale} keeps every scene and control on screen`,async({page})=>{
 await page.setViewportSize({width:360,height:740});await page.addInitScript(l=>localStorage.setItem('kirock:locale',l),locale);await page.goto('/');await page.getByTestId('story-open').click();
 await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-paused','true');
 for(let beat=0;beat<6;beat++){
  await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-story-beat',String(beat));
  for(const selector of ['.story-camera-top','.story-headline','.story-film-controls','.story-camera-bottom',...(beat>=2&&beat<=4?['.story-bubble']:[])]){
   const box=await page.locator(selector).boundingBox();expect(box!.x,`${locale} ${beat} ${selector}`).toBeGreaterThanOrEqual(-1);expect(box!.x+box!.width).toBeLessThanOrEqual(361);expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(741);
  }
  if(beat>0){const image=await page.locator('.story-real-photo').boundingBox();const face=await page.getByTestId('story-face-0').boundingBox();expect((face!.x+face!.width/2-image!.x)/image!.width).toBeCloseTo(.661,2);expect((face!.y+face!.height/2-image!.y)/image!.height).toBeCloseTo(.723,2);}
  if(beat===3&&['en','ko','ar'].includes(locale))await page.screenshot({path:`${folder}/story-${locale}-360.png`});
  await page.getByTestId('story-next').click();
 }
 await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-story-beat','0');
 await page.getByTestId('story-close').focus();await page.keyboard.press('Shift+Tab');await expect(page.getByTestId('story-photo')).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByTestId('story-open')).toBeFocused();
});
