import { readFileSync, writeFileSync } from 'node:fs';
import { KiroVisionProvider } from '../src/lib/ai/kiro-vision.server';
import { analyzeWithFallback } from '../src/lib/ai/provider';
async function main(){
const start=Date.now();
const photo=process.argv[2]||'tests/fixtures/photos/work-desk.jpg';
const result=await analyzeWithFallback(new KiroVisionProvider(),`data:image/jpeg;base64,${readFileSync(photo).toString('base64')}`,55000);
const report={executedAt:new Date().toISOString(),elapsedMs:Date.now()-start,fixture:photo,...result};
writeFileSync('docs/kiro/live-dialogue/vision.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
void main();
