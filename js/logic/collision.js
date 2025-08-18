// ========================================
// FILE: js/logic/collision.js
// ========================================
const CollisionSystem = {
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
    
    // Apply separation
    for (const enemy of GameState.enemies) {
      if (enemy.separationX || enemy.separationY) {
        enemy.x += enemy.separationX || 0;
        enemy.y += enemy.separationY || 0;
        
        enemy.x = Helpers.clamp(enemy.x, enemy.r, 320 - enemy.r);
        enemy.y = Helpers.clamp(enemy.y, enemy.r, 240 - enemy.r);
        
        enemy.separationX = 0;
        enemy.separationY = 0;
      }
    }
  },
  
  checkBulletCollisions() {
    // Player bullets hitting enemies
    for (let i = GameState.bullets.length - 1; i >= 0; i--) {
      const bullet = GameState.bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      bullet.life--;
      
      // Handle boomerang bullets
      if (bullet.boomerang && bullet.life === 45) {
        const angle = Helpers.angleTo(bullet.x, bullet.y, GameState.player.x, GameState.player.y);
        bullet.vx = Math.cos(angle) * bullet.spd;
        bullet.vy = Math.sin(angle) * bullet.spd;
      }
      
      // Remove out-of-bounds bullets
      if (bullet.x < 0 || bullet.x > 320 || bullet.y < 0 || bullet.y > 240 || bullet.life <= 0) {
        GameState.bullets.splice(i, 1);
        continue;
      }
      
      // Check collision with enemies
      for (let j = GameState.enemies.length - 1; j >= 0; j--) {
        const enemy = GameState.enemies[j];
        if (Helpers.dist(bullet.x, bullet.y, enemy.x, enemy.y) < 4 + enemy.r) {
          this.handleBulletHit(bullet, enemy);
          
          if (bullet.pierce > 0) {
            bullet.pierce--;
          } else {
            GameState.bullets.splice(i, 1);
            break;
          }
        }
      }
    }
    
    // Enemy bullets hitting player
    for (let i = GameState.ebullets.length - 1; i >= 0; i--) {
      const bullet = GameState.ebullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      if (--bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > 320 || bullet.y > 240) {
        GameState.ebullets.splice(i, 1);
        continue;
      }
      
      if (Helpers.dist(bullet.x, bullet.y, GameState.player.x, GameState.player.y) < GameState.player.r + 2 && 
          GameState.player.iTimer <= 0) {
        GameState.player.hp--;
        GameState.player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
        AudioSystem.hurt();
        GameState.ebullets.splice(i, 1);
        
        if (GameState.player.hp <= 0) {
          GameFlow.gameOver(false);
        }
      }
    }
  },
  
  handleBulletHit(bullet, enemy) {
    let damage = bullet.dmg || 1;
    
    // Apply bullet effects
    if (bullet.kind === 'ice') {
      enemy.slowT = bullet.slowT || 60;
      enemy.slowMul = bullet.slow || 0.5;
    }
    
    if (bullet.kind === 'poison') {
      enemy.poisonT = (enemy.poisonT || 0) + (bullet.poisonT || 100);
      enemy.poison = Math.max(enemy.poison || 0, bullet.poison || 1);
    }
    
    // Apply synergy effects
    if (bullet.kind === 'fire' && SynergySystem.hasSynergyActive('Firestorm')) {
      const radius = RelicSystem.hasRelic('Cinder Bloom') ? 30 : 24;
      Combat.radialExplosion(enemy.x, enemy.y, radius, 1);
      ParticleSystem.create(enemy.x, enemy.y, 2, 8, 'fire');
    }
    
    Combat.hitEnemy(enemy, damage, bullet.kind);
  }
};