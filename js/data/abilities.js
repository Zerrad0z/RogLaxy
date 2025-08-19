// ========================================
// FILE: js/data/abilities.js
// Complete abilities data and definitions
// ========================================

const AbilityIcons = {
  Firebolt: (g) => { g('❁') },
  IceShard: (g) => { g('❅') },
  Lightning: (g) => { g('⚡') },
  WindSlash: (g) => { g('∿') },
  Shield: (g) => { g('⛨') },
  Heal: (g) => { g('✚') },
  VoidNova: (g) => { g('◼') },
  RadiantArc: (g) => { g('✺') },
  PoisonDart: (g) => { g('☣') },
  Quake: (g) => { g('▼') },
  Blink: (g) => { g('⤍') }
};

const ABILITIES = [
  {
    name: 'Firebolt',
    icon: 'Firebolt',
    cd: 2.0,
    tags: ['Elemental', 'Fire'],
    cast() {
      AbilitiesLogic.autoShoot({
        spd: 2.2,
        dmg: AbilitiesLogic.baseDmg(),
        pierce: 0,
        kind: 'fire',
        color: '#ff5722'
      });
    }
  },
  
  {
    name: 'IceShard',
    icon: 'IceShard',
    cd: 2.5,
    tags: ['Elemental', 'Ice'],
    cast() {
      AbilitiesLogic.autoShoot({
        spd: 1.8,
        dmg: AbilitiesLogic.baseDmg(),
        pierce: 0,
        slow: 0.6,
        slowT: 80,
        kind: 'ice',
        color: '#29b6f6'
      });
    }
  },
  
  {
    name: 'Lightning',
    icon: 'Lightning',
    cd: 3.0,
    tags: ['Elemental', 'Shock'],
    cast() {
      Combat.chainLightning(GameState.player, 3, AbilitiesLogic.baseDmg() + 1);
    }
  },
  
  {
    name: 'WindSlash',
    icon: 'WindSlash',
    cd: 1.2,
    tags: ['Elemental', 'Wind'],
    cast() {
      AbilitiesLogic.autoShoot({
        spd: 2.8,
        dmg: AbilitiesLogic.baseDmg(),
        pierce: 2,
        kind: 'wind',
        color: '#8bc34a'
      });
    }
  },
  
  {
    name: 'Shield',
    icon: 'Shield',
    cd: 6.0,
    tags: ['Defense'],
    cast() {
      GameState.player.iTimer = Math.max(
        GameState.player.iTimer, 
        RelicSystem.hasRelic('PhaseGuard') ? 140 : 90
      );
      // Set shield effect for visual feedback
      GameState.player.shieldEffect = 90; // 1.5 seconds at 60fps
    }
  },
  
  {
    name: 'Heal',
    icon: 'Heal',
    cd: 6.0,
    tags: ['Support'],
    cast() {
      Combat.heal(2);
    }
  },
  
  {
    name: 'VoidNova',
    icon: 'VoidNova',
    cd: 5.0,
    tags: ['Void'],
    cast() {
      for (let angle = 0; angle < 16; angle++) {
        AbilitiesLogic.emitBullet(
          GameState.player.x,
          GameState.player.y,
          (angle / 16) * Math.PI * 2,
          {
            spd: 1.5,
            dmg: AbilitiesLogic.baseDmg(),
            pierce: 0,
            kind: 'void',
            color: '#ba68c8'
          }
        );
      }
    }
  },
  
  {
    name: 'RadiantArc',
    icon: 'RadiantArc',
    cd: 4.0,
    tags: ['Radiant'],
    cast() {
      const dir = AbilitiesLogic.aimDir();
      AbilitiesLogic.emitBullet(
        GameState.player.x,
        GameState.player.y,
        dir,
        {
          spd: 2.3,
          dmg: AbilitiesLogic.baseDmg(),
          pierce: 1,
          kind: 'radiant',
          boomerang: true,
          life: 90,
          color: '#fff176'
        }
      );
    }
  },
  
  {
    name: 'PoisonDart',
    icon: 'PoisonDart',
    cd: 1.6,
    tags: ['Toxic'],
    cast() {
      AbilitiesLogic.autoShoot({
        spd: 2.0,
        dmg: AbilitiesLogic.baseDmg(),
        pierce: 0,
        kind: 'poison',
        poison: 1,
        poisonT: 160,
        color: '#7cb342'
      });
    }
  },
  
  {
    name: 'Quake',
    icon: 'Quake',
    cd: 4.5,
    tags: ['Earth', 'Control'],
    cast() {
      Combat.radialExplosion(
        GameState.player.x,
        GameState.player.y,
        28,
        AbilitiesLogic.baseDmg()
      );
      
      // Create quake particles
      for (let k = 0; k < 10; k++) {
        ParticleSystem.create(
          GameState.player.x,
          GameState.player.y,
          1.4,
          16
        );
      }
      
      // Apply stun if has Grounded relic
      if (RelicSystem.hasRelic('Grounded')) {
        AbilitiesLogic.stunInRadius(
          GameState.player.x,
          GameState.player.y,
          24,
          50
        );
      }
    }
  },
  
  {
    name: 'Blink',
    icon: 'Blink',
    cd: 3.5,
    tags: ['Mobility'],
    cast() {
      AbilitiesLogic.blink();
    }
  }
];

