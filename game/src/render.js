import { C, W, H } from './config.js';
import { visible } from './sonar.js';

function text(ctx, words, x, y, size = 16, color = C.light, align = 'left') {
  ctx.font = `${size > 28 ? 'bold ' : ''}${size}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(words, x, y);
}
function circle(ctx, x, y, radius) {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
}
function cave(ctx, g) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const time = g.fxTime || 0;
  for (let layer = 0; layer < 2; layer++) {
    ctx.globalAlpha = layer ? 0.24 : 0.1;
    ctx.fillStyle = C.stone;
    for (let i = 0; i < 16; i++) {
      const x = i * 92 - g.p.x * (layer + 1) * 0.012;
      const tip = 120 + ((i * 73 + layer * 47) % 150);
      ctx.beginPath(); ctx.moveTo(x, 82); ctx.lineTo(x + 96, 82); ctx.lineTo(x + 36, tip); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, 682); ctx.lineTo(x + 110, 682); ctx.lineTo(x + 67, 720 - tip); ctx.fill();
    }
  }
  ctx.globalAlpha = 0.25; ctx.strokeStyle = C.stone; ctx.lineWidth = 1;
  for (let i = 0; i < 45; i++) {
    const x = (i * 179) % W, y = 100 + (i * 97) % 560;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 23, y - 8); ctx.lineTo(x + 42, y + 5); ctx.stroke();
  }
  const exposure = (x, y, baseline) => g.mode === 'play'
    ? Math.max(0.035, g.shot && g.s.reveal > 0 ? 0.85 : visible(g.s, g.p, x, y)) : baseline;
  for (const wall of g.lvl.walls) {
    ctx.globalAlpha = exposure(wall.x + wall.w / 2, wall.y + wall.h / 2, 0.9);
    ctx.fillStyle = C.stone; ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = C.muted; ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
    ctx.fillStyle = C.teal;
    for (let i = 0; i < Math.min(7, wall.w / 25); i++) ctx.fillRect(wall.x + 12 + i * 29, wall.y + 3, 3, 2);
  }
  for (const hazard of g.lvl.hazards) {
    ctx.globalAlpha = exposure(hazard.x, hazard.y, 0.9);
    ctx.fillStyle = C.red; ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8, radius = hazard.r * (i % 2 ? 0.55 : 1);
      const x = hazard.x + Math.cos(angle) * radius, y = hazard.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    if (hazard.type === 'current') {
      ctx.strokeStyle = C.red; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(hazard.x, hazard.y, hazard.r + 7 + i * 5, time * 0.3 + i, time * 0.3 + i + 1.7); ctx.stroke();
      }
    }
  }
  for (const shard of g.lvl.shards) {
    if (shard.got) continue;
    ctx.globalAlpha = exposure(shard.x, shard.y, 1);
    const halo = ctx.createRadialGradient(shard.x, shard.y, 0, shard.x, shard.y, 30);
    halo.addColorStop(0, C.amber); halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo; circle(ctx, shard.x, shard.y, 30); ctx.fill();
    ctx.fillStyle = C.amber; ctx.beginPath();
    ctx.moveTo(shard.x, shard.y - 11); ctx.lineTo(shard.x + 7, shard.y);
    ctx.lineTo(shard.x, shard.y + 11); ctx.lineTo(shard.x - 7, shard.y); ctx.closePath(); ctx.fill();
    text(ctx, '+', shard.x + 13, shard.y - 10, 14, C.amber);
  }
  ctx.globalAlpha = 1;
  const gate = g.lvl.exit, open = g.lvl.shards.every(shard => shard.got);
  if (open) {
    const beam = ctx.createLinearGradient(0, 110, 0, gate.y + gate.h);
    beam.addColorStop(0, 'transparent'); beam.addColorStop(1, C.teal);
    ctx.globalAlpha = 0.18; ctx.fillStyle = beam; ctx.fillRect(gate.x + 14, 110, gate.w - 28, gate.y + gate.h - 110);
    ctx.globalAlpha = 1; ctx.shadowColor = C.teal; ctx.shadowBlur = 22;
  }
  ctx.strokeStyle = open ? C.teal : C.muted; ctx.lineWidth = open ? 3 : 1;
  ctx.strokeRect(gate.x, gate.y, gate.w, gate.h); ctx.shadowBlur = 0;
  text(ctx, open ? 'GATE OPEN' : 'SEALED', gate.x + gate.w / 2, gate.y - 14, 13, open ? C.teal : C.muted, 'center');
  for (const ring of [...g.s.trail, ...g.s.rings]) {
    ctx.globalAlpha = ring.alpha ?? ring.a ?? 0.4;
    ctx.strokeStyle = C.teal; ctx.lineWidth = 2; circle(ctx, ring.x, ring.y, ring.r); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(g.p.x, g.p.y, 2, g.p.x, g.p.y, 85);
  glow.addColorStop(0, C.teal); glow.addColorStop(1, 'transparent');
  ctx.globalAlpha = 0.16; ctx.fillStyle = glow; circle(ctx, g.p.x, g.p.y, 85); ctx.fill();
  ctx.globalAlpha = g.p.invincible > 0 ? 0.55 + Math.sin(time * 25) * 0.25 : 1;
  ctx.strokeStyle = C.teal; ctx.lineWidth = 2; circle(ctx, g.p.x, g.p.y, 15); ctx.stroke();
  ctx.fillStyle = C.light; circle(ctx, g.p.x, g.p.y, 6); ctx.fill(); ctx.globalAlpha = 1;
}

export function render(ctx, g) {
  ctx.save();
  cave(ctx, g);
  for (const burst of g.bursts) {
    ctx.globalAlpha = burst.alpha; ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
    circle(ctx, burst.x, burst.y, burst.radius); ctx.stroke(); ctx.fillStyle = C.amber;
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      ctx.fillRect(burst.x + Math.cos(angle) * burst.radius - 2, burst.y + Math.sin(angle) * burst.radius - 2, 4, 4);
    }
  }
  ctx.globalAlpha = 1;
  if (g.hitFlash > 0) {
    const flash = ctx.createRadialGradient(W / 2, H / 2, 150, W / 2, H / 2, 720);
    flash.addColorStop(0, 'transparent'); flash.addColorStop(1, C.red);
    ctx.globalAlpha = g.hitFlash * 2; ctx.fillStyle = flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, 82); ctx.fillRect(0, H - 38, W, 38);
  ctx.fillStyle = C.stone; ctx.fillRect(0, 81, W, 1); ctx.fillRect(0, H - 39, W, 1);
  text(ctx, 'ECHODEEP', 28, 37, 27, C.teal);
  text(ctx, 'THE MEMORY OF LIGHT', 29, 59, 10, C.muted);
  const labels = [['DEPTH', 280], ['ECHO-SHARDS', 410], ['SONAR', 590], ['LIVES', 760], ['TIME', 920], ['SCORE', 1080]];
  for (const [label, x] of labels) text(ctx, label, x, 24, 11, C.muted);
  text(ctx, `0${g.n} / 05`, 280, 55, 23);
  text(ctx, `${g.lvl.shards.filter(shard => shard.got).length} / ${g.lvl.shards.length}`, 410, 55, 23, C.amber);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < g.s.charges ? C.teal : g.s.charges === 0 && Math.sin((g.fxTime || 0) * 6) > 0 ? C.red : C.stone;
    circle(ctx, 598 + i * 25, 46, 6); ctx.fill();
    ctx.fillStyle = i < g.p.lives ? C.light : C.stone; circle(ctx, 767 + i * 23, 46, 5); ctx.fill();
  }
  ctx.fillStyle = C.stone; ctx.fillRect(590, 63, 70, 2);
  ctx.fillStyle = C.teal; ctx.fillRect(590, 63, g.s.cool / 6 * 70, 2);
  const seconds = Math.floor(g.time);
  text(ctx, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, 920, 55, 23);
  text(ctx, String(g.score).padStart(5, '0'), 1080, 55, 23, C.amber);
  text(ctx, 'WASD / ARROWS move, SPACE / CLICK sonar, P pause, R restart, M mute', 24, 705, 12, C.muted);
  text(ctx, g.s.charges === 0 ? 'SONAR RECHARGING' : g.notice || 'Find every shard. Remember the dark. Reach the gate.', 1256, 705, 12, g.s.charges === 0 ? C.red : C.teal, 'right');
  if (g.intro > 0) {
    const names = ['SHALLOW DARK', 'THE SILT', 'HOLLOW CHOIR', 'PRESSURE', 'THE LAST LIGHT'];
    ctx.globalAlpha = Math.min(1, g.intro * 2);
    ctx.fillStyle = C.ink; ctx.fillRect(355, 250, 570, 150);
    text(ctx, `DEPTH 0${g.n}`, 640, 295, 17, C.teal, 'center');
    text(ctx, names[g.n - 1], 640, 350, 38, C.light, 'center'); ctx.globalAlpha = 1;
  }
  if (g.mode === 'win') {
    for (let i = 0; i < 48; i++) {
      ctx.globalAlpha = 0.25 + (i % 4) * 0.12; ctx.fillStyle = i % 3 ? C.teal : C.amber;
      ctx.fillRect((i * 193) % W, 90 + ((i * 73 + (g.fxTime || 0) * 19) % 570), 2, 7);
    }
    ctx.globalAlpha = 1;
  }
  if (g.mode !== 'play') {
    const title = g.mode === 'title', win = g.mode === 'win', pause = g.mode === 'pause';
    ctx.globalAlpha = 0.96; ctx.fillStyle = C.ink; ctx.fillRect(250, 145, 780, 468); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.stone; ctx.lineWidth = 2; ctx.strokeRect(250, 145, 780, 468);
    text(ctx, title ? 'A SONAR EXPLORATION GAME' : 'ECHODEEP · EXPEDITION LOG', 640, 187, 13, C.teal, 'center');
    text(ctx, title ? 'ECHODEEP' : win ? 'LIGHT RETURNS' : pause ? 'PAUSED' : 'SIGNAL LOST', 640, 263, title ? 76 : 57, C.light, 'center');
    text(ctx, title ? 'Trust your echo. Remember the way.' : win ? 'ALL FIVE DEPTHS CLEARED' : pause ? 'Take a breath. The deep can wait.' : 'The cave keeps its secrets. Dive again.', 640, 307, 20, C.muted, 'center');
    if (title) {
      text(ctx, 'Collect every amber shard, then find the glowing gate.', 640, 362, 19, C.amber, 'center');
      text(ctx, '3 sonar charges · recharge every 6 seconds · 3 lives', 640, 397, 16, C.light, 'center');
      text(ctx, 'WASD / arrows to move, SPACE / click to reveal', 640, 426, 16, C.muted, 'center');
    } else {
      text(ctx, `${g.score} POINTS · ${g.total} SHARDS · ${seconds} SECONDS`, 640, 374, 21, C.amber, 'center');
      text(ctx, 'Sonar fades. Your memory carries the light.', 640, 415, 17, C.muted, 'center');
    }
    ctx.fillStyle = C.teal; ctx.fillRect(440, 466, 400, 62);
    text(ctx, title ? 'BEGIN THE DESCENT' : pause ? 'RESUME' : 'PLAY AGAIN', 640, 505, 21, C.ink, 'center');
    text(ctx, title ? 'ENTER / CLICK TO START · 5 DEPTHS TO EXPLORE' : 'ENTER / CLICK · R TO RESTART', 640, 569, 12, C.muted, 'center');
  }
  ctx.restore();
}
