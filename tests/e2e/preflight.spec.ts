import {test,expect} from '@playwright/test';

test('cold opening waits for the desk photo and always shows a branded first frame',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.route('**/sample-desk.jpg',async route=>{await new Promise(resolve=>setTimeout(resolve,2200));await route.continue();});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.getByTestId('opening-poster')).toBeVisible({timeout:1000});
 await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-state','preparing');
 await expect(page.getByTestId('opening-sequence').getByRole('button')).toHaveCount(1);
 await page.screenshot({path:'docs/screenshots/preflight/cold-first-frame.png'});
 await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-state','playing');
 await expect(page.locator('.opening-desk')).toHaveJSProperty('naturalWidth',1100);
 await page.getByTestId('opening-skip').click();await expect(page.getByTestId('sample-start')).toBeFocused();
});

test('the corrected intro plays once for visitors who saw the old version',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>localStorage.setItem('kirock:opening-seen:v1','1'));
 await page.goto('/');await expect(page.getByTestId('opening-sequence')).toBeVisible();
 await page.getByTestId('opening-skip').click();await page.reload();
 await expect(page.getByTestId('opening-sequence')).toHaveCount(0);
});

test('a hidden tab pauses the intro clock and animation, then resumes',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const opening=page.getByTestId('opening-sequence');await expect(opening).toHaveAttribute('data-state','playing');
 await page.clock.install();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(opening).toHaveAttribute('data-paused','true');
 await expect(page.locator('.opening-investigation')).toHaveCSS('animation-play-state','paused');
 await page.clock.runFor(12000);await expect(opening).toHaveAttribute('data-state','playing');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(7500);await expect(opening).toHaveCount(0);
 await expect(page.getByTestId('sample-start')).toBeFocused();
});

test('a missing scene photograph still provides a visible title and working skip',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.route('**/sample-desk.jpg',route=>route.abort());
 await page.goto('/');await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-state','playing');
 await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-sweep-ready','false');
 await page.waitForTimeout(2800);await expect(page.locator('.opening-title')).toHaveCSS('opacity','1');
 await page.getByTestId('opening-skip').click();await expect(page.getByTestId('sample-start')).toBeFocused();
});

test('entry labels are centered and legible from compact phones to desktop',async({page})=>{
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1440,height:960}]){
  await page.setViewportSize(viewport);await page.goto('/');
  for(const locale of ['en','ko','de','ar']){
   await page.getByTestId('language-select').selectOption(locale);
   await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('.entry-actions svg, .entry-extras > button svg, .entry-extras summary svg')).toHaveCount(0);
   for(const button of await page.locator('.entry-actions button').all()){
    const label=button.locator('.button-label'),b=(await button.boundingBox())!,l=(await label.boundingBox())!;
    expect(Math.abs(l.x+l.width/2-b.x-b.width/2),`${viewport.width} ${locale} horizontal center`).toBeLessThan(1);
    expect(Math.abs(l.y+l.height/2-b.y-b.height/2),`${viewport.width} ${locale} vertical center`).toBeLessThan(1);
    expect(await label.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(17);
    expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(viewport.width+1);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.getByTestId('language-select').selectOption('en');
 await page.screenshot({path:'docs/screenshots/preflight/home-mobile.png',fullPage:true});
 await page.getByTestId('language-select').selectOption('ko');await page.getByTestId('opening-replay').click();
 const skip=page.getByTestId('opening-skip');await expect(skip).toHaveText('스킵 인트로');
 await expect(page.getByTestId('opening-sequence').getByRole('button')).toHaveCount(1);
 const b=(await skip.boundingBox())!,l=(await skip.locator('span').boundingBox())!;
 expect(b.x).toBeLessThan(30);expect(b.y).toBeGreaterThan(700);
 expect(Math.abs(l.x+l.width/2-b.x-b.width/2)).toBeLessThan(1);expect(Math.abs(l.y+l.height/2-b.y-b.height/2)).toBeLessThan(1);
 await page.screenshot({path:'docs/screenshots/preflight/skip-mobile-ko.png'});
});

test('phone chat keeps input and send controls visible when the keyboard reduces available height',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByTestId('sample-start').click();
 for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();
 await page.getByTestId('chat-input').focus();await page.setViewportSize({width:390,height:480});
 await page.evaluate(()=>window.scrollTo(0,0));
 const input=(await page.getByTestId('chat-input').boundingBox())!,send=(await page.locator('.chat-send').boundingBox())!,log=(await page.getByTestId('chat-log').boundingBox())!;
 expect(input.y+input.height,'typing remains above keyboard').toBeLessThanOrEqual(480);
 expect(send.y+send.height,'send remains above keyboard').toBeLessThanOrEqual(480);
 expect(log.height,'messages keep a useful scrollable area').toBeGreaterThanOrEqual(80);
 await page.screenshot({path:'docs/screenshots/preflight/chat-keyboard-space.png'});
});

