import { CFG } from './config.js';

export function sonar() {
  return { charges: 3, rings: [], cool: 0, reveal: 0, memories: [], trail: [] };
}

export function pulse(s, p) {
  if (s.charges <= 0) return false;
  s.charges -= 1;
  s.rings.push({ x: p.x, y: p.y, r: 5, alpha: 1 });
  s.trail.push({ x: p.x, y: p.y, r: 5, alpha: 0.55 });
  s.memories.push({ x: p.x, y: p.y, r: 0, age: 0 });
  s.reveal = CFG.fade;
  return true;
}

export function visible(s, p, x, y) {
  let strength = Math.max(0, 1 - Math.hypot(x - p.x, y - p.y) / 110);
  for (const memory of s.memories) {
    if (Math.hypot(x - memory.x, y - memory.y) <= memory.r) {
      strength = Math.max(strength, Math.min(1, Math.max(0, (CFG.fade - memory.age) / 0.7)));
    }
  }
  return strength;
}

export function tick(s, dt) {
  if (s.charges < CFG.pulseMax) {
    s.cool += dt;
    if (s.cool >= CFG.pulseRecharge) {
      s.charges += 1;
      s.cool = 0;
    }
  } else s.cool = 0;
  s.reveal = Math.max(0, s.reveal - dt);
  for (const ring of s.rings) { ring.r += 500 * dt; ring.alpha -= 0.7 * dt; }
  for (const wake of s.trail) { wake.r += 250 * dt; wake.alpha -= 0.35 * dt; }
  for (const memory of s.memories) { memory.age += dt; memory.r = Math.min(650, memory.r + 500 * dt); }
  s.rings = s.rings.filter(ring => ring.alpha > 0);
  s.trail = s.trail.filter(wake => wake.alpha > 0);
  s.memories = s.memories.filter(memory => memory.age < CFG.fade);
}
