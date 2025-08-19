// ========================================
// FILE: js/logic/enemies-logic.js (KEY FIXES)
// FIXED: Enemy bounds and VoidMonarch AI
// ========================================

// Wait for DOM to be ready and then initialize with a small delay
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired, waiting for scripts to execute...');
  
  // Small delay to ensure all scripts are fully executed
  setTimeout(function() {
    console.log('Initializing enemy systems after delay...');
    console.log('Debug - Available globals after delay:', {
      EnemyTypes: !!window.EnemyTypes,
      RNG: !!window.RNG,
      Helpers: !!window.Helpers,
      GameState: !!window.GameState
    });
    
    // Initialize EnemySpawner
    initEnemySpawner();
    
    // Initialize EnemyAI
    initEnemyAI();
    
    // Final status report
    console.log('Final initialization status:', {
      EnemySpawner: !!window.EnemySpawner,
      EnemyAI: !!window.EnemyAI,
      EnemyTypes: !!window.EnemyTypes,
      GameState: !!window.GameState,
      RNG: !!window.RNG,
      Helpers: !!window.Helpers
    });
    
    // If initialization failed, try again with a longer delay
    if (!window.EnemySpawner || !window.EnemyAI) {
      console.log('Initial initialization failed, retrying with longer delay...');
      setTimeout(function() {
        console.log('Retry initialization...');
        initEnemySpawner();
        initEnemyAI();
      }, 500); // 500ms retry delay
    }
  }, 100); // 100ms delay
});

