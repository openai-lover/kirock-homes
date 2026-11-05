'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { getOpeningCopy } from '@/lib/i18n/opening';
import { getDirection, type Locale } from '@/lib/i18n/locales';
import OpeningLens from './OpeningLens';
import './opening.css';

const SEEN_KEY='kirock:opening-seen:v2';
const PLAY_MS=6400;
type Stage='pending'|'preparing'|'playing'|'still'|'leaving'|'closed';
type Props={enabled:boolean;locale:Locale;reduced:boolean;replayKey:number;onVisibilityChange:(visible:boolean)=>void;focusTarget:RefObject<HTMLButtonElement|null>};

/** Presentation only: asset readiness and visibility never create or alter a case. */
export default function OpeningSequence({enabled,locale,reduced,replayKey,onVisibilityChange,focusTarget}:Props){
 const [stage,setStage]=useState<Stage>(enabled?'pending':'closed');
 const [characterFailed,setCharacterFailed]=useState(false),[sweepReady,setSweepReady]=useState(false),[hidden,setHidden]=useState(false);
 const skipRef=useRef<HTMLButtonElement>(null),returnFocus=useRef<HTMLElement|null>(null),didPlay=useRef(false),finishing=useRef(false),frame=useRef<number|null>(null),remaining=useRef(PLAY_MS);
 const copy=getOpeningCopy(locale),visible=stage!=='closed';
 const close=useCallback(()=>{try{localStorage.setItem(SEEN_KEY,'1');}catch{}setStage('closed');onVisibilityChange(false);if(frame.current!==null)cancelAnimationFrame(frame.current);},[onVisibilityChange]);
 const finish=useCallback((immediate=false)=>{if(finishing.current){if(immediate)close();return;}finishing.current=true;if(immediate)close();else setStage('leaving');},[close]);
 useEffect(()=>{if(stage!=='closed'||!didPlay.current)return;frame.current=requestAnimationFrame(()=>{const target=returnFocus.current?.isConnected?returnFocus.current:focusTarget.current;target?.focus({preventScroll:true});});return()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);};},[stage,focusTarget]);
 useEffect(()=>{
  if(!enabled){setStage('closed');onVisibilityChange(false);return;}
  let seen=false;try{seen=localStorage.getItem(SEEN_KEY)==='1';}catch{}
  const quiet=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(replayKey===0&&(seen||quiet||reduced)){setStage('closed');onVisibilityChange(false);return;}
  if(frame.current!==null)cancelAnimationFrame(frame.current);
  returnFocus.current=replayKey>0&&document.activeElement instanceof HTMLElement?document.activeElement:null;
  didPlay.current=true;finishing.current=false;remaining.current=PLAY_MS;setCharacterFailed(false);setSweepReady(false);
  setStage(quiet||reduced?'still':'preparing');onVisibilityChange(true);
  // Locale/settings changes must not replay a running introduction.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[enabled,replayKey,onVisibilityChange]);
 useEffect(()=>{
  if(stage!=='preparing')return;
  let active=true,done=false;const loaded={photo:false,character:false};
  const prepare=(src:string,key?:keyof typeof loaded)=>new Promise<void>(resolve=>{
   const image=new Image();image.onload=()=>{void image.decode().catch(()=>{}).then(()=>{if(key)loaded[key]=image.naturalWidth>0;resolve();});};image.onerror=()=>resolve();image.src=src;
  });
  const start=()=>{if(!active||done)return;done=true;setSweepReady(loaded.photo);setCharacterFailed(!loaded.character);setStage('playing');};
  // The first frame is a branded poster, including when a resource never arrives.
  const deadline=setTimeout(start,3000);
  const fonts=document.fonts?Promise.allSettled([document.fonts.load('500 80px Cormorant'),document.fonts.load('400 50px "Nanum Myeongjo"')]):Promise.resolve();
  void Promise.allSettled([prepare('/sample-desk.jpg','photo'),prepare('/art/kirock-case-invitation.webp','character'),prepare('/art/attraction-street.webp'),fonts]).then(start);
  return()=>{active=false;clearTimeout(deadline);};
 },[stage]);
 useEffect(()=>{const changed=()=>setHidden(document.hidden);changed();document.addEventListener('visibilitychange',changed);return()=>document.removeEventListener('visibilitychange',changed);},[]);
 useEffect(()=>{
  if(stage!=='playing'||hidden)return;
  const started=performance.now(),timer=setTimeout(()=>finish(),remaining.current);
  return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(performance.now()-started));};
 },[stage,hidden,finish]);
 useEffect(()=>{if(stage!=='leaving')return;const timer=setTimeout(close,500);return()=>clearTimeout(timer);},[stage,close]);
 useEffect(()=>{if(!visible||stage==='pending')return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';skipRef.current?.focus({preventScroll:true});return()=>{document.body.style.overflow=previous;};},[visible,stage==='pending']);
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{if(preference.matches&&visible&&stage!=='pending')finish(true);};preference.addEventListener('change',change);return()=>preference.removeEventListener('change',change);},[finish,visible,stage]);
 useEffect(()=>{if(reduced&&(stage==='preparing'||stage==='playing'||stage==='leaving'))finish(true);},[reduced,stage,finish]);
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
 if(!visible)return null;
 return <section className="opening-sequence attraction-opening" data-testid="opening-sequence" data-state={stage} data-paused={hidden} data-sweep-ready={sweepReady} role="dialog" aria-modal="true" aria-label={copy.label} aria-describedby="opening-line" lang={locale} dir={getDirection(locale)} onKeyDown={event=>{
  if(event.key==='Escape'){event.preventDefault();finish(true);}
  if(event.key==='Tab'){event.preventDefault();skipRef.current?.focus();}
 }}>
  <OpeningLens/>
  <div className="opening-poster" data-testid="opening-poster" aria-hidden="true"><p>{locale==='ko'?'킬록 홈즈':'Kirock Homes'}</p><span>⌕</span></div>
  <div className="opening-composition"><div className="opening-copy"><h1 className="opening-title">{locale==='ko'?'킬록':'Kirock'}<br/>{locale==='ko'?'홈즈':'Homes'}</h1><p className="opening-line" id="opening-line">“{copy.line}”</p></div><div className="opening-arrival" aria-hidden="true">{!characterFailed&&<img data-testid="opening-character" className="opening-character" src="/art/kirock-case-invitation.webp" alt="" width={960} height={960} fetchPriority="high" onError={()=>setCharacterFailed(true)}/>}</div></div>
  <button ref={skipRef} className="opening-enter" data-testid="opening-skip" onClick={()=>finish(true)}><span>{copy.skip}</span></button>
  {stage!=='still'&&<div className="opening-progress" aria-hidden="true"><span/></div>}
 </section>;
}
