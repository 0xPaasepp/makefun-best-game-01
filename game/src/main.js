import {createWorld,update} from './world.js';
import {render} from './render.js';
import {bindInput} from './input.js';
const canvas=document.querySelector('canvas');
const ctx=canvas.getContext('2d');
const world=createWorld();
const keys=bindInput(canvas,world);
function advance(dt){update(world,world.lens>0?dt*0.45:dt,keys);}
let previous=performance.now();
function frame(now){const dt=Math.min(0.04,(now-previous)/1000);previous=now;advance(dt);render(ctx,world);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
// The capture harness reads live state and advances the same simulation as animation frames.
window.rift={world,step:seconds=>{for(let t=0;t<seconds;t+=1/60)advance(1/60);render(ctx,world);}};
