// ========================================
// FILE: js/logic/combat.js
// ========================================
const Combat = {
  hitEnemy(enemy, damage, damageType) {
    enemy.hp -= damage;
    AudioSystem.hit();
    
    if (enemy.hp <= 0) {
      GameState.kills++;
      AudioSystem.kill();
      ParticleSystem.create(enemy.x, enemy.y, 1.2, 8);
      
      // Handle special death effects
      if (enemy.kind === 'splitter') {
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          const mx = enemy.x + Math.cos(angle) * 10;
          const my = enemy.y + Math.sin(angle) * 10;
          EnemySpawner.spawnMinion(mx, my);
        }
      }
      
      const idx = GameState.enemies.indexOf(enemy);
      if (idx >= 0) GameState.enemies.splice(idx, 1);
      
      // Handle boss deaths
      if (enemy.kind === 'Warden' || enemy.kind === 'EclipseTwin' || enemy.kind === 'VoidMonarch') {
        console.log(`🏆 BOSS DEFEATED: ${enemy.kind}`);
        Helpers.$('#bossBar').style.display = 'none';
        
        // Call defeatBoss to track boss defeat and give rewards
        if (GameState.defeatBoss) {
          GameState.defeatBoss(enemy.kind);
        }
        
        // Handle different boss rewards
        if (enemy.kind === 'Warden' || enemy.kind === 'EclipseTwin') {
          // Show legendary relic draft (yellow squares) for first two bosses
          if (window.DraftUI && window.DraftUI.showLegendaryRelicDraft) {
            window.DraftUI.showLegendaryRelicDraft();
          }
        } else if (enemy.kind === 'VoidMonarch') {
          // Show victory message for final boss victory!
          console.log('🎉 VOID MONARCH DEFEATED! Showing victory message in 1 second...');
          setTimeout(() => {
            console.log('🌟 Showing victory message now!');
            if (window.UI && window.UI.showVictory) {
              window.UI.showVictory();
            } else {
              console.error('❌ UI.showVictory not available!');
            }
          }, 1000); // 1 second delay for dramatic effect
        }
      }
    }
    
    // Check for synergy effects
    if (damageType === 'shock' && SynergySystem.hasSynergyActive('ShatterShock') && enemy.slowT > 0) {
      this.hitEnemy(enemy, 2, 'shatter');
      GameState.particles.push({
        x: enemy.x, 
        y: enemy.y, 
        vx: 0, 
        vy: 0, 
        life: 15, 
        kind: 'shatter'
      });
    }
  },
  
  radialExplosion(x, y, radius, damage) {
    for (let i = 0; i < 12; i++) {
      GameState.particles.push({
        x, y,
        vx: Math.cos(i / 12 * Math.PI * 2) * 1.2,
        vy: Math.sin(i / 12 * Math.PI * 2) * 1.2,
        life: 18,
        kind: 'explosion'
      });
    }
    
    for (const enemy of GameState.enemies) {
      if (Helpers.dist(x, y, enemy.x, enemy.y) <= radius) {
        this.hitEnemy(enemy, damage, 'explosion');
        if (RelicSystem.hasRelic('Grounded')) {
          enemy.stun = 30;
        }
      }
    }
  },
  
  heal(amount) {
    // Only heal if not at full HP
    if (GameState.player.hp < GameState.player.hpMax) {
      GameState.player.hp = Math.min(GameState.player.hpMax, GameState.player.hp + amount);
    }
    
    if (SynergySystem.hasSynergyActive('LifeSpark')) {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        GameState.particles.push({
          x: GameState.player.x,
          y: GameState.player.y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          life: 30,
          kind: 'lifespark'
        });
      }
    }
  },
  
  chainLightning(origin, bounces, damage) {
    let source = origin;
    let remaining = bounces;
    let lastTarget = null;
    
    while (remaining > 0) {
      const target = this.nearestEnemy(source.x, source.y, lastTarget);
      if (!target) break;
      
      this.hitEnemy(target, damage, 'shock');
      GameState.particles.push({
        x: source.x,
        y: source.y,
        vx: 0,
        vy: 0,
        life: 10,
        kind: 'zap',
        tx: target.x,
        ty: target.y
      });
      
      source = target;
      lastTarget = target;
      remaining--;
    }
  },
  
  nearestEnemy(x, y, notThis) {
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
  }
};