// Initialize EnemySpawner once dependencies are available
function initEnemySpawner() {
  console.log('initEnemySpawner called, checking dependencies...');
  console.log('Debug - Dependencies check:', {
    EnemyTypes: !!window.EnemyTypes,
    RNG: !!window.RNG,
    Helpers: !!window.Helpers
  });
  
  // Check if we have the minimum required dependencies
  if (!window.EnemyTypes || !window.RNG || !window.Helpers) {
    console.error('Missing dependencies for EnemySpawner:', {
      EnemyTypes: !!window.EnemyTypes,
      RNG: !!window.RNG,
      Helpers: !!window.Helpers
    });
    return;
  }

  const Types = window.EnemyTypes;
  console.log('EnemySpawner initializing with types:', Object.keys(Types));

  window.EnemySpawner = window.EnemySpawner || {};
  Object.assign(window.EnemySpawner, {
    // canvas constants used for clamping spawns
    CANVAS_W: 320,
    CANVAS_H: 240,

      // Helper function to get safe spawn position away from player
  getSafeSpawnPosition(enemyRadius) {
    const player = GameState.player;
    const minDistance = 40; // Minimum distance from player
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const x = RNG.range(enemyRadius, this.CANVAS_W - enemyRadius);
      const y = RNG.range(enemyRadius, this.CANVAS_H - enemyRadius);
      
      // Check distance from player
      if (player) {
        const dx = x - player.x;
        const dy = y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance >= minDistance) {
          return { x, y };
        }
      } else {
        // If no player, just return the position
        return { x, y };
      }
      
      attempts++;
    }
    
    // Fallback: spawn at edge of canvas
    const side = RNG.range(0, 3);
    let x, y;
    
    switch (side) {
      case 0: // Top
        x = RNG.range(enemyRadius, this.CANVAS_W - enemyRadius);
        y = enemyRadius;
        break;
      case 1: // Right
        x = this.CANVAS_W - enemyRadius;
        y = RNG.range(enemyRadius, this.CANVAS_H - enemyRadius);
        break;
      case 2: // Bottom
        x = RNG.range(enemyRadius, this.CANVAS_W - enemyRadius);
        y = this.CANVAS_H - enemyRadius;
        break;
      case 3: // Left
        x = enemyRadius;
        y = RNG.range(enemyRadius, this.CANVAS_H - enemyRadius);
        break;
    }
    
    return { x, y };
  },

  // Spawn a single grunt enemy
  spawnGrunt() {
    // Check if GameState is available
    if (!window.GameState) {
      console.warn('GameState not available, cannot spawn grunt');
      return;
    }
    
    const type = Types.grunt;
    if (!type) {
      console.error('spawnGrunt: Types.grunt missing');
      return;
    }
    const spawnPos = this.getSafeSpawnPosition(type.radius);
    const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x: spawnPos.x,
        y: spawnPos.y,
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
      const type = Types.archer;
      if (!type) {
        console.error('spawnArcher: Types.archer missing');
        return;
      }
      const spawnPos = this.getSafeSpawnPosition(type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x: spawnPos.x,
        y: spawnPos.y,
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
      const type = Types.bomber;
      if (!type) {
        console.error('spawnBomber: Types.bomber missing');
        return;
      }
      const spawnPos = this.getSafeSpawnPosition(type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x: spawnPos.x,
        y: spawnPos.y,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'bomber',
        spd: type.baseSpeed * 1.5, // Increased speed
        aggroRange: 80, // Aggro range for explosion
        exploding: false,
        explosionTimer: 0
      });
    },

    // Spawn a dasher enemy
    spawnDasher() {
      const type = Types.dasher;
      if (!type) {
        console.error('spawnDasher: Types.dasher missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
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
        dashT: type.dashCooldown || 60,
        dashing: false,
        dashDir: 0
      });
    },

    // Spawn an orbit mage enemy
    spawnOrbitMage() {
      const type = Types.orbitMage;
      if (!type) {
        console.error('spawnOrbitMage: Types.orbitMage missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
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
        angle: 0
      });
    },

    // Spawn a splitter enemy
    spawnSplitter() {
      const type = Types.splitter;
      if (!type) {
        console.error('spawnSplitter: Types.splitter missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
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
      const type = Types.tank;
      if (!type) {
        console.error('spawnTank: Types.tank missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
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
      const type = Types.sniper;
      if (!type) {
        console.error('spawnSniper: Types.sniper missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
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
        shootT: 0
      });
    },

    // Spawn a phantom enemy
    spawnPhantom() {
      const type = Types.phantom;
      if (!type) {
        console.error('spawnPhantom: Types.phantom missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x, y,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'phantom',
        spd: type.baseSpeed
      });
    },

    // Spawn a healer enemy
    spawnHealer() {
      const type = Types.healer;
      if (!type) {
        console.error('spawnHealer: Types.healer missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x, y,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'healer',
        spd: type.baseSpeed
      });
    },

    // Spawn a shielder enemy
    spawnShielder() {
      const type = Types.shielder;
      if (!type) {
        console.error('spawnShielder: Types.shielder missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x, y,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'shielder',
        spd: type.baseSpeed
      });
    },

    // Spawn a trickster enemy
    spawnTrickster() {
      const type = Types.trickster;
      if (!type) {
        console.error('spawnTrickster: Types.trickster missing');
        return;
      }
      const x = RNG.range(type.radius, this.CANVAS_W - type.radius);
      const y = RNG.range(type.radius, this.CANVAS_H - type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x, y,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'trickster',
        spd: type.baseSpeed
      });
    },

    // Spawn a voidling enemy
    spawnVoidling(x = null, y = null) {
      const type = Types.voidling;
      if (!type) {
        console.error('spawnVoidling: Types.voidling missing');
        return;
      }
      const spawnX = x || RNG.range(type.radius, this.CANVAS_W - type.radius);
      const spawnY = y || RNG.range(type.radius, this.CANVAS_H - type.radius);
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x: spawnX,
        y: spawnY,
        r: type.radius,
        hp,
        maxHp: hp,
        slowT: 0,
        slowMul: 1,
        stun: 0,
        kind: 'voidling',
        spd: type.baseSpeed
      });
    },

    // Spawn a minion enemy
    spawnMinion(x, y) {
      const type = Types.minion;
      if (!type) {
        console.error('spawnMinion: Types.minion missing');
        return;
      }
      const hp = type.baseHp + type.hpScaling(GameState.room);

      GameState.enemies.push({
        x, y,
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

    // spawnBoss - Fixed to spawn away from player
    spawnBoss() {
      // Spawn boss at a safe distance from the player
      const playerX = GameState.player.x || 160;
      const playerY = GameState.player.y || 120;
      
      // Calculate safe spawn position (opposite side of canvas from player)
      let x, y;
      if (playerX < this.CANVAS_W / 2) {
        // Player is on left side, spawn boss on right side
        x = this.CANVAS_W - 60;
      } else {
        // Player is on right side, spawn boss on left side
        x = 60;
      }
      
      if (playerY < this.CANVAS_H / 2) {
        // Player is on top side, spawn boss on bottom side
        y = this.CANVAS_H - 60;
      } else {
        // Player is on bottom side, spawn boss on top side
        y = 60;
      }
      
      let kind, bossName;
      if (GameState.room === 4) {
        kind = 'Warden';
        bossName = 'The Warden';
      } else if (GameState.room === 8) {
        kind = 'EclipseTwin';
        bossName = 'Eclipse Twin';
      } else if (GameState.room === 12) {
        kind = 'VoidMonarch';
        bossName = 'Void Monarch';
      } else {
        kind = 'Warden';
        bossName = 'The Warden';
      }

      const type = Types[kind];
      if (!type) {
        console.error('spawnBoss: Types[' + kind + '] missing'); return;
      }
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
        phase: 1,
        atkT: 90,
        attackT: 0,
        isBoss: true
      });

      const bossBar = document.querySelector('#bossBar');
      if (bossBar) {
        bossBar.style.display = 'block';
        const bossNameEl = document.querySelector('#bossName');
        if (bossNameEl) bossNameEl.textContent = bossName;
      }
    },

    // --- FINAL BOSS SPAWNER (for direct call, not used in spawnWave) ---
    spawnVoidMonarch() {
      const type = Types.VoidMonarch;
      if (!type) { console.error('spawnVoidMonarch: Types.VoidMonarch missing'); return; }
      
      // Spawn at safe distance from player
      const playerX = GameState.player.x || 160;
      const playerY = GameState.player.y || 120;
      
      // Spawn on opposite side of canvas from player
      let x, y;
      if (playerX < this.CANVAS_W / 2) {
        x = this.CANVAS_W - 60;
      } else {
        x = 60;
      }
      
      if (playerY < this.CANVAS_H / 2) {
        y = this.CANVAS_H - 60;
      } else {
        y = 60;
      }
      
      const hp = type.baseHp + type.hpScaling(GameState.room);
      GameState.enemies.push({
        x, y,
        r: type.radius,
        hp,
        maxHp: hp,
        kind: 'VoidMonarch',
        spd: type.baseSpeed,
        phase: 1,
        attackT: 0,
        isBoss: true
      });
      Helpers.$('#bossBar').style.display = 'block';
      Helpers.$('#bossName').textContent = 'Void Monarch';
    },

    // Spawn a wave of enemies for the current room
    spawnWave() {
      // Check if GameState is available before spawning
      if (!window.GameState) {
        console.warn('GameState not available, cannot spawn enemies');
        return;
      }
      
      // Boss rooms: 4, 8, 12
      if (GameState.room === 4 || GameState.room === 8 || GameState.room === 12) {
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
        else if (GameState.room <= 11) {
          // Endgame: new enemies
          if (roll < 15) this.spawnPhantom();
          else if (roll < 30) this.spawnHealer();
          else if (roll < 45) this.spawnShielder();
          else if (roll < 60) {
            this.spawnTrickster();
          } else if (roll < 75) {
            // safe call — prefer window.EnemySpawner if available
            if (typeof this.spawnVoidling === 'function') this.spawnVoidling();
            else if (window.EnemySpawner && typeof window.EnemySpawner.spawnVoidling === 'function') window.EnemySpawner.spawnVoidling();
            else console.warn('spawnVoidling missing');
          }
          else if (roll < 80) this.spawnDasher();
          else if (roll < 85) this.spawnSplitter();
          else if (roll < 90) this.spawnTank();
          else this.spawnSniper();
        }
      }
    }
  });

  console.log('EnemySpawner initialized successfully');
  // end init
}

