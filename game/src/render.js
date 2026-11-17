import {W,H,RELICS,ABILITIES,ENEMIES} from './config.js';
const C={ink:'#091322',panel:'#101f30',line:'#294557',mint:'#8af8d4',gold:'#e7c488',muted:'#8ca5b8',white:'#edf4ef',red:'#ff8d93'};
export function render(c,w){
const text=(s,x,y,size=14,color=C.white,font='monospace')=>{c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(s,x,y);};
const box=(x,y,ww,hh,color=C.panel)=>{c.fillStyle=color;c.fillRect(x,y,ww,hh);c.strokeStyle=C.line;c.lineWidth=1;c.strokeRect(x+0.5,y+0.5,ww-1,hh-1);};
const line=(x,y,xx,yy,color=C.line,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const circle=(x,y,r,color,fill=false)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.fillStyle=color;fill?c.fill():c.stroke();};
c.fillStyle=C.ink;c.fillRect(0,0,W,H);
for(let i=0;i<190;i++){const x=(i*191.7)%1280,y=(i*83.3)%720;c.globalAlpha=0.15+(i%5)*0.1;circle(x,y,i%7===0?1.5:0.7,C.mint,true);}c.globalAlpha=1;
box(20,18,1240,85);text('RIFTCHART',38,45,22,C.mint);text(w.chart===6?'BOSS / HOLLOW STAR':`CHART ${w.chart+1}/6`,245,44,16,C.gold);text(`SCORE ${Math.floor(w.score).toString().padStart(6,'0')}`,440,44,18);text(`✦ STARDUST ${Math.floor(w.dust)}`,684,44,16,C.gold);text(w.sound?'SOUND ON ♫':'SOUND OFF',1100,43,14,C.mint);
text('WASD sail   CLICK anchor / zap   SPACE nova   1–6 abilities   P pause',38,72,13,C.muted);text('WIN: seal six charts & sever five boss chords.   LOSE: chart integrity reaches zero.',38,92,13,C.gold);
box(20,114,960,484,'#0a1828');
for(let x=60;x<980;x+=48)line(x,115,x,598,'#132b3b');for(let y=145;y<598;y+=48)line(20,y,980,y,'#132b3b');
for(let r=75;r<370;r+=65)circle(490,350,r,'#193345');line(490,140,490,565);line(80,350,910,350);
text('SECTOR 07 / THE PALE EXPANSE',40,140,11,C.muted);text(w.name,40,166,22,C.gold);text(`ANCHORS ${w.next}/${w.stars.length}`,794,141,12,C.mint);
const glow=c.createRadialGradient(490,345,10,490,345,220);glow.addColorStop(0,w.chart===6?'#63364d':'#253353');glow.addColorStop(1,'#0a182800');c.fillStyle=glow;c.fillRect(230,130,520,430);
c.save();c.translate(490,345);c.rotate(w.time*0.05);for(let i=0;i<9;i++){c.rotate(0.7);c.strokeStyle=i%2?'#513d66':'#354261';c.beginPath();c.ellipse(0,0,60+i*4,22+i*3,0,0,Math.PI*2);c.stroke();}c.restore();
if(w.chart===6){circle(490,345,65,'#e8a5bb');text('HOLLOW',460,343,15,C.red);text('STAR',472,362,15,C.red);}
for(let i=1;i<w.stars.length;i++)line(w.stars[i-1].x,w.stars[i-1].y,w.stars[i].x,w.stars[i].y,'#314354',2);
for(let i=1;i<w.next;i++)line(w.stars[i-1].x,w.stars[i-1].y,w.stars[i].x,w.stars[i].y,C.mint,3);
w.stars.forEach((s,i)=>{if(w.chart===6&&i>=w.next)line(490,345,s.x,s.y,C.red,2);circle(s.x,s.y,i===w.next?19:12,i<w.next?C.mint:i===w.next?C.gold:C.muted);circle(s.x,s.y,5,i<w.next?C.mint:C.white,true);text(String(i+1),s.x+23,s.y+5,16,i===w.next?C.gold:C.muted);if(i===w.next){circle(s.x,s.y,25+Math.sin(w.time*4)*3,C.gold);text('ANCHOR NEXT',s.x-43,s.y-34,11,C.gold);}});
w.enemies.forEach(e=>{const color=[C.red,C.gold,'#bda7ff','#f091bd'][e.type];c.save();c.translate(e.x,e.y);c.rotate(w.time);c.strokeStyle=color;c.lineWidth=2;c.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,r=j%2?8:16;j?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.stroke();c.restore();circle(e.x,e.y,4,color,true);text(ENEMIES[e.type],e.x-35,e.y+30,10,color);});
c.save();c.translate(w.ship.x,w.ship.y);c.shadowColor=C.mint;c.shadowBlur=16;c.fillStyle=C.mint;c.beginPath();c.moveTo(0,-15);c.lineTo(11,12);c.lineTo(0,6);c.lineTo(-11,12);c.closePath();c.fill();c.restore();text('SKIFF',w.ship.x+17,w.ship.y+4,10,C.mint);if(w.ward>0)circle(w.ship.x,w.ship.y,32,C.mint);
for(const p of w.particles){c.globalAlpha=Math.max(0,p.life);circle(p.x,p.y,2,p.color,true);}c.globalAlpha=1;for(const t of w.texts)text(t.label,t.x-35,t.y,17,t.color);
box(996,114,264,484);text('THREAT QUEUE',1014,143,18,C.gold);text('LIVE CONTACTS / CLICK TO ZAP',1014,164,10,C.muted);
ENEMIES.forEach((n,i)=>{const count=w.enemies.filter(e=>e.type===i).length;text(n,1014,198+i*29,14);text(String(count).padStart(2,'0'),1214,198+i*29,16,count?C.red:C.muted);});line(1014,303,1240,303);text(`NEXT: ${w.chart>3?'Shade Mote':'Void Wisp'}`,1014,326,13,C.red);text(`ARRIVAL IN ${w.spawn.toFixed(1)}s`,1014,347,12,C.muted);text('RELICS HELD',1014,384,18,C.gold);RELICS.forEach((r,i)=>{text(r,1014,413+i*29,14,w.relics[i]?C.mint:C.muted);text('×'+w.relics[i],1214,413+i*29,14,C.gold);});
box(32,558,936,29,'#152c3b');text(w.chart===6?'SEVER THE FIVE CHORDS → click each numbered anchor.':`CHART THE RIFT → anchor stars 1–${w.stars.length} in order. Zap threats before they eat your lines.`,45,578,12,C.gold);
box(20,610,1240,92);const meter=(label,x,val,color)=>{text(label,x,631,12,C.muted);box(x+113,621,142,11,'#07111e');c.fillStyle=color;c.fillRect(x+114,622,140*val/100,9);text(Math.ceil(val)+'%',x+262,631,12,color);};meter('SKIFF HULL',36,w.hull,C.mint);meter('INTEGRITY',375,w.integrity,C.gold);text('COMBO ×'+w.combo.toFixed(1),743,633,17,C.mint);text('GRADE '+(w.score>14000?'S':w.score>9000?'A':w.score>4500?'B':w.score>1500?'C':'D'),1100,634,21,C.gold);
ABILITIES.forEach((a,i)=>{const x=35+i*174;box(x,647,164,42,w.cooldowns[i]>0?'#111b29':'#193344');text(`${i+1} ${a.name}`,x+8,665,12,C.white);text(w.cooldowns[i]>0?`${w.cooldowns[i].toFixed(1)}s recharge`:`${a.cost} dust · READY`,x+8,682,10,w.dust<a.cost?C.red:C.mint);});
if(w.mode!=='play'){
c.fillStyle='#050d1bea';c.fillRect(0,104,1280,506);box(190,155,900,390,'#0b1929');text('✦  THE PALE EXPANSE CARTOGRAPHIC SOCIETY  ✦',333,196,14,C.gold);
const title=w.mode==='title'?'RIFTCHART':w.mode==='pause'?'VOYAGE PAUSED':w.mode==='victory'?'THE VOID IS SEALED':'LOST TO THE VOID';text(title,w.mode==='title'?345:270,278,w.mode==='title'?74:48,w.mode==='loss'?C.red:C.mint,'Georgia');
text(w.mode==='title'?'chart the rifts, seal the void, face the Hollow Star':w.mode==='victory'?'Six charts restored. Five chords severed. The stars are yours.':w.mode==='loss'?'Chart integrity collapsed. A new expedition awaits.':'Your chart is safe while the expedition rests.',285,321,17,C.gold);
text(w.mode==='title'?'01  SAIL THE EXPANSE    02  CONNECT IN ORDER    03  DEFEND YOUR LINES':`FINAL SCORE  ${Math.floor(w.score)}     CHARTS SEALED  ${Math.min(w.chart,6)}/6     CHORDS  ${w.chords}/5`,270,370,15);
text(w.mode==='title'?'Click glowing numbered stars. Wisps eat lines; crawlers gnaw integrity.':'WASD sail · click to anchor / zap · 1–6 abilities · SPACE Nova Flare',270,402,14,C.muted);
box(418,435,444,52,'#25483f');text(w.mode==='title'?'ENTER / CLICK — BEGIN EXPEDITION':w.mode==='pause'?'P — RESUME EXPEDITION':'ENTER / CLICK — RESTART VOYAGE',443,468,17,C.mint);text('SIX CHARTS  /  FIVE RELICS  /  ONE HOLLOW STAR',390,521,12,C.muted);
}
}
