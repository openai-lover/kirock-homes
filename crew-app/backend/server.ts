import { createServer, type IncomingMessage } from 'node:http';
import { createHmac,createHash,timingSafeEqual } from 'node:crypto';
import { readFileSync,existsSync,mkdirSync } from 'node:fs';
import { resolve,join,extname,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { publicSnapshot,validateDraft } from '../shared/src/lib/game/index';
import { isLocale } from '../shared/src/lib/i18n/locales';
import { validateChatInput,addressedTarget } from '../shared/src/lib/chat/request';
import { fallbackChatPlan } from '../shared/src/lib/chat/routing';
import { generatePerformance } from '../shared/src/lib/chat/live-performance.server';
import { KiroVisionProvider } from '../shared/src/lib/ai/kiro-vision.server';
import { analyzeWithFallback } from '../shared/src/lib/ai/provider';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const data=join(process.env.KIROCREW_HOME||join(process.env.HOME||'.','.kiro/crew'),'app-data/kirock-homes');
mkdirSync(data,{recursive:true,mode:0o700});
// Optional operator paths only, never tokens or passwords. Defaults use the user's normal CLI login.
const configPath=join(data,'runtime.json');
if(existsSync(configPath)){
 const config=JSON.parse(readFileSync(configPath,'utf8'));
 if(typeof config.cliPath==='string')process.env.KIRO_CLI_PATH=config.cliPath;
 if(typeof config.kiroHome==='string')process.env.KIRO_HOME=config.kiroHome;
}
const db=new DatabaseSync(join(data,'allowance.sqlite'));
db.exec('CREATE TABLE IF NOT EXISTS usage(day TEXT PRIMARY KEY,n INTEGER); CREATE TABLE IF NOT EXISTS cache(id TEXT PRIMARY KEY,result TEXT,created INTEGER);');
let busy=false;
function reserve(){
 const day=new Date().toISOString().slice(0,10);db.exec('BEGIN IMMEDIATE');
 try{const old=db.prepare('SELECT n FROM usage WHERE day=?').get(day) as {n:number}|undefined;
 if((old?.n||0)>=20)throw new Error('daily_limit');
 db.prepare('INSERT INTO usage VALUES (?,1) ON CONFLICT(day) DO UPDATE SET n=n+1').run(day);db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
}
export function verifyProxy(header:string,method:string,target:string,body:Buffer,secret:string,now=Date.now()){
 const parts=/^(\d+):([a-f0-9]{64})$/.exec(header);if(!secret||!parts||Math.abs(now/1000-Number(parts[1]))>60)return false;
 const digest=createHash('sha256').update(body).digest('hex');const expected=createHmac('sha256',secret).update(`${parts[1]}:${method}:${target}:${digest}`).digest('hex');
 return timingSafeEqual(Buffer.from(expected),Buffer.from(parts[2]));
}
async function bodyOf(req:IncomingMessage){const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1_500_000)throw new Error('too_large');chunks.push(chunk);}return Buffer.concat(chunks);}
const MIME:Record<string,string>={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.gif':'image/gif'};
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kirock Homes · Crew</title><link rel="stylesheet" href="/apps/kirock-homes/api/static/game.css"></head><body><div id="root"></div><script type="module" src="/apps/kirock-homes/api/static/game.js"></script></body></html>';
const server=createServer(async(req,res)=>{
 const send=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 const url=new URL(req.url||'/','http://localhost');const path=url.pathname.replace(/^\/api\/(play\/?|static\/)/,'/$1');
 if(path==='/health')return send(200,{ok:true,app:'kirock-homes'});
 try{
 const bytes=await bodyOf(req);
 if(!verifyProxy(String(req.headers['x-kirocrew-proxy']||''),req.method||'GET',req.url||'/',bytes,process.env.KIROCREW_PROXY_SECRET||''))return send(401,{error:'Open this app through your authenticated Crew dashboard.'});
 if(req.method==='GET'&&path==='/play/'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'self'"});return res.end(html);}
 if(req.method==='GET'&&path.startsWith('/static/')){
  const relative=decodeURIComponent(path.slice(8));const base=join(root,'ui/game');const file=resolve(base,relative);if(!file.startsWith(base+'/')||!existsSync(file))return send(404,{error:'not_found'});
  res.writeHead(200,{'Content-Type':MIME[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});return res.end(readFileSync(file));
 }
 if(req.method==='GET'&&path==='/api/ai-status')return send(200,{vision:'kiro',chat:'kiro',performance:true,ownAccount:true});
 if(req.method!=='POST')return send(404,{error:'not_found'});
 const body=JSON.parse(bytes.toString('utf8'));
 if(path==='/api/chat'&&body.aiConsent!==true){const input=validateChatInput(body);return send(200,{mode:'local',plan:fallbackChatPlan({...input,suspects:publicSnapshot(validateDraft(body.draft),isLocale(body.locale)?body.locale:'en').suspects})});}
 if(path!=='/api/chat'&&path!=='/api/analyze')return send(404,{error:'not_found'});
 if(path==='/api/analyze'&&body.consent!==true)return send(400,{error:'consent_required'});
 const id=createHash('sha256').update(path).update(bytes).digest('hex');
 db.prepare('DELETE FROM cache WHERE created<?').run(Date.now()-3600000);
 const cached=db.prepare('SELECT result FROM cache WHERE id=?').get(id) as {result:string}|undefined;if(cached)return send(200,JSON.parse(cached.result));
 if(busy)return send(429,{error:'One Kiro request is already running. Try again shortly.'});
 let input:ReturnType<typeof validateChatInput>|undefined,snapshot:ReturnType<typeof publicSnapshot>|undefined;
 if(path==='/api/chat'){
  if(!isLocale(body.locale))throw new Error('invalid_locale');
  input=validateChatInput(body);snapshot=publicSnapshot(validateDraft(body.draft),body.locale);input.target=addressedTarget(input.question,input.target,snapshot.suspects);
 }else if(typeof body.dataUrl!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(body.dataUrl)||Buffer.from(body.dataUrl.split(',')[1],'base64').subarray(0,3).toString('hex')!=='ffd8ff')throw new Error('invalid_image');
 reserve();busy=true;
 try{
  let result;
  if(path==='/api/analyze')result=await analyzeWithFallback(new KiroVisionProvider(),body.dataUrl,55000);
  else {const context={...input!,snapshot:snapshot!,suspects:snapshot!.suspects};const plan=fallbackChatPlan(context);
   try{const performance=await generatePerformance(context,AbortSignal.timeout(55000));result={mode:'kiro',plan,performance};}
   catch{result={mode:'local',plan,reason:'unavailable'};}
  }
  db.prepare('INSERT OR REPLACE INTO cache VALUES (?,?,?)').run(id,JSON.stringify(result),Date.now());return send(200,result);
 }finally{busy=false;}
 }catch(e){return send(e instanceof Error&&e.message==='daily_limit'?429:400,{error:e instanceof Error&&e.message==='daily_limit'?'Daily limit reached. Continue with scripted replies.':'Request could not be completed.'});}
});
server.listen(Number(process.env.PORT||9100),'127.0.0.1',()=>console.log('Kirock Homes backend ready (loopback, signed Crew requests only).'));
