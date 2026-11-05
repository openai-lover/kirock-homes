'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createCase, publicSnapshot, resolveCase, type CaseDraft, type Locale, type Suspect, type SuspectId } from '@/lib/game';
import { normalizePhoto, PhotoError, rotateScene, type Scene } from '@/lib/image/normalize';
import PhotoStage, { colors } from './PhotoStage';
import GameIcon from './GameIcon';
import CaseChat from './CaseChat';
import { chatCopy } from '@/lib/chat/copy';
import OpeningSequence from './OpeningSequence';
import StoryComic from './StoryComic';
import CaseInvitation from './CaseInvitation';
import KirockLogo from './KirockLogo';
import { getDetectiveCopy } from '@/lib/i18n/detective';
import { getOpeningCopy } from '@/lib/i18n/opening';
import { getStoryCopy } from '@/lib/i18n/story';
import { validateCandidates } from '@/lib/ai/provider';
import { uiText, type UiKey } from '@/lib/i18n/ui';
import { DEFAULT_LOCALE, LOCALES, isLocale, getDirection } from '@/lib/i18n/locales';
import { sampleNames } from '@/lib/game/content';

type Phase='start'|'casting'|'awakening'|'investigating'|'resolving'|'reveal';
type Snapshot=ReturnType<typeof publicSnapshot>;
type Verdict=ReturnType<typeof resolveCase>;
type Shared=Snapshot & {id:string;locale:Locale;scene:{url:string;width:number;height:number};suspects:Suspect[];expiresAt:string;isOwner:boolean;availableLocales:Locale[]};
const SAMPLE:Scene={dataUrl:'/sample-desk.jpg',width:1100,height:1659};
const ids:SuspectId[]=['s0','s1','s2'];
const sample=(locale:Locale):Suspect[]=>{const names=sampleNames(locale);return [
  {id:'s0',displayName:names[0],sampleName:'cup',kind:'cup',personalityId:'dramatic',face:{x:.661,y:.723,scale:.14,rotation:0}},
  {id:'s1',displayName:names[1],sampleName:'lamp',kind:'lamp',personalityId:'cheerful',face:{x:.312,y:.250,scale:.18,rotation:0}},
  {id:'s2',displayName:names[2],sampleName:'keyboard',kind:'electronics',personalityId:'dry',face:{x:.379,y:.782,scale:.18,rotation:0}},
];};
async function request<T>(url:string,body?:unknown,method?:string,signal?:AbortSignal):Promise<T>{
  const r=await fetch(url,{method:method??(body?'POST':'GET'),headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,cache:'no-store',signal});
  const data=await r.json();if(!r.ok)throw new Error(String(r.status));return data;
}
function chirp(index:number){
  try {const ctx=new AudioContext();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=[420,620,290][index];o.type='sine';g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);o.start();o.stop(ctx.currentTime+.14);o.onended=()=>void ctx.close();}catch{/* Captions always remain available. */}
}
export default function Game({shareId}:{shareId?:string}){
  const appRef=useRef<HTMLElement>(null);
  const [locale,setLocale]=useState<Locale>(DEFAULT_LOCALE);const t=(key:UiKey,values?:Readonly<Record<string,string|number>>)=>uiText(locale,key,values);
  const [openingVisible,setOpeningVisible]=useState(!shareId);
  const [openingReplay,setOpeningReplay]=useState(0);
  const [storyOpen,setStoryOpen]=useState(false);
  const storyOpener=useRef<HTMLButtonElement>(null);
  function closeStory(){setStoryOpen(false);requestAnimationFrame(()=>storyOpener.current?.focus({preventScroll:true}));}
  const sampleStartRef=useRef<HTMLButtonElement>(null);
  const [phase,setPhase]=useState<Phase>('start');const [scene,setScene]=useState<Scene>(SAMPLE);const [suspects,setSuspects]=useState<Suspect[]>(sample(DEFAULT_LOCALE));
  const [draft,setDraft]=useState<CaseDraft>();const [shared,setShared]=useState<Shared>();const [loading,setLoading]=useState(!!shareId);
  const [error,setError]=useState<UiKey|''>('');const [muted,setMuted]=useState(true);const [reduced,setReduced]=useState(false);
  const [awake,setAwake]=useState(0);const [active,setActive]=useState<SuspectId>();const [heard,setHeard]=useState<SuspectId[]>([]);const [selected,setSelected]=useState<SuspectId>();const [result,setResult]=useState<Verdict>();const [resultLocale,setResultLocale]=useState<Locale>();
  const [verdictTranslation,setVerdictTranslation]=useState<{locale:Locale;status:'loading'|'failed'}>();
  const [verdictRetry,setVerdictRetry]=useState(0);const [sharedQueryLocale,setSharedQueryLocale]=useState<Locale>();
  const [questionsAsked,setQuestionsAsked]=useState(0);const [chatSession,setChatSession]=useState(0);const [spoken,setSpoken]=useState<string>();
  const [editId,setEditId]=useState<SuspectId>('s0');const [placed,setPlaced]=useState<SuspectId[]>([]);const [photoBusy,setPhotoBusy]=useState(false);
  const [analysisBusy,setAnalysisBusy]=useState(false);const [analysisAttempts,setAnalysisAttempts]=useState(0);const [analysisMessage,setAnalysisMessage]=useState<UiKey|''>('');const [aiConsent,setAiConsent]=useState(false);
  const [photoExpanded,setPhotoExpanded]=useState(false);const [preview,setPreview]=useState(false);const [consent,setConsent]=useState(false);const [shareBusy,setShareBusy]=useState(false);const [created,setCreated]=useState<{id:string;url:string;expiresAt:string}>();const [copied,setCopied]=useState(false);
  const shareOpener=useRef<HTMLButtonElement>(null);
  const wasPreview=useRef(false);
  const inputRef=useRef<HTMLInputElement>(null);const generation=useRef(0);const playId=useRef<string | undefined>(undefined);const accusationLock=useRef(false);const titleRef=useRef<HTMLHeadingElement>(null);
  const snapshot=useMemo(()=>shared??(draft?publicSnapshot(draft,locale):undefined),[shared,draft,locale]);
  const actors=shared?.suspects??snapshot?.suspects??suspects;
  const caseLocale=shared?.locale??locale;
  useEffect(()=>{
    const viewport=window.visualViewport;
    const fit=()=>{
      // Mobile browsers can keep 100dvh unchanged while their keyboard is open.
      // Pinch zoom must remain free to magnify the existing layout.
      if(viewport&&viewport.scale!==1)return;
      const height=Math.round(viewport?.height??innerHeight),app=appRef.current;
      app?.style.setProperty('--chat-viewport-height',`${height}px`);
      if(app)app.dataset.shortViewport=String(height<600);
    };
    fit();viewport?.addEventListener('resize',fit);window.addEventListener('resize',fit);
    return()=>{viewport?.removeEventListener('resize',fit);window.removeEventListener('resize',fit);};
  },[]);
  useEffect(()=>{
    let preferred: string | null = null;
    try { preferred=localStorage.getItem('kirock:locale'); } catch { /* English remains the first-visit default when storage is unavailable. */ }
    setLocale(isLocale(preferred)?preferred:DEFAULT_LOCALE);
  },[]);
  function chooseLocale(next:Locale){
    setLocale(next);
    try { localStorage.setItem('kirock:locale',next); } catch { /* The choice still applies for this visit. */ }
  }
  useEffect(()=>{setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches);},[]);
  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=getDirection(locale);setSpoken(undefined);},[locale]);
  useEffect(()=>{if(wasPreview.current&&!preview)shareOpener.current?.focus();wasPreview.current=preview;},[preview]);
  useEffect(()=>{
    if(!shareId)return;let cancelled=false;
    request<Shared>(`/api/shared-cases/${shareId}?locale=${locale}`).then(data=>{if(cancelled)return;setShared(data);setSharedQueryLocale(locale);setScene({dataUrl:data.scene.url,width:data.scene.width,height:data.scene.height});setLoading(false);setError('');}).catch(()=>{if(cancelled)return;setLoading(false);setError('This case has expired or was deleted.');});
    return()=>{cancelled=true;};
  },[shareId,locale]);
  useEffect(()=>{if(phase!=='start')titleRef.current?.focus();},[phase]);
  useEffect(()=>{
    if(phase!=='awakening')return;
    const timers:ReturnType<typeof setTimeout>[]=[];
    setAwake(1);setActive(actors[0].id);
    if(!muted)chirp(0);
    [1,2].forEach(i=>timers.push(setTimeout(()=>{setAwake(i+1);setActive(actors[i].id);if(!muted)chirp(i);},i===1?3200:5600)));
    timers.push(setTimeout(()=>{setAwake(3);setActive(undefined);setPhase('investigating');},8500));
    return()=>timers.forEach(clearTimeout);
    // Starting or restarting this sequence is tied only to the phase, never to the solution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[phase]);
  useEffect(()=>{
    // Re-render the immutable verdict in the snapshot's actual language. The same
    // play and accused ID are reused; language changes never create a new turn.
    const verdictLocale=caseLocale;
    if(!result||!shareId||!playId.current||resultLocale===verdictLocale)return;
    let cancelled=false;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8500);
    setVerdictTranslation({locale:verdictLocale,status:'loading'});
    request<Verdict>(`/api/plays/${playId.current}/accuse`,{suspectId:result.accusedId,locale:verdictLocale},undefined,controller.signal).then(verdict=>{
      if(!cancelled){setResult(verdict);setResultLocale(verdictLocale);setVerdictTranslation(undefined);}
    }).catch(()=>{if(!cancelled)setVerdictTranslation({locale:verdictLocale,status:'failed'});}).finally(()=>clearTimeout(timeout));
    return()=>{cancelled=true;controller.abort();clearTimeout(timeout);};
    // Result identity is stable across translated representations of one verdict.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[caseLocale,result?.accusedId,resultLocale,verdictRetry]);
  const reset=()=>{generation.current++;accusationLock.current=false;setDraft(undefined);setHeard([]);setSpoken(undefined);setSelected(undefined);setResult(undefined);setActive(undefined);setAwake(0);setPreview(false);setCreated(undefined);setError('');setAnalysisMessage('');};
  async function begin(isSample=false){
    setError('');generation.current++;
    try{
      if(shareId){
        const stored=sessionStorage.getItem(`play:${shareId}`);
        if(stored)playId.current=stored;else{const p=await request<{playId:string}>(`/api/shared-cases/${shareId}/plays`,{});playId.current=p.playId;sessionStorage.setItem(`play:${shareId}`,p.playId);}
      }else{const list=isSample?sample(locale):suspects;if(isSample){setSuspects(list);setScene(SAMPLE);}setDraft(createCase(list));}
      setHeard([]);setQuestionsAsked(0);setChatSession(n=>n+1);setSpoken(undefined);setSelected(undefined);setResult(undefined);accusationLock.current=false;setPhase('awakening');
    }catch{setError("Could not start this case. Refresh and try again.");}
  }
  async function accuse(){
    if(!selected||!readyToAccuse||accusationLock.current)return;accusationLock.current=true;setPhase('resolving');setActive(undefined);setSpoken(undefined);
    try{const verdictLocale=shared?.locale??locale;const verdict=shareId?await request<Verdict>(`/api/plays/${playId.current}/accuse`,{suspectId:selected,locale:verdictLocale}):resolveCase(draft!,selected,locale);
      await new Promise(r=>setTimeout(r,reduced?0:600));setResult(verdict);setResultLocale(verdictLocale);setPhase('reveal');setActive(verdict.culpritId);
    }catch{accusationLock.current=false;setPhase('investigating');setError("Could not retrieve the verdict. Retry to retrieve the original result.");}
  }
  async function upload(file?:File){
    if(!file)return;setPhotoBusy(true);setError('');
    try{const next=await normalizePhoto(file);reset();setScene(next);setSuspects(ids.map((id,i)=>({id,displayName:t('Object {number}',{number:i+1}),kind:'other',personalityId:['dry','dramatic','sleepy'][i],face:{x:.25+i*.25,y:.5,scale:.16,rotation:0}})));setPlaced([]);setEditId('s0');setAiConsent(false);setAnalysisAttempts(0);setPhase('casting');}
    catch(e){const code=e instanceof PhotoError?e.code:'decode';setError(code==='type'?"Choose JPG, PNG or WebP. Convert HEIC to JPG, or try the sample.":code==='size'?"Choose a photo under 10 MB.":code==='pixels'?"Resize the photo to 24 megapixels or less.":"This photo could not be read. Try another photo or the sample.");}
    finally{setPhotoBusy(false);if(inputRef.current)inputRef.current.value='';}
  }
  function updateActor(id:SuspectId,patch:Partial<Suspect>){generation.current++;setSuspects(ss=>ss.map(s=>{if(s.id!==id)return s;const next={...s,...patch};if('displayName' in patch||'kind' in patch)delete next.sampleName;return next;}));}
  function move(id:SuspectId,x:number,y:number){const s=suspects.find(a=>a.id===id)!;updateActor(id,{face:{...s.face,x,y}});setPlaced(p=>p.includes(id)?p:[...p,id]);}
  async function analyze(){
    if(analysisAttempts>=2)return;setAnalysisAttempts(n=>n+1);
    const stamp=++generation.current;setAnalysisBusy(true);setAnalysisMessage('');
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8500);
    try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({dataUrl:scene.dataUrl,requestId:crypto.randomUUID(),consent:true})});const data=await r.json();if(stamp!==generation.current)return;
      if(r.ok&&data.status==='ready'&&data.candidates?.length>=3){setSuspects(validateCandidates(data).slice(0,3).map((c:{displayName:string;kind:string;face:Suspect['face'];personalityId:string},i:number)=>({id:ids[i],displayName:c.displayName,kind:c.kind,personalityId:c.personalityId,face:c.face})));setPlaced([...ids]);setAnalysisMessage("Check the suggested positions and adjust them.");}
      else setAnalysisMessage("Suggestions are unavailable. Choose three objects directly on the photo.");
    }catch{if(stamp===generation.current)setAnalysisMessage("The response was late or unreadable. Continue with manual selection.");}
    finally{clearTimeout(timer);setAnalysisBusy(false);}
  }
  async function createShare(){
    if(!draft||!consent||shareBusy)return;setShareBusy(true);setError('');
    try{let normalized=scene;if(scene.dataUrl.startsWith('/')){const blob=await(await fetch(scene.dataUrl)).blob();normalized=await normalizePhoto(new File([blob],'sample.jpg',{type:blob.type||'image/jpeg'}));}
      const data=await request<{id:string;url:string;expiresAt:string}>('/api/shared-cases',{draft,scene:normalized,consent:true});setCreated({...data,url:new URL(data.url,location.origin).href});setPreview(false);
    }catch{setError("Could not create the link. Your photo and verdict are still here; try again.");}
    finally{setShareBusy(false);}
  }
  async function removeShare(id:string){try{await request(`/api/shared-cases/${id}`,undefined,'DELETE');setCreated(undefined);setPreview(false);if(shareId){setShared(undefined);setError("Share deleted. The photo and case were removed from the server.");}else setError("The shared photo and case have been deleted.");}catch{setError("Could not delete it. Use the browser that created this link.");}}
  const current=suspects.find(s=>s.id===editId)!;
  const line=spoken??(active?snapshot?.characterLines[active]?.[0]:undefined);
  const visibleVerdict=result&&(shareId?result:resolveCase(draft!,result.accusedId,locale));
  const verdictReady=!shareId||resultLocale===caseLocale;
  const verdictTranslationFailed=verdictTranslation?.locale===caseLocale&&verdictTranslation.status==='failed';
  const verdictTranslationMessage:UiKey=verdictTranslationFailed?'Could not load the verdict in this language. Your accusation is unchanged.':'Loading the verdict in this language…';
  const detectiveCopy=getDetectiveCopy(locale);
  const allHeard=heard.length===3;
  const readyToAccuse=allHeard&&questionsAsked>=1;
  return <><OpeningSequence enabled={!shareId} locale={locale} reduced={reduced} replayKey={openingReplay} onVisibilityChange={setOpeningVisible} focusTarget={sampleStartRef}/>{storyOpen&&<StoryComic locale={locale} reduced={reduced} onClose={closeStory} onSample={()=>{setStoryOpen(false);void begin(true);}} onPhoto={()=>{closeStory();inputRef.current?.click();}}/>}<div className="game-content" data-testid="game-content" inert={openingVisible||storyOpen} aria-hidden={openingVisible||storyOpen||undefined}><div className={`attraction-scene ${phase==='start'?'at-entry':''}`} aria-hidden="true"/><main ref={appRef} className={`${reduced?'app attraction reduced':'app attraction'} ${!['start','casting'].includes(phase)?'chat-app':''}`} data-phase={phase} lang={locale} dir={getDirection(locale)}>
    <header className="topbar">
      <a className="brand" href="/" aria-label={t("Kirock Homes")}><KirockLogo locale={locale} compact/></a>
      <div className="settings"><button onClick={()=>setMuted(v=>!v)} aria-pressed={!muted} aria-label={t(muted?'Turn sound on':'Turn sound off')} title={t("Sound effects")}><GameIcon name={muted?'quiet':'sound'}/><span className="setting-label">{t(muted?'Muted':'Sound on')}</span></button><button onClick={()=>setReduced(v=>!v)} aria-pressed={reduced} aria-label={t("Reduce motion")} title={t("Reduce motion")}><GameIcon name="motion"/><span className="setting-label">{t("Less motion")}</span></button><label className="language-setting"><span className="visually-hidden">{t('Language')}</span><select data-testid="language-select" aria-label={t('Language')} value={locale} onChange={e=>{if(isLocale(e.target.value))chooseLocale(e.target.value);}}>{LOCALES.map(option=><option key={option.code} value={option.code} lang={option.code} dir={option.dir}>{option.name}</option>)}</select></label></div>
    </header>
    <input className="visually-hidden" tabIndex={-1} ref={inputRef} type="file" data-testid="photo-upload" accept="image/jpeg,image/png,image/webp" aria-label={t("Upload photo")} onChange={e=>void upload(e.target.files?.[0])}/>
    {error&&<div className="notice error" role="alert">{t(error)}{shareId&&!shared&&<a href="/">{t("Start a new case")}</a>}</div>}
    {shared&&sharedQueryLocale===locale&&shared.locale!==locale&&<p className="notice" data-testid="legacy-language-notice">{t('This older case is available in {language}; its original testimony is preserved.',{language:LOCALES.find(l=>l.code===shared.locale)?.name??shared.locale})}</p>}
    {loading?<div className="loading">{t("Opening the case file…")}</div>:phase==='start'?<section className={`start-screen ${shareId?'shared-entry':''}`}>
      <div className="intro">
        <KirockLogo locale={locale}/>
        <p className="tagline">{t("Your room. Three suspects. One liar.")}</p>
        <div className="entry-actions">{shareId?<button className="primary" data-testid="shared-start" disabled={!shared} onClick={()=>void begin()}><span className="button-label">{t("Play this case")}</span></button>:<><button ref={sampleStartRef} className="primary" data-testid="sample-start" onClick={()=>void begin(true)}><span className="button-label">{t("Try the sample desk")}</span></button><button className="secondary" disabled={photoBusy} onClick={()=>inputRef.current?.click()}><span className="button-label">{photoBusy?t("Preparing photo…"):t("Make a case with my photo")}</span></button></>}</div>
      </div>
      {shareId?<div className="photo-exhibit"><CaseInvitation key={shareId} locale={locale} src={scene.dataUrl} width={scene.width} height={scene.height} suspects={shared?.suspects??sample(locale)} shared/></div>:<div className="entry-extras">
        <button ref={storyOpener} className="story-trigger" data-testid="story-open" onClick={()=>setStoryOpen(true)}>{getStoryCopy(locale).button}</button>
        <details className="entry-preview" data-testid="preview-disclosure">
          <summary data-testid="preview-toggle">{detectiveCopy.inspect}</summary>
          <div className="photo-exhibit"><CaseInvitation locale={locale} src={scene.dataUrl} width={scene.width} height={scene.height} suspects={sample(locale)} shared={false}/></div>
        </details>
        <button className="opening-replay" data-testid="opening-replay" onClick={()=>setOpeningReplay(value=>value+1)}>{getOpeningCopy(locale).replay}</button>
      </div>}
    </section>:phase==='casting'?<><section className="case-heading"><h1 ref={titleRef} tabIndex={-1}>{t('Who shall we wake up?')}</h1></section><div className="game-layout casting-layout"><section className="scene-column"><PhotoStage src={scene.dataUrl} width={scene.width} height={scene.height} suspects={suspects} awake={0} selected={editId} editing label={t('Your photo with three suspect faces')} onSelect={setEditId} onMove={move} onPlace={(x,y)=>{move(editId,x,y);const next=ids[ids.indexOf(editId)+1];if(next)setEditId(next);}}/><p className="photo-help">{t('Tap the photo to position · Drag a face to move')}<br/>{t('Keyboard: focus a face and use arrow keys')}</p></section><section className="evidence-column"><div className="casting-panel"><p>{t("Choose three objects in turn. Tap where their eyes should go and give them names.")}</p><div className="cast-tabs">{suspects.map((s,i)=><button key={s.id} onClick={()=>setEditId(s.id)} aria-pressed={editId===s.id}><b style={{background:colors[i]}}>{i+1}</b>{s.displayName}{placed.includes(s.id)?' ✓':''}</button>)}</div>
            <label>{t("Object name")}<input maxLength={28} value={current.displayName} onChange={e=>updateActor(editId,{displayName:e.target.value})}/></label>
            <label>{t("Kind")}<select value={current.kind} onChange={e=>updateActor(editId,{kind:e.target.value})}>{['cup','lamp','electronics','book','plant','toy','other'].map((k,i)=><option key={k} value={k}>{t((['Cup','Lighting','Electronics','Books & stationery','Plant','Toy','Other'] as const)[i])}</option>)}</select></label>
            <div className="sliders">{(['x','y','scale','rotation'] as const).map((key,i)=><label key={key}>{t((['Horizontal','Vertical','Face size','Tilt'] as const)[i])}<input type="range" min={key==='rotation'?-30:key==='scale'?.08:.04} max={key==='rotation'?30:key==='scale'?.30:.96} step={key==='rotation'?1:.01} value={current.face[key]} onChange={e=>{updateActor(editId,{face:{...current.face,[key]:Number(e.target.value)}});setPlaced(p=>p.includes(editId)?p:[...p,editId]);}}/></label>)}</div>
            <button className="text-button" onClick={()=>setPlaced(p=>p.includes(editId)?p:[...p,editId])}>{t("Use this position")} ✓</button>
            <div className="casting-tools"><button onClick={async()=>{generation.current++;setScene(await rotateScene(scene));setPlaced([]);setSuspects(ss=>ss.map(s=>({...s,face:{...s.face,x:1-s.face.y,y:s.face.x}})));}}>{t("Rotate photo ↻")}</button><button onClick={()=>inputRef.current?.click()}>{t("Change photo")}</button></div>
            <details className="ai-option"><summary>{t("Get object suggestions (optional)")}</summary><label className="check"><input type="checkbox" checked={aiConsent} onChange={e=>setAiConsent(e.target.checked)}/><span>{t("Send a resized photo to the configured AI provider for object suggestions. Manual selection always works without a key.")}</span></label><button disabled={!aiConsent||analysisBusy||analysisAttempts>=2} onClick={()=>void analyze()}>{analysisBusy?t("Up to 8 seconds · manual selection available"):t("Suggest objects")}</button>{analysisMessage&&<p role="status">{t(analysisMessage)}</p>}{analysisAttempts>=2&&<p>{t("Two suggestions per photo. Continue with manual selection.")}</p>}</details>
            <button className="primary" disabled={placed.length!==3||suspects.some(s=>!s.displayName.trim())||new Set(suspects.map(s=>s.displayName.trim().normalize('NFKC').toLocaleLowerCase())).size!==3} onClick={()=>void begin()}>{t("Wake these three up")}<span>{placed.length}/3</span></button><p className="small-note">{new Set(suspects.map(s=>s.displayName.trim().normalize('NFKC').toLocaleLowerCase())).size!==3?t("Give each object a different name. "):null}{t("Your photo stays in this browser until you share it or request AI suggestions.")}</p>
          </div></section></div></>:snapshot?<div className="room-chat-layout">
      <section className={`chat-scene-column ${photoExpanded?'photo-expanded':''}`} aria-label={t('Scene photograph')} onKeyDown={e=>{if(e.key==='Escape')setPhotoExpanded(false);}}><button className="chat-photo-expand" aria-expanded={photoExpanded} onClick={()=>setPhotoExpanded(v=>!v)}>{photoExpanded?t('Close'):t('Scene photograph')} {photoExpanded?'×':'⤢'}</button><div className="chat-scene-title"><span className="chat-camera-dot"/>{t('Scene photograph')}</div><PhotoStage src={scene.dataUrl} width={scene.width} height={scene.height} suspects={actors} awake={awake} active={active} selected={selected} bubble={phase==='awakening'?line?.split(/[.!?。]/)[0]?.slice(0,48):undefined} result={phase==='reveal'?result:undefined} label={t('Your photo with three suspect faces')} onSelect={id=>{setActive(id);setSpoken(snapshot.characterLines[id][0]);}}/><div className="chat-scene-caption" aria-live="polite"><img src="/art/kirock-logo-small.webp" alt="" width="48" height="48"/><p>{phase==='awakening'?chatCopy(locale).wake:active?actors.find(s=>s.id===active)?.displayName:chatCopy(locale).invite}</p></div></section>
      <div className="chat-pane" inert={photoExpanded}><CaseChat key={chatSession} snapshot={snapshot} draft={draft} shareId={shareId} scene={scene.dataUrl} awake={awake} phase={phase} result={visibleVerdict} verdictReady={verdictReady} verdictMessage={t(verdictTranslationMessage)} selected={selected} ready={readyToAccuse} onContinue={()=>{setAwake(3);setActive(undefined);setPhase('investigating');}} onHeard={setHeard} onSpeak={(id,text)=>{setActive(id);setSpoken(text);if(!muted)chirp(ids.indexOf(id));}} onQuestion={()=>setQuestionsAsked(n=>n+1)} onSelect={setSelected} onAccuse={()=>void accuse()} resultActions={<div className="chat-result-actions">{!shareId&&!created&&<button ref={shareOpener} className="primary" onClick={()=>{setPreview(true);setConsent(false);}}>{t("Send this case to a friend")}<span>↗</span></button>}
              {created&&<div className="shared-link"><label>{t("Your friend’s case link")}<input readOnly value={created.url} onFocus={e=>e.target.select()}/></label><button onClick={async()=>{try{await navigator.clipboard.writeText(created.url);setCopied(true);}catch{setError("Select and copy the link.");}}}>{copied?t("Copied ✓"):t("Copy link")}</button>{typeof navigator!=='undefined'&&!!navigator.share&&<button onClick={()=>void navigator.share({title:t("Kirock Homes · Room of Suspects"),url:created.url}).catch(()=>{})}>{t("Share")}</button>}<p>{t('Expires: {date}',{date:new Date(created.expiresAt).toLocaleDateString(locale)})}</p><button className="text-button" onClick={()=>void removeShare(created.id)}>{t("Delete share")}</button><small>{t("Deletion rights stay in this browser and cannot be recovered on another device.")}</small></div>}
              <a className="secondary button-link" href="/">{t("Make a new case")}</a>
            {verdictTranslationFailed&&<button onClick={()=>setVerdictRetry(n=>n+1)}>{t('Retry translation')}</button>}</div>}/></div>
    </div>:null}

    {shared?.isOwner&&<div className="owner-tools"><span>{t("You created this shared case")}</span><button onClick={()=>void removeShare(shared.id)}>{t("Delete photo and share")}</button></div>}
    <footer className={phase==='start'?'entry-footer':undefined}><span>{t("Kirock Homes")} <span className="footer-dot">✦</span> {t("Room of Suspects")}</span><a href="/credits">{t("Photo credit · Privacy")}</a></footer>
    {preview&&<div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="share-title" className="share-dialog" onKeyDown={e=>{if(e.key==='Escape'){setPreview(false);return;}if(e.key==='Tab'){const els=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href], [tabindex="0"]'));const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><button className="close" aria-label={t("Close")} onClick={()=>setPreview(false)}>×</button><h2 id="share-title">{t("Ready to share this photo?")}</h2><div className="share-photo"><PhotoStage src={scene.dataUrl} width={scene.width} height={scene.height} suspects={actors} awake={3} label={t("The exact photo to be shared")}/></div><p>{t("Anyone with the link can see the photo and case. The link expires after 7 days.")}</p><p className="small-note">{t("Check for addresses, faces and documents. To change this photo, start a new case. Stored photos and cases are cleaned up after expiry. Copies saved by recipients cannot be recalled.")}</p><label className="check"><input autoFocus type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t("I checked the photo and agree to share it through a link.")}</span></label><button className="primary" disabled={!consent||shareBusy} onClick={()=>void createShare()}>{shareBusy?t("Creating link…"):t("Create a link with this photo")}</button><button className="text-button" onClick={()=>setPreview(false)}>{t("Cancel sharing")}</button></section></div>}
  </main></div></>;
}
