import {readFileSync,readdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const archive='dist/KIROCK_HOMES_SOURCE.zip';
const names=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
if(names.some(p=>!p.startsWith('kirock-homes/')||p.includes('../')||p.startsWith('/')||/\/(?:node_modules|\.next|\.data|\.git|test-results|playwright-report)\//.test(p)||/\/\.env(?:\.|$)/.test(p)&&!p.endsWith('/.env.example')))throw new Error('Unsafe archive entry');
execFileSync('unzip',['-tq',archive],{stdio:'pipe'});
const directory=mkdtempSync(join(tmpdir(),'kirock-verify-'));execFileSync('unzip',['-q',archive,'-d',directory]);
const root=join(directory,'kirock-homes');const manifest=readFileSync(join(root,'SOURCE_MANIFEST.sha256'),'utf8').trim().split('\n');
for(const line of manifest){const [,expected,path]=line.match(/^([a-f0-9]{64})  (.+)$/)||[];if(!path||path.includes('../'))throw new Error('Invalid manifest');const actual=createHash('sha256').update(readFileSync(join(root,path))).digest('hex');if(actual!==expected)throw new Error(`Mismatch: ${path}`);}
const files=[];function walk(p){for(const item of readdirSync(p,{withFileTypes:true})){if(item.isSymbolicLink())throw new Error('Unexpected symlink');if(item.isDirectory())walk(join(p,item.name));else files.push(join(p,item.name));}}walk(root);
if(files.length!==manifest.length+1)throw new Error('Unmanifested files');
const result={verifiedAt:new Date().toISOString(),archive,bytes:readFileSync(archive).length,sourceFiles:manifest.length,allHashesMatch:true,archiveIntegrity:true,excludedPrivateRuntimeData:true,sha256:createHash('sha256').update(readFileSync(archive)).digest('hex')};writeFileSync('dist/PACKAGE_VERIFICATION.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
