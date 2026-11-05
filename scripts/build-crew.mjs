import {build} from 'esbuild';
import {cpSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
const app=resolve('crew-app');
mkdirSync(app+'/shared/src/app',{recursive:true});mkdirSync(app+'/ui/game',{recursive:true});mkdirSync(app+'/assets',{recursive:true});
for(const part of ['components','lib'])cpSync('src/'+part,app+'/shared/src/'+part,{recursive:true});
cpSync('src/app/globals.css',app+'/shared/src/app/globals.css');cpSync('public',app+'/ui/game',{recursive:true});cpSync('public/art/kirock-logo-mark.png',app+'/assets/icon.png');cpSync('LICENSE',app+'/LICENSE');
await import('../crew-app/build.mjs');
