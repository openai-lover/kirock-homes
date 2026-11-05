// Actual local browser footage; the closing evidence card is explicitly labelled.
import {chromium,expect} from '@playwright/test';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const dir='docs/demo';mkdirSync(dir,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(chrome)?{executablePath:chrome}:{});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'no-preference',recordVideo:{dir:'/private/tmp/kirock-demo-recording',size:{width:1280,height:900}}});
const page=await context.newPage();const started=Date.now(),chapters=[];
const note=text=>{chapters.push({seconds:(Date.now()-started)/1000,text});console.log(text);};
const pause=ms=>page.waitForTimeout(ms);
let mode;
try{
 note('Actual localhost gameplay. Licensed stock photo; no personal images.');
 await page.goto('http://127.0.0.1:3000/');await expect(page.getByTestId('opening-sequence')).toHaveAttribute('data-state','playing');
 await expect(page.getByTestId('opening-sequence')).toHaveCount(0,{timeout:12000});await pause(2200);
 note('One real photograph. The objects wake up.');await page.getByTestId('story-open').click();await pause(14500);await page.getByTestId('story-close').click();
 note('Upload another real desk photograph and place three faces.');await page.getByLabel('Upload photo',{exact:true}).setInputFiles('tests/fixtures/photos/work-desk.jpg');await pause(1600);
 const actors=[{name:'Laptop',kind:'electronics',x:.65,y:.40,scale:.20},{name:'Headphones',kind:'electronics',x:.21,y:.61,scale:.13},{name:'Plant',kind:'plant',x:.21,y:.10,scale:.12}];
 for(let i=0;i<3;i++){
  await page.locator('.cast-tabs button').nth(i).click();await page.getByLabel('Object name',{exact:true}).fill(actors[i].name);await page.getByRole('combobox',{name:'Kind',exact:true}).selectOption(actors[i].kind);
  for(const [name,value] of [['Horizontal',actors[i].x],['Vertical',actors[i].y],['Face size',actors[i].scale]])await page.getByRole('slider',{name,exact:true}).fill(String(value));
  await page.getByRole('button',{name:'Use this position'}).click();await pause(1900);
 }
 await page.getByRole('button',{name:'Wake these three up'}).click();note('The photograph stays intact as the objects join your group chat.');await pause(4000);
 for(let i=0;i<4;i++){await page.getByTestId('chat-continue').click();await pause(2700);}
 note('Ask a question. The addressed witness answers; another object can interject.');
 await page.getByTestId('chat-input').pressSequentially("Laptop, compare your statement with Plant's.",{delay:65});await pause(500);await page.getByTestId('chat-input').press('Enter');
 await expect(page.getByTestId('chat-reply-mode')).toBeVisible({timeout:25000});mode=await page.getByTestId('chat-reply-mode').innerText();await pause(5500);
 note('Three fixed statements. One false statement. One final accusation.');
 await page.getByTestId('open-accusation').click();await pause(1500);await page.getByTestId('choose-s0').click();await pause(1500);await page.getByTestId('accuse').click();
 await expect(page.locator('.chat-proof li')).toHaveCount(3);await page.locator('.chat-resolution').evaluate(el=>el.scrollIntoView({block:'start'}));await pause(6500);
 await page.locator('.chat-result-actions').evaluate(el=>el.scrollIntoView({block:'end'}));await pause(2500);
 note('Recorded development evidence — a summary card, not a new Kiro run.');
 const actual=JSON.parse(readFileSync('docs/kiro/group-chat-run.json','utf8'));
 await page.setContent(`<html><body style="margin:0;background:#12242a;color:#f4eedf;font:22px/1.6 Arial,sans-serif;padding:100px;box-sizing:border-box"><p style="color:#e5b65c;font-size:18px">Recorded development evidence · November 5, 2026</p><h1 style="font:64px Georgia,serif;margin:25px 0">Built with real Kiro use.</h1><p>Kiro CLI authored the chat-routing validator, fallback,<br>84 focused tests and three specification files.</p><p>Codex built the photo/chat UI, fixed deduction engine,<br>runtime adapter and broader verification.</p><p style="color:#c2d0cd">Kiro chooses a bounded reply plan.<br>Code owns the official testimony, culprit and explanation.</p><p style="margin-top:60px;font-size:16px;color:#c2d0cd">This is a local review recording, not a hosted release.<br>Photo: Jep Gambardella / Pexels. Evidence preserved in docs/kiro/.<br>Closing card summarizes a recorded run; it is not a live terminal capture.</p></body></html>`);
 if(actual.exitCode!==0&&actual.exit_code!==0)console.log('Original run metadata keys:',Object.keys(actual));
 await pause(9000);const duration=(Date.now()-started)/1000;
 const video=page.video();await context.close();await video.saveAs(`${dir}/kirock-homes-review.webm`);
 writeFileSync(`${dir}/recording.json`,JSON.stringify({recordedAt:new Date().toISOString(),durationSeconds:duration,viewport:{width:1280,height:900},footage:'Actual localhost browser interaction, plus a labelled closing evidence card',runtimeReplyLabel:mode,photo:'Jep Gambardella / Pexels, tests/fixtures/photos/work-desk.jpg',published:false,chapters},null,2));
 const stamp=s=>{const n=Math.round(s*1000);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;};
 writeFileSync(`${dir}/kirock-homes-review.en.srt`,chapters.map((c,i)=>`${i+1}\n${stamp(c.seconds)} --> ${stamp((chapters[i+1]?.seconds??duration)-.1)}\n${c.text}\n`).join('\n'));
 console.log(JSON.stringify({durationSeconds:duration,runtimeReplyLabel:mode,video:`${dir}/kirock-homes-review.webm`}));
}finally{await browser.close();}
