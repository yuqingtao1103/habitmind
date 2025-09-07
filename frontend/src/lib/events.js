const map = new Map();
export function on(name, cb){ const set = map.get(name)||new Set(); set.add(cb); map.set(name,set); return ()=>off(name,cb) }
export function off(name, cb){ const set = map.get(name); if(!set) return; set.delete(cb) }
export function emit(name, payload){ const set = map.get(name); if(!set) return; set.forEach(fn=>{ try{fn(payload)}catch{} }) }
