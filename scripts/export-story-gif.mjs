// Export the real photo/SVG story as a GIF. This is a rendered app asset, not native GPT GIF output.
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
const destination='public/art', frameMs=150, duration=15000;
mkdirSync(destination,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch(existsSync(chrome)?{executablePath:chrome}:{});
const results=[];
try{
 for(const locale of ['en','ko']){
  const context=await browser.newContext({viewport:{width:440,height:760},deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.addInitScript(l=>{localStorage.setItem('kirock:opening-seen:v2','1');localStorage.setItem('kirock:locale',l);},locale);
  const page=await context.newPage();await page.clock.install();await page.goto('http://127.0.0.1:3000/');await page.getByTestId('story-open').click();
  await page.locator('.story-real-photo').evaluate(image=>image.decode());await page.evaluate(()=>document.fonts.ready);
  // Stop wall-clock drift during screenshot encoding; advance only the intended 150 ms.
  await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
  await page.addStyleTag({content:'.story-headline p,.story-bubble,.story-player-question,.story-handoff,.story-actor{animation:none!important}'});
  await page.getByTestId('story-pause').click();for(let i=0;i<6;i++)await page.getByTestId('story-next').click();
  await page.getByTestId('story-pause').click();await page.clock.runFor(80);
  const frames=[], beats=[];
  for(let t=0;t<duration;t+=frameMs){
   if(t>0)await page.clock.runFor(frameMs);
   const beat=[0,1600,3100,5700,8400,11600].reduce((value,start,i)=>t>=start?i:value,0);
   // The UI ticks at 80 ms; check only away from each transition boundary.
   if(![0,1600,3100,5700,8400,11600].some(start=>Math.abs(start-t)<160))await expect(page.getByTestId('story-dialog')).toHaveAttribute('data-story-beat',String(beat));
   beats.push(await page.getByTestId('story-dialog').getAttribute('data-story-beat'));
   await page.locator('.story-film').evaluate((el,time)=>{for(const animation of el.getAnimations({subtree:true})){animation.pause();animation.currentTime=time;}},t);
   frames.push(await page.getByTestId('story-dialog').screenshot({animations:'allow'}));
  }
  const output=`${destination}/living-photo-story-${locale}.gif`;
  await sharp(frames,{join:{animated:true}}).gif({delay:Array(frames.length).fill(frameMs),loop:0,keepDuplicateFrames:true,effort:7,colours:128,dither:.3}).toFile(output);
  const metadata=await sharp(output,{animated:true}).metadata();
  if(metadata.pages!==frames.length||metadata.loop!==0||metadata.delay.reduce((a,b)=>a+b,0)!==duration)throw new Error('Invalid GIF timing');
  if(new Set(beats).size!==6||beats.at(-1)!=='5')throw new Error('Incomplete story timeline');
  results.push({path:output,format:metadata.format,frames:metadata.pages,width:metadata.width,height:metadata.pageHeight,durationMs:duration,loop:metadata.loop,beats:[...new Set(beats)],lastBeat:beats.at(-1)});
  console.log(JSON.stringify(results.at(-1)));await context.close();
 }
 writeFileSync('docs/verification/lens-story-gifs.json',JSON.stringify({exportedAt:new Date().toISOString(),authorship:'Codex-rendered photo and SVG animation; not GPT-native GIF generation',results},null,2));
}finally{await browser.close();}
