// ========================================
// FILE: js/data/enemies.js
// Complete enemy definitions and spawning system
// ========================================

const EnemyTypes = {
  grunt: {
    baseHp: 2,
    baseSpeed: 0.55,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 2),
    speedScaling: (room) => room * 0.05,
    behavior: 'chase',
    description: 'Basic melee enemy that chases the player'
  },
  
  archer: {
    baseHp: 2,
    baseSpeed: 0.45,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    shootCooldown: { min: 45, max: 80 },
    preferredDistance: 46,
    projectileSpeed: 1.3,
    behavior: 'ranged',
    description: 'Maintains distance and shoots projectiles'
  },
  
  bomber: {
    baseHp: 3,
    baseSpeed: 0.5,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 2),
    explosionRadius: 20,
    explosionDamage: 2,
    detonateDistance: 10,
    behavior: 'kamikaze',
    description: 'Explodes on contact with player'
  },
  
  dasher: {
    baseHp: 3,
    baseSpeed: 0.3,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    dashSpeed: 2.5,
    dashDuration: 20,
    dashCooldown: 80,
    behavior: 'dash',
    description: 'Periodically dashes toward player'
  },
  
  orbitMage: {
    baseHp: 4,
    baseSpeed: 0.4,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    orbitDistance: 60,
    orbitSpeed: 0.02,
    shootCooldown: 60,
    projectileSpeed: 1.1,
    behavior: 'orbit',
    description: 'Orbits around player while shooting'
  },
  
  splitter: {
    baseHp: 5,
    baseSpeed: 0.45,
    radius: 5,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 2),
    splitCount: 3,
    minionSpawnDistance: 10,
    behavior: 'splitter',
    description: 'Splits into minions on death'
  },
  
  tank: {
    baseHp: 8,
    baseSpeed: 0.25,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    damageResistance: 0.5,
    behavior: 'tank',
    description: 'Slow but very tanky enemy'
  },
  
  sniper: {
    baseHp: 3,
    baseSpeed: 0.35,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 2),
    preferredDistance: 80,
    chargeTime: 40,
    projectileSpeed: 3,
    behavior: 'sniper',
    description: 'Long range, high damage shots'
  },
  
  minion: {
    baseHp: 1,
    baseSpeed: 0.7,
    radius: 3,
    color: '#fff',
    hpScaling: (room) => 0,
    behavior: 'swarm',
    description: 'Weak but fast swarming enemy'
  },

  // New late-game enemies
  phantom: {
    baseHp: 4,
    baseSpeed: 0.6,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    fadeInterval: 60,
    invisibleDuration: 40,
    invisibleSpeedBoost: 1.5,
    behavior: 'phantom',
    description: 'Fades in and out, moves unpredictably'
  },

  healer: {
    baseHp: 3,
    baseSpeed: 0.4,
    radius: 4,
    color: '#0f0',
    hpScaling: (room) => Math.floor(room / 3),
    healRadius: 50,
    healAmount: 1,
    healCooldown: 120,
    safeDistance: 60,
    behavior: 'healer',
    description: 'Heals nearby allies'
  },

  shielder: {
    baseHp: 5,
    baseSpeed: 0.3,
    radius: 5,
    color: '#00f',
    hpScaling: (room) => Math.floor(room / 2),
    shieldRadius: 40,
    shieldDuration: 100,
    shieldCooldown: 150,
    behavior: 'shielder',
    description: 'Creates protective shields'
  },

  trickster: {
    baseHp: 3,
    baseSpeed: 0.7,
    radius: 4,
    color: '#f0f',
    hpScaling: (room) => Math.floor(room / 3),
    teleportCooldown: 80,
    teleportRange: 60,
    cloneCount: 2,
    cloneHp: 1,
    behavior: 'trickster',
    description: 'Teleports and creates clones'
  },

  voidling: {
    baseHp: 2,
    baseSpeed: 0.5,
    radius: 3,
    color: '#800080',
    hpScaling: (room) => Math.floor(room / 3),
    pullRadius: 30,
    pullStrength: 0.3,
    voidBurstCooldown: 100,
    behavior: 'voidling',
    description: 'Pulls player towards it'
  },
  
  // Boss enemies
  Warden: {
    baseHp: 30,
    baseSpeed: 0.6,
    radius: 7,
    color: '#fff',
    hpScaling: (room) => room * 4,
    attackCooldown: 90,
    projectileCount: 8,
    projectileSpeed: 1.2,
    behavior: 'boss',
    isBoss: true,
    description: 'Mid-game boss with radial attacks'
  },
  
  EclipseTwin: {
    baseHp: 30,
    baseSpeed: 0.6,
    radius: 7,
    color: '#fff',
    hpScaling: (room) => room * 4,
    attackCooldown: 70,
    projectileCount: 5,
    projectileSpeed: 1.5,
    orbitRadius: 40,
    behavior: 'boss',
    isBoss: true,
    description: 'Final boss with complex patterns'
  },

  // Final boss
  VoidMonarch: {
    baseHp: 50,
    baseSpeed: 0.4,
    radius: 8,
    color: '#800080',
    hpScaling: (room) => room * 6,
    attackCooldown: 60,
    projectileCount: 12,
    projectileSpeed: 1.8,
    voidlingSpawnRate: 0.05,
    behavior: 'boss',
    isBoss: true,
    description: 'Final boss with void powers'
  }
};

