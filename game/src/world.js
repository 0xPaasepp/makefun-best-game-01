import {ABILITIES, RELICS, ENEMIES, NAMES} from './config.js';
import {random, clamp} from './random.js';
import {burst, updateEffects} from './shots.js';
export const GEOMETRY = {cx:500,cy:356,track:220};
export function createWorld(){
  return {
    mode:'title',time:0,chart:0,sector:NAMES[0],score:0,dust:100,stardust:100,
    combo:1,grade:'C',integrity:100,hull:100,chords:0,sealed:0,
    stars:[[410,200],[590,200],[680,356],[590,512],[410,512],[320,356]].map(([x,y],i)=>({x,y,i,id:i,lit:false,anchored:false,active:false})),
    next:0,transition:0,ship:{x:500,y:400,vx:0,vy:0,angle:0},enemies:[],
    cooldowns:[0,0,0,0,0,0],ward:0,lens:0,dash:0,spawn:3,nextSpawn:3,spawnTimer:3,spawnIndex:0,
    relics:RELICS.map(name=>({name,count:1,toString(){return String(this.count);}})),
    boss:0,particles:[],texts:[],effects:[],lines:[],rand:random(7631),sound:false,shake:0,flash:0,kills:0
  };
}
export function start(w){const sound=w.sound;Object.assign(w,createWorld(),{mode:'play',sound});}
function reward(w,amount){
  w.score+=Math.round(amount*w.combo);w.dust+=5;w.stardust=w.dust;
  w.grade=w.score>=8000?'S':w.score>=4000?'A':w.score>=1500?'B':'C';
}
function anchor(w){
  if(w.transition>0||w.mode!=='play')return;
  const s=w.stars[w.next];if(!s)return;
  s.lit=s.anchored=s.active=true;
  if(w.next>0)w.lines.push({a:w.next-1,b:w.next,x1:w.stars[w.next-1].x,y1:w.stars[w.next-1].y,x2:s.x,y2:s.y});
  burst(w,s.x,s.y,'ANCHORED');reward(w,100);w.next++;w.combo=Math.min(9,w.combo+0.25);
  if(w.chart===6){w.chords++;reward(w,200);if(w.chords===5){w.mode='victory';w.boss=0;}}
  else if(w.next===6){w.sealed++;reward(w,500);w.transition=1.2;}
}
export function click(w,x,y){
  if(w.mode!=='play')return;
  const e=w.enemies.find(e=>Math.hypot(e.x-x,e.y-y)<26);
  if(e){w.enemies=w.enemies.filter(other=>other!==e);w.kills++;reward(w,120);burst(w,e.x,e.y,'DISPELLED');return;}
  const s=w.stars[w.next];if(s&&Math.hypot(s.x-x,s.y-y)<30)anchor(w);
}
export function ability(w,i){
  const a=ABILITIES[i];if(w.mode!=='play'||!a||w.cooldowns[i]>0||w.dust<a.cost)return;
  w.dust-=a.cost;w.stardust=w.dust;w.cooldowns[i]=a.cd;
  if(i===0){for(const e of w.enemies)burst(w,e.x,e.y,'NOVA');w.score+=w.enemies.length*150;w.enemies=[];}
  if(i===1){anchor(w);anchor(w);}
  if(i===2)w.ward=8;
  if(i===3)w.dash=3;
  if(i===4)w.lens=6;
  if(i===5){w.integrity=Math.min(100,w.integrity+25);w.hull=Math.min(100,w.hull+20);w.enemies=[];anchor(w);}
  burst(w,w.ship.x,w.ship.y,a.name.toUpperCase());
}
export function update(w,dt,keys=new Set()){
  if(w.mode!=='play')return;
  w.time+=dt;updateEffects(w,dt);
  for(const name of ['ward','lens','dash','shake','flash'])w[name]=Math.max(0,w[name]-dt);
  w.cooldowns=w.cooldowns.map(c=>Math.max(0,c-dt));
  const held=k=>keys.has?keys.has(k):!!keys[k];
  const dx=Number(held('KeyD')||held('ArrowRight'))-Number(held('KeyA')||held('ArrowLeft'));
  const dy=Number(held('KeyS')||held('ArrowDown'))-Number(held('KeyW')||held('ArrowUp'));
  const length=Math.hypot(dx,dy)||1,speed=w.dash>0?320:155;
  w.ship.vx=dx/length*speed;w.ship.vy=dy/length*speed;
  w.ship.x=clamp(w.ship.x+w.ship.vx*dt,60,940);w.ship.y=clamp(w.ship.y+w.ship.vy*dt,150,552);w.ship.angle=0;
  if(w.transition>0){
    w.transition=Math.max(0,w.transition-dt);
    if(w.transition===0){
      w.chart=Math.min(6,w.chart+1);w.sector=w.chart===6?'THE HOLLOW STAR':NAMES[w.chart];
      w.next=0;w.lines=[];for(const s of w.stars)s.lit=s.anchored=s.active=false;
      if(w.chart===6)w.boss=1;
    }
  }
  w.spawnTimer-=dt;
  if(w.spawnTimer<=0){
    const kind=w.spawnIndex%3,angle=w.rand()*Math.PI*2;
    w.enemies.push({kind,name:ENEMIES[kind],angle,x:500+220*Math.cos(angle),y:356+220*Math.sin(angle),hp:1,life:0});
    w.spawnIndex++;w.spawnTimer=Math.max(1.6,3.6-w.chart*0.25);
  }
  w.spawn=w.nextSpawn=w.spawnTimer;
  for(const e of w.enemies){
    e.angle+=dt*(0.12+e.kind*0.025);e.x=GEOMETRY.cx+GEOMETRY.track*Math.cos(e.angle);e.y=GEOMETRY.cy+GEOMETRY.track*Math.sin(e.angle);e.life+=dt;
    if(w.ward<=0){
      w.integrity-=dt*(e.kind===1?1.8:0.65);w.hull=Math.max(0,w.hull-dt*0.15);
      if(e.kind===0&&e.life>12&&w.next>0&&w.chart<6){
        w.next--;const s=w.stars[w.next];s.lit=s.anchored=s.active=false;w.lines.pop();w.combo=1;e.life=0;
      }
    }
  }
  w.integrity=Math.max(0,w.integrity);if(w.integrity===0)w.mode='loss';
}
