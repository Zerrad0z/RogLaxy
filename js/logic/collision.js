// ========================================
// FILE: js/logic/collision.js
// COMPLETE FIXED VERSION
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
        bullet.vx = Math.cos(angle) * (bullet.spd || 1.5);
        bullet.vy = Math.sin(angle) * (bullet.spd || 1.5);
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
          
          if (bullet.pierce && bullet.pierce > 0) {
            bullet.pierce--;
          } else {
            GameState.bullets.splice(i, 1);
            break;
          }
        }
      }
    }
    
    // Enemy bullets hitting player - WITH PROPER HOMING
    for (let i = GameState.ebullets.length - 1; i >= 0; i--) {
      const bullet = GameState.ebullets[i];

      // track age so newly spawned bullets don't immediately home inside their spawner
      bullet.age = (bullet.age || 0) + 1;

      // Handle homing bullets - reduced turn + distance scaling
      if (bullet.homing && bullet.age > 2) {
        const dx = GameState.player.x - bullet.x;
        const dy = GameState.player.y - bullet.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
          const currentAngle = Math.atan2(bullet.vy, bullet.vx);
          const targetAngle = Math.atan2(dy, dx);

          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Much gentler base turn to prevent spinning
          const baseTurn = 0.015; // Reduced from 0.03
          const distanceFactor = Math.min(1, dist / 80); // Increased distance threshold
          const turnSpeed = baseTurn * distanceFactor;

          // Limit maximum turn per frame
          const maxTurn = 0.02;
          const turnAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed, maxTurn);
          const newAngle = currentAngle + turnAmount;

          // Maintain or assign a sensible speed (fallback if zero)
          let speed = Math.hypot(bullet.vx, bullet.vy);
          if (speed < 0.01) speed = bullet.spd || 1.2;
          bullet.vx = Math.cos(newAngle) * speed;
          bullet.vy = Math.sin(newAngle) * speed;
          bullet.spd = speed;
        }
      }

      // Apply gravity to mortar bullets
      if (bullet.kind === 'mortar' && bullet.gravity) {
        bullet.vy += bullet.gravity;
      }
      
      // Move bullet
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Remove bullet if expired or out of bounds
      if (--bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > 320 || bullet.y > 240) {
        GameState.ebullets.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (Helpers.dist(bullet.x, bullet.y, GameState.player.x, GameState.player.y) < GameState.player.r + 2 && 
          GameState.player.iTimer <= 0) {
        // Fix: Clamp HP to prevent negative values and add damage cooldown
        if (!GameState.player.bulletDamageCooldown || GameState.player.bulletDamageCooldown <= 0) {
          // Much more balanced bullet damage scaling
          let damage = 0.25; // Base bullet damage is very low
          if (GameState.room > 5) damage = 0.5;  // Room 6-10: 0.5 damage
          if (GameState.room > 10) damage = 0.75; // Room 11+: 0.75 damage
          if (GameState.room > 15) damage = 1;    // Room 16+: 1 damage
          
          GameState.player.hp = Math.max(0, GameState.player.hp - damage);
          GameState.player.iTimer = CONSTANTS.INVULNERABILITY_TIME;
          GameState.player.bulletDamageCooldown = 45; // 0.75 second cooldown at 60fps
          AudioSystem.hurt();
        }
        GameState.ebullets.splice(i, 1);
        
        if (GameState.player.hp <= 0) {
          GameFlow.gameOver(false);
        }
      }
    }
  },
  
  handleBulletHit(bullet, enemy) {
    const damage = bullet.dmg || 1;
    
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
    
    Combat.hitEnemy(enemy, damage, bullet.kind, bullet.source);
  },
};

