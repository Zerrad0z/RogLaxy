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
    
    EnemySpawner.spawnWave();
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
    
    if (player.iTimer > 0) player.iTimer--;
    if (player.eclipse > 0) player.eclipse--;
  },
  
  updateAbilities(dt) {
    for (const ability of GameState.abilitySlots) {
      if (!ability) continue;
      if (ability.cdLeft > 0) {
        const rate = RelicSystem.hasRelic('Focusing Core') ? 0.85 : 1;
        ability.cdLeft = Math.max(0, ability.cdLeft - dt / 1000 * (1 / rate));
      }
    }
  },
  
  updateEnemies(dt) {
    for (let i = GameState.enemies.length - 1; i >= 0; i--) {
      const enemy = GameState.enemies[i];
      
      // Update enemy AI
      EnemyAI.updateEnemy(enemy, GameState.player, dt);
      
      // Check collision with player
      if (Helpers.dist(enemy.x, enemy.y, GameState.player.x, GameState.player.y) < 
          enemy.r + GameState.player.r) {
        if (GameState.player.iTimer <= 0) {
          GameState.player.hp--;
          GameState.player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
          AudioSystem.hurt();
          
          if (GameState.player.hp <= 0) {
            this.gameOver(false);
            return;
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