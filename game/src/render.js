// Grid-aligned canvas renderer. All coordinates are logical 1280 by 720 pixels.
import {GEOMETRY} from './world.js';
const C={bg:'#091320',panel:'#10202e',field:'#0a1a27',border:'#304554',grid:'#142c3a',text:'#e0e9e9',muted:'#91a7b5',mint:'#8cf3d5',gold:'#e7c88b',red:'#f4879a',purple:'#b8a4f4',button:'#24483f'};
const ABILITIES=['Nova Flare','Chain Star','Ward','Comet Dash','Starlens','Overchart'];
const COSTS=[20,15,18,10,12,30];
const RELICS=['Star Chart','Comet Lens','Void Bell','Anchor Chain','Hollow Compass'];
const ENEMIES=['Void Wisp','Rift Crawler','Shade Mote','Hollow Spawn'];
export function createRenderer(canvas){return new Renderer(canvas);}
export class Renderer{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();window.addEventListener('resize',()=>this.resize());}
  resize(){const d=window.devicePixelRatio||1;this.canvas.width=Math.round(window.innerWidth*d);this.canvas.height=Math.round(window.innerHeight*d);this.scale=Math.min(this.canvas.width/1280,this.canvas.height/720);this.ox=(this.canvas.width-1280*this.scale)/2;this.oy=(this.canvas.height-720*this.scale)/2;}
  text(value,x,y,size=14,color=C.text,align='left',serif=false){const c=this.ctx;c.font=`${size}px ${serif?'Georgia, serif':'monospace'}`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(String(value),x,y);}
  box(x,y,w,h,fill=C.panel,stroke=C.border){const c=this.ctx;c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.strokeRect(x+0.5,y+0.5,w-1,h-1);}}
  circle(x,y,r,color,width=1,fill=null){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;if(fill){c.fillStyle=fill;c.fill();}c.stroke();}
  line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  hud(w){
    this.box(20,18,1240,85);this.text('RIFTCHART',38,39,22,C.mint);
    this.text(w.chart===6?'BOSS / HOLLOW STAR':`CHART ${w.chart+1}/6`,245,39,16,C.gold);
    this.text(`SCORE ${String(w.score).padStart(6,'0')}`,440,39,18);
    this.text(`✦ STARDUST ${Math.floor(w.dust)}`,685,39,16,C.gold);
    this.text(`SOUND ${w.sound===false?'OFF':'ON'} ♫`,1100,39,14,C.mint);
    this.text('WASD sail   CLICK anchor / zap   SPACE nova   1–6 abilities   P pause',38,69,13,C.muted);
    this.text('WIN: seal six charts & sever five boss chords.   LOSE: chart integrity reaches zero.',38,89,13,C.gold);
    this.box(996,114,264,484);this.text('THREAT QUEUE',1014,138,18,C.gold);this.text('LIVE CONTACTS / CLICK TO ZAP',1014,161,10,C.muted);
    ENEMIES.forEach((name,i)=>{const count=w.enemies.filter(e=>e.name===name).length;this.text(name,1014,194+i*28,14);this.text(String(count).padStart(2,'0'),1234,194+i*28,16,count?C.red:C.muted,'right');});
    this.line(1014,303,1240,303,C.border);this.text(`NEXT: ${ENEMIES[w.spawnIndex%3]}`,1014,322,13,C.red);this.text(`ARRIVAL IN ${Math.max(0,w.spawnTimer).toFixed(1)}s`,1014,344,12,C.muted);
    this.text('RELICS HELD',1014,379,18,C.gold);RELICS.forEach((name,i)=>{this.text(name,1014,409+i*29,14,w.relics[i]?C.mint:C.muted);this.text(`×${w.relics[i]}`,1232,409+i*29,14,C.gold,'right');});
    this.box(20,610,1240,92);this.text('SKIFF HULL',36,628,12,C.muted);this.meter(150,622,140,w.hull,C.mint);this.text(`${Math.round(w.hull)}%`,298,628,12,C.mint);
    this.text('INTEGRITY',375,628,12,C.muted);this.meter(489,622,140,w.integrity,C.gold);this.text(`${Math.round(w.integrity)}%`,637,628,12,C.gold);
    this.text(`COMBO ×${w.combo.toFixed(1)}`,743,628,18,C.mint);this.text(`GRADE ${w.grade}`,1100,628,22,C.gold);
    ABILITIES.forEach((name,i)=>{const x=35+i*174;this.box(x,647,164,43,w.dust>=COSTS[i]?'#193342':C.panel);this.text(`${i+1} ${name}`,x+8,661,12);this.text(w.cooldowns[i]>0?`${w.cooldowns[i].toFixed(1)}s recharge`:`${COSTS[i]} dust · READY`,x+8,680,11,w.cooldowns[i]>0||w.dust<COSTS[i]?C.red:C.mint);});
  }
  meter(x,y,width,value,color){this.box(x,y,width,10,C.bg);this.ctx.fillStyle=color;this.ctx.fillRect(x+1,y+1,(width-2)*Math.max(0,Math.min(1,value/100)),8);}
  field(w){
    this.box(20,114,960,484,C.field);
    for(let x=60;x<980;x+=48)this.line(x,115,x,558,C.grid);
    for(let y=194;y<558;y+=48)this.line(21,y,979,y,C.grid);
    const {cx,cy,track}=GEOMETRY;
    this.circle(cx,cy,track,C.border);
    for(const r of [24,40,56])this.circle(cx,cy,r,'#35415a');
    this.star(cx,cy,9,C.purple);
    w.stars.forEach((s,i)=>{const next=w.stars[(i+1)%w.stars.length];this.line(s.x,s.y,next.x,next.y,i<w.next-1?C.mint:C.border,i<w.next-1?3:2);});
    w.stars.forEach((s,i)=>{
      const active=i<w.next,color=active?C.mint:i===w.next?C.gold:C.muted;
      this.circle(s.x,s.y,13,color,active?3:2,C.field);if(i===w.next)this.circle(s.x,s.y,19,C.gold,2);
      this.text(i+1,s.x,s.y,12,color,'center');
      // Captions have the same 38px gap from their node, directed outward.
      if(i===0||i===1)this.text(`ANCHOR ${i+1}`,s.x,s.y-38,12,color,'center');
      else if(i===3||i===4)this.text(`ANCHOR ${i+1}`,s.x,s.y+38,12,color,'center');
      else this.text(`ANCHOR ${i+1}`,s.x+(i===2?38:-38),s.y,12,color,i===2?'left':'right');
    });
    for(const e of w.enemies){
      const color=[C.red,C.gold,C.purple,C.red][e.kind]||C.red;
      this.star(e.x,e.y,12,color);this.circle(e.x,e.y,3,color,1,color);
      // Enemy captions point inward in the clear annulus outside the hexagon.
      const right=e.x>=cx;this.text(e.name,e.x+(right?18:-18),e.y,10,color,right?'left':'right');
    }
    const sx=w.ship.x,sy=w.ship.y,c=this.ctx;
    c.beginPath();c.moveTo(sx,sy-12);c.lineTo(sx-9,sy+10);c.lineTo(sx,sy+5);c.lineTo(sx+9,sy+10);c.closePath();c.fillStyle=C.mint;c.fill();
    if(w.ward>0)this.circle(sx,sy,23,C.mint);
    this.text('ANCHOR NEXT',sx,sy-30,10,C.gold,'center');this.text('SKIFF',sx+18,sy+1,10,C.mint);
    for(const e of w.effects)this.circle(e.x,e.y,(0.65-e.life)*50+8,C.mint);
    // Heading is painted in its own opaque row, outside every modal.
    this.box(32,123,280,54,C.field,null);this.text('SECTOR 07 / THE PALE EXPANSE',40,137,10,C.muted);this.text(w.sector,40,160,22,C.gold);
    this.text(`ANCHORS ${w.next}/${w.stars.length}`,874,137,12,C.mint,'right');
    this.box(32,558,936,29,'#152d39');this.text(w.chart===6?'SEVER THE FIVE CHORDS → click each numbered anchor.':'CHART THE RIFT → anchor stars 1–6 in order. Zap threats before they eat your lines.',45,574,12,C.gold);
  }
  star(x,y,r,color){const c=this.ctx;c.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,rr=i%2?r*0.4:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.strokeStyle=color;c.lineWidth=2;c.stroke();}
  modal(w){
    const x=170,y=190,width=660,height=354,cx=500;
    this.box(x,y,width,height,'#0c1b29');
    this.text('✦  THE PALE EXPANSE CARTOGRAPHIC SOCIETY  ✦',cx,216,12,C.gold,'center');
    if(w.mode==='title'){
      this.text('RIFTCHART',cx,266,56,C.mint,'center',true);
      this.text('chart the rifts, seal the void, face the Hollow Star',cx,313,16,C.gold,'center');
      this.text('01  SAIL THE EXPANSE',cx,351,14,C.text,'center');
      this.text('02  CONNECT IN ORDER',cx,379,14,C.text,'center');
      this.text('03  DEFEND YOUR LINES',cx,407,14,C.text,'center');
      this.text('Click glowing numbered stars.',cx,438,12,C.muted,'center');
      this.text('Wisps eat lines; crawlers gnaw integrity.',cx,458,12,C.muted,'center');
      this.box(260,480,480,36,C.button);this.text('ENTER / CLICK — BEGIN EXPEDITION',cx,498,16,C.mint,'center');
    }else if(w.mode==='pause'){
      this.text('PAUSED',cx,288,42,C.mint,'center',true);this.text('P / ENTER — RESUME VOYAGE',cx,403,18,C.gold,'center');
    }else{
      const victory=w.mode==='victory';this.text(victory?'THE VOID IS SEALED':'LOST TO THE VOID',cx,264,38,victory?C.mint:C.red,'center',true);
      if(victory){this.text('Six charts restored. Five chords severed.',cx,304,16,C.gold,'center');this.text('The stars are yours.',cx,327,16,C.gold,'center');}
      else this.text('Chart integrity collapsed. A new expedition awaits.',cx,315,16,C.gold,'center');
      this.text(`FINAL SCORE  ${w.score}`,cx,356,15,C.text,'center');
      this.text(`CHARTS SEALED  ${w.sealed}/6`,cx,384,15,C.text,'center');
      this.text(`CHORDS  ${w.chords}/5`,cx,412,15,C.text,'center');
      this.text(`GRADE ${w.grade}`,cx,440,16,C.gold,'center');
      this.box(260,480,480,36,C.button);this.text('ENTER / CLICK — RESTART VOYAGE',cx,498,16,C.mint,'center');
    }
    this.text('SIX CHARTS  /  FIVE RELICS  /  ONE HOLLOW STAR',cx,531,11,C.muted,'center');
  }
  draw(world,screen){
    const w=world.state||world;if(screen)w.mode=screen;
    const c=this.ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle=C.bg;c.fillRect(0,0,this.canvas.width,this.canvas.height);c.setTransform(this.scale,0,0,this.scale,this.ox,this.oy);
    for(let i=0;i<120;i++){c.fillStyle=i%3?'#283d4e':'#416075';c.fillRect((i*193+37)%1280,(i*83+5)%720,1,1);}
    this.field(w);this.hud(w);if(w.mode!=='play')this.modal(w);
  }
  render(world,screen){this.draw(world,screen);}
}
export function render(ctx,world){if(ctx instanceof Renderer)return ctx.draw(world);const canvas=ctx.canvas||ctx;return new Renderer(canvas).draw(world);}
