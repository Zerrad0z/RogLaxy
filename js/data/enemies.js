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
  }
};

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
      kind: 'dasher',
      spd: type.baseSpeed,
      dashT: 60,
      dashing: false
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
    
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      slowT: 0,
      slowMul: 1,
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
      kind,
      spd: type.baseSpeed,
      phase: 0,
      atkT: 90
    });
    
    // Show boss UI
    const bossBar = document.querySelector('#bossBar');
    if (bossBar) {
      bossBar.style.display = 'block';
      const bossName = document.querySelector('#bossName');
      if (bossName) {
        bossName.textContent = kind === 'Warden' ? 'The Warden' : 'Eclipse Twin';
      }
    }
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
  },
  
  // Spawn specific enemy type by name
  spawnByType(enemyType, x = null, y = null) {
    const spawners = {
      'grunt': this.spawnGrunt,
      'archer': this.spawnArcher,
      'bomber': this.spawnBomber,
      'dasher': this.spawnDasher,
      'orbitMage': this.spawnOrbitMage,
      'splitter': this.spawnSplitter,
      'tank': this.spawnTank,
      'sniper': this.spawnSniper,
      'minion': (x, y) => this.spawnMinion(x, y),
      'Warden': this.spawnBoss,
      'EclipseTwin': this.spawnBoss
    };
    
    const spawner = spawners[enemyType];
    if (spawner) {
      if (x !== null && y !== null) {
        spawner.call(this, x, y);
      } else {
        spawner.call(this);
      }
    }
  },
  
  // Get enemy composition for a specific room
  getWaveComposition(roomNumber) {
    const composition = {
      enemies: [],
      totalCount: 3 + roomNumber,
      isBoss: false
    };
    
    if (roomNumber === 4 || roomNumber === 8) {
      composition.isBoss = true;
      composition.enemies = [roomNumber === 4 ? 'Warden' : 'EclipseTwin'];
      return composition;
    }
    
    // Calculate enemy distribution based on room
    if (roomNumber <= 2) {
      composition.enemies = ['grunt', 'grunt', 'grunt', 'archer', 'bomber'];
    } else if (roomNumber === 3) {
      composition.enemies = ['grunt', 'grunt', 'archer', 'archer', 'bomber', 'dasher', 'orbitMage'];
    } else if (roomNumber <= 6) {
      composition.enemies = ['grunt', 'archer', 'archer', 'dasher', 'dasher', 'orbitMage', 'orbitMage', 'splitter', 'tank'];
    } else {
      composition.enemies = ['dasher', 'dasher', 'orbitMage', 'orbitMage', 'splitter', 'splitter', 'tank', 'tank', 'sniper'];
    }
    
    return composition;
  },
  
  // Clear all enemies
  clearEnemies() {
    GameState.enemies = [];
  },
  
  // Get enemy count
  getEnemyCount() {
    return GameState.enemies.length;
  },
  
  // Get enemies by type
  getEnemiesByType(type) {
    return GameState.enemies.filter(e => e.kind === type);
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
      case 'minion':
        this.minionAI(enemy, player);
        break;
      case 'Warden':
      case 'EclipseTwin':
        this.bossAI(enemy, player);
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
  }
};

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemyTypes, EnemySpawner, EnemyAI };
}