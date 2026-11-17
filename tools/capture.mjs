import {chromium} from 'playwright';
import {mkdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('screenshots',{recursive:true});
try{
await page.goto('http://127.0.0.1:8080');
await page.waitForFunction(()=>window.rift);
const mode=()=>page.evaluate(()=>rift.world.mode);
const shot=async name=>page.screenshot({path:'screenshots/'+name,type:'jpeg',quality:87});
const anchor=async()=>{const s=await page.evaluate(()=>rift.world.stars[rift.world.next]);await page.mouse.click(s.x,s.y);};
assert.equal(await mode(),'title');await shot('1-title.jpg');
await page.keyboard.press('Enter');assert.equal(await mode(),'play');
const x=await page.evaluate(()=>rift.world.ship.x);
await page.keyboard.down('KeyD');await page.waitForTimeout(180);await page.keyboard.up('KeyD');
assert.ok(await page.evaluate(()=>rift.world.ship.x)>x);
await page.keyboard.press('KeyP');assert.equal(await mode(),'pause');
const t=await page.evaluate(()=>rift.world.time);await page.waitForTimeout(80);
assert.equal(await page.evaluate(()=>rift.world.time),t);await page.keyboard.press('KeyP');
await page.evaluate(()=>rift.step(7));
const enemy=await page.evaluate(()=>rift.world.enemies[0]);if(enemy)await page.mouse.click(enemy.x,enemy.y);
await page.keyboard.press('Space');assert.ok(await page.evaluate(()=>rift.world.cooldowns[0])>0);
for(let chart=0;chart<7;chart++){
assert.equal(await page.evaluate(()=>rift.world.chart),chart);
if(chart===2){
await page.evaluate(()=>rift.step(6));
await anchor();await anchor();await anchor();
await shot('2-play.jpg');
}
for(let safety=0;safety<30;safety++){
const data=await page.evaluate(()=>({next:rift.world.stars[rift.world.next],transition:rift.world.transition,mode:rift.world.mode}));
if(!data.next||data.transition>0||data.mode==='victory')break;
await page.mouse.click(data.next.x,data.next.y);
}
if(chart<6)await page.evaluate(()=>rift.step(1.7));
}
assert.equal(await mode(),'victory');assert.equal(await page.evaluate(()=>rift.world.chords),5);
await shot('3-victory.jpg');
await page.keyboard.press('Enter');assert.equal(await mode(),'play');assert.equal(await page.evaluate(()=>rift.world.score),0);
for(const key of ['2','3','4','5'])await page.keyboard.press(key);
assert.ok(await page.evaluate(()=>rift.world.lens)>0);
assert.ok(await page.evaluate(()=>rift.world.ward)>0);
await page.evaluate(()=>rift.step(25));
await page.keyboard.press('6');
// Defeat comes from normal enemy damage, without modifying health or game mode.
await page.evaluate(()=>rift.step(240));assert.equal(await mode(),'loss');
await shot('4-game-over.jpg');
await page.keyboard.press('Enter');assert.equal(await mode(),'play');
assert.equal(await page.evaluate(()=>rift.world.integrity),100);
assert.deepEqual(errors,[]);
console.log('PASS: title, movement, zap, abilities, pause/resume, six charts, boss, victory, natural loss, restart; zero console errors.');
for(const name of ['1-title.jpg','2-play.jpg','3-victory.jpg','4-game-over.jpg'])console.log(name,(await stat('screenshots/'+name)).size);
}finally{await browser.close();}
