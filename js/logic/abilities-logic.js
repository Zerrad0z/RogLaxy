// ========================================
// FILE: js/logic/abilities-logic.js
// ========================================
window.AbilitiesLogic = window.AbilitiesLogic || {};
Object.assign(window.AbilitiesLogic, {
  baseDmg() {
    return 1 + 
           (GameState.player.eclipse ? 1 : 0) + 
           (RelicSystem.hasRelic('Sharper') ? 1 : 0);
  },
  
  emitBullet(x, y, dir, props) {
    const bullet = {
      x, y,
      dir,
      vx: Math.cos(dir) * (props.spd || 2),
      vy: Math.sin(dir) * (props.spd || 2),
      life: props.life || 120,
      owner: 'player',
      ...props
    };
    GameState.bullets.push(bullet);
  },
  
  autoShoot(props) {
    const enemy = Combat.nearestEnemy(GameState.player.x, GameState.player.y);
    const dir = enemy ? 
      Helpers.angleTo(GameState.player.x, GameState.player.y, enemy.x, enemy.y) : 
      0;
    this.emitBullet(GameState.player.x, GameState.player.y, dir, props);
  },
  
  blink() {
    const mvx = (GameState.keys['ArrowRight'] ? 1 : 0) - 
                (GameState.keys['ArrowLeft'] ? 1 : 0);
    const mvy = (GameState.keys['ArrowDown'] ? 1 : 0) - 
                (GameState.keys['ArrowUp'] ? 1 : 0);
    const len = Math.hypot(mvx, mvy) || 1;
    const dx = (mvx / len) * 24;
    const dy = (mvy / len) * 24;
    
    const oldX = GameState.player.x;
    const oldY = GameState.player.y;
    
    GameState.player.x = Helpers.clamp(GameState.player.x + dx, 8, 312);
    GameState.player.y = Helpers.clamp(GameState.player.y + dy, 8, 232);
    GameState.player.iTimer = Math.max(GameState.player.iTimer, 50);
    
    // Handle synergy effects
    if (SynergySystem.hasSynergyActive('StormWalk')) {
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = oldX + (GameState.player.x - oldX) * t;
        const y = oldY + (GameState.player.y - oldY) * t;
        GameState.particles.push({
          x, y, vx: 0, vy: 0, life: 30, kind: 'lightning'
        });
        
        for (const enemy of GameState.enemies) {
          if (Helpers.dist(x, y, enemy.x, enemy.y) < 12) {
            Combat.hitEnemy(enemy, 1, 'shock');
          }
        }
      }
    }
    
    // Create blink particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      GameState.particles.push({
        x: oldX,
        y: oldY,
        vx: Math.cos(angle) * 1.5,
        vy: Math.sin(angle) * 1.5,
        life: 20,
        kind: 'blink'
      });
    }
  },
  
  createShieldEffect() {
    const shield = document.createElement('div');
    shield.className = 'shield-effect';
    shield.style.left = (GameState.player.x - 20) + 'px';
    shield.style.top = (GameState.player.y - 20) + 'px';
    shield.style.width = '40px';
    shield.style.height = '40px';
    Helpers.$('.wrap').appendChild(shield);
    
    setTimeout(() => {
      shield.remove();
    }, 800);
  }
});