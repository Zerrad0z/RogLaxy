// ========================================
// FILE: js/data/relics.js
// Complete relic definitions and system
// ========================================

const RELICS = [
  {
    name: 'Focusing Core',
    icon: '◎',
    desc: '-15% ability cooldowns',
    rarity: 'common',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Focusing Core acquired: Abilities recharge faster!');
    },
    // Effect applied in ability cooldown calculations
    getCooldownModifier() {
      return 0.85; // 15% reduction
    }
  },
  
  {
    name: 'Fleet Boots',
    icon: '≡',
    desc: '+15% move speed',
    rarity: 'common',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Fleet Boots acquired: Movement speed increased!');
    },
    // Effect applied in movement calculations
    getSpeedModifier() {
      return 1.15; // 15% increase
    }
  },
  
  {
    name: 'Heart Sigil',
    icon: '♥',
    desc: '+2 max HP & heal 2',
    rarity: 'common',
    apply() {
      GameState.player.hpMax += 2;
      Combat.heal(2);
      GameState.relics.push(this);
      UI.showStatusMessage('Heart Sigil acquired: Max health increased!');
    }
  },
  
  {
    name: 'Sharper',
    icon: '†',
    desc: '+1 ability damage',
    rarity: 'uncommon',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Sharper acquired: Abilities deal more damage!');
    },
    // Effect applied in damage calculations
    getDamageBonus() {
      return 1;
    }
  },
  
  {
    name: 'Grounded',
    icon: '∎',
    desc: 'Quake also stuns briefly',
    rarity: 'uncommon',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Grounded acquired: Quake now stuns enemies!');
    },
    // Effect checked in Quake ability
    getStunDuration() {
      return 30; // frames
    }
  },
  
  {
    name: 'Cinder Bloom',
    icon: '¤',
    desc: 'Fire explosions +25% radius',
    rarity: 'uncommon',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Cinder Bloom acquired: Fire explosions are larger!');
    },
    // Effect applied in fire synergy calculations
    getExplosionRadiusModifier() {
      return 1.25; // 25% increase
    }
  },
  
  {
    name: 'PhaseGuard',
    icon: '↺',
    desc: 'Shield grants longer i-frames',
    rarity: 'rare',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('PhaseGuard acquired: Shield protection lasts longer!');
    },
    // Effect applied in Shield ability
    getShieldDuration() {
      return 140; // frames (vs 90 normal)
    }
  },
  
  {
    name: 'Synergy Master',
    icon: '⚡',
    desc: 'Synergies last longer',
    rarity: 'rare',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Synergy Master acquired: Synergies last longer!');
    },
    // Effects applied in synergy system
    getRecentCastDuration() {
      return 5000; // ms (vs 3000 normal)
    },
    getSynergyDuration() {
      return 8000; // ms (vs 5000 normal)
    }
  }
];

// Additional relics that could be added for expansion
const ADDITIONAL_RELICS = [
  {
    name: 'Glass Cannon',
    icon: '◈',
    desc: '+2 damage, -2 max HP',
    rarity: 'rare',
    apply() {
      GameState.player.hpMax = Math.max(1, GameState.player.hpMax - 2);
      GameState.player.hp = Math.min(GameState.player.hp, GameState.player.hpMax);
      GameState.relics.push(this);
      UI.showStatusMessage('Glass Cannon acquired: High risk, high reward!');
    },
    getDamageBonus() {
      return 2;
    }
  },
  
  {
    name: 'Vampiric Touch',
    icon: '◊',
    desc: 'Heal 1 HP every 10 kills',
    rarity: 'uncommon',
    apply() {
      this.killCounter = 0;
      GameState.relics.push(this);
      UI.showStatusMessage('Vampiric Touch acquired: Kills restore health!');
    },
    onKill() {
      this.killCounter++;
      if (this.killCounter >= 10) {
        Combat.heal(1);
        this.killCounter = 0;
        UI.showStatusMessage('Vampiric Touch: Health restored!');
      }
    }
  },
  
  {
    name: 'Echo Chamber',
    icon: '◉',
    desc: '10% chance to double cast',
    rarity: 'legendary',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Echo Chamber acquired: Abilities may cast twice!');
    },
    shouldDoubleCast() {
      return Math.random() < 0.1;
    }
  },
  
  {
    name: 'Berserker Rage',
    icon: '◆',
    desc: '+50% damage when below 3 HP',
    rarity: 'uncommon',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Berserker Rage acquired: Power through pain!');
    },
    getDamageBonus() {
      return GameState.player.hp <= 3 ? 1.5 : 1.0;
    }
  },
  
  {
    name: 'Shield Battery',
    icon: '◐',
    desc: 'Shield cooldown -50%',
    rarity: 'uncommon',
    apply() {
      GameState.relics.push(this);
      UI.showStatusMessage('Shield Battery acquired: Shield recharges faster!');
    },
    getAbilityCooldownModifier(abilityName) {
      return abilityName === 'Shield' ? 0.5 : 1.0;
    }
  }
];