// Helper functions for abilities
const AbilitiesLogic = {
  // Calculate base damage with modifiers
  baseDmg() {
    return 1 + 
      (GameState.player.eclipse ? 1 : 0) + 
      (RelicSystem.hasRelic('Sharper') ? 1 : 0);
  },
  
  // Emit a bullet from position
  emitBullet(x, y, dir, props) {
    const bullet = {
      x,
      y,
      dir,
      vx: Math.cos(dir) * (props.spd || 2),
      vy: Math.sin(dir) * (props.spd || 2),
      life: props.life || 120,
      owner: 'player',
      ...props
    };
    GameState.bullets.push(bullet);
  },
  
  // Auto-aim and shoot at nearest enemy
  autoShoot(props) {
    const enemy = Combat.nearestEnemy(GameState.player.x, GameState.player.y);
    const dir = enemy ? 
      Helpers.angleTo(GameState.player.x, GameState.player.y, enemy.x, enemy.y) : 
      0;
    this.emitBullet(GameState.player.x, GameState.player.y, dir, props);
  },
  
  // Get aim direction to nearest enemy
  aimDir() {
    const enemy = Combat.nearestEnemy(GameState.player.x, GameState.player.y);
    return enemy ? 
      Helpers.angleTo(GameState.player.x, GameState.player.y, enemy.x, enemy.y) : 
      0;
  },
  
  // Stun enemies in radius
  stunInRadius(x, y, radius, duration) {
    for (const enemy of GameState.enemies) {
      if (Helpers.dist(x, y, enemy.x, enemy.y) <= radius) {
        enemy.slowT = duration;
        enemy.slowMul = 0.1;
      }
    }
  },
  
  // Blink teleport ability
  blink() {
    // Get movement direction from arrow keys
    const mvx = (GameState.keys['ArrowRight'] ? 1 : 0) - 
                (GameState.keys['ArrowLeft'] ? 1 : 0);
    const mvy = (GameState.keys['ArrowDown'] ? 1 : 0) - 
                (GameState.keys['ArrowUp'] ? 1 : 0);
    
    const len = Math.hypot(mvx, mvy) || 1;
    const dx = (mvx / len) * 24;
    const dy = (mvy / len) * 24;
    
    const oldX = GameState.player.x;
    const oldY = GameState.player.y;
    
    // Update player position with bounds checking
            GameState.player.x = Helpers.clamp(GameState.player.x + dx, 8, 312);
            GameState.player.y = Helpers.clamp(GameState.player.y + dy, 8, 232);
    GameState.player.iTimer = Math.max(GameState.player.iTimer, 50);
    
    // Handle StormWalk synergy effect
    if (SynergySystem.hasSynergyActive('StormWalk')) {
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = oldX + (GameState.player.x - oldX) * t;
        const y = oldY + (GameState.player.y - oldY) * t;
        
        GameState.particles.push({
          x, y, 
          vx: 0, 
          vy: 0, 
          life: 30, 
          kind: 'lightning'
        });
        
        // Damage enemies along the path
        for (const enemy of GameState.enemies) {
          if (Helpers.dist(x, y, enemy.x, enemy.y) < 12) {
            Combat.hitEnemy(enemy, 1, 'shock');
          }
        }
      }
    }
    
    // Create blink particles at origin
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      GameState.particles.push({
        x: oldX,
        y: oldY,
        vx: Math.cos(angle) * 1.5,
        vy: Math.sin(angle) * 1.5,
        life: 20,
        kind: 'blink'
      });
    }
  },
  
  // Create shield visual effect
  createShieldEffect() {
    const shield = document.createElement('div');
    shield.className = 'shield-effect';
    shield.style.left = (GameState.player.x - 20) + 'px';
    shield.style.top = (GameState.player.y - 20) + 'px';
    shield.style.width = '40px';
    shield.style.height = '40px';
    
    const gameContainer = document.querySelector('.wrap') || 
                         document.querySelector('#gameContainer');
    if (gameContainer) {
      gameContainer.appendChild(shield);
      
      setTimeout(() => {
        shield.remove();
      }, 800);
    }
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ABILITIES, AbilityIcons, AbilitiesLogic };
}