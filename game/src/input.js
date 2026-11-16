// Keep held movement responsive and release it when the window loses focus.
export function input(){
 const keys={};
 addEventListener('keydown',event=>{keys[event.key.length===1?event.key.toLowerCase():event.key]=true});
 addEventListener('keyup',event=>{keys[event.key.length===1?event.key.toLowerCase():event.key]=false});
 addEventListener('blur',()=>{for(const key of Object.keys(keys))keys[key]=false});
 return keys;
}
