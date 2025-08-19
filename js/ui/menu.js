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
    Helpers.$('#credits').classList.add('hidden');
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
  
  showCredits() {
    console.log('🎬 showCredits() called!');
    GameState.state = 'credits';
    this.hideAllScreens();
    
    const creditsElement = Helpers.$('#credits');
    if (creditsElement) {
      creditsElement.classList.remove('hidden');
      console.log('🎬 Credits element found and hidden class removed');
    } else {
      console.error('❌ Credits element not found!');
    }
    
    Helpers.$('#bossBar').style.display = 'none';
    console.log('🎬 Credits screen should now be visible!');
  }
};

// Make UI globally available
window.UI = UI;