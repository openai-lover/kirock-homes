import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash,createHmac} from 'node:crypto';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {setTimeout as delay} from 'node:timers/promises';
const secret='test-only-proxy-secret',port=19110;
function signature(method,path,body,offset=0){const t=String(Math.floor(Date.now()/1000)+offset);return `${t}:${createHmac('sha256',secret).update(`${t}:${method}:${path}:${createHash('sha256').update(body).digest('hex')}`).digest('hex')}`;}
test('Crew backend requires signed requests, bounds work, caches retries, and never needs a paid provider',async()=>{
 const home=mkdtempSync(join(tmpdir(),'kirock-crew-test-'));const data=join(home,'app-data/kirock-homes');mkdirSync(data,{recursive:true});
 const fake=join(home,'fake-kiro');writeFileSync(fake,'#!/bin/sh\nsleep 0.5\nexit 1\n',{mode:0o700});writeFileSync(join(data,'runtime.json'),JSON.stringify({cliPath:fake}));
 const server=spawn(process.execPath,['backend/dist/server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),KIROCREW_HOME:home,KIROCREW_PROXY_SECRET:secret},stdio:'ignore'});
 const req=(path,method='GET',body='',header=signature(method,path,body))=>fetch(`http://127.0.0.1:${port}${path}`,{method,headers:{'x-kirocrew-proxy':header,'content-type':'application/json'},...(method==='POST'?{body}:{})});
 try{
  for(let i=0;i<80;i++){try{if((await req('/health')).ok)break;}catch{}await delay(50);}
  assert.equal((await req('/api/ai-status','GET','','')).status,401);
  assert.equal((await req('/api/ai-status','GET','',signature('GET','/api/ai-status','',-120))).status,401);
  assert.equal((await req('/api/ai-status','GET','',signature('GET','/other',''))).status,401);
  assert.equal((await req('/api/ai-status')).status,200);
  assert.equal((await req('/api/play/')).status,200);
  assert.match(await (await req('/api/static/game.js')).text(),/createElement|react/);
  assert.equal((await req('/api/analyze','POST',JSON.stringify({consent:false}))).status,400);
  assert.equal((await req('/api/analyze','POST',JSON.stringify({consent:true,dataUrl:'bad'}))).status,400);
  const body=JSON.stringify({consent:true,dataUrl:'data:image/jpeg;base64,/9j/'});
  const pending=req('/api/analyze','POST',body);await delay(100);
  assert.equal((await req('/api/analyze','POST',body)).status,429);
  const reply=await pending;assert.equal(reply.status,200);assert.equal((await reply.json()).status,'manual');
  assert.equal((await req('/api/analyze','POST',body)).status,200);
  const db=new DatabaseSync(join(data,'allowance.sqlite'));const day=new Date().toISOString().slice(0,10);
  assert.equal(db.prepare('SELECT n FROM usage WHERE day=?').get(day).n,1);
  db.prepare('UPDATE usage SET n=20 WHERE day=?').run(day);
  assert.equal((await req('/api/analyze','POST',JSON.stringify({consent:true,dataUrl:'data:image/jpeg;base64,/9j/AA=='}))).status,429);db.close();
 }finally{if(server.exitCode===null){server.kill();await new Promise(r=>server.once('exit',r));}rmSync(home,{recursive:true,force:true});}
});
