import { NextRequest } from 'next/server';
import { publicSnapshot,validateDraft } from '@/lib/game';
import { isLocale } from '@/lib/i18n/locales';
import { failure,json,readJson,sameOrigin,rateLimit } from '@/lib/server/http';
import { getAppStore } from '@/lib/server/app-store';
import {hash } from '@/lib/server/share-store';
import { ServiceError } from '@/lib/server/errors';
import { validateChatInput,addressedTarget } from '@/lib/chat/request';
import { chatProvider,planWithFallback,type ChatAnswer } from '@/lib/chat/provider.server';
import { fallbackChatPlan } from '@/lib/chat/routing';
import { getChatBudget } from '@/lib/chat/budget.server';
export const runtime='nodejs';
function cap(raw:string|undefined,fallback:number){const n=Number(raw??fallback);return Number.isInteger(n)&&n>=0&&n<=10000?n:fallback;}
export async function POST(request:NextRequest){
 try{
  sameOrigin(request);rateLimit('chat',40);
  const body=await readJson(request,32768);
  let input;try{input=validateChatInput(body);}catch{throw new ServiceError(400,'invalid_chat');}
  if(!isLocale(body.locale))throw new ServiceError(400,'invalid_locale');
  let snapshot;
  if(typeof body.shareId==='string')snapshot=await getAppStore().getPublic(body.shareId,body.locale);
  else {try{snapshot=publicSnapshot(validateDraft(body.draft),body.locale);}catch{throw new ServiceError(400,'invalid_case');}}
  input.target=addressedTarget(input.question,input.target,snapshot.suspects);
  const context={...input,suspects:snapshot.suspects,snapshot};
  // Opt-in sends only text. Offline mode never calls a provider or consumes a budget.
  let provider=body.aiConsent===true&&typeof body.shareId!=='string'?chatProvider():null;
  if(provider?.name==='kiro'&&!['127.0.0.1','localhost','[::1]'].includes(new URL(`http://${request.headers.get('host')}`).hostname))provider=null;
  let answer:ChatAnswer;
  if(!provider)answer=await planWithFallback(null,context);
  else {
   const caseHash=hash(JSON.stringify({statements:snapshot.statements,suspects:snapshot.suspects.map(s=>({id:s.id,displayName:s.displayName,personalityId:s.personalityId}))}));
   const id=hash(JSON.stringify({caseHash,locale:body.locale,...input,provider:provider.name}));
   const budget=getChatBudget();const result=await budget.begin(id,caseHash,cap(process.env.CHAT_DAILY_LIMIT,40),cap(process.env.CHAT_TOTAL_LIMIT,200));
   if(result.cached)answer=result.cached;
   else if(result.reason)answer={plan:fallbackChatPlan(context),mode:'local',reason:result.reason};
   else {answer=await planWithFallback(provider,context,provider.name==='kiro'&&process.env.CHAT_PERFORMANCE==='true'?55000:20000);await budget.finish(id,answer);}
   // Check again after a slow model response. Deleted/expired shares never return cached dialogue.
   if(typeof body.shareId==='string')await getAppStore().getPublic(body.shareId,body.locale);
  }
  return json(answer);
 }catch(error){return failure(error);}
}
