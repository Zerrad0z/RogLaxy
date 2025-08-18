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
  
  // --- NEW ENEMIES FOR LEVELS 9-12 ---
  phantom: {
    baseHp: 5,
    baseSpeed: 0.6,
    radius: 4,
    color: '#b0f',
    hpScaling: (room) => Math.floor(room / 2),
    fadeInterval: 60,
    invisibleDuration: 40,
    invisibleSpeedBoost: 1.5,
    behavior: 'phantom',
    description: 'Fades in/out, moves fast while invisible'
  },
  healer: {
    baseHp: 6,
    baseSpeed: 0.4,
    radius: 4,
    color: '#0f8',
    hpScaling: (room) => Math.floor(room / 2),
    healRadius: 50,
    healAmount: 1,
    healCooldown: 120,
    safeDistance: 60,
    behavior: 'healer',
    description: 'Heals nearby enemies periodically'
  },
  shielder: {
    baseHp: 7,
    baseSpeed: 0.35,
    radius: 5,
    color: '#0ff',
    hpScaling: (room) => Math.floor(room / 2),
    shieldRadius: 40,
    shieldDuration: 100,
    shieldCooldown: 150,
    behavior: 'shielder',
    description: 'Grants shields to nearby enemies'
  },
  trickster: {
    baseHp: 4,
    baseSpeed: 0.7,
    radius: 4,
    color: '#ff0',
    hpScaling: (room) => Math.floor(room / 2),
    teleportCooldown: 80,
    teleportRange: 60,
    cloneCount: 2,
    cloneHp: 1,
    behavior: 'trickster',
    description: 'Teleports and creates clones'
  },
  voidling: {
    baseHp: 6,
    baseSpeed: 0.5,
    radius: 4,
    color: '#08f',
    hpScaling: (room) => Math.floor(room / 2),
    pullRadius: 30,
    pullStrength: 0.3,
    voidBurstCooldown: 100,
    behavior: 'voidling',
    description: 'Pulls player and bursts with void energy'
  },

  // --- FINAL BOSS ---
  Warden: {
    baseHp: 30,
    baseSpeed: 0.7,
    radius: 10,
    hpScaling: (room) => room * 3,
    attackCooldown: 60,
    projectileCount: 8,
    projectileSpeed: 2,
    isBoss: true
  },
  EclipseTwin: {
    baseHp: 40,
    baseSpeed: 1.0,
    radius: 9,
    hpScaling: (room) => room * 4,
    attackCooldown: 50,
    projectileSpeed: 2.5,
    orbitRadius: 60,
    chargeTime: 60,
    isBoss: true
  },
  VoidMonarch: {
    baseHp: 60,
    baseSpeed: 0.9,
    radius: 12,
    hpScaling: (room) => room * 6,
    attackCooldown: 60,
    projectileCount: 12,
    projectileSpeed: 2.2,
    isBoss: true
  },

  // --- OLD ENEMIES ---
  wraith: {
    baseHp: 4,
    baseSpeed: 0.5,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    behavior: 'chase',
    description: 'Ghostly enemy that phases through walls'
  },
  flameMage: {
    baseHp: 5,
    baseSpeed: 0.4,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    fireballSpeed: 1.5,
    fireballCooldown: 50,
    behavior: 'ranged',
    description: 'Casts fireballs that explode on impact'
  },
  frostMage: {
    baseHp: 5,
    baseSpeed: 0.4,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    icicleSpeed: 1.2,
    icicleCooldown: 60,
    behavior: 'ranged',
    description: 'Shoots icicles that freeze on contact'
  },
  shadowAssassin: {
    baseHp: 6,
    baseSpeed: 0.7,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    smokeBombCooldown: 100,
    bladeDanceCooldown: 80,
    behavior: 'assassin',
    description: 'Stealthy enemy that deals high damage up close'
  },
  earthGolem: {
    baseHp: 10,
    baseSpeed: 0.3,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    stompCooldown: 120,
    rockThrowCooldown: 90,
    behavior: 'golem',
    description: 'High health enemy that controls earth'
  },
  lightningSpirit: {
    baseHp: 4,
    baseSpeed: 0.8,
    radius: 4,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    shockCooldown: 70,
    behavior: 'spirit',
    description: 'Fast enemy that shocks on contact'
  },
  poisonMist: {
    baseHp: 6,
    baseSpeed: 0.5,
    radius: 5,
    color: '#fff',
    hpScaling: (room) => Math.floor(room / 3),
    mistDuration: 100,
    damagePerSecond: 2,
    behavior: 'area',
    description: 'Creates a poisonous mist that damages over time'
  },
  fireElemental: {
    baseHp: 8,
    baseSpeed: 0.4,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    flameBurstCooldown: 90,
    behavior: 'elemental',
    description: 'Engulfs in flames and explodes on death'
  },
  iceElemental: {
    baseHp: 8,
    baseSpeed: 0.4,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    frostNovaCooldown: 100,
    behavior: 'elemental',
    description: 'Releases a frost nova that slows and damages'
  },
  shadowElemental: {
    baseHp: 8,
    baseSpeed: 0.4,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    shadowStrikeCooldown: 80,
    behavior: 'elemental',
    description: 'Strikes from the shadows, dealing high damage'
  },
  lightElemental: {
    baseHp: 8,
    baseSpeed: 0.4,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    healAuraCooldown: 120,
    behavior: 'elemental',
    description: 'Heals allies and damages enemies in radius'
  },
  natureSpirit: {
    baseHp: 8,
    baseSpeed: 0.4,
    radius: 6,
    color: '#fff',
    hpScaling: (room) => room,
    vineWhipCooldown: 100,
    behavior: 'spirit',
    description: 'Binds and damages enemies with vines'
  },
  arcaneGuardian: {
    baseHp: 10,
    baseSpeed: 0.3,
    radius: 7,
    color: '#fff',
    hpScaling: (room) => room,
    arcaneBlastCooldown: 90,
    behavior: 'guardian',
    description: 'Casts powerful arcane blasts from a distance'
  },
  celestialBeing: {
    baseHp: 12,
    baseSpeed: 0.2,
    radius: 8,
    color: '#fff',
    hpScaling: (room) => room,
    holyLightCooldown: 120,
    behavior: 'celestial',
    description: 'Channels celestial energy to damage and heal'
  },
  demonicEntity: {
    baseHp: 15,
    baseSpeed: 0.2,
    radius: 8,
    color: '#fff',
    hpScaling: (room) => room,
    shadowBoltCooldown: 100,
    behavior: 'demonic',
    description: 'Shoots shadow bolts and summons minions'
  },
  voidMonarch: {
    baseHp: 20,
    baseSpeed: 0.1,
    radius: 9,
    color: '#fff',
    hpScaling: (room) => room,
    voidPulseCooldown: 150,
    behavior: 'voidMonarch',
    description: 'Boss of the void realm, manipulates void energy'
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
  
  // Spawn a phantom enemy
  spawnPhantom() {
    const type = EnemyTypes.phantom;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      kind: 'phantom',
      spd: type.baseSpeed,
      fadeT: 0,
      invisible: false,
      alpha: 1
    });
  },
  // Spawn a healer enemy
  spawnHealer() {
    const type = EnemyTypes.healer;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      kind: 'healer',
      spd: type.baseSpeed,
      healT: 0
    });
  },
  // Spawn a shielder enemy
  spawnShielder() {
    const type = EnemyTypes.shielder;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      kind: 'shielder',
      spd: type.baseSpeed,
      shielding: false,
      shieldT: 0
    });
  },
  // Spawn a trickster enemy
  spawnTrickster() {
    const type = EnemyTypes.trickster;
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = type.baseHp + type.hpScaling(GameState.room);
    GameState.enemies.push({
      x, y,
      r: type.radius,
      hp,
      maxHp: hp,
      kind: 'trickster',
      spd: type.baseSpeed,
      teleportT: 0,
      cloneT: 0
    });
  },
  
  // Spawn a boss enemy
  spawnBoss() {
    const x = 160;
    const y = 120;
    let kind, bossLabel;
    if (GameState.room === 4) {
      kind = 'Warden';
      bossLabel = 'The Warden';
    } else if (GameState.room === 8) {
      kind = 'EclipseTwin';
      bossLabel = 'Eclipse Twin';
    } else if (GameState.room === 12) {
      kind = 'VoidMonarch';
      bossLabel = 'Void Monarch';
    } else {
      kind = 'Warden';
      bossLabel = 'The Warden';
    }
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
        bossName.textContent = bossLabel;
      }
    }
  },

  // Spawn a wave of enemies for the current room
  spawnWave() {
    const isBoss = (GameState.room === 4 || GameState.room === 8 || GameState.room === 12);

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
      else if (GameState.room <= 8) {
        // Late game: harder enemies
        if (roll < 20) this.spawnDasher();
        else if (roll < 40) this.spawnOrbitMage();
        else if (roll < 60) this.spawnSplitter();
        else if (roll < 80) this.spawnTank();
        else this.spawnSniper();
      }
      else {
        // Endgame: new enemies
        if (roll < 15) this.spawnPhantom();
        else if (roll < 30) this.spawnHealer();
        else if (roll < 45) this.spawnShielder();
        else if (roll < 60) this.spawnTrickster();
        else if (roll < 75) this.spawnVoidling();
        else if (roll < 80) this.spawnDasher();
        else if (roll < 85) this.spawnSplitter();
        else if (roll < 90) this.spawnTank();
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
      'EclipseTwin': this.spawnBoss,
      'phantom': this.spawnPhantom,
      'healer': this.spawnHealer,
      'shielder': this.spawnShielder,
      'trickster': this.spawnTrickster
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
  
  // Phantom AI: Fade in/out and speed boost
  phantomAI(enemy, player) {
    const type = EnemyTypes.phantom;
    
    // Fade in/out effect
    if (enemy.fadeT < type.fadeInterval) {
      enemy.fadeT++;
      enemy.alpha = enemy.fadeT / type.fadeInterval;
    } else {
      enemy.alpha = 1;
    }
    
    // Speed boost while invisible
    const speedMul = enemy.invisible ? type.invisibleSpeedBoost : 1;
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd * speedMul;
    enemy.y += Math.sin(angle) * enemy.spd * speedMul;
    
    // Toggle invisibility
    if (--enemy.fadeT <= 0) {
      enemy.invisible = !enemy.invisible;
      enemy.fadeT = enemy.invisible ? type.invisibleDuration : type.fadeInterval;
    }
  },
  
  // Healer AI: Heal allies and stay safe
  healerAI(enemy, player) {
    const type = EnemyTypes.healer;
    
    // Find nearby allies
    const allies = GameState.enemies.filter(e => e !== enemy && Helpers.dist(e.x, e.y, enemy.x, enemy.y) <= type.healRadius);
    
    // Heal nearest ally if possible
    if (allies.length > 0 && enemy.hp < enemy.maxHp) {
      const target = allies.reduce((a, b) => a.hp < b.hp ? a : b);
      if (target.hp < target.maxHp) {
        target.hp += type.healAmount;
        if (target.hp > target.maxHp) target.hp = target.maxHp;
      }
    }
    
    // Move away from player
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x -= Math.cos(angle) * enemy.spd;
    enemy.y -= Math.sin(angle) * enemy.spd;
  },
  
  // Shielder AI: Shield allies and block attacks
  shielderAI(enemy, player) {
    const type = EnemyTypes.shielder;
    
    // Activate shield and grant to nearest ally
    if (!enemy.shielding && enemy.shieldT <= 0) {
      const allies = GameState.enemies.filter(e => e !== enemy && Helpers.dist(e.x, e.y, enemy.x, enemy.y) <= type.shieldRadius);
      if (allies.length > 0) {
        const target = allies.reduce((a, b) => a.hp < b.hp ? a : b);
        target.shielding = true;
        target.shieldT = type.shieldDuration;
        enemy.shielding = true;
        enemy.shieldT = type.shieldCooldown;
      }
    }
    
    // Move to block player attacks
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
  },
  
  // Trickster AI: Teleport and confuse
  tricksterAI(enemy, player) {
    const type = EnemyTypes.trickster;
    
    // Teleport randomly
    if (enemy.teleportT <= 0) {
      enemy.x = RNG.range(16, 304);
      enemy.y = RNG.range(16, 224);
      enemy.teleportT = type.teleportCooldown;
    }
    
    // Create clones
    if (enemy.cloneT <= 0) {
      for (let i = 0; i < type.cloneCount; i++) {
        const angle = RNG.r() * Math.PI * 2;
        const cloneX = enemy.x + Math.cos(angle) * 10;
        const cloneY = enemy.y + Math.sin(angle) * 10;
        GameState.enemies.push({
          x: cloneX,
          y: cloneY,
          r: enemy.r,
          hp: type.cloneHp,
          maxHp: type.cloneHp,
          slowT: 0,
          slowMul: 1,
          kind: 'minion',
          spd: enemy.spd * 0.8
        });
      }
      enemy.cloneT = type.teleportCooldown;
    }
    
    // Move quickly to confuse
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd * 1.2;
    enemy.y += Math.sin(angle) * enemy.spd * 1.2;
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
    } else if (enemy.kind === 'VoidMonarch') {
      const type = EnemyTypes.VoidMonarch;

      // Radial void burst every attackCooldown
      if (enemy.atkT <= 0) {
        enemy.atkT = type.attackCooldown;
        // Fire radial projectiles
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

      // Phase 2: below 50% HP, fires homing orbs
      if (enemy.hp < enemy.maxHp * 0.5 && GameState.time % 40 === 0) {
        const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y) + (Math.random() - 0.5);
        GameState.ebullets.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * type.projectileSpeed * 0.7,
          vy: Math.sin(angle) * type.projectileSpeed * 0.7,
          life: 100,
          homing: true
        });
      }

      // Chase player slowly
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd * (enemy.hp < enemy.maxHp * 0.5 ? 1.2 : 0.8);
      enemy.y += Math.sin(angle) * enemy.spd * (enemy.hp < enemy.maxHp * 0.5 ? 1.2 : 0.8);
      clampToArena(enemy);
    }
  }
};

function clampToArena(enemy) {
  enemy.x = Math.max(8, Math.min(312, enemy.x));
  enemy.y = Math.max(8, Math.min(232, enemy.y));
}

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnemyTypes, EnemySpawner, EnemyAI };
}