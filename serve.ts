import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const base=resolve('game');
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);const file=resolve(base,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(base+'/')){res.writeHead(403);res.end();return;}const body=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(8080,'127.0.0.1',()=>console.log('RIFTCHART http://127.0.0.1:8080'));
