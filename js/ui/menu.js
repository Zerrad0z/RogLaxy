// ========================================
// FILE: js/ui/menu.js
// ========================================
const UI = {
  showStatusMessage(msg) {
    const el = Helpers.$('#statusMessage');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
    }, 2000);
  },
  
  hideAllScreens() {
    Helpers.$('#mainMenu').classList.add('hidden');
    Helpers.$('#gameContainer').classList.add('hidden');
    Helpers.$('#gameGuide').classList.add('hidden');
    Helpers.$('#draft').classList.add('hidden');
    Helpers.$('#relicDraft').classList.add('hidden');
    Helpers.$('#gameOver').classList.add('hidden');
    Helpers.$('#victoryMessage').classList.add('hidden');
    Helpers.$('#bossBar').style.display = 'none';
  },
  
  showGameScreen() {
    this.hideAllScreens();
    Helpers.$('#gameContainer').classList.remove('hidden');
  },
  
  showMainMenu() {
    this.hideAllScreens();
    Helpers.$('#mainMenu').classList.remove('hidden');
  },
  
  showGameGuide() {
    this.hideAllScreens();
    Helpers.$('#gameGuide').classList.remove('hidden');
  },
  
  showGameOver(victory) {
    GameState.state = 'over';
    Helpers.$('#gameOver').classList.remove('hidden');
    Helpers.$('#draft').classList.add('hidden');
    Helpers.$('#relicDraft').classList.add('hidden');
    
    const statsText = (victory ? 'Victory! ' : 'Defeat. ') + 
      `Rooms cleared: ${GameState.room - 1}/${GameState.maxRooms} · ` +
      `Kills: ${GameState.kills} · Relics: ${GameState.relics.length}`;
    
    Helpers.$('#finalStats').textContent = statsText;
    Helpers.$('#bossBar').style.display = 'none';
  },
  
  showVictory() {
    console.log('🎉 showVictory() called!');
    GameState.state = 'victory';
    
    // Hide other screens but keep game container visible for victory message
    Helpers.$('#mainMenu').classList.add('hidden');
    Helpers.$('#gameGuide').classList.add('hidden');
    Helpers.$('#draft').classList.add('hidden');
    Helpers.$('#relicDraft').classList.add('hidden');
    Helpers.$('#gameOver').classList.add('hidden');
    
    // Make sure game container is visible
    Helpers.$('#gameContainer').classList.remove('hidden');
    
    const victoryElement = Helpers.$('#victoryMessage');
    if (victoryElement) {
      victoryElement.classList.remove('hidden');
      console.log('🎉 Victory element found and hidden class removed');
    } else {
      console.error('❌ Victory element not found!');
    }
    
    Helpers.$('#bossBar').style.display = 'none';
    
    // Start countdown and fireworks
    this.startVictorySequence();
    
    console.log('🎉 Victory screen should now be visible!');
  },
  
  startVictorySequence() {
    let countdown = 10;
    const countdownElement = Helpers.$('#countdown');
    
    // Update countdown every second
    const timer = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.textContent = countdown;
      }
      
      if (countdown <= 0) {
        clearInterval(timer);
        this.showMainMenu();
      }
    }, 1000);
    
    // Start fireworks
    this.startFireworks();
  },
  
  startFireworks() {
    const container = Helpers.$('.fireworks-container');
    if (!container) return;
    
    // Create fireworks every 150ms for 10 seconds (more frequent!)
    const fireworksInterval = setInterval(() => {
      // Create 2-3 fireworks at once for more spectacular effect
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        this.createFirework(container);
      }
    }, 150);
    
    // Stop fireworks after 10 seconds
    setTimeout(() => {
      clearInterval(fireworksInterval);
    }, 10000);
  },
  
  createFirework(container) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // Random position across entire arena (320x240)
    const x = Math.random() * 320;
    const y = Math.random() * 240;
    
    // Random color with more vibrant options
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#ff0088', '#88ff00', '#0088ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size variation
    const size = 4 + Math.random() * 8;
    
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    firework.style.width = size + 'px';
    firework.style.height = size + 'px';
    firework.style.backgroundColor = color;
    firework.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`;
    
    container.appendChild(firework);
    
    // Remove firework after animation
    setTimeout(() => {
      if (firework.parentNode) {
        firework.parentNode.removeChild(firework);
      }
    }, 2000);
  }
};

// Make UI globally available
window.UI = UI;