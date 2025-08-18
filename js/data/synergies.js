// ========================================
// FILE: js/data/synergies.js
// Complete synergy combinations and system
// ========================================

const SYNERGIES = {
  'Firebolt+WindSlash': {
    name: 'Firestorm',
    desc: 'Fire spells create burning winds',
    color: '#ff5722'
  },
  
  'IceShard+Lightning': {
    name: 'ShatterShock',
    desc: 'Lightning shatters frozen enemies',
    color: '#29b6f6'
  },
  
  'Shield+Heal': {
    name: 'Aegis',
    desc: 'Perfect defense regeneration',
    color: '#4fc3f7'
  },
  
  'VoidNova+RadiantArc': {
    name: 'Eclipse',
    desc: 'Shadow and light become one',
    color: '#ba68c8'
  },
  
  'PoisonDart+WindSlash': {
    name: 'VenomRend',
    desc: 'Poison spreads through air',
    color: '#7cb342'
  },
  
  'Quake+Lightning': {
    name: 'Thunderquake',
    desc: 'Earth splits with electric fury',
    color: '#8d6e63'
  },
  
  'IceShard+Quake': {
    name: 'Frostquake',
    desc: 'Frozen ground shatters',
    color: '#29b6f6'
  },
  
  'Blink+Shield': {
    name: 'PhaseGuard',
    desc: 'Untouchable movement',
    color: '#9fa8da'
  },
  
  'Blink+Lightning': {
    name: 'StormWalk',
    desc: 'Lightning trail follows blinks',
    color: '#ffeb3b'
  },
  
  'Lightning+VoidNova': {
    name: 'VoidStorm',
    desc: 'Chaotic energy chains',
    color: '#ba68c8'
  },
  
  'Firebolt+PoisonDart': {
    name: 'Hellfire',
    desc: 'Toxic flames burn longer',
    color: '#ff5722'
  },
  
  'WindSlash+VoidNova': {
    name: 'VoidTornado',
    desc: 'Reality tears in spirals',
    color: '#8bc34a'
  },
  
  'Heal+Lightning': {
    name: 'LifeSpark',
    desc: 'Healing energy electrifies',
    color: '#81c784'
  },
  
  'RadiantArc+IceShard': {
    name: 'PrismIce',
    desc: 'Light refracts through ice',
    color: '#fff176'
  },
  
  'Shield+Quake': {
    name: 'Fortress',
    desc: 'Immovable defender',
    color: '#4fc3f7'
  }
};

