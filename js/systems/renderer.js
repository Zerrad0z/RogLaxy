// ========================================
// FILE: js/systems/renderer.js
// Complete rendering system for all game visuals
// ========================================

const Renderer = (() => {
  let canvas, ctx;
  
  // Initialize the renderer
  function init() {
    canvas = Helpers.$('#c');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.font = '10px monospace';
    return { canvas, ctx };
  }
  
  // Basic drawing primitives
  function pRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x|0, y|0, w|0, h|0);
  }
  
  function pText(text, x, y, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillText(text, x|0, y|0);
  }
  
  function pCircle(x, y, radius, color, filled = true) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (filled) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
  
  function pLine(x1, y1, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  // Clear the canvas
  function clear() {
    pRect(0, 0, canvas.width, canvas.height, '#000');
  }
  
  // Draw grid background
  function drawGrid() {
    ctx.globalAlpha = 0.08;
    for (let x = 0; x < canvas.width; x += 8) {
      pRect(x, 0, 1, canvas.height, '#fff');
    }
    for (let y = 0; y < canvas.height; y += 8) {
      pRect(0, y, canvas.width, 1, '#fff');
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw the player
  function drawPlayer(player) {
    // Eclipse effect
    if (player.eclipse > 0) {
      ctx.globalAlpha = 0.8;
      pRect(player.x - 4, player.y - 4, 8, 8, '#fff');
      ctx.globalAlpha = 1;
    }
    
    // Player with glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ff';
    pRect(player.x - 2, player.y - 2, 4, 4, '#fff');
    ctx.shadowBlur = 0;
    
    // Invulnerability shield
    if (player.iTimer > 0) {
      ctx.globalAlpha = 0.4;
      pRect(player.x - 3, player.y - 3, 6, 6, '#fff');
      ctx.globalAlpha = 1;
    }
  }
  
  // Draw a single enemy
  function drawEnemy(enemy) {
    ctx.save();
    
    // General attack effect for all bosses
    if (enemy.isBoss && enemy.attackEffect > 0) {
      // Only log when effect first appears to reduce spam
      if (enemy.attackEffect === 15) {
        console.log('Drawing boss attack effect:', enemy.attackEffect);
      }
      ctx.globalAlpha = 0.6;
      pRect(enemy.x - 8, enemy.y - 8, 16, 16, '#ff6600');
      ctx.globalAlpha = 1;
    }
    
    // Draw different enemy types
    switch(enemy.kind) {
      case 'grunt':
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#fff');
        break;
        
      case 'archer':
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + 3);
        ctx.lineTo(enemy.x - 3, enemy.y - 3);
        ctx.lineTo(enemy.x + 3, enemy.y - 3);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'bomber':
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'dasher':
        if (enemy.dashing) {
          pRect(enemy.x - 5, enemy.y - 1, 10, 2, '#fff');
        } else {
          pRect(enemy.x - 3, enemy.y - 1, 6, 2, '#fff');
        }
        break;
        
      case 'orbitMage':
        pRect(enemy.x - 4, enemy.y - 1, 8, 2, '#fff');
        pRect(enemy.x - 1, enemy.y - 4, 2, 8, '#fff');
        break;
        
      case 'splitter':
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = enemy.x + Math.cos(angle) * 4;
          const py = enemy.y + Math.sin(angle) * 4;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'tank':
        pRect(enemy.x - 3, enemy.y - 3, 6, 6, '#fff');
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#000');
        pRect(enemy.x - 1, enemy.y - 1, 2, 2, '#fff');
        break;
        
      case 'sniper':
        if (enemy.charging) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(GameState.time / 50);
        }
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x - 3, enemy.y - 3);
        ctx.lineTo(enemy.x + 3, enemy.y + 3);
        ctx.moveTo(enemy.x + 3, enemy.y - 3);
        ctx.lineTo(enemy.x - 3, enemy.y + 3);
        ctx.stroke();
        if (enemy.charging) {
          ctx.globalAlpha = 1;
        }
        break;
        
      case 'minion':
        pRect(enemy.x - 1, enemy.y - 1, 2, 2, '#fff');
        break;
        
      case 'Warden':
        drawWardenBoss(enemy);
        break;
        
      case 'EclipseTwin':
        drawEclipseTwinBoss(enemy);
        break;
        
      // ===== NEW ENEMY TYPES START HERE =====
      case 'phantom':
        // Phantom - ghostly appearance with transparency
        ctx.globalAlpha = enemy.alpha || 1;
        ctx.strokeStyle = '#9c27b0';
        ctx.fillStyle = '#9c27b0';
        ctx.lineWidth = 1;
        
        // Ghost body
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y - 2, 3, Math.PI, 0);
        ctx.lineTo(enemy.x + 3, enemy.y + 3);
        for (let i = 0; i < 3; i++) {
          const wave = Math.sin(GameState.time / 100 + i) * 1;
          ctx.lineTo(enemy.x + 3 - i * 2, enemy.y + 3 + wave);
        }
        ctx.lineTo(enemy.x - 3, enemy.y + 3);
        ctx.closePath();
        
        if (enemy.invisible) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
        
        // Ghost eyes
        if (!enemy.invisible) {
          ctx.fillStyle = '#fff';
          pCircle(enemy.x - 1, enemy.y - 2, 0.5, '#fff');
          pCircle(enemy.x + 1, enemy.y - 2, 0.5, '#fff');
        }
        break;
        
      case 'healer':
        // Healer - cross symbol with green glow
        ctx.fillStyle = '#4caf50';
        
        // Draw cross
        pRect(enemy.x - 1, enemy.y - 4, 2, 8, '#4caf50');
        pRect(enemy.x - 4, enemy.y - 1, 8, 2, '#4caf50');
        
        // Healing aura when active
        if (enemy.healT && enemy.healT < 30) {
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, 8 + Math.sin(GameState.time / 50) * 2, 0, Math.PI * 2);
          ctx.fillStyle = '#4caf50';
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
        
      case 'shielder':
        // Shielder - hexagon with shield effect
        ctx.fillStyle = '#2196f3';
        ctx.strokeStyle = '#2196f3';
        
        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = enemy.x + Math.cos(angle) * 4;
          const py = enemy.y + Math.sin(angle) * 4;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Shield bubble when active
        if (enemy.shielding) {
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, EnemyTypes.shielder.shieldRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        
        // Inner detail
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#000');
        pRect(enemy.x - 1, enemy.y - 1, 2, 2, '#2196f3');
        break;
        
      case 'trickster':
        // Trickster - diamond shape with illusion effect
        ctx.fillStyle = enemy.isClone ? 'rgba(255, 152, 0, 0.5)' : '#ff9800';
        ctx.globalAlpha = enemy.alpha || (enemy.isClone ? 0.5 : 1);
        
        // Draw diamond
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - 5);
        ctx.lineTo(enemy.x + 4, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + 5);
        ctx.lineTo(enemy.x - 4, enemy.y);
        ctx.closePath();
        ctx.fill();
        
        // Shimmer effect for real trickster
        if (!enemy.isClone && enemy.teleportT < 20) {
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
        
      case 'voidling':
        // Voidling - swirling void creature
        ctx.fillStyle = '#673ab7';
        
        // Main body with swirl
        const swirl = GameState.time / 50;
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(swirl);
        
        // Draw swirling tentacles
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          ctx.fillRect(
            Math.cos(angle) * 2 - 1,
            Math.sin(angle) * 2 - 1,
            4, 2
          );
        }
        ctx.restore();
        
        // Core
        pCircle(enemy.x, enemy.y, 2, '#000');
        pCircle(enemy.x, enemy.y, 1, '#673ab7');
        
        // Void pull visualization
        if (Helpers.dist(enemy.x, enemy.y, GameState.player.x, GameState.player.y) < 
            EnemyTypes.voidling.voidPullRadius) {
          ctx.globalAlpha = 0.2;
          ctx.strokeStyle = '#673ab7';
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, EnemyTypes.voidling.voidPullRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        break;
        
      case 'VoidMonarch':
        // Void Monarch - Final boss
        drawVoidMonarchBoss(enemy);
        break;
      // ===== NEW ENEMY TYPES END HERE =====
        
      default:
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#fff');
    }
    
    // Draw health bar for non-boss enemies
    if (enemy.kind !== 'Warden' && enemy.kind !== 'EclipseTwin' && enemy.kind !== 'VoidMonarch') {
      drawEnemyHealthBar(enemy);
    }
    
    // Draw status effects
    drawEnemyStatusEffects(enemy);
    
    ctx.restore();
  }
  
  // Draw Warden boss
  function drawWardenBoss(enemy) {
    // Attack effect - flash red when attacking
    if (enemy.slamEffect > 0) {
      // Only log when effect first appears to reduce spam
      if (enemy.slamEffect === 10) {
        console.log('Drawing Warden slam effect:', enemy.slamEffect);
      }
      ctx.globalAlpha = 0.8;
      pRect(enemy.x - 8, enemy.y - 8, 16, 16, '#ff0000');
      ctx.globalAlpha = 1;
    }
    
    // Attack animation - scale up when attacking
    if (enemy.attacking) {
      // Only log when animation first starts to reduce spam
      if (enemy.attackFrame === 0) {
        console.log('Drawing Warden attack animation, frame:', enemy.attackFrame);
      }
      const scale = 1 + (enemy.attackFrame / 20) * 0.3;
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.scale(scale, scale);
      ctx.translate(-enemy.x, -enemy.y);
    }
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - 6);
    ctx.lineTo(enemy.x + 6, enemy.y);
    ctx.lineTo(enemy.x, enemy.y + 6);
    ctx.lineTo(enemy.x - 6, enemy.y);
    ctx.closePath();
    ctx.fill();
    
    if (enemy.attacking) {
      ctx.restore();
    }
    
    // Boss health bar (smaller version above boss)
    pRect(enemy.x - 8, enemy.y - 10, 16, 2, '#555');
    const hpRatio = enemy.hp / enemy.maxHp;
    pRect(enemy.x - 8, enemy.y - 10, Math.max(0, 16 * hpRatio), 2, '#fff');
  }
  
  // Draw Eclipse Twin boss
  function drawEclipseTwinBoss(enemy) {
    // Attack effect - flash cyan when attacking
    if (enemy.twinEffect > 0) {
      ctx.globalAlpha = 0.7;
      pRect(enemy.x - 10, enemy.y - 10, 20, 20, '#00ffff');
      ctx.globalAlpha = 1;
    }
    
    // Attack animation - scale up when attacking
    if (enemy.attacking) {
      const scale = 1 + (enemy.attackFrame / 20) * 0.4;
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.scale(scale, scale);
      ctx.translate(-enemy.x, -enemy.y);
    }
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? 7 : 4;
      const px = enemy.x + Math.cos(angle) * r;
      const py = enemy.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    if (enemy.attacking) {
      ctx.restore();
    }
    
    // Boss health bar
    pRect(enemy.x - 8, enemy.y - 10, 16, 2, '#555');
    const hpRatio = enemy.hp / enemy.maxHp;
    pRect(enemy.x - 8, enemy.y - 10, Math.max(0, 16 * hpRatio), 2, '#fff');
  }
  
  // Draw Void Monarch boss
  function drawVoidMonarchBoss(enemy) {
    const phase = enemy.currentPhase || 1;
    
    // Attack effect - flash purple when attacking
    if (enemy.voidEffect > 0) {
      ctx.globalAlpha = 0.6;
      pRect(enemy.x - 12, enemy.y - 12, 24, 24, '#8b00ff');
      ctx.globalAlpha = 1;
    }
    
    // Attack animation - scale up when attacking
    if (enemy.attacking) {
      const scale = 1 + (enemy.attackFrame / 20) * 0.5;
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.scale(scale, scale);
      ctx.translate(-enemy.x, -enemy.y);
    }
    
    // Phase-based color
    const colors = {
      1: '#673ab7',
      2: '#512da8',
      3: '#311b92'
    };
    const color = colors[phase];
    
    // Void aura
    ctx.globalAlpha = 0.3;
    const auraSize = 12 + Math.sin(GameState.time / 30) * 3;
    for (let i = 3; i > 0; i--) {
      ctx.globalAlpha = 0.1 * i;
      pCircle(enemy.x, enemy.y, auraSize * i, color);
    }
    ctx.globalAlpha = 1;
    
    // Main body - complex star shape
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = i % 2 === 0 ? 8 : 4;
      const wobble = Math.sin(GameState.time / 20 + i) * 0.5;
      const px = enemy.x + Math.cos(angle) * (r + wobble);
      const py = enemy.y + Math.sin(angle) * (r + wobble);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Core eye
    pCircle(enemy.x, enemy.y, 3, '#000');
    pCircle(enemy.x, enemy.y, 2, '#fff');
    pCircle(enemy.x, enemy.y, 1, color);
    
    // Phase indicators (orbiting dots)
    for (let i = 0; i < phase; i++) {
      const orbitAngle = (GameState.time / 40) + (i / phase) * Math.PI * 2;
      const orbitX = enemy.x + Math.cos(orbitAngle) * 10;
      const orbitY = enemy.y + Math.sin(orbitAngle) * 10;
      pCircle(orbitX, orbitY, 1, '#fff');
    }
    
    if (enemy.attacking) {
      ctx.restore();
    }
    
    // Boss health bar
    pRect(enemy.x - 10, enemy.y - 12, 20, 2, '#555');
    const hpRatio = enemy.hp / enemy.maxHp;
    
    // Color health bar based on phase
    let barColor = '#fff';
    if (hpRatio <= 0.33) barColor = '#f44336';
    else if (hpRatio <= 0.66) barColor = '#ff9800';
    
    pRect(enemy.x - 10, enemy.y - 12, Math.max(0, 20 * hpRatio), 2, barColor);
  }
  
  // Draw enemy health bar
  function drawEnemyHealthBar(enemy) {
    const barWidth = enemy.kind === 'tank' ? 10 : 
                    enemy.kind === 'minion' ? 4 :
                    enemy.kind === 'healer' ? 6 :
                    enemy.kind === 'shielder' ? 8 :
                    enemy.kind === 'phantom' ? 6 :
                    enemy.kind === 'voidling' ? 7 :
                    enemy.kind === 'trickster' && enemy.isClone ? 3 : 8;
    
    pRect(enemy.x - barWidth/2, enemy.y - 6, barWidth, 2, '#555');
    const hpRatio = enemy.hp / enemy.maxHp;
    pRect(enemy.x - barWidth/2, enemy.y - 6, Math.max(0, barWidth * hpRatio), 2, '#fff');
    
    // Shield indicator for shielded enemies
    if (enemy.shield && enemy.shield > 0) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
    }
  }
  
  // Draw enemy status effects (slow, poison, stun)
  function drawEnemyStatusEffects(enemy) {
    let offset = -10;
    
    // Slow effect
    if (enemy.slowT > 0) {
      ctx.globalAlpha = 0.7;
      pText('❄', enemy.x - 3, enemy.y + offset, '#29b6f6');
      offset -= 5;
      ctx.globalAlpha = 1;
    }
    
    // Poison effect
    if (enemy.poisonT > 0) {
      ctx.globalAlpha = 0.7;
      pText('☣', enemy.x - 3, enemy.y + offset, '#7cb342');
      offset -= 5;
      ctx.globalAlpha = 1;
    }
    
    // Stun effect
    if (enemy.stun > 0) {
      ctx.globalAlpha = 0.7;
      pText('✦', enemy.x - 3, enemy.y + offset, '#ffeb3b');
      ctx.globalAlpha = 1;
    }
  }
  
  // Draw all enemies
  function drawEnemies() {
    for (const enemy of GameState.enemies) {
      drawEnemy(enemy);
    }
  }
  
  // Draw a single bullet
  function drawBullet(bullet) {
    ctx.save();
    
    ctx.fillStyle = bullet.color || '#fff';
    pRect(bullet.x - 1, bullet.y - 1, 2, 2, bullet.color || '#fff');
    
    // Add trail effect for certain bullets
    if (bullet.kind === 'fire' || bullet.kind === 'radiant') {
      for (let i = 0; i < 3; i++) {
        const trail = {
          x: bullet.x - bullet.vx * i * 0.5,
          y: bullet.y - bullet.vy * i * 0.5
        };
        ctx.globalAlpha = 0.3 * (1 - i/3);
        pRect(trail.x - 0.5, trail.y - 0.5, 1, 1, bullet.color);
      }
      ctx.globalAlpha = 1;
    }
    
    // Special effects for different bullet types
    if (bullet.kind === 'ice') {
      ctx.globalAlpha = 0.5;
      pCircle(bullet.x, bullet.y, 3, '#29b6f6', false);
      ctx.globalAlpha = 1;
    } else if (bullet.kind === 'void') {
      ctx.globalAlpha = 0.3;
      pRect(bullet.x - 2, bullet.y - 2, 4, 4, '#ba68c8');
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }
  
  // Draw all bullets
  function drawBullets() {
    // Player bullets
    for (const bullet of GameState.bullets) {
      drawBullet(bullet);
    }
    
    // Enemy bullets
    for (const bullet of GameState.ebullets) {
      if (bullet.homing) {
        // Draw homing bullets with a purple glow effect
        ctx.save();

        // Pulsing glow effect
        const pulse = Math.sin(GameState.time / 10) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;

        // Outer glow
        ctx.fillStyle = '#8b00ff';
        ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);

        // Middle layer
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#b366ff';
        ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);

        // Core
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);

        // Trail effect for homing bullets
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#8b00ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.vx * 3, bullet.y - bullet.vy * 3);
        ctx.stroke();

        ctx.restore();
      } else if (bullet.kind === 'wave') {
        // Warden wave bullets - red with trail
        ctx.save();
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        
        // Red trail effect
        ctx.globalAlpha = 0.5;
        ctx.fillRect(bullet.x - bullet.vx * 2, bullet.y - bullet.vy * 2, 2, 2);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(bullet.x - bullet.vx * 4, bullet.y - bullet.vy * 4, 2, 2);
        ctx.restore();
      } else if (bullet.kind === 'arc') {
        // Eclipse Twin arc bullets - cyan with glow
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        ctx.restore();
      } else if (bullet.kind === 'spiral') {
        // Void Monarch spiral bullets - purple with rotation
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(GameState.time / 100);
        ctx.fillStyle = '#8b00ff';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      } else if (bullet.kind === 'cross') {
        // Void Monarch cross bullets - dark purple with cross shape
        ctx.save();
        ctx.fillStyle = '#4a148c';
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        ctx.strokeStyle = '#8b00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bullet.x - 2, bullet.y);
        ctx.lineTo(bullet.x + 2, bullet.y);
        ctx.moveTo(bullet.x, bullet.y - 2);
        ctx.lineTo(bullet.x, bullet.y + 2);
        ctx.stroke();
        ctx.restore();
      } else if (bullet.kind === 'chaos') {
        // Void Monarch chaos bullets - random colors with sparkle
        ctx.save();
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#8000ff'];
        ctx.fillStyle = colors[Math.floor(bullet.life / 10) % colors.length];
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        
        // Sparkle effect
        if (bullet.life % 5 === 0) {
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#fff';
          ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
        }
        ctx.restore();
      } else if (bullet.kind === 'ring') {
        // Void Monarch ring bullets - blue ring pattern
        ctx.save();
        ctx.fillStyle = '#00bcd4';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.8;
        
        // Draw ring bullet
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (bullet.kind === 'spiralBurst') {
        // Void Monarch spiral burst bullets - green spiral pattern
        ctx.save();
        ctx.fillStyle = '#4caf50';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        
        // Draw spiral burst bullet
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        ctx.restore();
      } else if (bullet.kind === 'nova') {
        // Void Monarch nova bullets - intense purple with glow effect
        ctx.save();
        ctx.fillStyle = '#ff00ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;
        
        // Draw glowing bullet
        ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3);
        ctx.globalAlpha = 0.4;
        ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);
        ctx.restore();
      } else {
        // Regular enemy bullets
        pRect(bullet.x - 1, bullet.y - 1, 2, 2, '#fff');
      }
    }
  }
  
  // Draw a single particle
  function drawParticle(particle) {
    ctx.save();
    
    switch(particle.kind) {
      case 'zap':
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.tx, particle.ty);
        ctx.stroke();
        break;
        
      case 'lightning':
        ctx.globalAlpha = 0.8;
        pRect(particle.x - 1, particle.y - 1, 3, 3, '#ffeb3b');
        break;
        
      case 'fire':
        ctx.globalAlpha = particle.life / 30;
        pRect(particle.x - 1, particle.y - 1, 2, 2, '#ff5722');
        break;
        
      case 'hellfire':
        ctx.globalAlpha = particle.life / 40;
        pRect(particle.x - 2, particle.y - 2, 4, 4, '#ff5722');
        break;
        
      case 'void':
        ctx.globalAlpha = 0.6;
        pRect(particle.x - 1, particle.y - 1, 2, 2, '#ba68c8');
        break;
        
      case 'eclipse':
        const size = (60 - particle.life) / 10;
        ctx.globalAlpha = particle.life / 60;
        pRect(particle.x - size/2, particle.y - size/2, size, size, '#ba68c8');
        break;
        
      case 'shatter':
        ctx.strokeStyle = '#29b6f6';
        ctx.globalAlpha = particle.life / 15;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const len = 5 + (15 - particle.life);
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + Math.cos(angle) * len, 
                    particle.y + Math.sin(angle) * len);
        }
        ctx.stroke();
        break;
        
      case 'lifespark':
        ctx.globalAlpha = 0.7;
        pRect(particle.x - 1, particle.y - 1, 3, 3, '#81c784');
        if (particle.life % 3 === 0) {
          pRect(particle.x - 2, particle.y - 2, 5, 5, '#81c784');
        }
        break;
        
      case 'blink':
        ctx.globalAlpha = particle.life / 20;
        pRect(particle.x, particle.y, 2, 2, '#9fa8da');
        break;
        
      case 'explosion':
        ctx.globalAlpha = particle.life / 18;
        pRect(particle.x - 1, particle.y - 1, 3, 3, '#ff5722');
        break;
        
      // ===== NEW PARTICLE TYPES START HERE =====
      case 'heal':
        ctx.globalAlpha = particle.life / 30;
        pText('+', particle.x, particle.y, '#4caf50');
        ctx.globalAlpha = 1;
        break;
        
      case 'shield':
        ctx.globalAlpha = particle.life / 20;
        ctx.strokeStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 6 - (20 - particle.life) / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
        
      case 'teleport':
  ctx.globalAlpha = particle.life / 20;
  // Change variable name to avoid conflict
  const teleportSize = 3 - (20 - particle.life) / 10;
  pRect(particle.x - teleportSize/2, particle.y - teleportSize/2, 
        teleportSize, teleportSize, '#ff9800');
  ctx.globalAlpha = 1;
  break;
        
      case 'voidRift':
        // Persistent void zone
        ctx.globalAlpha = 0.4 + 0.1 * Math.sin(GameState.time / 20);
        ctx.fillStyle = '#673ab7';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + GameState.time / 50;
          const r = 15 + Math.sin(angle * 3) * 3;
          const px = particle.x + Math.cos(angle) * r;
          const py = particle.y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      // ===== NEW PARTICLE TYPES END HERE =====
        
      default:
        pRect(particle.x, particle.y, 1, 1, '#fff');
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  
  // Draw all particles
  function drawParticles() {
    for (const particle of GameState.particles) {
      drawParticle(particle);
    }
  }
  
  // Draw active synergies indicator
  function drawSynergies() {
    if (GameState.activeSynergies.length === 0) return;
    
    ctx.save();
    let yOffset = 10;
    
    for (const synergy of GameState.activeSynergies) {
      const alpha = synergy.justActivated ? 
        0.8 + 0.2 * Math.sin(GameState.time / 100) : 0.6;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = synergy.color || '#fff';
      ctx.font = '8px monospace';
      
      const text = synergy.name;
      const width = ctx.measureText(text).width;
      
      // Background
      ctx.globalAlpha = alpha * 0.3;
      pRect(5, yOffset - 8, width + 10, 10, synergy.color);
      
      // Text
      ctx.globalAlpha = alpha;
      pText(text, 10, yOffset, synergy.color);
      
      // Timer bar
      const timerWidth = (synergy.timeLeft / 8000) * (width + 10);
      ctx.globalAlpha = alpha * 0.5;
      pRect(5, yOffset, timerWidth, 2, synergy.color);
      
      yOffset += 15;
    }
    
    ctx.restore();
  }
  
  // Draw debug info
  function drawDebug() {
    if (!window.DEBUG_MODE) return;
    
    ctx.save();
    ctx.fillStyle = '#0f0';
    ctx.font = '8px monospace';
    
    const stats = [
      `FPS: ${Math.round(1000 / 16)}`,
      `Enemies: ${GameState.enemies.length}`,
      `Bullets: ${GameState.bullets.length}`,
      `Particles: ${GameState.particles.length}`,
      `Room: ${GameState.room}`,
      `HP: ${GameState.player.hp}/${GameState.player.hpMax}`
    ];
    
    stats.forEach((stat, i) => {
      pText(stat, canvas.width - 80, 10 + i * 10, '#0f0');
    });
    
    ctx.restore();
  }
  
  // Main render function
  function render() {
    // Clear and draw background
    clear();
    drawGrid();
    
    // Draw game elements in order
    drawParticles();
    drawBullets();
    drawEnemies();
    drawPlayer(GameState.player);
    
    // UI elements
    drawSynergies();
    drawDebug();
  }
  
  // Pause screen overlay
  function drawPauseScreen() {
    ctx.save();
    
    // Darken screen
    ctx.globalAlpha = 0.7;
    pRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Pause text
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    ctx.font = '10px monospace';
    ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }
  
  // Victory/defeat overlay
  function drawGameOverlay(victory) {
    ctx.save();
    
    ctx.globalAlpha = 0.8;
    pRect(0, 0, canvas.width, canvas.height, victory ? '#001100' : '#110000');
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = victory ? '#0f0' : '#f00';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(victory ? 'VICTORY!' : 'DEFEAT', canvas.width / 2, canvas.height / 2);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }
  
  // Get canvas and context references
  function getCanvas() {
    return canvas;
  }
  
  function getContext() {
    return ctx;
  }
  
  // Set global alpha
  function setAlpha(alpha) {
    ctx.globalAlpha = alpha;
  }
  
  // Reset rendering state
  function resetState() {
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
  }
  
  return {
    init,
    clear,
    render,
    
    // Basic drawing
    pRect,
    pText,
    pCircle,
    pLine,
    
    // Component drawing
    drawGrid,
    drawPlayer,
    drawEnemy,
    drawEnemies,
    drawBullet,
    drawBullets,
    drawParticle,
    drawParticles,
    drawSynergies,
    drawDebug,
    
    // Overlays
    drawPauseScreen,
    drawGameOverlay,
    
    // Utilities
    getCanvas,
    getContext,
    setAlpha,
    resetState
  };
})();

// Export for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}