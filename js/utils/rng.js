// ========================================
// FILE: js/utils/rng.js
// ========================================
const RNG = (() => {
  let seed = Date.now() % 2147483647;
  
  return {
    seed(v) { 
      seed = v || seed; 
    },
    
    r() { 
      seed = (seed * 48271) % 2147483647; 
      return seed / 2147483647; 
    },
    
    range(min, max) { 
      return min + Math.floor(this.r() * (max - min + 1)); 
    }
  };
})();