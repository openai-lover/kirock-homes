'use client';
import { useEffect,useRef,useState } from 'react';
import type { CaseDraft,CaseResolution,PublicSnapshot,SuspectId } from '@/lib/game';
import { chatCopy,chatRules,renderChatAnswer,performanceLabel,type ChatUtterance } from '@/lib/chat/copy';
import { fallbackChatPlan,validateChatPlan,type ChatActor,type ChatHistoryItem,type ChatPlan } from '@/lib/chat/routing';
import type { ChatAnswer } from '@/lib/chat/provider.server';
import { validatePerformance } from '@/lib/chat/performance';
import { addressedTarget } from '@/lib/chat/request';
import { getDirection } from '@/lib/i18n/locales';
import { uiText } from '@/lib/i18n/ui';
import { Face } from './PhotoStage';
import './chat.css';

type Turn={id:string;question:string;target:ChatActor|'auto';plan:ChatPlan;mode:ChatAnswer['mode'];performance?:ChatAnswer['performance']};
type Props={snapshot:PublicSnapshot;draft?:CaseDraft;shareId?:string;scene:string;awake:number;phase:string;result?:CaseResolution;verdictReady:boolean;verdictMessage?:string;selected?:SuspectId;ready:boolean;onContinue:()=>void;onHeard:(ids:SuspectId[])=>void;onSpeak:(id:SuspectId,text:string)=>void;onQuestion:()=>void;onSelect:(id:SuspectId)=>void;onAccuse:()=>void;resultActions:React.ReactNode};
export default function CaseChat(p:Props){
 const locale=p.snapshot.locale,copy=chatCopy(locale),t=(key:Parameters<typeof uiText>[1])=>uiText(locale,key);
 const [step,setStep]=useState(0),[turns,setTurns]=useState<Turn[]>([]),[question,setQuestion]=useState(''),[target,setTarget]=useState<ChatActor|'auto'>('auto');
 const [livePerformance,setLivePerformance]=useState(false);
 useEffect(()=>{fetch('/api/ai-status').then(r=>r.json()).then(s=>setLivePerformance(s.performance===true)).catch(()=>{});},[]);
 const [pending,setPending]=useState<string>(),[ai,setAi]=useState(false),[notes,setNotes]=useState(false),[accusing,setAccusing]=useState(false),[unavailable,setUnavailable]=useState(false);
 const controller=useRef<AbortController|null>(null),busy=useRef(false),seq=useRef(0),log=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),dialog=useRef<HTMLDivElement>(null),accuseButton=useRef<HTMLButtonElement>(null);
 const ready=step>=4,locked=p.phase==='reveal'||p.phase==='resolving';
 const name=(id:ChatActor|'player')=>id==='player'?copy.you:id==='kirock'?'Kirock':p.snapshot.suspects.find(s=>s.id===id)?.displayName??id;
 useEffect(()=>()=>{controller.current?.abort();seq.current++;},[]);
 useEffect(()=>{const element=log.current;if(element)element.scrollTop=element.scrollHeight;},[step,turns,pending,p.awake,p.result]);
 useEffect(()=>{if(accusing)dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();},[accusing]);
 function avatar(id:ChatActor|'player'){
  if(id==='player')return null;
  if(id==='kirock')return <img className="chat-avatar kirock-avatar" src="/art/kirock-logo-small.webp" alt="" width="36" height="36"/>;
  const s=p.snapshot.suspects.find(s=>s.id===id)!;
  return <span className="chat-avatar object-avatar" aria-hidden="true" style={{backgroundImage:`url(${JSON.stringify(p.scene)})`,backgroundPosition:`${s.face.x*100}% ${s.face.y*100}%`}}><Face/></span>;
 }
 function bubble(item:ChatUtterance|{speakerId:'player';text:string},key:string,official=false){
  const quote='quoteId' in item&&item.quoteId?p.snapshot.statements.find(s=>s.id===item.quoteId):undefined;
  const reference='referenceId' in item&&item.referenceId?p.snapshot.statements.find(s=>s.speakerId===item.referenceId):undefined;
  return <article className={`chat-message ${item.speakerId==='player'?'from-player':''} ${official?'is-official':''}`} key={key} data-speaker={item.speakerId}>
   {avatar(item.speakerId)}<div className="chat-message-body"><span className="chat-speaker">{name(item.speakerId)}</span>
    <div className="chat-bubble">{reference&&<div className="chat-reply-reference"><b>{name(reference.speakerId)}</b><span>{reference.text}</span></div>}
     {item.text&&<p>{item.text}</p>}{quote&&<blockquote data-testid={official?`statement-${quote.speakerId}`:undefined}><span>{copy.official}</span><p>{quote.text}</p></blockquote>}
    </div>
   </div>
  </article>;
 }
 function next(){
  if(p.phase==='awakening')p.onContinue();
  const n=Math.min(4,step+1);setStep(n);
  if(n>=2){const revealed=p.snapshot.statements.slice(0,n-1);p.onHeard(revealed.map(s=>s.speakerId));const s=revealed.at(-1)!;p.onSpeak(s.speakerId,s.text);}
  if(n===4)requestAnimationFrame(()=>input.current?.focus({preventScroll:true}));
 }
 function history():ChatHistoryItem[]{
  const evidence=p.snapshot.statements.map(s=>({speakerId:s.speakerId,text:s.text}));
  const replies=turns.flatMap(turn=>[{speakerId:'player' as const,text:turn.question},...renderChatAnswer(p.snapshot,turn).map(line=>({speakerId:line.speakerId,text:[line.text,p.snapshot.statements.find(s=>s.id===line.quoteId)?.text].filter(Boolean).join('\n').slice(0,1800)}))]);
  return [...evidence,...replies].slice(-12);
 }
 async function send(forced?:string){
  const value=(forced??question).trim();if(!value||value.length>500||busy.current||!ready||locked||turns.length>=30||unavailable)return;
  busy.current=true;const stamp=++seq.current;setQuestion('');setPending(value);const context={question:value,target:addressedTarget(value,target,p.snapshot.suspects),suspects:p.snapshot.suspects,history:history()};
  const abort=new AbortController();controller.current=abort;const timer=setTimeout(()=>abort.abort(),livePerformance?60000:22000);
  let answer:ChatAnswer={plan:fallbackChatPlan(context),mode:'local',reason:'unavailable'};
  try{
   const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({...context,suspects:undefined,locale,aiConsent:ai,...(p.shareId?{shareId:p.shareId}:{draft:p.draft})})});
   if(p.shareId&&(response.status===404||response.status===410)){setUnavailable(true);return;}
   if(response.ok){const data=await response.json();if(!['local','kiro','compatible'].includes(data.mode))throw new Error('invalid_reply');answer={plan:validateChatPlan(data.plan,data.mode==='local'?{...context,target:'auto'}:context),mode:data.mode,...(data.performance?{performance:validatePerformance(data.performance,{target:context.target,statementIds:p.snapshot.statements.map(s=>s.id),suspectIds:p.snapshot.suspects.map(s=>s.id)})}:{})};}
  }catch{/* A local authored route always completes without credentials/network. */}
  finally{clearTimeout(timer);if(stamp===seq.current){busy.current=false;setPending(undefined);controller.current=null;}}
  if(stamp!==seq.current)return;
  setTurns(old=>[...old,{id:crypto.randomUUID(),question:value,target,plan:answer.plan,mode:answer.mode,performance:answer.performance}]);
  const spoken=renderChatAnswer(p.snapshot,answer).find(s=>s.speakerId!=='kirock');if(spoken)p.onSpeak(spoken.speakerId as SuspectId,spoken.text);
  p.onQuestion();input.current?.focus({preventScroll:true});
 }
 function offline(){controller.current?.abort();setAi(false);}
 return <section className="case-chat" lang={locale} dir={getDirection(locale)} aria-label={copy.room} data-testid="case-chat">
  <header className="chat-header"><div className="chat-group-icon">{avatar('kirock')}</div><div><h1>{copy.room}</h1><p>{p.snapshot.suspects.map(s=>s.displayName).join(', ')} <span>+ Kirock + {copy.you}</span></p></div><button type="button" className="chat-notes-toggle" aria-expanded={notes} onClick={()=>setNotes(!notes)} data-testid="chat-notes">{copy.notes}<b>{Math.max(0,step-1)}/3</b></button></header>
  {notes&&<aside className="chat-notes"><strong>{p.snapshot.title}</strong><p>{chatRules(locale)}</p>{p.snapshot.statements.slice(0,Math.max(0,step-1)).map(s=><blockquote key={s.id}><b>{name(s.speakerId)}</b><p>{s.text}</p></blockquote>)}<button onClick={()=>setNotes(false)}>{t('Close')}</button></aside>}
  <div className="chat-log" ref={log} role="log" aria-live="polite" aria-relevant="additions" aria-label={copy.room} data-testid="chat-log">
   <div className="chat-date">{p.snapshot.title}</div>
   {bubble({speakerId:'kirock',text:copy.welcome},'welcome')}
   {p.snapshot.suspects.slice(0,p.awake).map(s=>bubble({speakerId:s.id,text:p.snapshot.characterLines[s.id][0]},`wake-${s.id}`))}
   {step>=1&&<>{bubble({speakerId:'kirock',text:p.snapshot.context},'context')}{bubble({speakerId:'kirock',text:chatRules(locale)},'rules')}</>}
   {p.snapshot.statements.slice(0,Math.max(0,step-1)).map(s=>bubble({speakerId:s.speakerId,text:'',quoteId:s.id},s.id,true))}
   {ready&&bubble({speakerId:'kirock',text:copy.ask},'invite')}
   {turns.map(turn=><div className="chat-turn" key={turn.id}>{bubble({speakerId:'player',text:turn.question},`q-${turn.id}`)}{renderChatAnswer(p.snapshot,turn).map((reply,i)=>bubble(reply,`${turn.id}-${i}`))}<span className="chat-mode" data-testid="chat-reply-mode">{turn.performance?performanceLabel(locale):turn.mode==='local'?copy.local:turn.mode==='kiro'?copy.live:'AI'}</span></div>)}
   {pending&&<>{bubble({speakerId:'player',text:pending},'pending-question')}<div className="chat-typing" role="status"><span aria-hidden="true">•••</span> {copy.typing}<button onClick={offline}>{copy.continueOffline}</button></div></>}
   {unavailable&&<p role="alert">{t('This case has expired or was deleted.')}</p>}
   {turns.length>=30&&<p role="status">{copy.limit}</p>}
   {p.result&&<div className="chat-resolution" data-testid="chat-resolution"><span className="chat-case-seal" aria-hidden="true">✓</span><h2>{t(p.result.correct?'You got it!':'An innocent object!')}</h2><h3>{uiText(locale,'The culprit is {name}.',{name:name(p.result.culpritId)})}</h3>{p.verdictReady?<>{bubble({speakerId:p.result.culpritId,text:p.result.confession},'confession')}<ol className="chat-proof" data-testid="verdict-proof">{p.result.proofSteps.map((text,i)=><li key={i}>{text}</li>)}</ol></>:<p role="status">{p.verdictMessage??t('Loading the verdict in this language…')}</p>}{p.resultActions}</div>}
  </div>
  {!ready?<div className="chat-next"><button className="chat-primary" onClick={next} data-testid="chat-continue">{p.phase==='awakening'?copy.invite:copy.next}<span aria-hidden="true">↓</span></button></div>:!locked&&<div className="chat-composer">
   {turns.length===0&&<div className="chat-suggestions">{(['compare','defend'] as const).map(k=><button key={k} onClick={()=>void send(copy[k])} disabled={!!pending||unavailable}>{copy[k]}</button>)}</div>}
   <form onSubmit={e=>{e.preventDefault();void send();}}>
    <label className="chat-target"><span className="visually-hidden">{copy.everyone}</span><select aria-label={copy.everyone} value={target} onChange={e=>setTarget(e.target.value as ChatActor|'auto')}><option value="auto">@ {copy.everyone}</option><option value="kirock">@ Kirock</option>{p.snapshot.suspects.map(s=><option value={s.id} key={s.id}>@ {s.displayName}</option>)}</select></label>
    <div className="chat-input-row"><textarea ref={input} value={question} onChange={e=>setQuestion(e.target.value)} placeholder={copy.placeholder} aria-label={copy.placeholder} maxLength={500} rows={1} disabled={!!pending||unavailable||turns.length>=30} data-testid="chat-input" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/><button type="submit" className="chat-send" disabled={!question.trim()||!!pending||unavailable||turns.length>=30} aria-label={copy.send}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></svg></button></div>
   </form>
   <div className="chat-bottom"><details className="chat-ai"><summary>{livePerformance&&!ai?copy.consent:ai?'Kiro / AI':copy.local}</summary><label><input type="checkbox" checked={ai} onChange={e=>setAi(e.target.checked)} disabled={!!pending}/>{copy.consent}</label><p>{livePerformance?(locale==='ko'?'내 Kiro로 질문과 최근 대화를 보내 반응을 생성·검사합니다. 공식 증언은 그대로 유지되며 Kiro 사용량이 차감됩니다.':'Your Kiro generates and reviews reactions using your question and recent chat. Official evidence stays fixed. This uses your Kiro allowance.'):copy.consentDetail}</p></details><button ref={accuseButton} className="chat-accuse" disabled={!p.ready||!!pending||unavailable} onClick={()=>setAccusing(true)} data-testid="open-accusation">{copy.accuse}</button></div>
  </div>}
  {accusing&&!locked&&<div className="chat-accusation-overlay"><div className="chat-accusation-dialog" role="dialog" aria-modal="true" aria-label={copy.accuse} ref={dialog} onKeyDown={e=>{if(e.key==='Escape'){setAccusing(false);accuseButton.current?.focus();}if(e.key==='Tab'){const bs=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));if(e.shiftKey&&document.activeElement===bs[0]){e.preventDefault();bs.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===bs.at(-1)){e.preventDefault();bs[0]?.focus();}}}}><h2>{copy.accuse}</h2><p>{copy.locked}</p><div className="chat-suspect-choices">{p.snapshot.suspects.map(s=><button key={s.id} onClick={()=>p.onSelect(s.id)} aria-pressed={p.selected===s.id} data-testid={`choose-${s.id}`}>{avatar(s.id)}{s.displayName}</button>)}</div><button className="chat-primary" disabled={!p.selected} onClick={()=>{setAccusing(false);p.onAccuse();}} data-testid="accuse">{copy.confirm}</button><button className="chat-cancel" onClick={()=>{setAccusing(false);accuseButton.current?.focus();}}>{copy.back}</button></div></div>}
 </section>;
}
