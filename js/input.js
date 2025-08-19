// ========================================
// FILE: js/input.js
// Complete input handling system
// ========================================

const InputHandler = {
  // Input configuration
  config: {
    keys: {
      moveUp: 'ArrowUp',
      moveDown: 'ArrowDown',
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      ability1: 'q',
      ability2: 'w',
      ability3: 'e',
      pause: 'p',
      debug: 'f3'
    },
    mouse: {
      castOnClick: true,
      aimAssist: false
    }
  },
  
  // Mouse state
  mouse: {
    x: 0,
    y: 0,
    down: false,
    button: 0
  },
  
  // Initialize input system
  init() {
    // Keyboard events
    this.initKeyboard();
    
    // Mouse events
    this.initMouse();
    
    // Touch events (for mobile support)
    this.initTouch();
    
    // Menu button handlers
    this.initMenuButtons();
    
    // Draft screen handlers
    this.initDraftHandlers();
    
    console.log('Input system initialized');
  },
  
  // Initialize keyboard input
  initKeyboard() {
    // Keydown handler
    window.addEventListener('keydown', (e) => {
      // Prevent default for game keys
      if (this.isGameKey(e.key)) {
        e.preventDefault();
      }
      
      // Store key state
      GameState.keys[e.key] = true;
      
      // Handle key press based on game state
      if (GameState.state === 'play') {
        this.handleGameKeyDown(e);
      } else if (GameState.state === 'paused') {
        this.handlePausedKeyDown(e);
      } else if (GameState.state === 'menu') {
        this.handleMenuKeyDown(e);
      }
    });
    
    // Keyup handler
    window.addEventListener('keyup', (e) => {
      GameState.keys[e.key] = false;
      
      if (GameState.state === 'play') {
        this.handleGameKeyUp(e);
      }
    });
    
    // Prevent arrow key scrolling
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
  },
  
  // Initialize mouse input
  initMouse() {
    const canvas = Helpers.$('#c');
    
    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    
    // Mouse down
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.down = true;
      this.mouse.button = e.button;
      
      // Check if clicking on ability bar
      const barEl = Helpers.$('#bar');
      const barRect = barEl.getBoundingClientRect();
      
      if (e.clientY >= barRect.top && e.clientY <= barRect.bottom &&
          e.clientX >= barRect.left && e.clientX <= barRect.right) {
        return; // Don't cast if clicking on UI
      }
      
      // Cast selected ability on left click
      if (e.button === 0 && GameState.state === 'play') {
        this.useSelectedAbility();
      }
    });
    
    // Mouse up
    canvas.addEventListener('mouseup', (e) => {
      this.mouse.down = false;
    });
    
    // Right click prevention
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Mouse wheel (for potential ability switching)
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      if (GameState.state !== 'play') return;
      
      if (e.deltaY > 0) {
        // Scroll down - next ability
        this.selectNextAbility();
      } else {
        // Scroll up - previous ability
        this.selectPreviousAbility();
      }
    });
  },
  
  // Initialize touch input (mobile support)
  initTouch() {
    const canvas = Helpers.$('#c');
    
    // Touch start
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
      this.mouse.down = true;
      
      // Virtual joystick for movement
      this.handleTouchMove(touch);
    });
    
    // Touch move
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleTouchMove(touch);
    });
    
    // Touch end
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouse.down = false;
      
      // Clear movement keys
      GameState.keys['ArrowUp'] = false;
      GameState.keys['ArrowDown'] = false;
      GameState.keys['ArrowLeft'] = false;
      GameState.keys['ArrowRight'] = false;
    });
  },
  
  // Handle touch movement (virtual joystick)
  handleTouchMove(touch) {
    const canvas = Helpers.$('#c');
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Virtual joystick in bottom left corner
    const joystickX = 50;
    const joystickY = canvas.height - 50;
    const joystickRadius = 30;
    
    const dx = x - joystickX;
    const dy = y - joystickY;
    const dist = Math.hypot(dx, dy);
    
    if (dist < joystickRadius * 2) {
      // Convert to movement
      GameState.keys['ArrowRight'] = dx > joystickRadius * 0.5;
      GameState.keys['ArrowLeft'] = dx < -joystickRadius * 0.5;
      GameState.keys['ArrowDown'] = dy > joystickRadius * 0.5;
      GameState.keys['ArrowUp'] = dy < -joystickRadius * 0.5;
    }
  },
  
  // Initialize menu button handlers
  initMenuButtons() {
    // Play button
    const playBtn = Helpers.$('#playBtn');
    if (playBtn) {
      playBtn.onclick = () => {
        UI.showGameScreen();
        GameFlow.startRun();
      };
    }
    
    // Restart button
    const restartBtn = Helpers.$('#restartBtn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        Helpers.$('#gameOver').classList.add('hidden');
        GameFlow.startRun();
      };
    }
    
    // Menu button
    const menuBtn = Helpers.$('#menuBtn');
    if (menuBtn) {
      menuBtn.onclick = () => {
        UI.showMainMenu();
        GameState.state = 'menu';
      };
    }
    
    // Guide button (disabled for now)
    const guideBtn = Helpers.$('#guideBtn');
    if (guideBtn) {
      guideBtn.onclick = () => {
        UI.showGameGuide();
      };
    }
    
    // Back to menu button in guide
    const backToMenuBtn = Helpers.$('#backToMenuBtn');
    if (backToMenuBtn) {
      backToMenuBtn.onclick = () => {
        UI.showMainMenu();
      };
    }
    
    // Credits menu button
    const creditsMenuBtn = Helpers.$('#creditsMenuBtn');
    if (creditsMenuBtn) {
      creditsMenuBtn.onclick = () => {
        UI.showMainMenu();
      };
    }
    
    // Test credits button (temporary)
    const testCreditsBtn = Helpers.$('#testCreditsBtn');
    if (testCreditsBtn) {
      testCreditsBtn.onclick = () => {
        console.log('🧪 Test credits button clicked!');
        if (window.UI && window.UI.showCredits) {
          window.UI.showCredits();
        } else {
          console.error('❌ UI not available for test!');
        }
      };
    }
  },
  
  // Initialize draft screen handlers
  initDraftHandlers() {
    // Skip button for ability draft
    const skipBtn = Helpers.$('#skipBtn');
    if (skipBtn) {
      // Handler will be set dynamically by DraftUI
    }
  },
  
  // Handle keydown during gameplay
  handleGameKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Ability hotkeys
    if (key === this.config.keys.ability1) {
      this.selectSlot(0);
      this.useSelectedAbility();
    } else if (key === this.config.keys.ability2) {
      this.selectSlot(1);
      this.useSelectedAbility();
    } else if (key === this.config.keys.ability3) {
      this.selectSlot(2);
      this.useSelectedAbility();
    }
    
    // Pause
    else if (key === this.config.keys.pause) {
      this.togglePause();
    }
    
    // Debug mode
    else if (key === this.config.keys.debug) {
      window.DEBUG_MODE = !window.DEBUG_MODE;
      console.log('Debug mode:', window.DEBUG_MODE);
    }
    
    // Number keys for ability selection
    else if (key >= '1' && key <= '3') {
      this.selectSlot(parseInt(key) - 1);
    }
  },
  
  // Handle keyup during gameplay
  handleGameKeyUp(e) {
    // Currently no specific keyup handlers needed
  },
  
  // Handle keydown while paused
  handlePausedKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === this.config.keys.pause || key === 'escape') {
      this.togglePause();
    }
  },
  
  // Handle keydown in menu
  handleMenuKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Quick start with Enter or Space
    if (key === 'enter' || key === ' ') {
      const playBtn = Helpers.$('#playBtn');
      if (playBtn) playBtn.click();
    }
  },
  
  // Toggle pause state
  togglePause() {
    if (GameState.state === 'play') {
      GameState.state = 'paused';
      console.log('Game paused');
    } else if (GameState.state === 'paused') {
      GameState.state = 'play';
      console.log('Game resumed');
    }
  },
  
  // Select ability slot
  selectSlot(index) {
    if (index >= 0 && index < GameState.abilitySlots.length) {
      GameState.selectedSlot = index;
      HUD.renderAbilityBar();
    }
  },
  
  // Select next ability slot
  selectNextAbility() {
    const nextSlot = (GameState.selectedSlot + 1) % GameState.abilitySlots.length;
    this.selectSlot(nextSlot);
  },
  
  // Select previous ability slot
  selectPreviousAbility() {
    const prevSlot = (GameState.selectedSlot - 1 + GameState.abilitySlots.length) % 
                     GameState.abilitySlots.length;
    this.selectSlot(prevSlot);
  },
  
  // Use currently selected ability
  useSelectedAbility() {
    if (GameState.state !== 'play') return;
    
    const ability = GameState.abilitySlots[GameState.selectedSlot];
    if (!ability || ability.cdLeft > 0) return;
    
    // Add to recent casts for synergy checking
    SynergySystem.addRecentCast(ability.name);
    SynergySystem.checkForSynergies(ability.name);
    
    // Cast the ability
    ability.cast();
    AudioSystem.cast();
    
    // Apply synergy effects
    this.applySynergyEffects(ability);
    
    // Check for double cast relic
    if (RelicSystem.shouldDoubleCast()) {
      setTimeout(() => {
        ability.cast();
        AudioSystem.cast();
        UI.showStatusMessage('Echo Chamber: Double cast!');
      }, 100);
    }
    
    // Set cooldown
    ability.cdLeft = ability.cd;
    if (RelicSystem.hasRelic('Focusing Core')) {
      ability.cdLeft *= 0.85;
    }
    
    // Special cooldown for specific abilities
    const cooldownMod = RelicSystem.getCooldownModifier(ability.name);
    ability.cdLeft *= cooldownMod;
    
    GameState.lastCast = { name: ability.name, t: GameState.time };
    HUD.renderAbilityBar();
  },
  
  // Apply synergy effects when casting abilities
  applySynergyEffects(ability) {
    // Shield + Heal = Aegis
    if (ability.name === 'Shield' && SynergySystem.hasSynergyActive('Aegis')) {
      GameState.player.iTimer = Math.max(GameState.player.iTimer, 180);
      Combat.heal(1);
    }
    
    // VoidNova + RadiantArc = Eclipse
    if (ability.name === 'VoidNova' && SynergySystem.hasSynergyActive('Eclipse')) {
      GameState.player.eclipse = 200;
      ParticleSystem.create(GameState.player.x, GameState.player.y, 2.5, 20, 'eclipse');
    }
    
    // Quake + Lightning = Thunderquake
    if (ability.name === 'Quake' && SynergySystem.hasSynergyActive('Thunderquake')) {
      AbilitiesLogic.stunInRadius(GameState.player.x, GameState.player.y, 35, 60);
      Combat.chainLightning(GameState.player, 5, AbilitiesLogic.baseDmg());
    }
    
    // IceShard + Quake = Frostquake
    if (ability.name === 'Quake' && SynergySystem.hasSynergyActive('Frostquake')) {
      Combat.radialExplosion(GameState.player.x, GameState.player.y, 30, AbilitiesLogic.baseDmg());
      AbilitiesLogic.stunInRadius(GameState.player.x, GameState.player.y, 30, 40);
      
      for (const enemy of GameState.enemies) {
        if (Helpers.dist(GameState.player.x, GameState.player.y, enemy.x, enemy.y) < 30) {
          enemy.slowT = 120;
          enemy.slowMul = 0.2;
        }
      }
    }
    
    // Shield + Quake = Fortress
    if (ability.name === 'Shield' && SynergySystem.hasSynergyActive('Fortress')) {
      GameState.player.iTimer = Math.max(GameState.player.iTimer, 200);
      Combat.radialExplosion(GameState.player.x, GameState.player.y, 20, AbilitiesLogic.baseDmg());
    }
    
    // Blink + Shield = PhaseGuard (handled in blink function)
    // Blink + Lightning = StormWalk (handled in blink function)
  },
  
  // Check if key is a game control key
  isGameKey(key) {
    const gameKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'q', 'w', 'e', 'p', ' ',
      '1', '2', '3'
    ];
    return gameKeys.includes(key.toLowerCase());
  },
  
  // Get movement vector from input
  getMovementVector() {
    const keys = GameState.keys;
    let vx = 0;
    let vy = 0;
    
    if (keys['ArrowLeft']) vx -= 1;
    if (keys['ArrowRight']) vx += 1;
    if (keys['ArrowUp']) vy -= 1;
    if (keys['ArrowDown']) vy += 1;
    
    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }
    
    return { x: vx, y: vy };
  },
  
  // Update player movement based on input
  updatePlayerMovement(dt) {
    const player = GameState.player;
    const movement = this.getMovementVector();
    const speed = player.spd * RelicSystem.getMovementSpeedModifier();
    
    const oldX = player.x;
    const oldY = player.y;
    
            player.x = Helpers.clamp(player.x + movement.x * speed, 8, 312);
            player.y = Helpers.clamp(player.y + movement.y * speed, 8, 232);
    
    // Apply movement synergies
    SynergySystem.applyMovementSynergies(oldX, oldY, player.x, player.y);
  },
  
  // Clear all input states
  clearInputStates() {
    GameState.keys = {};
    this.mouse.down = false;
  },
  
  // Debug: Log current input state
  logInputState() {
    console.log('Keys:', Object.keys(GameState.keys).filter(k => GameState.keys[k]));
    console.log('Mouse:', this.mouse);
    console.log('Selected slot:', GameState.selectedSlot);
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}