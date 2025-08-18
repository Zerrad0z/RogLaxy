// ========================================
// FILE: js/utils/constants.js
// Updated game constants with extended rooms
// ========================================

const CONSTANTS = {
  // Canvas
  CANVAS_WIDTH: 320,
  CANVAS_HEIGHT: 240,
  
  // Game progression
  MAX_ROOMS: 12,  // Extended from 8 to 12
  BOSS_ROOMS: [4, 8, 12],  // Three boss encounters
  
  // Player
  PLAYER_BASE_SPEED: 1.2,
  PLAYER_BASE_HP: 8,
  PLAYER_RADIUS: 4,
  INVULNERABILITY_TIME: 60,
  
  // UI
  SLOT_KEYS: ['Q', 'W', 'E'],
  
  // Difficulty scaling
  ENEMY_COUNT_BASE: 3,  // Base enemies per room
  ENEMY_COUNT_SCALING: 1,  // Additional enemies per room
  
  // Room descriptions for UI
  ROOM_NAMES: {
    1: 'The Beginning',
    2: 'Shallow Depths',
    3: 'Growing Darkness',
    4: 'Warden\'s Domain',
    5: 'Beyond the Gate',
    6: 'Twisted Paths',
    7: 'Shadow Realm',
    8: 'Eclipse Chamber',
    9: 'Void Threshold',
    10: 'Nightmare Depths',
    11: 'Final Approach',
    12: 'Throne of the Void'
  },
  
  // Enemy wave configurations per room
  WAVE_CONFIGS: {
    1: { grunt: 70, archer: 20, bomber: 10 },
    2: { grunt: 60, archer: 25, bomber: 15 },
    3: { grunt: 40, archer: 20, bomber: 15, dasher: 15, orbitMage: 10 },
    4: { boss: 'Warden' },
    5: { grunt: 20, archer: 20, dasher: 20, orbitMage: 20, splitter: 15, tank: 5 },
    6: { grunt: 15, archer: 20, dasher: 20, orbitMage: 15, splitter: 20, tank: 10 },
    7: { dasher: 20, orbitMage: 20, splitter: 20, tank: 20, sniper: 20 },
    8: { boss: 'EclipseTwin' },
    9: { tank: 15, sniper: 15, phantom: 15, voidling: 15, trickster: 15, healer: 10, shielder: 15 },
    10: { sniper: 10, phantom: 20, voidling: 20, trickster: 15, healer: 15, shielder: 20 },
    11: { sniper: 10, phantom: 15, voidling: 15, trickster: 15, healer: 15, shielder: 15, tank: 15 },
    12: { boss: 'VoidMonarch' }
  },
  
  // New enemy special properties
  ENEMY_SPECIALS: {
    phantom: {
      fadeInterval: 60,
      invisibleDuration: 40,
      invisibleSpeedBoost: 1.5
    },
    healer: {
      healRadius: 50,
      healAmount: 1,
      healCooldown: 120,
      safeDistance: 60
    },
    shielder: {
      shieldRadius: 40,
      shieldDuration: 100,
      shieldCooldown: 150
    },
    trickster: {
      teleportCooldown: 80,
      teleportRange: 60,
      cloneCount: 2,
      cloneHp: 1
    },
    voidling: {
      pullRadius: 30,
      pullStrength: 0.3,
      voidBurstCooldown: 100
    }
  },
  
  // Boss phases
  BOSS_PHASES: {
    VoidMonarch: {
      phase1: { hpThreshold: 0.66, attackCooldown: 60 },
      phase2: { hpThreshold: 0.33, attackCooldown: 40 },
      phase3: { hpThreshold: 0, attackCooldown: 30 }
    }
  },
  
  // Debug mode
  DEBUG_ENABLED: false
};

// Room progression helper
const RoomProgression = {
  isEarlyGame(room) {
    return room <= 3;
  },
  
  isMidGame(room) {
    return room > 3 && room <= 7;
  },
  
  isLateGame(room) {
    return room > 7 && room <= 11;
  },
  
  isBossRoom(room) {
    return CONSTANTS.BOSS_ROOMS.includes(room);
  },
  
  getBossType(room) {
    switch(room) {
      case 4: return 'Warden';
      case 8: return 'EclipseTwin';
      case 12: return 'VoidMonarch';
      default: return null;
    }
  },
  
  getRoomName(room) {
    return CONSTANTS.ROOM_NAMES[room] || `Room ${room}`;
  },
  
  getEnemyCountForRoom(room) {
    if (this.isBossRoom(room)) return 1;
    return CONSTANTS.ENEMY_COUNT_BASE + (room * CONSTANTS.ENEMY_COUNT_SCALING);
  },
  
  getDifficultyMultiplier(room) {
    if (room <= 3) return 1.0;
    if (room <= 6) return 1.2;
    if (room <= 9) return 1.5;
    if (room <= 11) return 1.8;
    return 2.0;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONSTANTS, RoomProgression };
}