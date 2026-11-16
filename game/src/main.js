import { level } from './levels.js';
import { makePlayer, move } from './player.js';
import { sonar, pulse, tick } from './sonar.js';
import { input } from './input.js';
import { render } from './render.js';
import { ping, chime, thud, mute } from './audio.js';
import { shot, configureShot } from './shots.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const keys = input();
let g;
let shake = 0;
let last = 0;
let fxTime = 0;

function reset(mode = 'title') {
  g = { mode, n: 1, p: makePlayer(), lvl: level(1), s: sonar(), time: 0, score: 0, total: 0,
    notice: '', shot: shot(), intro: mode === 'play' ? 1.5 : 0, bursts: [], hitFlash: 0 };
  window.__game = g;
  window.echo = { get state() { return g; }, start, emit };
}
function start() { reset('play'); }
function emit() { if (pulse(g.s, g.p)) ping(); }
function action() {
  if (g.mode === 'play') emit();
  else if (g.mode === 'pause') g.mode = 'play';
  else start();
}
window.addEventListener('keydown', event => {
  if (event.code === 'Space' || event.key.startsWith('Arrow')) event.preventDefault();
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'enter') action();
  if (key === 'm') mute();
  if (event.code === 'Space' && g.mode === 'play') emit();
  if (key === 'r') start();
  if (key === 'p') {
    if (g.mode === 'play') g.mode = 'pause';
    else if (g.mode === 'pause') g.mode = 'play';
  }
});
window.addEventListener('pointerdown', action);

function frame(now) {
  const dt = Math.min(0.035, Math.max(0, (now - last) / 1000));
  last = now;
  fxTime = g.shot ? 2 : fxTime + dt;
  g.fxTime = fxTime;
  if (g.mode === 'play' && !g.shot) {
    g.time += dt;
    g.intro = Math.max(0, g.intro - dt);
    g.hitFlash = Math.max(0, g.hitFlash - dt);
    tick(g.s, dt);
    if (move(g.p, keys, dt, g.lvl)) {
      thud(); shake = 0.65; g.hitFlash = 0.28;
      g.notice = 'HULL STRUCK · ONE LIGHT LOST';
      if (g.p.lives <= 0) g.mode = 'lose';
    }
    for (const shard of g.lvl.shards) {
      if (shard.got) continue;
      const distance = Math.hypot(shard.x - g.p.x, shard.y - g.p.y);
      if (distance >= 28 && distance < 90) {
        shard.x += (g.p.x - shard.x) * 0.35 * dt;
        shard.y += (g.p.y - shard.y) * 0.35 * dt;
      }
      if (distance < 28) {
        shard.got = true; g.score += 250; g.total += 1;
        g.bursts.push({ x: shard.x, y: shard.y, alpha: 1, radius: 4 });
        chime();
      }
    }
    for (const burst of g.bursts) { burst.radius += 100 * dt; burst.alpha -= 3 * dt; }
    g.bursts = g.bursts.filter(burst => burst.alpha > 0);
    if (g.mode === 'play' && g.lvl.shards.every(shard => shard.got)) {
      g.notice = 'GATE OPEN · FOLLOW THE TEAL LIGHT';
      if (Math.hypot(g.p.x - 1195, g.p.y - 635) < 50) {
        g.score += 1000; chime();
        if (g.n === 5) g.mode = 'win';
        else {
          g.n += 1; g.lvl = level(g.n); g.p.x = 90; g.p.y = 360;
          g.s = sonar(); g.intro = 1.5; g.notice = '';
        }
      }
    }
  }
  shake = Math.max(0, shake - dt);
  ctx.save();
  if (shake > 0) ctx.translate(Math.sin(now * 0.07) * shake * 7, Math.cos(now * 0.09) * shake * 5);
  render(ctx, g);
  ctx.restore();
  document.querySelector('#hud').textContent = `${g.mode} · depth ${g.n} of 5 · shards ${g.lvl.shards.filter(s => s.got).length} of ${g.lvl.shards.length} · lives ${g.p.lives} · sonar ${g.s.charges} · score ${g.score}`;
  requestAnimationFrame(frame);
}
reset();
configureShot(g);
requestAnimationFrame(frame);
