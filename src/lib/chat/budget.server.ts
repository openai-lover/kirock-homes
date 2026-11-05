import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,chmodSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import type { ChatAnswer } from './provider.server';
/** Stores only hashes and bounded plans, never player text/photos. */
export class ChatBudget {
 private db:DatabaseSync;
 constructor(path:string,private now:()=>number=Date.now){if(path!==':memory:')mkdirSync(dirname(resolve(path)),{recursive:true,mode:0o700});this.db=new DatabaseSync(path);if(path!==':memory:')chmodSync(path,0o600);this.db.exec('PRAGMA busy_timeout=5000; PRAGMA secure_delete=ON; CREATE TABLE IF NOT EXISTS chat_cache(id TEXT PRIMARY KEY, case_hash TEXT, answer TEXT, expires INTEGER); CREATE TABLE IF NOT EXISTS chat_budget(period TEXT PRIMARY KEY,used INTEGER);');}
 begin(id:string,caseHash:string,daily:number,total:number):{cached?:ChatAnswer;reason?:'budget'|'pending'}{
  this.db.exec('BEGIN IMMEDIATE');try{
   this.db.prepare('DELETE FROM chat_cache WHERE expires<=?').run(this.now());
   const old=this.db.prepare('SELECT answer FROM chat_cache WHERE id=?').get(id) as {answer:string|null}|undefined;
   if(old){this.db.exec('COMMIT');return old.answer?{cached:JSON.parse(old.answer)}:{reason:'pending'};}
   const count=this.db.prepare('SELECT COUNT(*) n FROM chat_cache WHERE case_hash=?').get(caseHash) as {n:number};
   if(count.n>=24){this.db.exec('ROLLBACK');return {reason:'budget'};}
   const periods:[[string,number],[string,number]]=[[new Date(this.now()).toISOString().slice(0,10),daily],['total',total]];
   for(const [period,limit] of periods){const row=this.db.prepare('SELECT used FROM chat_budget WHERE period=?').get(period) as {used:number}|undefined;if((row?.used??0)>=limit){this.db.exec('ROLLBACK');return {reason:'budget'};}}
   for(const [period] of periods)this.db.prepare('INSERT INTO chat_budget VALUES (?,1) ON CONFLICT(period) DO UPDATE SET used=used+1').run(period);
   this.db.prepare('INSERT INTO chat_cache VALUES (?,?,NULL,?)').run(id,caseHash,this.now()+3600000);this.db.exec('COMMIT');return {};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 finish(id:string,answer:ChatAnswer){this.db.prepare('UPDATE chat_cache SET answer=? WHERE id=?').run(JSON.stringify(answer),id);}
 close(){this.db.close();}
}
const globalChat=globalThis as typeof globalThis&{__chatBudget?:ChatBudget};
export function getChatBudget(){return globalChat.__chatBudget??=new ChatBudget(process.env.CHAT_DB_PATH||resolve('.data/chat.sqlite'));}
