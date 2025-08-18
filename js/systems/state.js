// ========================================
// FILE: js/systems/state.js
// ========================================
const GameState = {
  room: 1,
  maxRooms: CONSTANTS.MAX_ROOMS,
  state: 'menu', // menu, play, paused, draft, relic, over
  
  player: {
    x: 160,
    y: 120,
    r: 4,
    hp: CONSTANTS.PLAYER_BASE_HP,
    hpMax: CONSTANTS.PLAYER_BASE_HP,
    spd: CONSTANTS.PLAYER_BASE_SPEED,
    iTimer: 0,
    eclipse: 0
  },
  
  enemies: [],
  bullets: [],
  ebullets: [],
  particles: [],
  keys: {},
  
  abilitySlots: [null, null, null],
  selectedSlot: 0,
  lastCast: { name: null, t: -999 },
  recentCasts: [],
  activeSynergies: [],
  
  time: 0,
  kills: 0,
  relics: [],
  roomsCleared: 0,
  
  reset() {
    this.room = 1;
    this.state = 'play';
    this.kills = 0;
    this.roomsCleared = 0;
    
    this.player = {
      x: 160,
      y: 120,
      r: 4,
      hp: CONSTANTS.PLAYER_BASE_HP,
      hpMax: CONSTANTS.PLAYER_BASE_HP,
      spd: CONSTANTS.PLAYER_BASE_SPEED,
      iTimer: 0,
      eclipse: 0
    };
    
    this.enemies = [];
    this.bullets = [];
    this.ebullets = [];
    this.particles = [];
    this.relics = [];
    this.recentCasts = [];
    this.activeSynergies = [];
    this.selectedSlot = 0;
  }
};