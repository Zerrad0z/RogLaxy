// ========================================
// FILE: js/systems/renderer.js
// ========================================
const Renderer = (() => {
  let canvas, ctx;
  
  function init() {
    canvas = Helpers.$('#c');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }
  
  function pRect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x|0, y|0, w|0, h|0);
  }
  
  function pText(text, x, y) {
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x|0, y|0);
  }
  
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
  
  function drawPlayer(player) {
    if (player.eclipse > 0) {
      ctx.globalAlpha = 0.8;
      pRect(player.x - 4, player.y - 4, 8, 8, '#fff');
      ctx.globalAlpha = 1;
    }
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ff';
    pRect(player.x - 2, player.y - 2, 4, 4, '#fff');
    ctx.shadowBlur = 0;
    
    if (player.iTimer > 0) {
      ctx.globalAlpha = 0.4;
      pRect(player.x - 3, player.y - 3, 6, 6, '#fff');
      ctx.globalAlpha = 1;
    }
  }
  
  function drawEnemy(enemy) {
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
      case 'tank':
        pRect(enemy.x - 3, enemy.y - 3, 6, 6, '#fff');
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#000');
        pRect(enemy.x - 1, enemy.y - 1, 2, 2, '#fff');
        break;
      // Add other enemy types...
      default:
        pRect(enemy.x - 2, enemy.y - 2, 4, 4, '#fff');
    }
    
    // Draw health bar
    if (enemy.kind !== 'Warden' && enemy.kind !== 'EclipseTwin') {
      const barWidth = enemy.kind === 'tank' ? 10 : (enemy.kind === 'minion' ? 4 : 8);
      pRect(enemy.x - barWidth/2, enemy.y - 6, barWidth, 2, '#555');
      const hpRatio = enemy.hp / enemy.maxHp;
      pRect(enemy.x - barWidth/2, enemy.y - 6, Math.max(0, barWidth * hpRatio), 2, '#fff');
    }
  }
  
  function drawBullet(bullet) {
    ctx.fillStyle = bullet.color || '#fff';
    pRect(bullet.x - 1, bullet.y - 1, 2, 2, bullet.color || '#fff');
    
    // Trail effect for certain bullets
    if (bullet.kind === 'fire' || bullet.kind === 'radiant') {
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.3 * (1 - i/3);
        pRect(bullet.x - bullet.vx * i * 0.5 - 0.5, 
              bullet.y - bullet.vy * i * 0.5 - 0.5, 
              1, 1, bullet.color);
        ctx.globalAlpha = 1;
      }
    }
  }
  
  function clear() {
    pRect(0, 0, canvas.width, canvas.height, '#000');
  }
  
  return {
    init,
    clear,
    drawGrid,
    drawPlayer,
    drawEnemy,
    drawBullet,
    pRect,
    pText,
    getContext: () => ctx,
    getCanvas: () => canvas
  };
})();