const EnemyAI = {
  // Main AI update function
  updateEnemy(enemy, player, dt) {
    // Apply slow effects
    if (enemy.slowT > 0) {
      enemy.slowT--;
    }
    
    // Call specific AI based on enemy type
    switch(enemy.kind) {
      case 'grunt':
        this.gruntAI(enemy, player);
        break;
      case 'archer':
        this.archerAI(enemy, player);
        break;
      case 'bomber':
        this.bomberAI(enemy, player);
        break;
      case 'dasher':
        this.dasherAI(enemy, player);
        break;
      case 'orbitMage':
        this.orbitMageAI(enemy, player);
        break;
      case 'splitter':
        this.splitterAI(enemy, player);
        break;
      case 'tank':
        this.tankAI(enemy, player);
        break;
      case 'sniper':
        this.sniperAI(enemy, player);
        break;
      case 'phantom':
        this.phantomAI(enemy, player);
        break;
      case 'healer':
        this.healerAI(enemy, player);
        break;
      case 'shielder':
        this.shielderAI(enemy, player);
        break;
      case 'trickster':
        this.tricksterAI(enemy, player);
        break;
      case 'voidling':
        this.voidlingAI(enemy, player);
        break;
      case 'minion':
        this.minionAI(enemy, player);
        break;
      case 'Warden':
      case 'EclipseTwin':
        this.bossAI(enemy, player);
        break;
      case 'VoidMonarch':
        this.voidMonarchAI(enemy, player);
        break;
    }
  },
  
  // Grunt AI: Simple chase
  gruntAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    const speedMul = enemy.slowT > 0 ? enemy.slowMul : 1;
    enemy.x += Math.cos(angle) * enemy.spd * speedMul;
    enemy.y += Math.sin(angle) * enemy.spd * speedMul;
  },
  
  // Archer AI: Maintain distance and shoot
  archerAI(enemy, player) {
    const dist = Helpers.dist(enemy.x, enemy.y, player.x, player.y);
    const type = EnemyTypes.archer;
    
    // Move closer if too far
    if (dist > type.preferredDistance) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd;
      enemy.y += Math.sin(angle) * enemy.spd;
    }
    
    // Shoot projectile
    if (--enemy.shootT <= 0) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      GameState.ebullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * type.projectileSpeed,
        vy: Math.sin(angle) * type.projectileSpeed,
        life: 160
      });
      enemy.shootT = RNG.range(type.shootCooldown.min, type.shootCooldown.max);
    }
  },
  
  // Bomber AI: Chase and explode
  bomberAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
    
    const type = EnemyTypes.bomber;
    if (Helpers.dist(enemy.x, enemy.y, player.x, player.y) < type.detonateDistance) {
      Combat.radialExplosion(enemy.x, enemy.y, type.explosionRadius, type.explosionDamage);
      const idx = GameState.enemies.indexOf(enemy);
      if (idx >= 0) GameState.enemies.splice(idx, 1);
    }
  },
  
  // Dasher AI: Periodic dash attacks
  dasherAI(enemy, player) {
    const type = EnemyTypes.dasher;
    
    if (--enemy.dashT <= 0 && !enemy.dashing) {
      enemy.dashing = true;
      enemy.dashDir = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.dashT = type.dashDuration;
    }
    
    if (enemy.dashing) {
      enemy.x += Math.cos(enemy.dashDir) * type.dashSpeed;
      enemy.y += Math.sin(enemy.dashDir) * type.dashSpeed;
      if (--enemy.dashT <= 0) {
        enemy.dashing = false;
        enemy.dashT = type.dashCooldown;
      }
    } else {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd;
      enemy.y += Math.sin(angle) * enemy.spd;
    }
  },
  
  // Orbit Mage AI: Circle player and shoot
  orbitMageAI(enemy, player) {
    const type = EnemyTypes.orbitMage;
    enemy.angle += type.orbitSpeed;
    
    const targetX = player.x + Math.cos(enemy.angle) * type.orbitDistance;
    const targetY = player.y + Math.sin(enemy.angle) * type.orbitDistance;
    const angle = Helpers.angleTo(enemy.x, enemy.y, targetX, targetY);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
    
    if (--enemy.shootT <= 0) {
      const shootAngle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      GameState.ebullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(shootAngle) * type.projectileSpeed,
        vy: Math.sin(shootAngle) * type.projectileSpeed,
        life: 120
      });
      enemy.shootT = type.shootCooldown;
    }
  },
  
  // Splitter AI: Chase (splits on death handled elsewhere)
  splitterAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    const speedMul = enemy.slowT > 0 ? enemy.slowMul : 1;
    enemy.x += Math.cos(angle) * enemy.spd * speedMul;
    enemy.y += Math.sin(angle) * enemy.spd * speedMul;
  },
  
  // Tank AI: Slow but steady chase
  tankAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
  },
  
  // Sniper AI: Long range charged shots
  sniperAI(enemy, player) {
    const type = EnemyTypes.sniper;
    const dist = Helpers.dist(enemy.x, enemy.y, player.x, player.y);
    
    if (dist > type.preferredDistance && !enemy.charging) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd;
      enemy.y += Math.sin(angle) * enemy.spd;
    } else if (!enemy.charging) {
      enemy.charging = true;
      enemy.chargeT = type.chargeTime;
    }
    
    if (enemy.charging) {
      if (--enemy.chargeT <= 0) {
        const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
        GameState.ebullets.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * type.projectileSpeed,
          vy: Math.sin(angle) * type.projectileSpeed,
          life: 100
        });
        enemy.charging = false;
      }
    }
  },
  
  // Minion AI: Fast swarm behavior
  minionAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
  },

  // Phantom AI: Fade in and out
  phantomAI(enemy, player) {
    const type = EnemyTypes.phantom;
    enemy.fadeT = (enemy.fadeT || 0) + 1;
    
    if (enemy.fadeT > type.fadeInterval) {
      enemy.fadeT = 0;
      enemy.invisible = !enemy.invisible;
    }
    
    if (!enemy.invisible) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      const speed = enemy.invisible ? enemy.spd * type.invisibleSpeedBoost : enemy.spd;
      enemy.x += Math.cos(angle) * speed;
      enemy.y += Math.sin(angle) * speed;
    }
  },

  // Healer AI: Heal nearby allies
  healerAI(enemy, player) {
    const type = EnemyTypes.healer;
    enemy.healT = (enemy.healT || 0) + 1;
    
    if (enemy.healT > type.healCooldown) {
      enemy.healT = 0;
      
      // Find allies to heal
      for (const other of GameState.enemies) {
        if (other !== enemy && other.hp < other.maxHp) {
          const dist = Helpers.dist(other.x, other.y, enemy.x, enemy.y);
          if (dist < type.healRadius) {
            other.hp = Math.min(other.hp + type.healAmount, other.maxHp);
            enemy.hp -= type.healAmount * 0.5; // Sacrifice some HP
          }
        }
      }
    }
    
    // Keep distance from player
    const dist = Helpers.dist(enemy.x, enemy.y, player.x, player.y);
    if (dist < type.safeDistance) {
      const angle = Helpers.angleTo(player.x, player.y, enemy.x, enemy.y);
      enemy.x += Math.cos(angle) * enemy.spd;
      enemy.y += Math.sin(angle) * enemy.spd;
    }
  },

  // Shielder AI: Create protective shields
  shielderAI(enemy, player) {
    const type = EnemyTypes.shielder;
    enemy.shieldT = (enemy.shieldT || 0) + 1;
    
    if (enemy.shieldT > type.shieldCooldown) {
      enemy.shieldT = 0;
      enemy.shielded = true;
      enemy.shieldDuration = type.shieldDuration;
    }
    
    if (enemy.shielded) {
      enemy.shieldDuration--;
      if (enemy.shieldDuration <= 0) {
        enemy.shielded = false;
      }
    }
    
    // Basic movement
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
  },

  // Trickster AI: Teleport and create clones
  tricksterAI(enemy, player) {
    const type = EnemyTypes.trickster;
    enemy.teleportT = (enemy.teleportT || 0) + 1;
    
    if (enemy.teleportT > type.teleportCooldown) {
      enemy.teleportT = 0;
      
      // Teleport away from player
      const angle = Helpers.angleTo(player.x, player.y, enemy.x, enemy.y);
      enemy.x += Math.cos(angle) * type.teleportRange;
      enemy.y += Math.sin(angle) * type.teleportRange;
      
      // Create clones
      for (let i = 0; i < type.cloneCount; i++) {
        const cloneAngle = (Math.PI * 2 * i) / type.cloneCount;
        const cloneX = enemy.x + Math.cos(cloneAngle) * 20;
        const cloneY = enemy.y + Math.sin(cloneAngle) * 20;
        
        GameState.enemies.push({
          x: cloneX,
          y: cloneY,
          r: enemy.r,
          hp: type.cloneHp,
          maxHp: type.cloneHp,
          kind: 'minion',
          spd: enemy.spd * 1.2,
          isClone: true
        });
      }
    }
    
    // Basic movement
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
  },

  // Voidling AI: Pull player towards it
  voidlingAI(enemy, player) {
    const type = EnemyTypes.voidling;
    enemy.voidT = (enemy.voidT || 0) + 1;
    
    if (enemy.voidT > type.voidBurstCooldown) {
      enemy.voidT = 0;
      
      // Pull effect
      const dist = Helpers.dist(enemy.x, enemy.y, player.x, player.y);
      if (dist < type.pullRadius) {
        const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
        player.x += Math.cos(angle) * type.pullStrength;
        player.y += Math.sin(angle) * type.pullStrength;
      }
    }
    
    // Stay in place
    // voidlings don't move, they just pull
  },
  
  // Boss AI: Complex patterns
  bossAI(enemy, player) {
    enemy.atkT--;
    
    if (enemy.kind === 'Warden') {
      const type = EnemyTypes.Warden;
      
      if (enemy.atkT <= 0) {
        enemy.atkT = type.attackCooldown;
        
        // Radial burst attack
        for (let i = 0; i < type.projectileCount; i++) {
          const angle = (i / type.projectileCount) * Math.PI * 2;
          GameState.ebullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * type.projectileSpeed,
            vy: Math.sin(angle) * type.projectileSpeed,
            life: 120
          });
        }
      }
      
      // Chase player slowly
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd * 0.7;
      enemy.y += Math.sin(angle) * enemy.spd * 0.7;
      
    } else if (enemy.kind === 'EclipseTwin') {
      const type = EnemyTypes.EclipseTwin;
      
      if (enemy.atkT <= 0) {
        enemy.atkT = type.attackCooldown;
        
        // Shotgun attack toward player
        const baseAngle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
        for (let k = -2; k <= 2; k++) {
          const angle = baseAngle + k * 0.1;
          GameState.ebullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * type.projectileSpeed,
            vy: Math.sin(angle) * type.projectileSpeed,
            life: 130
          });
        }
      }
      
      // Orbit around center
      const orbitAngle = (GameState.time / 600) + (enemy.phase * 2.1);
      enemy.x = 160 + Math.cos(orbitAngle) * type.orbitRadius;
      enemy.y = 120 + Math.sin(orbitAngle) * 30;
    }
  },

  // Void Monarch AI: Final boss with phases
  voidMonarchAI(enemy, player) {
    const type = EnemyTypes.VoidMonarch;
    
    // Phase transitions based on HP
    if (enemy.hp < enemy.maxHp * 0.33 && enemy.phase === 1) {
      enemy.phase = 2;
      enemy.spd *= 1.3;
    } else if (enemy.hp < enemy.maxHp * 0.1 && enemy.phase === 2) {
      enemy.phase = 3;
      enemy.spd *= 1.5;
    }
    
    // Attack cooldown
    enemy.attackT = (enemy.attackT || 0) + 1;
    
    if (enemy.attackT > type.attackCooldown) {
      enemy.attackT = 0;
      
      if (enemy.phase === 1) {
        // Phase 1: Radial burst
        for (let i = 0; i < type.projectileCount; i++) {
          const angle = (i / type.projectileCount) * Math.PI * 2;
          GameState.ebullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * type.projectileSpeed,
            vy: Math.sin(angle) * type.projectileSpeed,
            life: 150,
            homing: false // No homing in phase 1
          });
        }
      } else if (enemy.phase === 2) {
        // Phase 2: Spiral pattern
        for (let i = 0; i < type.projectileCount; i++) {
          const angle = (i / type.projectileCount) * Math.PI * 2 + (enemy.attackT * 0.1);
          GameState.ebullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * type.projectileSpeed,
            vy: Math.sin(angle) * type.projectileSpeed,
            life: 150,
            homing: false
          });
        }
        
        // Spawn voidlings
        if (Math.random() < type.voidlingSpawnRate) {
          const spawnX = enemy.x + RNG.range(-20, 20);
          const spawnY = enemy.y + RNG.range(-20, 20);
          if (window.EnemySpawner && typeof window.EnemySpawner.spawnVoidling === 'function') {
            window.EnemySpawner.spawnVoidling(spawnX, spawnY);
          }
        }
      } else if (enemy.phase === 3) {
        // Phase 3: Chaos mode - multiple patterns
        // Radial burst
        for (let i = 0; i < type.projectileCount; i++) {
          const angle = (i / type.projectileCount) * Math.PI * 2;
          GameState.ebullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * type.projectileSpeed * 1.2,
            vy: Math.sin(angle) * type.projectileSpeed * 1.2,
            life: 150,
            homing: false
          });
        }
        
        // Spawn more voidlings
        if (Math.random() < type.voidlingSpawnRate * 2) {
          const spawnX = enemy.x + RNG.range(-30, 30);
          const spawnY = enemy.y + RNG.range(-30, 30);
          if (window.EnemySpawner && typeof window.EnemySpawner.spawnVoidling === 'function') {
            window.EnemySpawner.spawnVoidling(spawnX, spawnY);
          }
        }
      }
    }
    
    // Movement: stay in center area
    const centerX = 160, centerY = 120;
    const distFromCenter = Helpers.dist(enemy.x, enemy.y, centerX, centerY);
    
    if (distFromCenter > 40) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, centerX, centerY);
      enemy.x += Math.cos(angle) * enemy.spd * 0.5;
      enemy.y += Math.sin(angle) * enemy.spd * 0.5;
    }
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemyTypes, EnemyAI };
}

// Ensure types and the data spawner are available to browser runtime code
if (typeof window !== 'undefined') {
  window.EnemyTypes = typeof EnemyTypes !== 'undefined' ? EnemyTypes : window.EnemyTypes;
  window.EnemyDataSpawner = typeof EnemyDataSpawner !== 'undefined' ? EnemyDataSpawner : window.EnemyDataSpawner;
}