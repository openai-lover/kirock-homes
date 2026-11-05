/** Explicit opt-in smoke test. Creates only its own disposable fixture cases. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createClient } from '@libsql/client/web';
import { createCase, publicSnapshot, resolveCase, type Suspect } from '../src/lib/game';
import { sanitizeImage } from '../src/lib/server/image';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/locales';

async function main() {
 const base = process.argv[2];
 if (!base || new URL(base).protocol !== 'https:' || process.env.RUN_PRODUCTION_CHECKS !== 'yes') throw new Error('Explicit HTTPS target and RUN_PRODUCTION_CHECKS=yes required');
 const connectionFile = process.env.VERIFY_TURSO_ENV_FILE;
 if (!connectionFile || !process.env.VERIFY_CRON_FILE) throw new Error('Private verification connection paths required');
 const connection = parseEnv(readFileSync(connectionFile, 'utf8'));
 if (!connection.TURSO_DATABASE_URL || !connection.TURSO_AUTH_TOKEN) throw new Error('Incomplete private database settings');
 const db = createClient({url:connection.TURSO_DATABASE_URL,authToken:connection.TURSO_AUTH_TOKEN});
 const passed:string[]=[];const owned:Array<{id:string;cookie:string}>=[];
 const check=(name:string)=>{passed.push(name);console.log(`PASS ${name}`);};
 async function request(path:string,method='GET',body?:unknown,cookie?:string) {
  const response=await fetch(base+path,{method,redirect:'manual',headers:{Origin:base,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(45000)});
  const bytes=Buffer.from(await response.arrayBuffer());let data:any;
  try {data=JSON.parse(bytes.toString());}catch{data=null;}
  return {status:response.status,headers:response.headers,bytes,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
 }
 const suspects:Suspect[]=['Cup','Lamp','Keyboard'].map((displayName,i)=>({id:`s${i}` as Suspect['id'],displayName,kind:'other',personalityId:'dry',face:{x:.2+i*.2,y:.5,scale:.16,rotation:0}}));
 const draft=createCase(suspects,{seed:13});
 const fixture=readFileSync('tests/fixtures/photos/work-desk.jpg');
 const inputUrl=`data:image/jpeg;base64,${fixture.toString('base64')}`;
 const image=await sanitizeImage(inputUrl);
 const body={draft,consent:true,scene:{dataUrl:inputUrl,width:image.width,height:image.height}};
 try {
  const home=await request('/');assert.equal(home.status,200);assert.match(home.bytes.toString(),/Kirock/);check('Unauthenticated public home');
  assert.equal((await request('/api/shared-cases','POST',{...body,consent:false})).status,400);check('Explicit photo publication consent enforced');
  const created=await request('/api/shared-cases','POST',body);assert.equal(created.status,201,JSON.stringify(created.data));assert.ok(created.cookie);assert.match(created.headers.get('set-cookie')!,/HttpOnly/i);assert.match(created.headers.get('set-cookie')!,/Secure/i);
  const id=created.data.id,path=`/api/shared-cases/${id}`,owner=created.cookie!;owned.push({id,cookie:owner});check('Real photo saved to remote storage with secure owner cookie');
  for(const locale of SUPPORTED_LOCALES){
   const result=await request(`${path}?locale=${locale}`);assert.equal(result.status,200);assert.equal(result.data.isOwner,false);assert.deepEqual(result.data.statements,publicSnapshot(draft,locale).statements);assert.deepEqual(result.data.characterLines,publicSnapshot(draft,locale).characterLines);
   for(const key of ['culpritId','confession','proofSteps','roleAssignment','private_json','results']) assert.equal(result.bytes.toString().includes(`"${key}"`),false);
  }check('All ten languages preserve statements and dialogue; public responses omit solution');
  assert.equal((await request(path,'GET',undefined,owner)).data.isOwner,true);
  const firstImage=await request(path+'/image');assert.equal(firstImage.status,200);assert.deepEqual(firstImage.bytes,image.bytes);assert.match(firstImage.headers.get('cache-control')!,/no-store/);check('Shared photograph matches sanitized image exactly and is not publicly cached');
  const one=await request(path+'/plays','POST'),friend=await request(path+'/plays','POST');assert.equal(one.status,201);assert.equal(friend.status,201);assert.notEqual(one.data.playId,friend.data.playId);
  const accuse=`/api/plays/${one.data.playId}/accuse`;
  assert.equal((await request(accuse,'POST',{suspectId:'s0',locale:'en'},friend.cookie)).status,403);
  const race=await Promise.all(['s0','s2'].map(suspectId=>request(accuse,'POST',{suspectId,locale:'en'},one.cookie)));
  for(const r of race)assert.equal(r.status,200,JSON.stringify(r.data));assert.deepEqual(race[0].data,race[1].data);assert.deepEqual(race[0].data,resolveCase(draft,race[0].data.accusedId,'en'));
  assert.deepEqual((await request(accuse,'POST',{suspectId:'s1',locale:'en'},one.cookie)).data,race[0].data);check('Concurrent and repeated accusation keeps first verdict and exact explanation');
  assert.equal((await request(`/api/plays/${friend.data.playId}/accuse`,'POST',{suspectId:'s1',locale:'en'},friend.cookie)).data.accusedId,'s1');check('Friend has independent play and cannot use another player session');
  const chat={shareId:id,locale:'en',question:'Cup, compare your testimony with the lamp.',target:'auto',history:[],aiConsent:true};
  const reply=await request('/api/chat','POST',chat);assert.equal(reply.status,200);assert.equal(reply.data.mode,'local');
  const analyze=await request('/api/analyze','POST',{consent:true,dataUrl:inputUrl});assert.equal(analyze.status,200);assert.equal(analyze.data.status,'manual');check('No AI key: authored chat and manual photo selection remain available');
  assert.equal((await request(path,'DELETE',undefined,friend.cookie)).status,403);assert.equal((await request(path,'DELETE',undefined,owner)).status,200);
  for(const p of [path,path+'/image'])assert.equal((await request(p)).status,404);
  assert.equal((await request(accuse,'POST',{suspectId:'s0',locale:'en'},one.cookie)).status,404);check('Ownership enforced; deletion removes case, photograph and play session');
  const expired=await request('/api/shared-cases','POST',body);assert.equal(expired.status,201);const expiredId=expired.data.id,expiredPath=`/api/shared-cases/${expiredId}`;owned.push({id:expiredId,cookie:expired.cookie!});
  const expiredPlay=await request(expiredPath+'/plays','POST');assert.equal(expiredPlay.status,201);
  await db.execute({sql:'UPDATE shared_cases SET expires_at=? WHERE id=?',args:[Date.now()-1,expiredId]});
  for(const p of [expiredPath,expiredPath+'/image'])assert.equal((await request(p)).status,410);
  assert.equal((await request(expiredPath+'/plays','POST')).status,410);
  assert.equal((await request(`/api/plays/${expiredPlay.data.playId}/accuse`,'POST',{suspectId:'s0',locale:'en'},expiredPlay.cookie)).status,410);
  assert.equal((await request('/api/chat','POST',{...chat,shareId:expiredId})).status,410);check('Expired cloud case immediately refuses photo, case, play, accusation and chat');
  assert.equal((await request('/api/maintenance/cleanup')).status,401);
  const cleanup=await fetch(base+'/api/maintenance/cleanup',{headers:{Authorization:`Bearer ${readFileSync(process.env.VERIFY_CRON_FILE,'utf8').trim()}`},signal:AbortSignal.timeout(45000)});assert.equal(cleanup.status,200);assert.equal((await request(expiredPath)).status,404);
  assert.equal((await db.execute({sql:'SELECT COUNT(*) n FROM play_sessions WHERE share_id=?',args:[expiredId]})).rows[0].n,0);check('Authenticated production cleanup physically removes expired rows');
  writeFileSync('docs/verification/production-api.json',JSON.stringify({verifiedAt:new Date().toISOString(),url:base,passed,failures:0,usesPaidAI:false,fixture:'work-desk.jpg',notes:['Expiry tested by aging only a fixture row; natural seven-day passage and scheduled cron invocation not observed.','Authorized cleanup endpoint invoked directly.']},null,2));
 } finally {
  // Remove only test-created IDs, including a case left behind after a failed assertion.
  for(const item of owned)await db.batch([{sql:'DELETE FROM play_sessions WHERE share_id=?',args:[item.id]},{sql:'DELETE FROM shared_cases WHERE id=?',args:[item.id]}],'write');
  db.close();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
