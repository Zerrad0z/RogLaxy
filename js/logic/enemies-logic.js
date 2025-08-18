// ========================================
// FILE: js/logic/enemies-logic.js
// Enemy spawning, AI, and behavior logic
// ========================================

const EnemySpawner = {
  // Spawn a single grunt enemy
  spawnGrunt() {
    const type = EnemyTypes.grunt;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      poisonT: 0,
      poison: 0,
      poisonTick: 0,
      kind: 'grunt',
      spd: type.baseSpeed + type.speedScaling(GameState.room)
    });
  },
  
  // Spawn an archer enemy
  spawnArcher() {
    const type = EnemyTypes.archer;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'archer',
      spd: type.baseSpeed,
      shootT: RNG.range(type.shootCooldown.min, type.shootCooldown.max)
    });
  },
  
  // Spawn a bomber enemy
  spawnBomber() {
    const type = EnemyTypes.bomber;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'bomber',
      spd: type.baseSpeed
    });
  },
  
  // Spawn a dasher enemy
  spawnDasher() {
    const type = EnemyTypes.dasher;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'dasher',
      spd: type.baseSpeed,
      dashT: 60,
      dashing: false,
      dashDir: 0
    });
  },
  
  // Spawn an orbit mage enemy
  spawnOrbitMage() {
    const type = EnemyTypes.orbitMage;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'orbitMage',
      spd: type.baseSpeed,
      angle: RNG.r() * Math.PI * 2,
      shootT: 80
    });
  },
  
  // Spawn a splitter enemy
  spawnSplitter() {
    const type = EnemyTypes.splitter;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'splitter',
      spd: type.baseSpeed
    });
  },
  
  // Spawn a tank enemy
  spawnTank() {
    const type = EnemyTypes.tank;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'tank',
      spd: type.baseSpeed
    });
  },
  
  // Spawn a sniper enemy
  spawnSniper() {
    const type = EnemyTypes.sniper;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'sniper',
      spd: type.baseSpeed,
      chargeT: 0,
      charging: false
    });
  },
  
  // Spawn a minion (from splitter death)
  spawnMinion(x, y) {
    const type = EnemyTypes.minion;
    const hp = type.baseHp;
    
    // Add some offset to prevent stacking
    const angle = Math.random() * Math.PI * 2;
    const offset = 5;
    
    GameState.enemies.push({
      x: x + Math.cos(angle) * offset,
      y: y + Math.sin(angle) * offset,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind: 'minion',
      spd: type.baseSpeed
    });
  },
  
  // Spawn a boss enemy
  spawnBoss() {
    const x = 160;
    const y = 120;
    const kind = GameState.room === 4 ? 'Warden' : 'EclipseTwin';
    const type = EnemyTypes[kind];
    const hp = type.baseHp + type.hpScaling(GameState.room);
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
      stun: 0,
      kind,
      spd: type.baseSpeed,
      phase: 0,
      atkT: 90
    });
    
    // Show boss UI
    Helpers.$('#bossBar').style.display = 'block';
    Helpers.$('#bossName').textContent = kind === 'Warden' ? 'The Warden' : 'Eclipse Twin';
  },
  
  // Spawn a wave of enemies for the current room
  spawnWave() {
    const isBoss = (GameState.room === 4 || GameState.room === 8);
    
    if (isBoss) {
      this.spawnBoss();
      return;
    }
    
    const enemyCount = 3 + GameState.room;
    
    for (let i = 0; i < enemyCount; i++) {
      const roll = RNG.range(0, 100);
      
      if (GameState.room <= 2) {
        // Early game: mostly grunts and archers
        if (roll < 70) this.spawnGrunt();
        else if (roll < 90) this.spawnArcher();
        else this.spawnBomber();
      }
      else if (GameState.room === 3) {
        // Introduce dashers and orbit mages
        if (roll < 40) this.spawnGrunt();
        else if (roll < 60) this.spawnArcher();
        else if (roll < 75) this.spawnBomber();
        else if (roll < 90) this.spawnDasher();
        else this.spawnOrbitMage();
      }
      else if (GameState.room <= 6) {
        // Mid game: variety of enemies
        if (roll < 25) this.spawnGrunt();
        else if (roll < 45) this.spawnArcher();
        else if (roll < 60) this.spawnDasher();
        else if (roll < 75) this.spawnOrbitMage();
        else if (roll < 90) this.spawnSplitter();
        else this.spawnTank();
      }
      else {
        // Late game: harder enemies
        if (roll < 20) this.spawnDasher();
        else if (roll < 40) this.spawnOrbitMage();
        else if (roll < 60) this.spawnSplitter();
        else if (roll < 80) this.spawnTank();
        else this.spawnSniper();
      }
    }
  }
};

