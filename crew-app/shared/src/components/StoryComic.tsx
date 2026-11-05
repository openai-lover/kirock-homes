'use client';
import { useEffect, useRef, useState } from 'react';
import { getDirection, type Locale } from '@/lib/i18n/locales';
import { uiText } from '@/lib/i18n/ui';
import { chatCopy } from '@/lib/chat/copy';
import { sampleNames } from '@/lib/game/content';
import { STORY_BEATS, STORY_DURATION, storyBeatAt, storyLoopCopy } from '@/lib/i18n/story-loop';
import { Face } from './PhotoStage';
import './story.css';
type Props={locale:Locale;reduced:boolean;onClose:()=>void;onSample:()=>void;onPhoto:()=>void};
const ACTORS=[{x:66.1,y:72.3,w:14},{x:31.2,y:25,w:18},{x:37.9,y:78.2,w:18}];
/** A looping live-photo teaser, isolated from the actual mystery and its answer. */
export default function StoryComic({locale,reduced,onClose,onSample,onPhoto}:Props){
 const copy=storyLoopCopy(locale),actions=chatCopy(locale),names=sampleNames(locale);
 const close=useRef<HTMLButtonElement>(null),elapsed=useRef(0),last=useRef<number|null>(null);
 const [time,setTime]=useState(0),[paused,setPaused]=useState(reduced),[hidden,setHidden]=useState(false),[ready,setReady]=useState(false);
 const beat=storyBeatAt(time),still=paused||reduced||hidden;
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);return()=>{document.body.style.overflow=previous;document.removeEventListener('visibilitychange',visibility);};},[]);
 useEffect(()=>{if(reduced)setPaused(true);},[reduced]);
 useEffect(()=>{last.current=null;if(paused||hidden||!ready)return;const timer=setInterval(()=>{const now=performance.now();if(last.current!==null)elapsed.current=(elapsed.current+now-last.current)%STORY_DURATION;last.current=now;setTime(elapsed.current);},80);return()=>clearInterval(timer);},[paused,hidden,ready]);
 function next(){elapsed.current=STORY_BEATS[(beat+1)%STORY_BEATS.length];last.current=null;setTime(elapsed.current);setPaused(true);}
 const speaker=beat===2?0:beat===3?2:beat===4?1:undefined;
 return <div className={`story-overlay photo-story ${still?'story-still':''} ${reduced?'story-reduced':''}`} data-testid="story-overlay"><section className="story-camera" role="dialog" aria-modal="true" aria-labelledby="story-title" aria-describedby="story-summary" lang={locale} dir={getDirection(locale)} data-testid="story-dialog" data-story-beat={beat} data-paused={paused} onKeyDown={e=>{
  if(e.key==='Escape'){e.preventDefault();onClose();}
  if(e.key==='Tab'){const controls=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}}
 }}>
  <header className="story-camera-top"><h2 id="story-title">{copy.title}</h2><button ref={close} className="story-close" data-testid="story-close" aria-label={uiText(locale,'Close')} onClick={onClose}>×</button></header><p id="story-summary" className="story-sr-only">{copy.summary}</p>
  <div className="story-film" data-testid="story-film" data-beat={beat}><div className="story-photo-plane">
   <img className="story-real-photo" src="/sample-desk.jpg" alt={uiText(locale,'Scene photograph')} width="1100" height="1659" onLoad={()=>setReady(true)} onError={()=>setReady(true)}/><div className="story-photo-shade" aria-hidden="true"/>
   {beat===0&&<div className="story-viewfinder" aria-hidden="true"><i/><i/><i/><i/></div>}
   {beat>0&&ACTORS.map((actor,i)=><div key={i} className={`story-actor ${speaker===i?'story-speaking':''}`} data-testid={`story-face-${i}`} style={{left:`${actor.x}%`,top:`${actor.y}%`,width:`${actor.w}%`}}><Face index={i} talking={speaker===i}/></div>)}
   {speaker!==undefined&&<div key={beat} className={`story-bubble story-bubble-${speaker}`} data-testid="story-bubble"><span>{names[speaker]}</span><p>{copy.lines[beat===2?0:beat===3?1:3]}</p></div>}
   {beat===4&&<div className="story-player-question" data-testid="story-question"><span aria-hidden="true">↗</span>{copy.lines[2]}</div>}
   {beat===5&&<div className="story-handoff"><img src="/art/kirock-logo-small.webp" width={76} height={76} alt="Kirock Homes"/><p>{copy.lines[4]}</p></div>}
   {beat===1&&!still&&<div className="story-flash" aria-hidden="true"/>}
   <div className="story-headline" aria-live={paused?'polite':'off'} aria-atomic="true"><p key={beat}>{copy.headings[beat]}</p></div>
  </div><div className="story-film-controls"><div className="story-playback"><button data-testid="story-pause" onClick={()=>setPaused(!paused)} aria-label={paused?copy.play:copy.pause}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button><button data-testid="story-next" onClick={next}>{beat===5?copy.replay:copy.next}<span aria-hidden="true">{beat===5?'↺':'›'}</span></button></div><div className="story-timeline" aria-hidden="true">{STORY_BEATS.map((_,i)=><span key={i} className={i<=beat?'seen':''}/>)}</div></div></div>
  <footer className="story-camera-bottom"><button className="story-shutter" data-testid="story-sample" onClick={onSample}><span className="shutter-ring" aria-hidden="true"/>{actions.shutter}</button><button className="story-photo" data-testid="story-photo" onClick={onPhoto}>{actions.photo}</button></footer>
 </section></div>;
}
