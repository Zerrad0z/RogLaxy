// ========================================
// FILE: js/systems/state.js
// Updated game state for extended game
// ========================================

window.GameState = {
  // Room progression
  room: 1,
  maxRooms: 12,  // Extended from 8 to 12
  
  // Game state
  state: 'menu', // menu, play, paused, draft, relic, over
  
  // Player state
  player: {
    x: 160,
    y: 120,
    r: 4,
    hp: 5,
    hpMax: 5,
    spd: 1.2,
    iTimer: 0,  // Invulnerability timer
    eclipse: 0,  // Eclipse synergy timer
    
    // New: Void pull effects
    voidPullX: 0,
    voidPullY: 0
  },
  
  // Entity arrays
  enemies: [],
  bullets: [],
  ebullets: [],  // Enemy bullets
  particles: [],
  voidZones: [],  // New: Persistent void zones
  
  // Input state
  keys: {},
  
  // Ability system
  abilitySlots: [null, null, null],
  selectedSlot: 0,
  lastCast: { name: null, t: -999 },
  recentCasts: [],
  activeSynergies: [],
  
  // Game statistics
  time: 0,
  kills: 0,
  relics: [],
  roomsCleared: 0,
  
  // New statistics for extended game
  stats: {
    damageDealt: 0,
    damageTaken: 0,
    abilitiesCast: 0,
    synergyActivations: 0,
    bossesDefeated: 0,
    healingDone: 0,
    totalTime: 0
  },
  
  // Reset game state for new run
  reset() {
    this.room = 1;
    this.state = 'play';
    this.kills = 0;
    this.roomsCleared = 0;
    this.time = 0;
    
    // Reset player
    this.player = {
      x: 160,
      y: 120,
      r: 4,
      hp: 5,
      hpMax: 5,
      spd: 1.2,
      iTimer: 0,
      eclipse: 0,
      voidPullX: 0,
      voidPullY: 0
    };
    
    // Clear arrays
    this.enemies = [];
    this.bullets = [];
    this.ebullets = [];
    this.particles = [];
    this.voidZones = [];
    
    // Reset abilities
    this.relics = [];
    this.recentCasts = [];
    this.activeSynergies = [];
    this.selectedSlot = 0;
    
    // Reset stats
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      abilitiesCast: 0,
      synergyActivations: 0,
      bossesDefeated: 0,
      healingDone: 0,
      totalTime: 0
    };
  },
  
  // Clear room entities
  clearRoom() {
    this.enemies = [];
    this.bullets = [];
    this.ebullets = [];
    this.particles = [];
    this.voidZones = [];
    this.player.voidPullX = 0;
    this.player.voidPullY = 0;
  },
  
  // Track boss defeat
  defeatBoss(bossType) {
    this.stats.bossesDefeated++;
    
    // Special rewards for each boss
    switch(bossType) {
      case 'Warden':
        this.player.hpMax += 1;
        this.player.hp = Math.min(this.player.hp + 1, this.player.hpMax);
        UI.showStatusMessage('Warden defeated! +1 Max HP!');
        break;
        
      case 'EclipseTwin':
        this.player.hpMax += 1;
        this.player.hp = Math.min(this.player.hp + 1, this.player.hpMax);
        UI.showStatusMessage('Eclipse Twin defeated! +1 Max HP!');
        break;
        
      case 'VoidMonarch':
        // Victory!
        this.state = 'victory';
        UI.showStatusMessage('VOID MONARCH DEFEATED! YOU ARE VICTORIOUS!');
        break;
    }
  },
  
  // Check if game is in final stages
  isFinalStage() {
    return this.room >= 9;
  },
  
  // Get current difficulty modifier
  getDifficultyModifier() {
    if (this.room <= 3) return 1.0;
    if (this.room <= 6) return 1.2;
    if (this.room <= 9) return 1.5;
    if (this.room <= 11) return 1.8;
    return 2.0;
  },
  
  // Track statistics
  recordDamage(amount, isPlayer) {
    if (isPlayer) {
      this.stats.damageTaken += amount;
    } else {
      this.stats.damageDealt += amount;
    }
  },
  
  recordHealing(amount) {
    this.stats.healingDone += amount;
  },
  
  recordAbilityCast() {
    this.stats.abilitiesCast++;
  },
  
  recordSynergyActivation() {
    this.stats.synergyActivations++;
  },
  
  // Get formatted statistics for end screen
  getFormattedStats() {
    const minutes = Math.floor(this.stats.totalTime / 60000);
    const seconds = Math.floor((this.stats.totalTime % 60000) / 1000);
    
    return {
      roomsCleared: `${this.roomsCleared}/${this.maxRooms}`,
      kills: this.kills,
      bossesDefeated: `${this.stats.bossesDefeated}/3`,
      damageDealt: this.stats.damageDealt,
      damageTaken: this.stats.damageTaken,
      abilitiesCast: this.stats.abilitiesCast,
      synergyActivations: this.stats.synergyActivations,
      healingDone: this.stats.healingDone,
      relicsCollected: this.relics.length,
      timePlayed: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      finalScore: this.calculateScore()
    };
  },
  
  // Calculate final score
  calculateScore() {
    let score = 0;
    
    // Base scores
    score += this.kills * 10;
    score += this.roomsCleared * 100;
    score += this.stats.bossesDefeated * 500;
    
    // Efficiency bonuses
    score += this.stats.damageDealt * 2;
    score -= this.stats.damageTaken * 5;
    score += this.stats.synergyActivations * 50;
    score += this.relics.length * 200;
    
    // Time bonus (faster is better)
    const timeBonus = Math.max(0, 30000 - Math.floor(this.stats.totalTime / 100));
    score += timeBonus;
    
    // Victory bonus
    if (this.state === 'victory') {
      score += 5000;
    }
    
    return Math.max(0, score);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
}