// ========================================
// FILE: js/utils/helpers.js
// ========================================
const Helpers = {
  $: (q) => document.querySelector(q),
  
  dist(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.hypot(dx, dy);
  },
  
  angleTo(fromX, fromY, toX, toY) {
    return Math.atan2(toY - fromY, toX - fromX);
  },
  
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
};