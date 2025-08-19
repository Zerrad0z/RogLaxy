// ========================================
// FILE: js/ui/draft.js
// ========================================
const DraftUI = {
  showAbilityDraft() {
    GameState.state = 'draft';
    Helpers.$('#draft').classList.remove('hidden');
    Helpers.$('#relicDraft').classList.add('hidden');
    Helpers.$('#gameOver').classList.add('hidden');
    
    const pool = ABILITIES.slice();
    const current = new Set(GameState.abilitySlots.filter(Boolean).map(a => a.name));
    const options = [];
    
    while (options.length < 3 && pool.length) {
      const idx = RNG.range(0, pool.length - 1);
      const ability = pool.splice(idx, 1)[0];
      if (!current.has(ability.name)) {
        options.push(ability);
      }
    }
    
    const choicesBox = Helpers.$('#draftChoices');
    choicesBox.innerHTML = '';
    
    options.forEach(option => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      
      const icon = document.createElement('div');
      icon.style.fontSize = '12px';
      const glyph = (txt) => { icon.textContent = txt; };
      (AbilityIcons[option.icon] || (() => {}))(glyph);
      slot.appendChild(icon);
      
      slot.title = `${option.name} (${option.cd}s CD) | Tags: ${option.tags.join(', ')}`;
      
      slot.ondblclick = () => {
        GameState.abilitySlots[GameState.selectedSlot] = { ...option, cdLeft: 0 };
        Helpers.$('#draft').classList.add('hidden');
        this.maybeShowRelic();
      };
      
      choicesBox.appendChild(slot);
    });
    
    Helpers.$('#skipBtn').onclick = () => {
      Helpers.$('#draft').classList.add('hidden');
      this.maybeShowRelic();
    };
  },
  
  showRelicDraft() {
    GameState.state = 'relic';
    Helpers.$('#relicDraft').classList.remove('hidden');
    Helpers.$('#draft').classList.add('hidden');
    
    const pool = RELICS.filter(r => !RelicSystem.hasRelic(r.name));
    const picks = [];
    
    while (picks.length < 3 && pool.length) {
      const idx = RNG.range(0, pool.length - 1);
      picks.push(pool.splice(idx, 1)[0]);
    }
    
    const choicesBox = Helpers.$('#relicChoices');
    choicesBox.innerHTML = '';
    
    picks.forEach(relic => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      
      const icon = document.createElement('div');
      icon.style.fontSize = '14px';
      icon.textContent = relic.icon;
      slot.appendChild(icon);
      
      slot.title = `${relic.name} — ${relic.desc}`;
      
      slot.ondblclick = () => {
        relic.apply();
        AudioSystem.relic();
        Helpers.$('#relicDraft').classList.add('hidden');
        GameFlow.startRoom();
      };
      
      choicesBox.appendChild(slot);
    });
  },
  
  maybeShowRelic() {
    // No more automatic relic rewards every 2 rooms
    // Relics are now only given by boss defeats
    GameFlow.startRoom();
  },
  
  showLegendaryRelicDraft() {
    GameState.state = 'legendaryRelic';
    Helpers.$('#relicDraft').classList.remove('hidden');
    Helpers.$('#draft').classList.add('hidden');
    
    // Get all relics and mark them as legendary (yellow squares)
    const pool = RELICS.filter(r => !RelicSystem.hasRelic(r.name));
    const picks = [];
    
    while (picks.length < 3 && pool.length) {
      const idx = RNG.range(0, pool.length - 1);
      picks.push(pool.splice(idx, 1)[0]);
    }
    
    const choicesBox = Helpers.$('#relicChoices');
    choicesBox.innerHTML = '';
    
    picks.forEach(relic => {
      const slot = document.createElement('div');
      slot.className = 'slot legendary'; // Add legendary class for yellow styling
      
      const icon = document.createElement('div');
      icon.style.fontSize = '14px';
      icon.textContent = relic.icon;
      slot.appendChild(icon);
      
      slot.title = `LEGENDARY: ${relic.name} — ${relic.desc}`;
      
      slot.ondblclick = () => {
        relic.apply();
        AudioSystem.relic();
        Helpers.$('#relicDraft').classList.add('hidden');
        
        // After choosing legendary relic, move to next room instead of restarting current room
        if (GameFlow.endRoom) {
          GameFlow.endRoom();
        } else {
          // Fallback if endRoom doesn't exist
          GameState.room++;
          GameFlow.startRoom();
        }
      };
      
      choicesBox.appendChild(slot);
    });
  }
};

// Make DraftUI globally available
window.DraftUI = DraftUI;