// Initialize EnemyAI independently (doesn't need EnemySpawner)
function initEnemyAI() {
  // Check if we have the minimum required dependencies for EnemyAI
  if (!window.RNG || !window.Helpers || !window.GameState) {
    console.error('Missing dependencies for EnemyAI:', {
      RNG: !!window.RNG,
      Helpers: !!window.Helpers,
      GameState: !!window.GameState
    });
    return;
  }

  console.log('EnemyAI initialization starting...');
  window.EnemyAI = window.EnemyAI || {};
  Object.assign(window.EnemyAI, {
    // Common AI for all enemies
    update(enemy) {
      // Basic movement towards player
      const player = GameState.player;
      if (!player) {
        console.warn('Player not found in EnemyAI.update');
        return;
      }
      
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Normalize direction
      if (dist !== 0) {
        enemy.x += (dx / dist) * enemy.spd;
        enemy.y += (dy / dist) * enemy.spd;
      }

      // Reduce cooldowns
      if (enemy.damageCooldown > 0) enemy.damageCooldown--;
      if (enemy.shootCooldown > 0) enemy.shootCooldown--;
      
      // Handle visual effects
      if (enemy.attacking) {
        enemy.attackFrame++;
        if (enemy.attackFrame > 20) {
          enemy.attacking = false;
          enemy.attackFrame = 0;
        }
      }
      
             if (enemy.attackEffect > 0) enemy.attackEffect--;
       if (enemy.slamEffect > 0) enemy.slamEffect--;
       if (enemy.twinEffect > 0) enemy.twinEffect--;
       if (enemy.voidEffect > 0) enemy.voidEffect--;
       if (enemy.shieldEffect > 0) enemy.shieldEffect--;
       if (enemy.tricksterEffect > 0) enemy.tricksterEffect--;

      // Handle enemy-specific behavior
      switch (enemy.kind) {
        case 'grunt':
          this.gruntAI(enemy);
          break;
        case 'archer':
          this.archerAI(enemy);
          break;
        case 'bomber':
          this.bomberAI(enemy);
          break;
        case 'dasher':
          this.dasherAI(enemy);
          break;
        case 'orbitMage':
          this.orbitMageAI(enemy);
          break;
        case 'splitter':
          this.splitterAI(enemy);
          break;
        case 'tank':
          this.tankAI(enemy);
          break;
        case 'sniper':
          this.sniperAI(enemy);
          break;
        case 'phantom':
          this.phantomAI(enemy);
          break;
        case 'healer':
          this.healerAI(enemy);
          break;
        case 'shielder':
          this.shielderAI(enemy);
          break;
        case 'trickster':
          this.tricksterAI(enemy);
          break;
        case 'voidling':
          this.voidlingAI(enemy);
          break;
        case 'minion':
          this.minionAI(enemy);
          break;
        case 'Warden':
          this.wardenAI(enemy);
          break;
        case 'EclipseTwin':
          this.eclipseTwinAI(enemy);
          break;
        case 'VoidMonarch':
          this.voidMonarchAI(enemy);
          break;
        default:
          console.warn('Unknown enemy kind:', enemy.kind);
      }

      // Central clamp to arena to prevent any AI from pushing enemies outside bounds
      if (window.EnemySpawner) {
        enemy.x = Helpers.clamp(enemy.x, enemy.r || 6, EnemySpawner.CANVAS_W - (enemy.r || 6));
        enemy.y = Helpers.clamp(enemy.y, enemy.r || 6, EnemySpawner.CANVAS_H - (enemy.r || 6));
      }
    },

    // Test function to verify initialization
    test() {
      console.log('EnemyAI.test() called successfully');
      return true;
    },

    // Grunt AI: movement + melee + ranged attacks (like Enter the Gungeon)
    gruntAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Move towards player when far
      if (dist > 80) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.8;
        enemy.y += Math.sin(angle) * enemy.spd * 0.8;
      }

      // Melee attack when close
      if (dist < enemy.r + 15) {
        if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
          // Much more balanced damage scaling
          let damage = 0.25; // Base damage is very low
          if (GameState.room > 5) damage = 0.5;  // Room 6-10: 0.5 damage
          if (GameState.room > 10) damage = 0.75; // Room 11+: 0.75 damage
          if (GameState.room > 15) damage = 1;    // Room 16+: 1 damage
          
          player.hp = Math.max(0, player.hp - damage);
          this.handleStun(player, enemy);
          enemy.damageCooldown = 90; // 1.5 second cooldown at 60fps
        }
      }
      
      // Ranged attack when at medium distance
      if (dist > 40 && dist < 120 && (!enemy.shootCooldown || enemy.shootCooldown <= 0)) {
        this.shootBullet(enemy, player);
        enemy.shootCooldown = 180; // 3 second cooldown
      }
    },

    // Archer AI: ranged attack
    archerAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < enemy.r + 50) {
        // Shoot arrow with cooldown
        this.shootArrow(enemy, player);
      }
    },

    // Bomber AI: Chase and explode when close to player
    bomberAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      
      // Check if player is in aggro range
      if (dist < enemy.aggroRange && !enemy.exploding) {
        // Start explosion sequence
        enemy.exploding = true;
        enemy.explosionTimer = 30; // 0.5 seconds to explode
        enemy.spd = 0; // Stop moving
      }
      
      // Handle explosion countdown
      if (enemy.exploding) {
        enemy.explosionTimer--;
        
        // Visual effect - enemy gets bigger and redder
        enemy.explosionScale = 1 + (30 - enemy.explosionTimer) / 30;
        
        if (enemy.explosionTimer <= 0) {
          // EXPLODE!
          this.bomberExplode(enemy);
        }
      } else {
        // Normal movement towards player
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd;
        enemy.y += Math.sin(angle) * enemy.spd;
      }
    },
    
    // Bomber explosion effect
    bomberExplode(enemy) {
      // Deal damage to player if close
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      
      if (dist < 60) { // Explosion radius
        // Deal damage
        if (!player.enemyDamageCooldown || player.enemyDamageCooldown <= 0) {
          const damage = 1.5; // High explosion damage
          player.hp = Math.max(0, player.hp - damage);
          player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
          player.enemyDamageCooldown = 90;
          AudioSystem.hurt();
        }
      }
      
      // Create explosion particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        GameState.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30,
          kind: 'explosion'
        });
      }
      
      // Remove the enemy
      const idx = GameState.enemies.indexOf(enemy);
      if (idx >= 0) GameState.enemies.splice(idx, 1);
    },
    
    // Shoot basic bullet (for grunts and other enemies)
    shootBullet(enemy, player) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      const speed = 1.5;
      
      GameState.ebullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 80,
        dmg: 0.3,
        kind: 'basic'
      });
      
      // Visual effect
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },
    
    // Tank slam attack
    tankSlam(enemy, player) {
      // Deal heavy damage
      if (!player.enemyDamageCooldown || player.enemyDamageCooldown <= 0) {
        const damage = 1.5; // Heavy damage
        player.hp = Math.max(0, player.hp - damage);
        player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
        player.enemyDamageCooldown = 90;
        AudioSystem.hurt();
      }
      
      // Create shockwave effect
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        GameState.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 1.5,
          vy: Math.sin(angle) * 1.5,
          life: 45,
          kind: 'shockwave'
        });
      }
      
      // Visual effect
      enemy.attacking = true;
      enemy.attackFrame = 0;
      enemy.slamEffect = 30;
    },
    
    // Tank mortar attack
    shootMortar(enemy, player) {
      // Calculate arc trajectory
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      
      // Mortar shell with arc
      GameState.ebullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: (dx / distance) * 2,
        vy: (dy / distance) * 2 - 1, // Arc effect
        life: 120,
        dmg: 0.8,
        kind: 'mortar',
        gravity: 0.05
      });
      
      // Visual effect
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Dasher AI: dashes towards player
    dasherAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < 100 && !enemy.dashing) {
        // Dash towards player
        enemy.dashDir = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(enemy.dashDir) * enemy.spd * 2;
        enemy.y += Math.sin(enemy.dashDir) * enemy.spd * 2;
        enemy.dashing = true;
        enemy.dashT = 15; // Dash duration
      } else if (enemy.dashT > 0) {
        enemy.dashT--;
      } else {
        enemy.dashing = false;
      }
    },

    // Orbit Mage AI: orbits around a point
    orbitMageAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist > 50) {
        // Move towards player
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.5;
        enemy.y += Math.sin(angle) * enemy.spd * 0.5;
      } else {
        // Stay in place and shoot with cooldown
        enemy.angle += Math.PI / 180 * 5; // Rotate
        this.shootOrbital(enemy);
      }
    },

    // Splitter AI: splits into minions on death
    splitterAI(enemy) {
      // Splitting logic handled in enemy death logic
    },

    // Tank AI: high health, slow movement, but powerful attacks
    tankAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Slow movement towards player
      if (dist > 60) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.4; // Very slow
        enemy.y += Math.sin(angle) * enemy.spd * 0.4;
      }

      // Heavy slam attack when close
      if (dist < enemy.r + 20 && (!enemy.attackCooldown || enemy.attackCooldown <= 0)) {
        this.tankSlam(enemy, player);
        enemy.attackCooldown = 240; // 4 second cooldown
      }
      
      // Ranged mortar attack when at medium distance
      if (dist > 80 && dist < 150 && (!enemy.shootCooldown || enemy.shootCooldown <= 0)) {
        this.shootMortar(enemy, player);
        enemy.shootCooldown = 300; // 5 second cooldown
      }
    },

    // Sniper AI: charges shot, high damage
    sniperAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < 200) {
        // Charge shot
        enemy.chargeT = (enemy.chargeT || 0) + 1;
        if (enemy.chargeT > 60) {
          // Shoot with cooldown
          this.shootSniper(enemy, player);
          enemy.chargeT = 0;
        }
      }
    },

    // Phantom AI: fades in and out, moves unpredictably
    phantomAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < 100) {
        // Fade out
        enemy.alpha = (enemy.alpha || 1) - 0.05;
        if (enemy.alpha <= 0) {
          enemy.alpha = 0;
          enemy.invisible = true;
        }
      } else {
        // Fade in
        enemy.alpha = (enemy.alpha || 0) + 0.05;
        if (enemy.alpha >= 1) {
          enemy.alpha = 1;
          enemy.invisible = false;
        }
      }

      // Move randomly
      enemy.x += RNG.range(-1, 1);
      enemy.y += RNG.range(-1, 1);
    },

    // Healer AI: heals nearby enemies
    healerAI(enemy) {
      const healRadius = 50;
      const healAmount = 0.5;

      // Find allies to heal
      for (const other of GameState.enemies) {
        if (other !== enemy && other.hp < other.maxHp) {
          const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
          if (dist < healRadius) {
            other.hp += healAmount;
            enemy.hp -= healAmount; // Healers sacrifice some hp to heal
          }
        }
      }
    },

    // Shielder AI: creates protective barriers and blocks damage
    shielderAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Move slowly towards player
      if (dist > 60) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.3;
        enemy.y += Math.sin(angle) * enemy.spd * 0.3;
      }

      // Create shield effect when close to player
      if (dist < 80) {
        enemy.shielding = true;
        enemy.shieldEffect = 30; // Shield visual effect duration
      } else {
        enemy.shielding = false;
      }

      // Melee attack when very close
      if (dist < enemy.r + 15) {
        if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
          this.basicAttack(enemy, player);
          enemy.damageCooldown = 120; // 2 second cooldown
        }
      }
    },

    // Trickster AI: teleports around and creates illusions
    tricksterAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Teleport when player gets too close
      if (dist < 50 && (!enemy.teleportCooldown || enemy.teleportCooldown <= 0)) {
        // Teleport to a random position around the player
        const teleportAngle = Math.random() * Math.PI * 2;
        const teleportDist = 80 + Math.random() * 40;
        enemy.x = player.x + Math.cos(teleportAngle) * teleportDist;
        enemy.y = player.y + Math.sin(teleportAngle) * teleportDist;
        
        // Clamp to arena bounds
        if (window.EnemySpawner) {
          enemy.x = Helpers.clamp(enemy.x, enemy.r, EnemySpawner.CANVAS_W - enemy.r);
          enemy.y = Helpers.clamp(enemy.y, enemy.r, EnemySpawner.CANVAS_H - enemy.r);
        }
        
        enemy.teleportCooldown = 180; // 3 second cooldown
        enemy.teleportT = 20; // Visual effect duration for renderer
        enemy.tricksterEffect = 20; // Visual effect duration
      }

      // Reduce teleport cooldown
      if (enemy.teleportCooldown > 0) enemy.teleportCooldown--;

      // Ranged attack from distance
      if (dist > 60 && dist < 120) {
        if (!enemy.shootCooldown || enemy.shootCooldown <= 0) {
          this.shootArrow(enemy, player);
          enemy.shootCooldown = 90; // 1.5 second cooldown
        }
      }
    },

    // Voidling AI: pulls player towards it
    voidlingAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < 100) {
        // Pull player towards voidling - Fix: add bounds checking
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const pullX = Math.cos(angle) * enemy.spd * 0.5;
        const pullY = Math.sin(angle) * enemy.spd * 0.5;
        
        // Apply pull with bounds checking
        player.x = Helpers.clamp(player.x - pullX, player.r, 320 - player.r);
        player.y = Helpers.clamp(player.y - pullY, player.r, 240 - player.r);
      }
    },

    // Minion AI: basic melee attack
    minionAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      if (dist < enemy.r + 10) {
        // Deal damage to player on contact - Fix: prevent negative HP
        player.hp = Math.max(0, player.hp - 0.25);
        this.handleStun(player, enemy);
      }
    },

    // Warden AI: summons minions, charges attack
    wardenAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Always move towards player when far away
      if (dist > 80) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.3;
        enemy.y += Math.sin(angle) * enemy.spd * 0.3;
      }

      // Charge attack when close enough - RESTORE: Old wave attack
      if (dist < 150) {
        if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
          // Wave attack - sends bullets in all directions
          this.waveAttack(enemy);
          enemy.damageCooldown = 120; // 2 second cooldown (reduced from 3)
        }
      }
    },

    // Wave attack for Warden boss - sends bullets in all directions
    waveAttack(enemy) {
      // Create wave effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 5, 15, 'slam');
      } else {
        console.warn('ParticleSystem not available for wave!');
      }
      
      // Send bullets in all directions (8 directions)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 1,
          vy: Math.sin(angle) * 1,
          life: 120,
          kind: 'wave',
          dmg: 0.25 // Very low damage for early boss
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes red
      enemy.slamEffect = 10;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Eclipse Twin AI: phases, summons, and twin mechanics
    eclipseTwinAI(enemy) {
      // Handle phasing and twin mechanics
      if (enemy.phase === 1) {
        // Phase 1: arc attacks
        this.arcTwinAI(enemy);
      } else if (enemy.phase === 2) {
        // Phase 2: faster, more aggressive
        this.aggressiveTwinAI(enemy);
      } else if (enemy.phase === 3) {
        // Phase 3: summons and chaos
        this.chaosTwinAI(enemy);
      }
    },

    // Arc twin AI for Eclipse Twin - AUTOMATIC ATTACKS
    arcTwinAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Simple movement and attack pattern
      if (dist > 50) {
        // Move towards player
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.5;
        enemy.y += Math.sin(angle) * enemy.spd * 0.5;
      }
      
      // ALWAYS attack automatically regardless of distance
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        this.arcAttack(enemy, player);
        enemy.damageCooldown = 90; // 1.5 second cooldown (reduced from 2)
        
        // Add special visual effect for Eclipse Twin
        if (window.ParticleSystem) {
          window.ParticleSystem.create(enemy.x, enemy.y, 8, 20, 'twin');
        }
        enemy.twinEffect = 20;
      }
    },

    // Aggressive twin AI for Eclipse Twin Phase 2 - AUTOMATIC ATTACKS
    aggressiveTwinAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Faster movement
      if (dist > 30) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.spd * 0.8;
        enemy.y += Math.sin(angle) * enemy.spd * 0.8;
      }

      // ALWAYS attack automatically regardless of distance
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        this.arcAttack(enemy, player);
        enemy.damageCooldown = 60; // 1 second cooldown (reduced from 1.5)
        enemy.twinEffect = 25;
      }
    },

    // Chaos twin AI for Eclipse Twin Phase 3
    chaosTwinAI(enemy) {
      const player = GameState.player;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Teleport to player if too far
      if (dist > 200) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x = player.x - Math.cos(angle) * 100;
        enemy.y = player.y - Math.sin(angle) * 100;
      }

      // Chaos attacks
      if (dist < 40 && (!enemy.damageCooldown || enemy.damageCooldown <= 0)) {
        this.arcAttack(enemy, player);
        enemy.damageCooldown = 60; // 1 second cooldown
        enemy.twinEffect = 30;
      }
    },

    // Arc attack for Eclipse Twin - PREDICTS PLAYER MOVEMENT for intelligent aiming!
    // This makes the boss much more challenging by aiming where the player WILL be, not where they ARE!
    arcAttack(enemy, player) {
      // PREDICT where player will be when bullets arrive
      const bulletSpeed = 1;
      const distanceToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      const timeToReach = distanceToPlayer / bulletSpeed;
      
      // Calculate predicted position based on player's current movement
      let predictedX = player.x;
      let predictedY = player.y;
      
      // If player is moving, predict their future position
      if (GameState.player) {
        // Get player velocity from input system
        const playerSpeed = 2; // Base player movement speed
        const keys = GameState.keys || {};
        
        // Calculate player's current movement direction
        let playerVx = 0;
        let playerVy = 0;
        
        if (keys['ArrowUp'] || keys['w'] || keys['W']) playerVy -= playerSpeed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) playerVy += playerSpeed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) playerVx -= playerSpeed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) playerVx += playerSpeed;
        
        // Normalize diagonal movement
        if (playerVx !== 0 && playerVy !== 0) {
          playerVx *= 0.707; // 1/√2
          playerVy *= 0.707;
        }
        
              // ADVANCED PREDICTION: Consider player's movement patterns and recent history
      if (playerVx !== 0 || playerVy !== 0) {
        // Basic prediction based on current movement
        predictedX = player.x + (playerVx * timeToReach);
        predictedY = player.y + (playerVy * timeToReach);
        
        // ENHANCED PREDICTION: Consider player's movement history for better accuracy
        if (GameState.player && GameState.player.lastPositions) {
          // Get recent movement pattern
          const recentPositions = GameState.player.lastPositions;
          if (recentPositions.length >= 2) {
            // Calculate recent velocity from actual movement
            const recentVx = recentPositions[recentPositions.length - 1].x - recentPositions[recentPositions.length - 2].x;
            const recentVy = recentPositions[recentPositions.length - 1].y - recentPositions[recentPositions.length - 2].y;
            
            // Blend current input with recent movement for more accurate prediction
            const blendFactor = 0.7; // 70% recent movement, 30% current input
            const blendedVx = recentVx * blendFactor + playerVx * (1 - blendFactor);
            const blendedVy = recentVy * blendFactor + playerVy * (1 - blendFactor);
            
            // Apply blended prediction
            predictedX = player.x + (blendedVx * timeToReach);
            predictedY = player.y + (blendedVy * timeToReach);
          }
        }
        
        // Add some randomness to make it less predictable (boss isn't perfect)
        const predictionError = 0.2; // Reduced to 20% for better accuracy
        predictedX += (Math.random() - 0.5) * 15 * predictionError;
        predictedY += (Math.random() - 0.5) * 15 * predictionError;
        
        // Ensure prediction stays within reasonable bounds
        predictedX = Math.max(50, Math.min(EnemySpawner.CANVAS_W - 50, predictedX));
        predictedY = Math.max(50, Math.min(EnemySpawner.CANVAS_H - 50, predictedY));
      } else {
        // Player is stationary - aim directly at them
        predictedX = player.x;
        predictedY = player.y;
      }
      }
      
      // Calculate angle to PREDICTED position (not current position)
      const angleToPredicted = Math.atan2(predictedY - enemy.y, predictedX - enemy.x);
      
      // Send bullets in a SMALL 45-degree arc centered on PREDICTED position
      const arcSpread = Math.PI / 4; // 45 degrees (tight arc)
      const bulletCount = 5;
      
      for (let i = 0; i < bulletCount; i++) {
        const angle = angleToPredicted - arcSpread/2 + (i / (bulletCount-1)) * arcSpread;
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * (bulletSpeed * 1.3), // Increased speed by 30%
          vy: Math.sin(angle) * (bulletSpeed * 1.3), // Increased speed by 30%
          life: 100,
          kind: 'arc',
          dmg: 0.3 // Low damage for mid-game boss
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes cyan and shows prediction
      enemy.twinEffect = 20;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
      
      // Visual prediction indicator - shows where boss is aiming
      if (window.ParticleSystem) {
        // Create a small particle at predicted position to show where boss is aiming
        window.ParticleSystem.create(predictedX, predictedY, 2, 10, 'twin');
        
        // Create a line effect from boss to predicted position (optional visual)
        if (window.Renderer && window.Renderer.getContext) {
          const ctx = window.Renderer.getContext();
          if (ctx) {
            // Store prediction line data for rendering
            enemy.predictionLine = {
              startX: enemy.x,
              startY: enemy.y,
              endX: predictedX,
              endY: predictedY,
              alpha: 0.6,
              timer: 15
            };
          }
        }
        
        // Add prediction warning effect - boss glows when predicting
        enemy.predictionWarning = 25;
      }
    },

    // Void Monarch AI: phases and powerful attacks
    voidMonarchAI(enemy) {
      // Check for phase transitions based on health
      const healthPercent = enemy.hp / enemy.maxHp;
      if (healthPercent > 0.66 && enemy.phase !== 1) {
        enemy.phase = 1;
        console.log('Void Monarch entering Phase 1');
      } else if (healthPercent <= 0.66 && healthPercent > 0.33 && enemy.phase !== 2) {
        enemy.phase = 2;
        console.log('Void Monarch entering Phase 2');
      } else if (healthPercent <= 0.33 && enemy.phase !== 3) {
        enemy.phase = 3;
        console.log('Void Monarch entering Phase 3');
      }

      // Handle phases and attacks
      if (enemy.phase === 1) {
        this.voidPhase1AI(enemy);
      } else if (enemy.phase === 2) {
        this.voidPhase2AI(enemy);
      } else if (enemy.phase === 3) {
        this.voidPhase3AI(enemy);
      }
    },

    // Phase 1 AI for Void Monarch - PURE ATTACK MODE
    voidPhase1AI(enemy) {
      // No movement - just attacks from center
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        this.spiralAttack(enemy);
        enemy.damageCooldown = 120; // 2 second cooldown
      }
    },

    // Phase 2 AI for Void Monarch: PURE ATTACK MODE - NO SUMMONS
    voidPhase2AI(enemy) {
      // No movement - just pure attacks from center
      
      // Cross pattern attack with cooldown
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        this.crossAttack(enemy);
        enemy.damageCooldown = 90; // 1.5 second cooldown
      }
      
      // Additional ring attack every 2 seconds
      if (!enemy.ringCooldown || enemy.ringCooldown <= 0) {
        this.ringAttack(enemy);
        enemy.ringCooldown = 120; // 2 second cooldown
      }
      
      // Spiral burst attack every 3 seconds
      if (!enemy.spiralCooldown || enemy.spiralCooldown <= 0) {
        this.spiralBurstAttack(enemy);
        enemy.spiralCooldown = 180; // 3 second cooldown
      }
      
      // Reduce cooldowns
      if (enemy.ringCooldown > 0) enemy.ringCooldown--;
      if (enemy.spiralCooldown > 0) enemy.spiralCooldown--;
    },

    // Phase 3 AI for Void Monarch: PURE CHAOS ATTACK MODE
    voidPhase3AI(enemy) {
      // No movement or teleporting - just pure chaos attacks from center
      
      // Chaos storm attack with cooldown - CONSTANT ATTACKS
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        this.chaosStormAttack(enemy);
        enemy.damageCooldown = 60; // 1 second cooldown (very fast)
      }
      
      // Additional special attack every 3 seconds
      if (!enemy.specialCooldown || enemy.specialCooldown <= 0) {
        this.voidNovaAttack(enemy);
        enemy.specialCooldown = 180; // 3 second cooldown
      }
      
      // Reduce special cooldown
      if (enemy.specialCooldown > 0) enemy.specialCooldown--;
    },

    // Spiral attack for Void Monarch Phase 1 - ENHANCED SPIRAL PATTERN
    spiralAttack(enemy) {
      // Create spiral effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 8, 20, 'void');
      }
      
      // Send bullets in a double spiral pattern for more intensity
      const spiralCount = 16; // Increased from 12
      for (let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 2;
        const speed = 1 + (i % 4) * 0.25; // Much slower speeds (reduced by half)
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 180, // Longer life
          kind: 'spiral',
          dmg: 0.4 // Moderate damage for final boss Phase 1
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes purple
      enemy.voidEffect = 30;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Cross attack for Void Monarch Phase 2 - ENHANCED CROSS PATTERN
    crossAttack(enemy) {
      // Create cross effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 10, 25, 'void');
      }
      
      // Send bullets in a cross pattern with diagonal directions (8 directions total)
      const directions = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*3/2, Math.PI*7/4];
      directions.forEach(angle => {
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 1,
          vy: Math.sin(angle) * 1,
          life: 140,
          kind: 'cross',
          dmg: 0.5 // Moderate damage for final boss Phase 2
        };
        GameState.ebullets.push(bullet);
      });
      
      // Visual feedback - boss flashes purple
      enemy.voidEffect = 30;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Chaos storm attack for Void Monarch Phase 3 - ENHANCED CHAOS STORM
    chaosStormAttack(enemy) {
      // Create chaos effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 15, 30, 'void');
      }
      
      // Send bullets in random directions with varying speeds - MORE INTENSE
      const bulletCount = 20; // Increased from 15
      for (let i = 0; i < bulletCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 0.5; // Same speed as Phase 1 (1.0-1.5)
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 120 + Math.random() * 80, // Longer life
          kind: 'chaos',
          dmg: 0.6 // Higher damage for final boss Phase 3
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes purple
      enemy.voidEffect = 35;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Ring Attack for Void Monarch Phase 2 - ADDITIONAL ATTACK
    ringAttack(enemy) {
      // Create ring effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 12, 25, 'void');
      }
      
      // Send bullets in a perfect ring pattern - 16 bullets
      const bulletCount = 16;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2;
        const speed = 1; // Same speed as Phase 1
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 130,
          kind: 'ring',
          dmg: 0.45 // Moderate damage for Phase 2
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes purple
      enemy.voidEffect = 25;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Spiral Burst Attack for Void Monarch Phase 2 - THIRD ATTACK
    spiralBurstAttack(enemy) {
      // Create spiral burst effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 15, 30, 'void');
      }
      
      // Send bullets in a spiral burst pattern - 20 bullets with varying speeds
      const bulletCount = 20;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2;
        const speed = 1 + (i % 5) * 0.25; // Same speed as Phase 1 (1.0-2.0)
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 140,
          kind: 'spiralBurst',
          dmg: 0.4 // Lower damage for burst attack
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes purple
      enemy.voidEffect = 30;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // Void Nova Attack for Void Monarch Phase 3 - SPECIAL ATTACK
    voidNovaAttack(enemy) {
      // Create massive nova effect particles
      if (window.ParticleSystem) {
        window.ParticleSystem.create(enemy.x, enemy.y, 20, 40, 'void');
      }
      
      // Send bullets in ALL directions with varying speeds - NOVA EXPLOSION
      const bulletCount = 32; // Massive bullet count
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2;
        const speed = 1 + Math.random() * 0.5; // Same speed as Phase 1 (1.0-1.5)
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 150 + Math.random() * 100, // Very long life
          kind: 'nova',
          dmg: 0.7 // High damage for special attack
        };
        GameState.ebullets.push(bullet);
      }
      
      // Visual feedback - boss flashes intensely
      enemy.voidEffect = 50;
      
      // Add attack animation
      enemy.attacking = true;
      enemy.attackFrame = 0;
    },

    // --- HELPER FUNCTIONS ---
    shootArrow(enemy, player) {
      // Add cooldown to prevent spamming
      if (!enemy.shootCooldown || enemy.shootCooldown <= 0) {
        const arrow = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 3,
          vy: Math.sin(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 3,
          life: 100,
          dmg: 0.2 // Very low damage for regular enemies
        };
        GameState.ebullets.push(arrow);
        enemy.shootCooldown = 120; // 2 second cooldown
      }
    },

    shootOrbital(enemy) {
      // Add cooldown to prevent spamming
      if (!enemy.shootCooldown || enemy.shootCooldown <= 0) {
        const orb = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(enemy.angle) * 2,
          vy: Math.sin(enemy.angle) * 2,
          life: 80,
          dmg: 0.2 // Very low damage for regular enemies
        };
        GameState.ebullets.push(orb);
        enemy.shootCooldown = 100; // 1.67 second cooldown
      }
    },

    shootSniper(enemy, player) {
      // Add cooldown to prevent spamming
      if (!enemy.shootCooldown || enemy.shootCooldown <= 0) {
        const bullet = {
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 5,
          vy: Math.sin(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 5,
          life: 150,
          dmg: 0.3 // Low damage for sniper shots
        };
        GameState.ebullets.push(bullet);
        enemy.shootCooldown = 180; // 3 second cooldown
      }
    },

    basicAttack(enemy, player, critical = false) {
      const damage = critical ? 1.5 : 0.75; // Reduced base damage
      
      // Fix: prevent negative HP values and add damage cooldown
      if (!enemy.damageCooldown || enemy.damageCooldown <= 0) {
        player.hp = Math.max(0, player.hp - damage);
        this.handleStun(player, enemy);
        // NOTE: Cooldown is now set by the calling AI function, not here
        
        // Add visual attack effects for bosses
        if (enemy.isBoss) {
          console.log('Boss attacking! Setting visual effects...');
          // Create attack particles
          if (window.ParticleSystem) {
            console.log('ParticleSystem available, creating particles');
            window.ParticleSystem.create(enemy.x, enemy.y, 3, 10, 'attack');
          } else {
            console.warn('ParticleSystem not available!');
          }
          
          // Add attack animation
          enemy.attacking = true;
          enemy.attackFrame = 0;
          
          // Boss flash effect
          enemy.attackEffect = 15;
          console.log('Set enemy.attackEffect =', enemy.attackEffect);
        }
      }
    },

    handleStun(player, enemy) {
      player.stun = 10;
      enemy.stun = 10;
    }
  });

  console.log('EnemyAI initialized successfully');
  // end init
}

// Manual initialization trigger for game loop
window.ensureEnemySystemsReady = function() {
  // Check if systems are ready
  if (!window.EnemySpawner || !window.EnemyAI || !window.EnemyAI.update) {
    console.warn('Enemy systems not ready, attempting manual initialization...');
    
    // Try to initialize if dependencies are available
    if (window.EnemyTypes && window.RNG && window.Helpers) {
      initEnemySpawner();
    }
    
    if (window.RNG && window.Helpers && window.GameState) {
      initEnemyAI();
    }
  }
  
  return !!(window.EnemySpawner && window.EnemyAI && window.EnemyAI.update);
};