const RelicSystem = {
  // Check if player has a specific relic
  hasRelic(name) {
    return GameState.relics.some(r => r.name === name);
  },
  
  // Get a specific relic if player has it
  getRelic(name) {
    return GameState.relics.find(r => r.name === name);
  },
  
  // Get all relics of a specific rarity
  getRelicsByRarity(rarity) {
    return GameState.relics.filter(r => r.rarity === rarity);
  },
  
  // Calculate total damage bonus from relics
  getTotalDamageBonus() {
    let bonus = 0;
    
    if (this.hasRelic('Sharper')) {
      bonus += 1;
    }
    
    // Add bonuses from additional relics if implemented
    const glassCanon = this.getRelic('Glass Cannon');
    if (glassCanon && glassCanon.getDamageBonus) {
      bonus += glassCanon.getDamageBonus();
    }
    
    const berserker = this.getRelic('Berserker Rage');
    if (berserker && berserker.getDamageBonus) {
      const mult = berserker.getDamageBonus();
      if (mult > 1) {
        bonus = Math.floor(bonus * mult);
      }
    }
    
    return bonus;
  },
  
  // Calculate movement speed modifier
  getMovementSpeedModifier() {
    let modifier = 1.0;
    
    if (this.hasRelic('Fleet Boots')) {
      modifier *= 1.15;
    }
    
    return modifier;
  },
  
  // Calculate cooldown modifier for abilities
  getCooldownModifier(abilityName) {
    let modifier = 1.0;
    
    if (this.hasRelic('Focusing Core')) {
      modifier *= 0.85;
    }
    
    // Check for ability-specific modifiers
    const shieldBattery = this.getRelic('Shield Battery');
    if (shieldBattery && shieldBattery.getAbilityCooldownModifier) {
      modifier *= shieldBattery.getAbilityCooldownModifier(abilityName);
    }
    
    return modifier;
  },
  
  // Get shield duration based on relics
  getShieldDuration() {
    if (this.hasRelic('PhaseGuard')) {
      return 140;
    }
    return 90; // default duration
  },
  
  // Get synergy durations based on relics
  getSynergyDurations() {
    if (this.hasRelic('Synergy Master')) {
      return {
        recentCast: 5000,
        synergy: 8000
      };
    }
    return {
      recentCast: 3000,
      synergy: 5000
    };
  },
  
  // Get explosion radius modifier
  getExplosionRadiusModifier() {
    if (this.hasRelic('Cinder Bloom')) {
      return 1.25;
    }
    return 1.0;
  },
  
  // Handle kill events for relics with kill effects
  onEnemyKilled(enemy) {
    const vampiric = this.getRelic('Vampiric Touch');
    if (vampiric && vampiric.onKill) {
      vampiric.onKill();
    }
    
    // Add other kill-based relic effects here
  },
  
  // Check if ability should double cast
  shouldDoubleCast() {
    const echo = this.getRelic('Echo Chamber');
    if (echo && echo.shouldDoubleCast) {
      return echo.shouldDoubleCast();
    }
    return false;
  },
  
  // Get random relics for draft (excluding owned)
  getRandomRelicsForDraft(count = 3, includeAdditional = false) {
    const pool = includeAdditional ? 
      [...RELICS, ...ADDITIONAL_RELICS] : 
      RELICS;
    
    const available = pool.filter(r => !this.hasRelic(r.name));
    const picks = [];
    
    while (picks.length < count && available.length > 0) {
      const index = RNG.range(0, available.length - 1);
      picks.push(available.splice(index, 1)[0]);
    }
    
    return picks;
  },
  
  // Get total relic count
  getRelicCount() {
    return GameState.relics.length;
  },
  
  // Get relic summary for UI
  getRelicSummary() {
    return GameState.relics.map(r => ({
      name: r.name,
      icon: r.icon,
      desc: r.desc,
      rarity: r.rarity || 'common'
    }));
  },
  
  // Apply a relic (used during draft)
  applyRelic(relic) {
    if (relic && relic.apply) {
      relic.apply();
      AudioSystem.relic();
      return true;
    }
    return false;
  },
  
  // Debug function to grant all relics
  grantAllRelics() {
    if (process.env.NODE_ENV === 'development') {
      RELICS.forEach(relic => {
        if (!this.hasRelic(relic.name)) {
          this.applyRelic(relic);
        }
      });
      console.log('All relics granted!');
    }
  },
  
  // Reset relics (for new run)
  reset() {
    GameState.relics = [];
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RELICS, ADDITIONAL_RELICS, RelicSystem };
}