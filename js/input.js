// ========================================
// FILE: js/input.js
// ========================================
const InputHandler = {
  init() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      GameState.keys[e.key] = true;
      
      if (key === 'q') {
        GameState.selectedSlot = 0;
        HUD.renderAbilityBar();
        this.useSelectedAbility();
      } else if (key === 'w') {
        GameState.selectedSlot = 1;
        HUD.renderAbilityBar();
        this.useSelectedAbility();
      } else if (key === 'e') {
        GameState.selectedSlot = 2;
        HUD.renderAbilityBar();
        this.useSelectedAbility();
      } else if (key === 'p') {
        this.togglePause();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      GameState.keys[e.key] = false;
    });
    
    const canvas = Helpers.$('#c');
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const barEl = Helpers.$('#bar');
      const barRect = barEl.getBoundingClientRect();
      
      if (e.clientY >= barRect.top && e.clientY <= barRect.bottom &&
          e.clientX >= barRect.left && e.clientX <= barRect.right) {
        return;
      }
      
      this.useSelectedAbility();
    });
    
    // Menu buttons
    Helpers.$('#playBtn').onclick = () => {
      UI.showGameScreen();
      GameFlow.startRun();
    };
    
    Helpers.$('#restartBtn').onclick = () => {
      Helpers.$('#gameOver').classList.add('hidden');
      GameFlow.startRun();
    };
    
    Helpers.$('#menuBtn').onclick = () => {
      UI.showMainMenu();
      GameState.state = 'menu';
    };
  },
  
  togglePause() {
    if (GameState.state === 'play') {
      GameState.state = 'paused';
    } else if (GameState.state === 'paused') {
      GameState.state = 'play';
    }
  },
  
  useSelectedAbility() {
    if (GameState.state !== 'play') return;
    
    const ability = GameState.abilitySlots[GameState.selectedSlot];
    if (!ability || ability.cdLeft > 0) return;
    
    SynergySystem.addRecentCast(ability.name);
    SynergySystem.checkForSynergies(ability.name);
    
    ability.cast();
    AudioSystem.cast();
    
    // Apply synergy effects
    this.applySynergyEffects(ability);
    
    // Set cooldown
    ability.cdLeft = ability.cd;
    if (RelicSystem.hasRelic('Focusing Core')) {
      ability.cdLeft *= 0.85;
    }
    
    GameState.lastCast = { name: ability.name, t: GameState.time };
    HUD.renderAbilityBar();
  },
  
  applySynergyEffects(ability) {
    if (ability.name === 'Shield' && SynergySystem.hasSynergyActive('Aegis')) {
      GameState.player.iTimer = Math.max(GameState.player.iTimer, 180);
      Combat.heal(1);
    }
    
    if (ability.name === 'VoidNova' && SynergySystem.hasSynergyActive('Eclipse')) {
      GameState.player.eclipse = 200;
      ParticleSystem.create(GameState.player.x, GameState.player.y, 2.5, 20, 'eclipse');
    }
    
    // Add other synergy effects...
  }
};