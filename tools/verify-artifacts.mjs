import {readdir,readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(root){let all=[];for(const f of await readdir(root,{withFileTypes:true})){const p=root+'/'+f.name;if(f.isDirectory())all.push(...await walk(p));else all.push({path:p,bytes:(await stat(p)).size});}return all;}
const files=await walk('game');const bytes=files.reduce((s,f)=>s+f.bytes,0);if(files.length>993||bytes>50331648)throw Error('Game exceeds caps');
for(const f of files){const text=await readFile(f.path,'utf8');if(/https?:|(?:src|href)\s*=\s*["']\/\//.test(text))throw Error('Network reference '+f.path);}
const a=await readFile('out1/dossier.json'),b=await readFile('out2/dossier.json');if(!a.equals(b))throw Error('Dossiers differ');
console.log(JSON.stringify({files,gameFiles:files.length,gameBytes:bytes,dossierBytes:a.length,dossierSHA256:createHash('sha256').update(a).digest('hex')},null,2));