const EnemyAI = {
  // Main AI update function
  updateEnemy(enemy, player, dt) {
    // Handle stun
    if (enemy.stun > 0) {
      enemy.stun--;
      return; // Stunned enemies can't act
    }
    
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
      case 'minion':
        this.minionAI(enemy, player);
        break;
      case 'Warden':
      case 'EclipseTwin':
        this.bossAI(enemy, player);
        break;
    }
    
    // Keep enemies in bounds
    enemy.x = Helpers.clamp(enemy.x, enemy.r, 320 - enemy.r);
    enemy.y = Helpers.clamp(enemy.y, enemy.r, 240 - enemy.r);
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
  
  // Boss AI: Complex patterns
  bossAI(enemy, player) {
    enemy.atkT--;
    
    if (enemy.kind === 'Warden') {
      this.wardenAI(enemy, player);
    } else if (enemy.kind === 'EclipseTwin') {
      this.eclipseTwinAI(enemy, player);
    }
  },
  
  // Warden boss specific AI
  wardenAI(enemy, player) {
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
  },
  
  // Eclipse Twin boss specific AI
  eclipseTwinAI(enemy, player) {
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
};

const EnemyLogic = {
  // Update all enemies
  updateEnemies(dt) {
    for (let i = GameState.enemies.length - 1; i >= 0; i--) {
      const enemy = GameState.enemies[i];
      
      // Update enemy AI
      EnemyAI.updateEnemy(enemy, GameState.player, dt);
      
      // Handle poison damage
      this.updatePoison(enemy);
      
      // Check collision with player
      this.checkPlayerCollision(enemy);
    }
    
    // Apply enemy collision avoidance
    this.separateEnemies();
  },
  
  // Update poison effects on enemy
  updatePoison(enemy) {
    if (enemy.poisonT > 0) {
      if ((enemy.poisonTick || 0) <= 0) {
        let poisonDmg = enemy.poison || 1;
        
        // Hellfire synergy bonus
        if (SynergySystem.hasSynergyActive('Hellfire')) {
          poisonDmg += 1;
          GameState.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: 0,
            vy: -0.5,
            life: 20,
            kind: 'hellfire'
          });
        }
        
        Combat.hitEnemy(enemy, poisonDmg, 'poison');
        enemy.poisonTick = 30;
      } else {
        enemy.poisonTick--;
      }
      enemy.poisonT--;
    }
  },
  
  // Check enemy collision with player
  checkPlayerCollision(enemy) {
    if (Helpers.dist(enemy.x, enemy.y, GameState.player.x, GameState.player.y) < 
        enemy.r + GameState.player.r) {
      
      if (GameState.player.iTimer <= 0) {
        GameState.player.hp--;
        GameState.player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
        AudioSystem.hurt();
        
        if (GameState.player.hp <= 0) {
          GameFlow.gameOver(false);
        }
      }
    }
  },
  
  // Separate overlapping enemies
  separateEnemies() {
    const separation = 1.5;
    const minDistance = 8;
    
    for (let i = 0; i < GameState.enemies.length; i++) {
      const e1 = GameState.enemies[i];
      let separationX = 0;
      let separationY = 0;
      
      for (let j = i + 1; j < GameState.enemies.length; j++) {
        const e2 = GameState.enemies[j];
        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < minDistance && distance > 0) {
          const force = (minDistance - distance) / distance * separation;
          const forceX = dx * force;
          const forceY = dy * force;
          
          separationX += forceX;
          separationY += forceY;
          
          if (!e2.separationX) e2.separationX = 0;
          if (!e2.separationY) e2.separationY = 0;
          e2.separationX -= forceX;
          e2.separationY -= forceY;
        }
      }
      
      e1.separationX = (e1.separationX || 0) + separationX;
      e1.separationY = (e1.separationY || 0) + separationY;
    }
    
    // Apply separation forces
    for (const enemy of GameState.enemies) {
      if (enemy.separationX || enemy.separationY) {
        enemy.x += enemy.separationX || 0;
        enemy.y += enemy.separationY || 0;
        
        // Keep in bounds
        enemy.x = Helpers.clamp(enemy.x, enemy.r, 320 - enemy.r);
        enemy.y = Helpers.clamp(enemy.y, enemy.r, 240 - enemy.r);
        
        // Reset separation forces
        enemy.separationX = 0;
        enemy.separationY = 0;
      }
    }
  },
  
  // Handle enemy death
  onEnemyDeath(enemy) {
    // Special death effects
    if (enemy.kind === 'splitter') {
      // Spawn minions
      const type = EnemyTypes.splitter;
      for (let i = 0; i < type.splitCount; i++) {
        const angle = (i / type.splitCount) * Math.PI * 2;
        const mx = enemy.x + Math.cos(angle) * type.minionSpawnDistance;
        const my = enemy.y + Math.sin(angle) * type.minionSpawnDistance;
        EnemySpawner.spawnMinion(mx, my);
      }
    }
    
    // Boss death handling
    if (enemy.kind === 'Warden' || enemy.kind === 'EclipseTwin') {
      Helpers.$('#bossBar').style.display = 'none';
    }
    
    // Trigger relic effects
    RelicSystem.onEnemyKilled(enemy);
  },
  
  // Get nearest enemy to a position
  nearestEnemy(x, y, notThis = null) {
    let best = null;
    let bestDist = Infinity;
    
    for (const enemy of GameState.enemies) {
      if (enemy === notThis) continue;
      const dist = Helpers.dist(x, y, enemy.x, enemy.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = enemy;
      }
    }
    
    return best;
  },
  
  // Get all enemies in radius
  enemiesInRadius(x, y, radius) {
    return GameState.enemies.filter(enemy => 
      Helpers.dist(x, y, enemy.x, enemy.y) <= radius
    );
  },
  
  // Apply effect to enemies in radius
  applyToEnemiesInRadius(x, y, radius, effect) {
    const enemies = this.enemiesInRadius(x, y, radius);
    enemies.forEach(effect);
    return enemies.length;
  },
  
  // Clear all enemies
  clearEnemies() {
    GameState.enemies = [];
    GameState.ebullets = [];
  },
  
  // Get enemy statistics
  getEnemyStats() {
    return {
      count: GameState.enemies.length,
      types: GameState.enemies.reduce((acc, enemy) => {
        acc[enemy.kind] = (acc[enemy.kind] || 0) + 1;
        return acc;
      }, {}),
      totalHp: GameState.enemies.reduce((sum, enemy) => sum + enemy.hp, 0),
      hasBoss: GameState.enemies.some(e => e.kind === 'Warden' || e.kind === 'EclipseTwin')
    };
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemySpawner, EnemyAI, EnemyLogic };
}