const photos=[
 {file:'dark-desk.jpg',viewport:{width:390,height:844},width:1067,height:1600,correct:true,actors:[{name:'머그',kind:'cup',x:.15,y:.63,scale:.15},{name:'태블릿',kind:'electronics',x:.68,y:.45,scale:.20},{name:'노트',kind:'book',x:.69,y:.82,scale:.20}]},
 {file:'work-desk.jpg',viewport:{width:1440,height:960},width:1600,height:1067,correct:false,actors:[{name:'노트북',kind:'electronics',x:.65,y:.40,scale:.20},{name:'헤드폰',kind:'electronics',x:.21,y:.61,scale:.13},{name:'화분',kind:'plant',x:.21,y:.10,scale:.12}]},
];
for(const photo of photos)test(`real ${photo.file} uploads, preserves face placement and completes ${photo.correct?'correct':'wrong'} verdict`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize(photo.viewport);await page.addInitScript(()=>localStorage.setItem('kirock:locale','ko'));
 await page.goto('/');await page.getByLabel('사진 업로드',{exact:true}).setInputFiles(`tests/fixtures/photos/${photo.file}`);
 const scene=page.locator('.scene-column .photo-stage');await expect(scene.locator('img')).toHaveJSProperty('naturalWidth',photo.width);await expect(scene.locator('img')).toHaveJSProperty('naturalHeight',photo.height);
 for(let i=0;i<photo.actors.length;i++){
  const actor=photo.actors[i];await page.locator('.cast-tabs button').nth(i).click();
  await page.getByLabel('물건 이름',{exact:true}).fill(actor.name);await page.getByRole('combobox',{name:'종류',exact:true}).selectOption(actor.kind);
  // Range inputs exercise the same precise placement controls as a player.
  for(const [label,value] of [['가로 위치',actor.x],['세로 위치',actor.y],['얼굴 크기',actor.scale]] as const)await page.getByRole('slider',{name:label,exact:true}).fill(String(value));
  await page.getByRole('button',{name:'이 위치로 선택'}).click();
 }
 await page.screenshot({path:`docs/screenshots/preflight/${photo.file}-casting.png`,fullPage:true});
 await page.getByRole('button',{name:'이 셋을 깨우기'}).click();
 for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();
 const chatScene=page.locator('.chat-scene-column .photo-stage'),before=await chatScene.locator('img').getAttribute('src');
 for(let i=0;i<photo.actors.length;i++){
  const image=(await chatScene.boundingBox())!,face=(await page.getByTestId(`face-s${i}`).boundingBox())!;
  expect((face.x+face.width/2-image.x)/image.width).toBeCloseTo(photo.actors[i].x,2);expect((face.y+face.height/2-image.y)/image.height).toBeCloseTo(photo.actors[i].y,2);
 }
 if(photo.viewport.width<760){await page.locator('.chat-photo-expand').click();await page.screenshot({path:'docs/screenshots/preflight/dark-desk-awake-mobile.png'});await page.keyboard.press('Escape');await expect(page.locator('.chat-pane')).toHaveJSProperty('inert',false);}
 const statements=await page.locator('.is-official blockquote p').allTextContents();expect(statements).toHaveLength(3);
 const culprit=statements.find(text=>/범인은 ‘.+’야\./.test(text))?.match(/범인은 ‘(.+)’야\./)?.[1];expect(culprit).toBeTruthy();
 await page.locator('.chat-ai summary').click();await page.locator('.chat-ai input').uncheck();await page.locator('.chat-ai summary').click();
 await page.getByTestId('chat-input').fill(`${photo.actors[0].name}, 다른 물건의 말과 비교해 줘.`);await page.getByTestId('chat-input').press('Enter');
 await expect(page.getByTestId('chat-reply-mode')).toHaveText('기본 대사');
 expect(await page.locator('.is-official blockquote p').allTextContents()).toEqual(statements);expect(await chatScene.locator('img').getAttribute('src')).toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`docs/screenshots/preflight/${photo.file}-chat.png`});
 await page.getByTestId('open-accusation').click();
 const target=photo.correct?culprit!:photo.actors.find(a=>a.name!==culprit)!.name;
 await page.locator('.chat-suspect-choices button').filter({hasText:target}).click();await page.getByTestId('accuse').click();
 await expect(page.locator('.chat-resolution h2')).toHaveText(photo.correct?'정답이에요!':'앗, 무고한 물건이었어요');
 await expect(page.locator('.chat-resolution h3')).toContainText(culprit!);await expect(page.locator('.chat-proof li')).toHaveCount(3);await expect(page.locator('.chat-proof li').last()).toContainText(culprit!);
 await page.screenshot({path:`docs/screenshots/preflight/${photo.file}-verdict.png`});expect(errors).toEqual([]);
});
