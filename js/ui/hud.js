// ========================================
// FILE: js/ui/hud.js
// FIXED: Boss bar now tracks VoidMonarch
// ========================================
const HUD = {
  update() {
    const player = GameState.player;
    // Fix: Clamp HP values to prevent negative repeat errors
    const currentHp = Math.max(0, Math.min(player.hp, player.hpMax));
    const missingHp = Math.max(0, player.hpMax - currentHp);
    
    Helpers.$('#hp').textContent = `${'♥'.repeat(currentHp)}${'·'.repeat(missingHp)}`;
    Helpers.$('#room').textContent = `Room ${GameState.room}/${GameState.maxRooms}`;
    
    this.updateBossBar();
  },
  
  updateBossBar() {
    // FIXED: Now includes VoidMonarch!
    const boss = GameState.enemies.find(e => 
      e.kind === 'Warden' || e.kind === 'EclipseTwin' || e.kind === 'VoidMonarch'
    );
    
    if (boss) {
      const healthPercent = Math.max(0, boss.hp / boss.maxHp);
      const percent = healthPercent * 100;
      
      const barEl = Helpers.$('#bossHealth');
      barEl.style.width = `${percent}%`;
      Helpers.$('#bossHealthText').textContent = `${Math.ceil(percent)}%`;
      
      // Dynamic color based on health
      if (percent > 60) {
        barEl.style.background = '#0f0';
      } else if (percent > 30) {
        barEl.style.background = '#ff0';
      } else {
        barEl.style.background = '#f00';
      }
    }
  },
  
  renderAbilityBar() {
    const bar = Helpers.$('#bar');
    bar.innerHTML = '';
    
    GameState.abilitySlots.forEach((ability, i) => {
      const slot = document.createElement('div');
      let className = 'slot' + (i === GameState.selectedSlot ? ' selected' : '');
      
      const hasSynergyEffect = ability && GameState.activeSynergies.some(
        s => s.abilities.includes(ability.name)
      );
      if (hasSynergyEffect) className += ' synergy';
      
      slot.className = className;
      
      const icon = document.createElement('div');
      icon.style.fontSize = '14px';
      if (ability) {
        const glyph = (txt) => { icon.textContent = txt; };
        (AbilityIcons[ability.icon] || (() => {}))(glyph);
      }
      slot.appendChild(icon);
      
      const keyHint = document.createElement('div');
      keyHint.className = 'keyhint';
      keyHint.textContent = CONSTANTS.SLOT_KEYS[i];
      slot.appendChild(keyHint);
      
      if (ability && ability.cdLeft > 0 && typeof ability.cdLeft === 'number') {
        const cd = document.createElement('div');
        cd.className = 'cd';
        cd.textContent = ability.cdLeft.toFixed(1);
        slot.appendChild(cd);
      }
      
      slot.onclick = () => { 
        GameState.selectedSlot = i; 
        this.renderAbilityBar();
      };
      
      bar.appendChild(slot);
    });
  }
};