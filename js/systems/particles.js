// ========================================
// FILE: js/systems/particles.js
// ========================================
const ParticleSystem = {
  create(x, y, speed, count, kind = 'p') {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      GameState.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 18,
        kind
      });
    }
  },
  
  update(dt) {
    for (let i = GameState.particles.length - 1; i >= 0; i--) {
      const particle = GameState.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      if (particle.life <= 0) {
        GameState.particles.splice(i, 1);
      }
    }
  },
  
  draw(ctx) {
    for (const particle of GameState.particles) {
      switch(particle.kind) {
        case 'zap':
          ctx.strokeStyle = '#fff';
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.tx, particle.ty);
          ctx.stroke();
          ctx.globalAlpha = 1;
          break;
        case 'lightning':
          ctx.globalAlpha = 0.8;
          Renderer.pRect(particle.x - 1, particle.y - 1, 3, 3, '#ffeb3b');
          ctx.globalAlpha = 1;
          break;
        case 'fire':
          ctx.globalAlpha = particle.life / 30;
          Renderer.pRect(particle.x - 1, particle.y - 1, 2, 2, '#ff5722');
          ctx.globalAlpha = 1;
          break;
        default:
          Renderer.pRect(particle.x, particle.y, 1, 1, '#fff');
      }
    }
  }
};