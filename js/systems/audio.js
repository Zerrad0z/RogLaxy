// ========================================
// FILE: js/systems/audio.js
// ========================================
const AudioSystem = (() => {
  let audioContext;
  
  function ensureContext() {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        console.warn('Audio context not available');
      }
    }
  }
  
  function beep(frequency = 440, duration = 0.07, type = 'square', volume = 0.02) {
    ensureContext();
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }
  
  return {
    cast() { beep(520, 0.05, 'square'); },
    hit() { beep(180, 0.04, 'square', 0.03); },
    kill() { beep(140, 0.07, 'square', 0.04); },
    hurt() { beep(120, 0.08, 'square', 0.05); },
    relic() { beep(660, 0.08, 'square', 0.03); },
    synergy() { beep(800, 0.1, 'square', 0.03); }
  };
})();