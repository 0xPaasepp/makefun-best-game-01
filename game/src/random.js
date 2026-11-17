export function random(seed=7631){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
