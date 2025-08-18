// ========================================
// FILE: js/main.js
// ========================================
let lastTime = 0;

function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) || 16;
  lastTime = timestamp;
  
  if (GameState.state === 'play') {
    GameFlow.update(dt);
  }
  
  if (GameState.state !== 'menu') {
    GameFlow.draw();
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize the game
function init() {
  Renderer.init();
  InputHandler.init();
  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}