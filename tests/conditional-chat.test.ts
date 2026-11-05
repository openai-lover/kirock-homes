import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase,createVariant,sampleSuspects,solve,evaluate,validateDraft,publicSnapshot,resolveCase,SUSPECT_IDS,type SuspectId,type Triple } from '../src/lib/game';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/locales';
import { chatCopy,renderChatPlan } from '../src/lib/chat/copy';
import { modelPayload,planWithFallback,type ChatProvider } from '../src/lib/chat/provider.server';
import { ChatBudget } from '../src/lib/chat/budget.server';
import { validateChatInput } from '../src/lib/chat/request';
const permutations=<T>(items:T[]):T[][]=>items.length?items.flatMap((x,i)=>permutations(items.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]];
const orders=permutations([...SUSPECT_IDS]) as Triple<SuspectId>[];
test('v2: all 144 conditional variants uniquely solve, every statement is necessary, all six worlds and ten locales agree',()=>{
 let count=0;
 for(const storyId of ['coffee','sticker'] as const)for(const [a,b,c] of orders)for(const factInverted of [false,true])for(const displayOrder of orders){
  const draft=createVariant(sampleSuspects(),{templateVersion:2,storyId,roleAssignment:{a,b,c},factInverted,displayOrder});
  const [world]=solve(draft.statements);assert.deepEqual(solve(draft.statements),[{culpritId:a,fact:!factInverted}]);
  assert.equal(draft.statements.filter(s=>!evaluate(s.claim,world)).length,1);
  for(const omitted of draft.statements)assert.ok(new Set(solve(draft.statements.filter(s=>s!==omitted)).map(w=>w.culpritId)).size>=2);
  assert.deepEqual(validateDraft(draft),draft);assert.equal(draft.statements.some(s=>s.claim.type==='culprit_is'),false);
  if(storyId==='coffee')assert.equal(draft.factSubjectId,'s1');
  for(const locale of SUPPORTED_LOCALES){const snapshot=publicSnapshot(draft,locale),result=resolveCase(draft,a,locale);assert.equal(result.correct,true);assert.equal(result.fact,!factInverted);assert.equal(result.proofSteps.length,3);assert.ok(result.proofSteps[2].includes(snapshot.suspects.find(s=>s.id===a)!.displayName));assert.ok(snapshot.statements.every(s=>s.text.length>5&&!s.text.includes('{')));const raw=JSON.stringify(snapshot);for(const key of ['culpritId','factInverted','roleAssignment','proofSteps','confession'])assert.ok(!raw.includes(`"${key}"`));}
  count++;
 }assert.equal(count,144);
});
test('v1 shares remain valid and v2 rejects tampered condition/target/version',()=>{
 const draft=createCase(sampleSuspects(),{seed:12});for(const key of ['value','negated','suspectId']){const altered=structuredClone(draft),claim=altered.statements.find(s=>s.claim.type==='fact_or_culprit')!.claim as unknown as Record<string,unknown>;claim[key]=typeof claim[key]==='boolean'?!claim[key]:'s9';assert.throws(()=>validateDraft(altered));}
 const old=createVariant(sampleSuspects(),{storyId:'coffee',roleAssignment:{a:'s0',b:'s1',c:'s2'},factInverted:false,displayOrder:['s0','s1','s2']});assert.equal(validateDraft(old).templateVersion,1);
});
const snapshot=publicSnapshot(createCase(sampleSuspects(),{seed:12}),'en');
const context={snapshot,suspects:snapshot.suspects,question:'Compare your statement with Keyboard.',target:'s0' as const,history:[]};
test('provider input has only public text and roles, with no image, draft or resolution',()=>{
 const raw=JSON.stringify(modelPayload(context));for(const prohibited of ['dataUrl','face','roleAssignment','factInverted','confession','culpritId','proofSteps','solution'])assert.ok(!raw.includes(`"${prohibited}"`));assert.equal(modelPayload(context).characters.length,3);assert.equal(modelPayload(context).evidence.length,3);
});
test('missing key, malformed AI, extra answer fields and hanging provider always yield safe authored replies',async()=>{
 const cases:(ChatProvider|null)[]=[null,{name:'kiro',plan:async()=>({reply:'The culprit is s0'})},{name:'kiro',plan:async()=>{throw new Error('offline');}},{name:'kiro',plan:()=>new Promise(()=>{})}];
 for(const provider of cases){const result=await planWithFallback(provider,context,15);assert.equal(result.mode,'local');const lines=renderChatPlan(snapshot,result.plan);assert.ok(lines.length);for(const line of lines)if(line.quoteId)assert.ok(snapshot.statements.some(s=>s.id===line.quoteId));}
});
test('validated live plan makes the requested witness answer and another interject, without inventing evidence',async()=>{
 const result=await planWithFallback({name:'kiro',plan:async()=>({speakerId:'s0',intent:'compare',referenceId:'s2',tone:'dry',interject:true})},context);
 assert.equal(result.mode,'kiro');const lines=renderChatPlan(snapshot,result.plan);assert.deepEqual(lines.map(l=>l.speakerId),['s0','s2']);assert.equal(lines[0].referenceId,'s2');assert.equal(lines[0].quoteId,snapshot.statements.find(s=>s.speakerId==='s0')!.id);
});
test('chat budget is durable, deduplicates in-flight/completed calls, caps usage and expires cached plans',()=>{
 let now=Date.now();const db=new ChatBudget(':memory:',()=>now);try{assert.deepEqual(db.begin('a','case',1,2),{});assert.equal(db.begin('a','case',1,2).reason,'pending');const result={mode:'local' as const,plan:{speakerId:'kirock' as const,intent:'help' as const,referenceId:null,tone:'calm' as const,interject:false}};db.finish('a',result);assert.deepEqual(db.begin('a','case',1,2).cached,result);assert.equal(db.begin('b','case',1,2).reason,'budget');now+=86400000;assert.deepEqual(db.begin('b','case',1,2),{});now+=86400000;assert.equal(db.begin('c','case',1,2).reason,'budget');}finally{db.close();}
});
test('bounded player input rejects oversized histories/questions and invalid actors',()=>{
 const good={question:'Why?',target:'auto',history:[{speakerId:'s0',text:'hello'}]};assert.equal(validateChatInput(good).question,'Why?');for(const bad of [{...good,question:'a'.repeat(501)},{...good,target:'culprit'},{...good,history:Array(13).fill(good.history[0])},{...good,history:[{speakerId:'s9',text:'hello'}]}])assert.throws(()=>validateChatInput(bad));
});
test('all ten locales supply every chat label and result paths; English remains default',()=>{for(const locale of SUPPORTED_LOCALES)for(const [key,value] of Object.entries(chatCopy(locale)))assert.ok(typeof value==='string'&&value.length>0,`${locale}.${key}`);assert.equal(createCase(sampleSuspects()).locale,'en');});
test('a factual witness never describes its own statement as a conditional',()=>{
 const draft=createCase(sampleSuspects(),{seed:123});const id=draft.statements.find(s=>s.claim.type==='fact_is')!.speakerId;const en=publicSnapshot(draft,'en');assert.match(en.interrogations![id].challenge,/state at that moment/);assert.doesNotMatch(en.interrogations![id].challenge,/A condition is not/);
});
test('addressing a witness by name fixes the recipient before the model sees the question',async()=>{
 const {addressedTarget}=await import('../src/lib/chat/request');const suspects=[{id:'s0' as const,displayName:'Mug'},{id:'s1' as const,displayName:'스탠드'},{id:'s2' as const,displayName:'키보드'}];assert.equal(addressedTarget('키보드, 머그컵이 네 이름을 꺼냈는데 반론 있어?','auto',suspects),'s2');assert.equal(addressedTarget('@ＭＵＧ, defend yourself.','auto',suspects),'s0');assert.equal(addressedTarget('Mug, explain yourself.','s1',suspects),'s1');assert.equal(addressedTarget('Is the mug correct?','auto',suspects),'auto');
});