const SynergySystem = {
  // Check if two abilities have a synergy
  hasSynergy(ability1, ability2) {
    const key1 = `${ability1}+${ability2}`;
    const key2 = `${ability2}+${ability1}`;
    return SYNERGIES[key1] || SYNERGIES[key2];
  },
  
  // Add a cast to recent casts history
  addRecentCast(abilityName) {
    const duration = RelicSystem.hasRelic('Synergy Master') ? 5000 : 3000;
    
    GameState.recentCasts.push({
      name: abilityName,
      time: GameState.time
    });
    
    // Clean up old casts
    GameState.recentCasts = GameState.recentCasts.filter(
      cast => GameState.time - cast.time < duration
    );
  },
  
  // Check if a new cast creates any synergies
  checkForSynergies(newCast) {
    const synergyDuration = RelicSystem.hasRelic('Synergy Master') ? 8000 : 5000;
    
    for (const recent of GameState.recentCasts) {
      if (recent.name === newCast) continue;
      
      const synergy = this.hasSynergy(recent.name, newCast);
      if (synergy) {
        // Remove existing instance of this synergy
        GameState.activeSynergies = GameState.activeSynergies.filter(
          s => s.name !== synergy.name
        );
        
        // Add new synergy instance
        GameState.activeSynergies.push({
          name: synergy.name,
          desc: synergy.desc,
          color: synergy.color,
          abilities: [recent.name, newCast],
          timeLeft: synergyDuration,
          justActivated: true
        });
        
        AudioSystem.synergy();
        UI.showStatusMessage(`${synergy.name} activated!`);
        
        // Apply immediate synergy effects
        this.applySynergyActivation(synergy.name, newCast);
      }
    }
  },
  
  // Update active synergies (called each frame)
  updateSynergies(dt) {
    GameState.activeSynergies = GameState.activeSynergies.filter(synergy => {
      synergy.timeLeft -= dt;
      
      if (synergy.timeLeft <= 0) {
        UI.showStatusMessage(`${synergy.name} faded...`);
        this.onSynergyExpired(synergy.name);
        return false;
      }
      
      synergy.justActivated = false;
      return true;
    });
  },
  
  // Check if a specific synergy is currently active
  hasSynergyActive(name) {
    return GameState.activeSynergies.some(s => s.name === name);
  },
  
  // Get active synergy by name
  getActiveSynergy(name) {
    return GameState.activeSynergies.find(s => s.name === name);
  },
  
  // Apply immediate effects when synergy activates
  applySynergyActivation(synergyName, triggerAbility) {
    switch(synergyName) {
      case 'Eclipse':
        if (triggerAbility === 'VoidNova') {
          GameState.player.eclipse = 200;
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            GameState.particles.push({
              x: GameState.player.x,
              y: GameState.player.y,
              vx: Math.cos(angle) * 2.5,
              vy: Math.sin(angle) * 2.5,
              life: 60,
              kind: 'eclipse'
            });
          }
        }
        break;
        
      case 'Aegis':
        if (triggerAbility === 'Shield') {
          GameState.player.iTimer = Math.max(GameState.player.iTimer, 180);
          Combat.heal(1);
        }
        break;
        
      case 'Thunderquake':
        if (triggerAbility === 'Quake') {
          AbilitiesLogic.stunInRadius(GameState.player.x, GameState.player.y, 35, 60);
          Combat.chainLightning(GameState.player, 5, AbilitiesLogic.baseDmg());
        }
        break;
        
      case 'Frostquake':
        if (triggerAbility === 'Quake') {
          Combat.radialExplosion(GameState.player.x, GameState.player.y, 30, AbilitiesLogic.baseDmg());
          AbilitiesLogic.stunInRadius(GameState.player.x, GameState.player.y, 30, 40);
          
          // Apply freeze to enemies in radius
          for (const enemy of GameState.enemies) {
            if (Helpers.dist(GameState.player.x, GameState.player.y, enemy.x, enemy.y) < 30) {
              enemy.slowT = 120;
              enemy.slowMul = 0.2;
            }
          }
        }
        break;
        
      case 'Fortress':
        if (triggerAbility === 'Shield') {
          GameState.player.iTimer = Math.max(GameState.player.iTimer, 200);
          Combat.radialExplosion(GameState.player.x, GameState.player.y, 20, AbilitiesLogic.baseDmg());
        }
        break;
    }
  },
  
  // Handle synergy expiration effects
  onSynergyExpired(synergyName) {
    switch(synergyName) {
      case 'Eclipse':
        // Eclipse effect naturally expires with the eclipse timer
        break;
        
      case 'PhaseGuard':
        // No special cleanup needed
        break;
        
      default:
        // Most synergies don't need cleanup
        break;
    }
  },
  
  // Get all possible synergies for an ability
  getPossibleSynergies(abilityName) {
    const synergies = [];
    
    for (const key in SYNERGIES) {
      const abilities = key.split('+');
      if (abilities.includes(abilityName)) {
        synergies.push({
          combo: key,
          ...SYNERGIES[key]
        });
      }
    }
    
    return synergies;
  },
  
  // Check combat synergy effects (called during combat)
  applyCombatSynergies(context) {
    // ShatterShock: Lightning shatters frozen enemies
    if (context.damageType === 'shock' && 
        this.hasSynergyActive('ShatterShock') && 
        context.enemy.slowT > 0) {
      Combat.hitEnemy(context.enemy, 2, 'shatter');
      GameState.particles.push({
        x: context.enemy.x,
        y: context.enemy.y,
        vx: 0,
        vy: 0,
        life: 15,
        kind: 'shatter'
      });
    }
    
    // Firestorm: Fire creates burning winds
    if (context.bulletKind === 'fire' && this.hasSynergyActive('Firestorm')) {
      const radius = RelicSystem.hasRelic('Cinder Bloom') ? 30 : 24;
      Combat.radialExplosion(context.enemy.x, context.enemy.y, radius, 1);
      
      for (let k = 0; k < 8; k++) {
        const angle = (k / 8) * Math.PI * 2;
        GameState.particles.push({
          x: context.enemy.x,
          y: context.enemy.y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          life: 30,
          kind: 'fire'
        });
      }
    }
    
    // VenomRend: Poison spreads through air
    if (context.bulletKind === 'poison' && this.hasSynergyActive('VenomRend')) {
      for (const nearbyEnemy of GameState.enemies) {
        if (nearbyEnemy !== context.enemy && 
            Helpers.dist(context.enemy.x, context.enemy.y, nearbyEnemy.x, nearbyEnemy.y) < 20) {
          nearbyEnemy.poisonT = (nearbyEnemy.poisonT || 0) + 60;
          nearbyEnemy.poison = Math.max(nearbyEnemy.poison || 0, 1);
        }
      }
    }
    
    // Hellfire: Poison + Fire creates toxic flames
    if (context.bulletKind === 'poison' && this.hasSynergyActive('Hellfire')) {
      context.bonusDamage = (context.bonusDamage || 0) + 1;
      GameState.particles.push({
        x: context.enemy.x,
        y: context.enemy.y,
        vx: 0,
        vy: -1,
        life: 40,
        kind: 'hellfire'
      });
    }
    
    // VoidStorm: Void creates lightning chains
    if (context.bulletKind === 'void' && this.hasSynergyActive('VoidStorm')) {
      Combat.chainLightning(context.enemy, 2, 1);
    }
    
    // VoidTornado: Void + Wind creates reality tears
    if (context.bulletKind === 'void' && this.hasSynergyActive('VoidTornado')) {
      for (let k = 0; k < 12; k++) {
        const angle = (k / 12) * Math.PI * 2;
        GameState.particles.push({
          x: context.enemy.x,
          y: context.enemy.y,
          vx: Math.cos(angle) * 1.5,
          vy: Math.sin(angle) * 1.5,
          life: 25,
          kind: 'void'
        });
      }
    }
    
    // PrismIce: Radiant + Ice creates light refraction
    if (context.bulletKind === 'radiant' && this.hasSynergyActive('PrismIce')) {
      for (let k = 0; k < 6; k++) {
        const angle = (k / 6) * Math.PI * 2;
        AbilitiesLogic.emitBullet(
          context.enemy.x,
          context.enemy.y,
          angle,
          {
            spd: 1.5,
            dmg: 1,
            pierce: 1,
            kind: 'radiant',
            life: 60
          }
        );
      }
    }
    
    // LifeSpark: Healing creates electric sparks
    if (context.isHealing && this.hasSynergyActive('LifeSpark')) {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        GameState.particles.push({
          x: GameState.player.x,
          y: GameState.player.y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          life: 30,
          kind: 'lifespark'
        });
      }
    }
    
    return context;
  },
  
  // Movement synergy effects (called during movement)
  applyMovementSynergies(oldX, oldY, newX, newY) {
    // StormWalk: Movement during blink creates lightning trail
    if (this.hasSynergyActive('StormWalk') && 
        (Math.abs(newX - oldX) > 0.5 || Math.abs(newY - oldY) > 0.5)) {
      
      if (Math.random() < 0.3) {
        GameState.particles.push({
          x: oldX,
          y: oldY,
          vx: 0,
          vy: 0,
          life: 20,
          kind: 'lightning'
        });
        
        // Damage nearby enemies
        for (const enemy of GameState.enemies) {
          if (Helpers.dist(oldX, oldY, enemy.x, enemy.y) < 16) {
            Combat.hitEnemy(enemy, 1, 'shock');
          }
        }
      }
    }
  },
  
  // Get visual effect for synergy
  getSynergyVisualEffect(synergyName) {
    const synergy = Object.values(SYNERGIES).find(s => s.name === synergyName);
    return synergy ? synergy.color : '#ffffff';
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SYNERGIES, SynergySystem };
}