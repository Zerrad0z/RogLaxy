// ========================================
// FILE: js/game-loop.js
// ========================================
const GameFlow = {
  startRun() {
    GameState.reset();
    
    // Set starting abilities
    const starters = ['Firebolt', 'IceShard', 'Shield'];
    GameState.abilitySlots = starters.map(name => {
      const ability = ABILITIES.find(a => a.name === name);
      return { ...ability, cdLeft: 0 };
    });
    
    HUD.renderAbilityBar();
    this.startRoom();
  },
  
  startRoom() {
    GameState.enemies = [];
    GameState.bullets = [];
    GameState.ebullets = [];
    GameState.particles = [];
    GameState.player.x = 160;
    GameState.player.y = 120;
    GameState.player.iTimer = 0;
    GameState.state = 'play';
    
    // Ensure enemy systems are ready before spawning
    if (window.ensureEnemySystemsReady && typeof window.ensureEnemySystemsReady === 'function') {
      if (!window.ensureEnemySystemsReady()) {
        console.error('Enemy systems not ready, cannot spawn enemies');
        return;
      }
    }
    
    if (window.EnemySpawner && typeof window.EnemySpawner.spawnWave === 'function') {
      EnemySpawner.spawnWave();
    } else {
      console.error('EnemySpawner.spawnWave not available');
    }
  },
  
  endRoom() {
    GameState.roomsCleared++;
    
    if (GameState.room >= GameState.maxRooms) {
      this.gameOver(true);
      return;
    }
    
    GameState.room++;
    Helpers.$('#bossBar').style.display = 'none';
    DraftUI.showAbilityDraft();
  },
  
  gameOver(victory) {
    UI.showGameOver(victory);
  },
  
  update(dt) {
    if (GameState.state !== 'play') return;
    
    GameState.time += dt;
    
    // Update player
    this.updatePlayer(dt);
    if (GameState.player.iTimer > 0) GameState.player.iTimer--;
    if (GameState.player.stun > 0) GameState.player.stun--;
    if (GameState.player.shieldEffect > 0) GameState.player.shieldEffect--;
    
    // Reduce damage cooldowns
    if (GameState.player.bulletDamageCooldown > 0) GameState.player.bulletDamageCooldown--;
    if (GameState.player.enemyDamageCooldown > 0) GameState.player.enemyDamageCooldown--;
    
    // Update abilities cooldowns
    this.updateAbilities(dt);
    
    // Update synergies
    SynergySystem.updateSynergies(dt);
    
    // Update enemies
    this.updateEnemies(dt);
    
    // Update collisions
    CollisionSystem.checkBulletCollisions();
    
    // Update particles
    ParticleSystem.update(dt);
    
    // Check win condition
    if (GameState.enemies.length === 0 && GameState.state === 'play') {
      this.endRoom();
    }
  },
  
  updatePlayer(dt) {
    const player = GameState.player;
    const keys = GameState.keys;
    
    let vx = 0, vy = 0;
    const speed = player.spd * (RelicSystem.hasRelic('Fleet Boots') ? 1.15 : 1);
    
    if (keys['ArrowLeft']) vx -= speed;
    if (keys['ArrowRight']) vx += speed;
    if (keys['ArrowUp']) vy -= speed;
    if (keys['ArrowDown']) vy += speed;
    
    player.x = Helpers.clamp(player.x + vx, 8, 312);
    player.y = Helpers.clamp(player.y + vy, 8, 232);
    
    // Track movement history for boss prediction AI
    if (!player.lastPositions) {
      player.lastPositions = [];
    }
    
    // Add current position to history
    player.lastPositions.push({ x: player.x, y: player.y, time: GameState.time });
    
    // Keep only last 10 positions (about 1/6 second at 60fps)
    if (player.lastPositions.length > 10) {
      player.lastPositions.shift();
    }
    
    if (player.iTimer > 0) player.iTimer--;
    if (player.eclipse > 0) player.eclipse--;
    if (player.shieldEffect > 0) player.shieldEffect--;
  },
  
  updateAbilities(dt) {
    for (const ability of GameState.abilitySlots) {
      if (!ability) continue;
      
      // Ensure cdLeft property exists and is valid
      if (typeof ability.cdLeft === 'undefined' || ability.cdLeft === null) {
        ability.cdLeft = 0;
      }
      
      if (ability.cdLeft > 0) {
        const rate = RelicSystem.hasRelic('Focusing Core') ? 0.85 : 1;
        ability.cdLeft = Math.max(0, ability.cdLeft - dt / 1000 * (1 / rate));
      }
    }
    
    // Update HUD to show real-time cooldown changes
    if (HUD && HUD.renderAbilityBar) {
      HUD.renderAbilityBar();
    } else {
      console.warn('HUD or renderAbilityBar not available for cooldown updates');
    }
  },
  
  updateEnemies(dt) {
    // Ensure enemy systems are ready
    if (window.ensureEnemySystemsReady && typeof window.ensureEnemySystemsReady === 'function') {
      if (!window.ensureEnemySystemsReady()) {
        console.warn('Enemy systems not ready, skipping enemy updates');
        return;
      }
    }
    
    for (let i = GameState.enemies.length - 1; i >= 0; i--) {
      const enemy = GameState.enemies[i];
      
      // Update enemy AI
      if (window.EnemyAI && window.EnemyAI.update) {
        try {
          window.EnemyAI.update(enemy);
        } catch (error) {
          console.error('Error updating enemy:', enemy.kind, error);
        }
      } else {
        console.error('EnemyAI.update not available!');
        console.log('window.EnemyAI:', window.EnemyAI);
        if (window.EnemyAI) {
          console.log('EnemyAI keys:', Object.keys(window.EnemyAI));
        }
      }
      
      // Check collision with player
      if (Helpers.dist(enemy.x, enemy.y, GameState.player.x, GameState.player.y) < 
          enemy.r + GameState.player.r) {
        if (GameState.player.iTimer <= 0) {
          // Fix: prevent negative HP values and add damage cooldown
          if (!GameState.player.enemyDamageCooldown || GameState.player.enemyDamageCooldown <= 0) {
            // Much more balanced enemy collision damage scaling
            let damage = 0.25; // Base collision damage is very low
            if (GameState.room > 5) damage = 0.5;  // Room 6-10: 0.5 damage
            if (GameState.room > 10) damage = 0.75; // Room 11+: 0.75 damage
            if (GameState.room > 15) damage = 1;    // Room 16+: 1 damage
            
            GameState.player.hp = Math.max(0, GameState.player.hp - damage);
            GameState.player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
            GameState.player.enemyDamageCooldown = 90; // 1.5 second cooldown at 60fps
            AudioSystem.hurt();
            
            if (GameState.player.hp <= 0) {
              this.gameOver(false);
              return;
            }
          }
        }
      }
      
      // Update poison
      if (enemy.poisonT > 0) {
        if ((enemy.poisonTick || 0) <= 0) {
          let poisonDmg = enemy.poison || 1;
          if (SynergySystem.hasSynergyActive('Hellfire')) {
            poisonDmg += 1;
            ParticleSystem.create(enemy.x, enemy.y, 0.5, 1, 'hellfire');
          }
          Combat.hitEnemy(enemy, poisonDmg, 'poison');
          enemy.poisonTick = 30;
        } else {
          enemy.poisonTick--;
        }
        enemy.poisonT--;
      }
    }
    
    // Apply enemy collision avoidance
    CollisionSystem.separateEnemies();
  },
  
  draw() {
    const ctx = Renderer.getContext();
    const canvas = Renderer.getCanvas();
    
    // Clear and draw background
    Renderer.clear();
    Renderer.drawGrid();
    
    // Draw player
    Renderer.drawPlayer(GameState.player);
    
    // Draw enemies
    for (const enemy of GameState.enemies) {
      Renderer.drawEnemy(enemy);
    }
    
    // Draw bullets
    for (const bullet of GameState.bullets) {
      Renderer.drawBullet(bullet);
    }
    
    // Draw enemy bullets
    for (const bullet of GameState.ebullets) {
      Renderer.pRect(bullet.x - 1, bullet.y - 1, 2, 2, '#fff');
    }
    
    // Draw particles
    ParticleSystem.draw(ctx);
    
    // Update HUD
    HUD.update();
  }
};

// Make GameFlow globally available
window.GameFlow = GameFlow;