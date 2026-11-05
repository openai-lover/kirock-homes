import {test,expect,type Page} from '@playwright/test';
import {SUPPORTED_LOCALES} from '../../src/lib/i18n/locales';
import {chatCopy} from '../../src/lib/chat/copy';
import {mkdirSync} from 'node:fs';
const screenshots='docs/screenshots/group-chat';mkdirSync(screenshots,{recursive:true});
async function start(page:Page){await page.goto('/');await page.getByTestId('sample-start').click();for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();}
async function local(page:Page){await page.locator('.chat-ai summary').click();await page.locator('.chat-ai input').uncheck();await page.locator('.chat-ai summary').click();}
async function ask(page:Page,q:string){await page.getByTestId('chat-input').fill(q);await page.getByTestId('chat-input').press('Enter');await expect(page.getByTestId('chat-reply-mode').last()).toBeVisible();}
for(const locale of SUPPORTED_LOCALES)test(`chat in ${locale}: sequential evidence, free input, replies and verdict`,async({page})=>{
 await page.addInitScript(l=>localStorage.setItem('kirock:locale',l),locale);await start(page);await local(page);
 await expect(page.locator('.is-official')).toHaveCount(3);await expect(page.getByTestId('open-accusation')).toBeDisabled();
 await ask(page,chatCopy(locale).compare);await expect(page.getByTestId('open-accusation')).toBeEnabled();
 const before=await page.locator('.is-official blockquote p').allTextContents();await page.getByTestId('open-accusation').click();await page.getByTestId('choose-s0').click();await page.getByTestId('accuse').click();await expect(page.getByTestId('verdict-proof').locator('li')).toHaveCount(3);expect(await page.locator('.is-official blockquote p').allTextContents()).toEqual(before);await expect(page.locator('html')).toHaveAttribute('lang',locale);
});
for(const width of [360,390,768,1440])test(`chat at ${width}px has reachable composer, readable photo and no overflow`,async({page})=>{
 await page.setViewportSize({width,height:844});await start(page);await local(page);await ask(page,'Compare your statements.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
 const composer=await page.getByTestId('chat-input').boundingBox();expect(composer).toBeTruthy();expect(composer!.x).toBeGreaterThanOrEqual(0);expect(composer!.y+composer!.height).toBeLessThanOrEqual(844);
 for(const id of ['s0','s1','s2']){const face=await page.getByTestId(`face-${id}`).boundingBox();expect(face!.x).toBeGreaterThanOrEqual(0);expect(face!.x+face!.width).toBeLessThanOrEqual(width);}
 await page.screenshot({path:`${screenshots}/${width}-chat.png`,fullPage:true});
});
test('photo story uses one real photo and its shutter opens the same actual game scene',async({page})=>{
 await page.goto('/');await page.getByTestId('story-open').click();await expect(page.getByTestId('story-dialog')).toBeVisible();await expect(page.locator('.story-real-photo')).toHaveAttribute('src','/sample-desk.jpg');await expect(page.locator('.story-art')).toHaveCount(0);
 await page.keyboard.press('Shift+Tab');await expect(page.getByTestId('story-photo')).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByTestId('story-open')).toBeFocused();
 await page.getByTestId('story-open').click();await page.screenshot({path:`${screenshots}/photo-story.png`,fullPage:true});await page.getByTestId('story-sample').click();await expect(page.getByTestId('story-dialog')).toHaveCount(0);await expect(page.locator('.chat-scene-column .photo-stage>img')).toHaveAttribute('src','/sample-desk.jpg');await expect(page.locator('.is-official')).toHaveCount(0);for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();await expect(page.getByTestId('chat-input')).toBeVisible();
});
test('AI plan uses the player target and recent history, interjects and preserves evidence',async({page})=>{
 let body:any;await page.route('**/api/chat',async route=>{body=route.request().postDataJSON();await route.fulfill({json:{mode:'kiro',plan:{speakerId:'s0',intent:'compare',referenceId:'s2',tone:'dramatic',interject:true}}});});
 await start(page);const original=await page.locator('.is-official blockquote p').allTextContents();await page.locator('.chat-target select').selectOption('s0');await ask(page,'Keyboard disagrees. How do you defend that?');expect(body.target).toBe('s0');expect(body.history).toHaveLength(3);expect(body.aiConsent).toBe(true);expect(body.dataUrl).toBeUndefined();await expect(page.locator('.chat-turn .chat-message[data-speaker=s0]')).toBeVisible();await expect(page.locator('.chat-turn .chat-message[data-speaker=s2]')).toBeVisible();await ask(page,'But what about that last reply?');expect(body.history.length).toBeGreaterThan(3);expect(body.history.some((h:any)=>h.speakerId==='player')).toBe(true);expect(await page.locator('.is-official blockquote p').allTextContents()).toEqual(original);
});
test('malformed chat and user-cancelled slow AI both fall back and allow accusation',async({page})=>{
 await start(page);await page.route('**/api/chat',route=>route.fulfill({json:{mode:'kiro',plan:{reply:'invented confession'}}}));await ask(page,'Compare the statements.');await expect(page.getByTestId('chat-reply-mode')).toHaveText('Scripted replies');await page.unroute('**/api/chat');
 await page.route('**/api/chat',async route=>{await new Promise(r=>setTimeout(r,2500));await route.abort().catch(()=>{});});await page.getByTestId('chat-input').fill('Explain yourself.');await page.getByTestId('chat-input').press('Enter');await page.getByRole('button',{name:'Continue without AI'}).click();await expect(page.getByTestId('chat-reply-mode')).toHaveCount(2);await expect(page.getByTestId('open-accusation')).toBeEnabled();
});
test('Arabic mobile retains evidence across language change, traps accusation focus and allows cancellation',async({page})=>{
 await page.setViewportSize({width:360,height:800});await start(page);await local(page);await ask(page,'Explain yourself.');const count=await page.locator('.chat-turn').count();const face=await page.getByTestId('face-s0').getAttribute('style');await page.getByTestId('language-select').selectOption('ar');expect(await page.locator('.chat-turn').count()).toBe(count);expect(await page.getByTestId('face-s0').getAttribute('style')).toBe(face);await expect(page.locator('.case-chat')).toHaveCSS('direction','rtl');await page.getByTestId('open-accusation').click();await page.keyboard.press('Shift+Tab');await expect(page.locator('.chat-cancel')).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByTestId('open-accusation')).toBeFocused();await page.screenshot({path:`${screenshots}/360-ar.png`,fullPage:true});
});
test('mobile photo expansion preserves original coordinates and closes with Escape',async({page})=>{
 await page.setViewportSize({width:360,height:800});await start(page);const before=await page.getByTestId('face-s0').getAttribute('style');await page.locator('.chat-photo-expand').click();await expect(page.locator('.chat-scene-column')).toHaveClass(/photo-expanded/);expect(await page.getByTestId('face-s0').getAttribute('style')).toBe(before);const photo=await page.locator('.chat-scene-column .photo-stage').boundingBox();expect(photo!.height).toBeGreaterThan(400);await page.screenshot({path:`${screenshots}/360-photo-expanded.png`,fullPage:true});await page.keyboard.press('Escape');await expect(page.locator('.chat-scene-column')).not.toHaveClass(/photo-expanded/);await expect(page.getByTestId('chat-input')).toBeVisible();
});
test('a typed direct address is passed as an explicit recipient and wrong-speaker output falls back',async({page})=>{
 let target='';await page.route('**/api/chat',route=>{target=route.request().postDataJSON().target;return route.fulfill({json:{mode:'kiro',plan:{speakerId:'s1',intent:'compare',referenceId:'s2',tone:'calm',interject:true}}});});await start(page);await ask(page,'Mug, explain yourself.');expect(target).toBe('s0');await expect(page.getByTestId('chat-reply-mode')).toHaveText('Scripted replies');await expect(page.locator('.chat-turn .chat-message[data-speaker=s0]')).toBeVisible();
});
