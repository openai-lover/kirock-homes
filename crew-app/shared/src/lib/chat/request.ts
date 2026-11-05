import type { ChatActor, ChatHistoryItem } from './routing';
const actors=['kirock','s0','s1','s2'];
export function validateChatInput(body:Record<string,unknown>):{question:string;target:ChatActor|'auto';history:ChatHistoryItem[]}{
 const question=body.question;
 if(typeof question!=='string'||question.trim().length<1||question.length>500||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(question))throw new Error('invalid_question');
 if(typeof body.target!=='string'||!['auto',...actors].includes(body.target))throw new Error('invalid_target');
 if(!Array.isArray(body.history)||body.history.length>12)throw new Error('invalid_history');
 const history=body.history.map(item=>{if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).sort().join(',')!=='speakerId,text'||![...actors,'player'].includes(item.speakerId)||typeof item.text!=='string'||item.text.length>1800)throw new Error('invalid_history');return {speakerId:item.speakerId,text:item.text} as ChatHistoryItem;});
 return {question:question.trim(),target:body.target as ChatActor|'auto',history};
}

/** Addressing “Name, …” or @Name is an explicit recipient, not a model guess. */
export function addressedTarget(question:string,target:ChatActor|'auto',suspects:ReadonlyArray<{id:'s0'|'s1'|'s2';displayName:string}>):ChatActor|'auto'{
 if(target!=='auto')return target;
 const q=question.trim().normalize('NFKC').toLocaleLowerCase();
 const names=[{id:'kirock' as const,displayName:'Kirock'},{id:'kirock' as const,displayName:'킬록'},...suspects].sort((a,b)=>b.displayName.length-a.displayName.length);
 for(const suspect of names){for(const name of [suspect.displayName.normalize('NFKC').toLocaleLowerCase(),suspect.id]){const prefix=q.startsWith('@')?'@'+name:name;if(q.startsWith(prefix)&&/^[\s,，:：!?！？]/u.test(q.slice(prefix.length)))return suspect.id;}}
 return 'auto';
}
