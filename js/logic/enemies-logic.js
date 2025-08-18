// ========================================
// FILE: js/logic/enemies-logic.js
// ========================================
const EnemySpawner = {
  spawnGrunt() {
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = 2 + Math.floor(GameState.room / 2);
    GameState.enemies.push({
      x, y, r: 4, hp, maxHp: hp,
      slowT: 0, slowMul: 1,
      kind: 'grunt',
      spd: 0.55 + GameState.room * 0.05
    });
  },
  
  spawnArcher() {
    const x = RNG.range(16, 304);
    const y = RNG.range(16, 224);
    const hp = 2 + Math.floor(GameState.room / 3);
    GameState.enemies.push({
      x, y, r: 4, hp, maxHp: hp,
      slowT: 0, slowMul: 1,
      kind: 'archer',
      spd: 0.45,
      shootT: RNG.range(30, 60)
    });
  },
  
  spawnMinion(x, y) {
    const hp = 1;
    GameState.enemies.push({
      x, y, r: 3, hp, maxHp: hp,
      slowT: 0, slowMul: 1,
      kind: 'minion',
      spd: 0.7
    });
  },
  
  spawnBoss() {
    const x = 160, y = 120;
    const hp = 30 + GameState.room * 4;
    const kind = GameState.room === 4 ? 'Warden' : 'EclipseTwin';
    GameState.enemies.push({
      x, y, r: 7, hp, maxHp: hp,
      slowT: 0, slowMul: 1,
      kind, spd: 0.6,
      phase: 0, atkT: 90
    });
    Helpers.$('#bossBar').style.display = 'block';
    Helpers.$('#bossName').textContent = kind === 'Warden' ? 'The Warden' : 'Eclipse Twin';
  },
  
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
        if (roll < 70) this.spawnGrunt();
        else if (roll < 90) this.spawnArcher();
        else this.spawnBomber();
      }
      // ... Add other room spawn logic
    }
  }
};

const EnemyAI = {
  updateEnemy(enemy, player, dt) {
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
      // ... Add other enemy AI
    }
  },
  
  gruntAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    const mul = enemy.slowT > 0 ? enemy.slowMul : 1;
    enemy.x += Math.cos(angle) * enemy.spd * mul;
    enemy.y += Math.sin(angle) * enemy.spd * mul;
    if (enemy.slowT > 0) enemy.slowT--;
  },
  
  archerAI(enemy, player) {
    const dist = Helpers.dist(enemy.x, enemy.y, player.x, player.y);
    if (dist > 46) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      enemy.x += Math.cos(angle) * enemy.spd;
      enemy.y += Math.sin(angle) * enemy.spd;
    }
    
    if (--enemy.shootT <= 0) {
      const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
      GameState.ebullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * 1.3,
        vy: Math.sin(angle) * 1.3,
        life: 160
      });
      enemy.shootT = RNG.range(45, 80);
    }
  },
  
  bomberAI(enemy, player) {
    const angle = Helpers.angleTo(enemy.x, enemy.y, player.x, player.y);
    enemy.x += Math.cos(angle) * enemy.spd;
    enemy.y += Math.sin(angle) * enemy.spd;
    
    if (Helpers.dist(enemy.x, enemy.y, player.x, player.y) < 10) {
      Combat.radialExplosion(enemy.x, enemy.y, 20, 2);
      const idx = GameState.enemies.indexOf(enemy);
      if (idx >= 0) GameState.enemies.splice(idx, 1);
    }
  }
};