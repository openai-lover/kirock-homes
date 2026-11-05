/** Explicit operator check: calls configured AI once; never prints identity or keys. */
import { writeFileSync } from 'node:fs';
import { chatProvider,planWithFallback } from '../src/lib/chat/provider.server';
import { createCase,publicSnapshot,sampleSuspects } from '../src/lib/game';
async function main(){
const snapshot=publicSnapshot(createCase(sampleSuspects(),{seed:14}),'en');
const input={snapshot,suspects:snapshot.suspects,target:'s0' as const,question:'Keyboard disagrees with you. How does your statement fit with theirs?',history:[{speakerId:'s2' as const,text:snapshot.statements.find(s=>s.speakerId==='s2')!.text}]};
const start=Date.now();const result=await planWithFallback(chatProvider(),input);
const report={executedAt:new Date().toISOString(),elapsedMs:Date.now()-start,mode:result.mode,plan:result.plan,reason:result.reason??null};
writeFileSync('docs/verification/group-chat-live.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

}
void main();
