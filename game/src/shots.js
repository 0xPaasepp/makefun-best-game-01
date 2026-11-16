import {level} from './levels.js';
export function shot(){return new URLSearchParams(location.search).get('shot')||''}
// Frozen in-engine scenes keep screenshot captures reproducible.
export function configureShot(g){if(!g.shot)return;g.s.rings=[{x:640,y:360,r:275,a:.25},{x:640,y:360,r:440,a:.12}];if(g.shot==='play'||g.shot==='gate'){g.mode='play';g.n=g.shot==='gate'?4:2;g.lvl=level(g.n);g.p.x=640;g.p.y=340;g.s.reveal=2;g.s.rings=[{x:640,y:340,r:240,a:.7},{x:640,y:340,r:120,a:.4}];g.score=1800;g.time=94;if(g.shot==='gate'){g.lvl.shards.forEach(q=>q.got=true);g.p.x=1040;g.p.y=590;g.notice='ALL SHARDS FOUND · ENTER THE GATE'}}if(g.shot==='end'){g.mode='win';g.n=5;g.lvl=level(5);g.lvl.shards.forEach(q=>q.got=true);g.total=29;g.score=12850;g.time=347}}
