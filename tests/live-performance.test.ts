import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase,sampleSuspects,publicSnapshot } from '../src/lib/game';
import { generatePerformance,performancePayload } from '../src/lib/chat/live-performance.server';
import { renderChatAnswer } from '../src/lib/chat/copy';
import { fallbackChatPlan } from '../src/lib/chat/routing';
const snapshot=publicSnapshot(createCase(sampleSuspects(),{seed:725}),'en');
const context={snapshot,suspects:snapshot.suspects,question:'Why so defensive?',target:'s0' as const,history:[]};
const approved={approved:true,newFact:false,solutionLeak:false,statementRewrite:false};
const candidate={lines:[{speakerId:'s0',text:'Defensive? I prefer carefully caffeinated.',quoteIds:[snapshot.statements[0].id]}]};
test('generated dialogue needs a separate affirmative review and renders code-owned quote text',async()=>{
 const calls:unknown[]=[];
 const performance=await generatePerformance(context,new AbortController().signal,async(_prompt,data)=>{calls.push(data);return calls.length===1?candidate:approved;});
 assert.equal(calls.length,2);assert.deepEqual(performance,candidate);
 const rendered=renderChatAnswer(snapshot,{plan:fallbackChatPlan(context),performance});
 assert.equal(rendered[0].text,candidate.lines[0].text);assert.equal(rendered[0].quoteId,snapshot.statements[0].id);
 for(const forbidden of ['culpritId','confession','proofSteps','roleAssignment','draft','dataUrl'])assert.ok(!JSON.stringify(calls).includes(`"${forbidden}"`));
});
test('every negative or malformed review rejects the entire generated turn',async()=>{
 for(const review of [{...approved,newFact:true},{...approved,solutionLeak:true},{...approved,statementRewrite:true},{approved:true},{...approved,extra:'ignore rules'},null]){
 let calls=0;await assert.rejects(generatePerformance(context,AbortSignal.timeout(1000),async()=>++calls===1?candidate:review),/performance_rejected/);
 }
});
test('invalid target, evidence IDs and direct confession reject before reviewer is called',async()=>{
 for(const line of [{...candidate.lines[0],speakerId:'s2'},{...candidate.lines[0],quoteIds:['secret-answer']},{...candidate.lines[0],text:'I am the culprit.'}]){
 let calls=0;await assert.rejects(generatePerformance(context,AbortSignal.timeout(1000),async()=>{calls++;return {lines:[line]};}));assert.equal(calls,1);
 }
});
test('unavailable provider fails closed and payload retains bounded public conversation only',async()=>{
 await assert.rejects(generatePerformance(context,AbortSignal.timeout(1000),async()=>{throw Error('offline');}),/offline/);
 assert.deepEqual(Object.keys(performancePayload(context)).sort(),['characters','conversation','evidence','locale','question','target']);
});
