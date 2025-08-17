// =============== AUDIO =========
const AudioSys = (()=>{
  let ctx; function ensure(){ if(!ctx){ try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch{} } }
  function beep(freq=440, dur=0.07, type='square', vol=0.02){ ensure(); if(!ctx) return; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur); }
  return { 
    cast(){beep(520,0.05,'square');}, 
    hit(){beep(180,0.04,'square',0.03);}, 
    kill(){beep(140,0.07,'square',0.04);}, 
    hurt(){beep(120,0.08,'square',0.05);}, 
    relic(){beep(660,0.08,'square',0.03);},
    synergy(){beep(800,0.1,'square',0.03);}
  };
})();

// =============== UTIL & RNG ==================
const RNG = (()=>{ let s=Date.now()%2147483647; return { seed(v){ s=v||s; }, r(){ s=(s*48271)%2147483647; return s/2147483647; }, range(a,b){ return a+Math.floor(this.r()*(b-a+1)); } }; })();

// DOM references
const $ = (q)=>document.querySelector(q);
const c = $('#c');
const ctx = c.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Drawing helpers
function pRect(x,y,w,h,col){ ctx.fillStyle=col; ctx.fillRect(x|0,y|0,w|0,h|0); }
function pText(t,x,y){ ctx.fillStyle='#fff'; ctx.fillText(t,x|0,y|0); }

// Status message display
function showStatusMessage(msg) {
  const el = $('#statusMessage');
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => {
    el.style.opacity = '0';
  }, 2000);
}

// =============== CORE STATE ==================
const G = {
  room: 1, maxRooms: 8, state: 'play',
  player: { x:160, y:120, r:4, hp:8, hpMax:8, spd:1.2, iTimer:0, eclipse:0 },
  enemies: [], bullets: [], ebullets: [], particles: [], keys: {},
  abilitySlots: [null,null,null], selectedSlot:0, lastCast:{ name:null, t: -999 },
  recentCasts: [], activeSynergies: [],
  time:0, kills:0, relics: [], roomsCleared:0,
};

// =============== ABILITIES ===================
const Icons = {
  Firebolt: (g)=>{ g('#') }, IceShard: (g)=>{ g('*') }, Lightning: (g)=>{ g('~') },
  WindSlash: (g)=>{ g('/') }, Shield: (g)=>{ g('[]') }, Heal: (g)=>{ g('+') },
  VoidNova: (g)=>{ g('◼') }, RadiantArc: (g)=>{ g('∩') }, PoisonDart:(g)=>{ g('!') },
  Quake:(g)=>{ g('∎') }, Blink:(g)=>{ g('⇢') }
};

const ABILITIES = [
  { name:'Firebolt', icon:'Firebolt', cd:2.0, tags:['Elemental','Fire'], cast() { autoShoot({spd:2.2,dmg:baseDmg(),pierce:0,kind:'fire'}); } },
  { name:'IceShard', icon:'IceShard', cd:2.5, tags:['Elemental','Ice'], cast(){ autoShoot({spd:1.8,dmg:baseDmg(),pierce:0,slow:0.6, slowT:80, kind:'ice'}); } },
  { name:'Lightning', icon:'Lightning', cd:3.0, tags:['Elemental','Shock'], cast(){ chainLightning(G.player, 3, baseDmg()+1); } },
  { name:'WindSlash', icon:'WindSlash', cd:1.2, tags:['Elemental','Wind'], cast(){ autoShoot({spd:2.8,dmg:baseDmg(),pierce:2,kind:'wind'}); } },
  { name:'Shield', icon:'Shield', cd:6.0, tags:['Defense'], cast(){ G.player.iTimer = Math.max(G.player.iTimer, relicVal('PhaseGuard')?140:90); } },
  { name:'Heal', icon:'Heal', cd:6.0, tags:['Support'], cast(){ heal(2); } },
  { name:'VoidNova', icon:'VoidNova', cd:5.0, tags:['Void'], cast(){ for(let a=0;a<16;a++) emitBullet(G.player.x,G.player.y,(a/16)*Math.PI*2,{spd:1.5,dmg:baseDmg(),pierce:0,kind:'void'}); } },
  { name:'RadiantArc', icon:'RadiantArc', cd:4.0, tags:['Radiant'], cast(){ const dir=aimDir(); emitBullet(G.player.x,G.player.y,dir,{spd:2.3,dmg:baseDmg(),pierce:1,kind:'radiant', boomerang:true, life:90}); } },
  { name:'PoisonDart', icon:'PoisonDart', cd:1.6, tags:['Toxic'], cast(){ autoShoot({spd:2.0,dmg:baseDmg(),pierce:0,kind:'poison', poison:1, poisonT:160}); } },
  { name:'Quake', icon:'Quake', cd:4.5, tags:['Earth','Control'], cast(){ radialExplosion(G.player.x,G.player.y,28, baseDmg()); for(let k=0;k<10;k++) particles(G.player.x,G.player.y,1.4,16); if(relicVal('Grounded')) stunInRadius(G.player.x,G.player.y,24,50); } },
  { name:'Blink', icon:'Blink', cd:3.5, tags:['Mobility'], cast(){ blink(); } },
];

function baseDmg(){ return 1 + (G.player.eclipse?1:0) + (relicVal('Sharper')?1:0); }

// Synergy definitions
const SYNERGIES = {
  'Firebolt+WindSlash': {name:'Firestorm', desc:'Fire spells create burning winds'},
  'IceShard+Lightning': {name:'ShatterShock', desc:'Lightning shatters frozen enemies'},
  'Shield+Heal': {name:'Aegis', desc:'Perfect defense regeneration'},
  'VoidNova+RadiantArc': {name:'Eclipse', desc:'Shadow and light become one'},
  'PoisonDart+WindSlash': {name:'VenomRend', desc:'Poison spreads through air'},
  'Quake+Lightning': {name:'Thunderquake', desc:'Earth splits with electric fury'},
  'IceShard+Quake': {name:'Frostquake', desc:'Frozen ground shatters'},
  'Blink+Shield': {name:'PhaseGuard', desc:'Untouchable movement'},
  'Blink+Lightning': {name:'StormWalk', desc:'Lightning trail follows blinks'},
  'Lightning+VoidNova': {name:'VoidStorm', desc:'Chaotic energy chains'},
  'Firebolt+PoisonDart': {name:'Hellfire', desc:'Toxic flames burn longer'},
  'WindSlash+VoidNova': {name:'VoidTornado', desc:'Reality tears in spirals'},
  'Heal+Lightning': {name:'LifeSpark', desc:'Healing energy electrifies'},
  'RadiantArc+IceShard': {name:'PrismIce', desc:'Light refracts through ice'},
  'Shield+Quake': {name:'Fortress', desc:'Immovable defender'},
};

function hasSynergy(a,b){ 
  const key1 = `${a}+${b}`;
  const key2 = `${b}+${a}`;
  return SYNERGIES[key1] || SYNERGIES[key2]; 
}

// =============== RELICS =====================
const RELICS = [
  { name:'Focusing Core', icon:'◎', desc:'-15% ability cooldowns', apply(){ G.relics.push(this); } },
  { name:'Fleet Boots', icon:'≡', desc:'+15% move speed', apply(){ G.relics.push(this); } },
  { name:'Heart Sigil', icon:'♥', desc:'+2 max HP & heal 2', apply(){ G.player.hpMax+=2; heal(2); G.relics.push(this);} },
  { name:'Sharper', icon:'†', desc:'+1 ability damage', apply(){ G.relics.push(this);} },
  { name:'Grounded', icon:'∎', desc:'Quake also stuns briefly', apply(){ G.relics.push(this);} },
  { name:'Cinder Bloom', icon:'¤', desc:'Fire explosions +25% radius', apply(){ G.relics.push(this);} },
  { name:'PhaseGuard', icon:'↺', desc:'Shield grants longer i-frames', apply(){ G.relics.push(this);} },
  { name:'Synergy Master', icon:'⚡', desc:'Synergies last longer', apply(){ G.relics.push(this);} },
];
function relicVal(name){ return G.relics.some(r=>r.name===name); }

// =============== ENEMY SPAWNING =============
function spawnGrunt(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 2 + Math.floor(G.room/2);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'grunt', spd: 0.55 + G.room*0.05 });
}
function spawnArcher(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 2 + Math.floor(G.room/3);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'archer', spd: 0.45, shootT: RNG.range(30,60) });
}
function spawnBomber(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 3 + Math.floor(G.room/2);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'bomber', spd: 0.5 });
}
function spawnDasher(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 3 + Math.floor(G.room/3);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'dasher', spd: 0.3, dashT: 60, dashing:false });
}
function spawnOrbitMage(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 4 + Math.floor(G.room/3);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'orbitMage', spd: 0.4, angle:RNG.r()*6.28, shootT:80 });
}
function spawnSplitter(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 5 + Math.floor(G.room/2);
  G.enemies.push({ x,y, r:5, hp, slowT:0, slowMul:1, kind:'splitter', spd: 0.45 });
}
function spawnTank(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 8 + G.room;
  G.enemies.push({ x,y, r:6, hp, slowT:0, slowMul:1, kind:'tank', spd: 0.25 });
}
function spawnSniper(){
  const x = RNG.range(16, c.width-16); const y = RNG.range(16, c.height-16);
  const hp = 3 + Math.floor(G.room/2);
  G.enemies.push({ x,y, r:4, hp, slowT:0, slowMul:1, kind:'sniper', spd: 0.35, chargeT:0, charging:false });
}
function spawnMinion(x,y){
  const hp = 1;
  G.enemies.push({ x,y, r:3, hp, slowT:0, slowMul:1, kind:'minion', spd: 0.7 });
}
function spawnBoss(){
  const x=160, y=120; const hp= 30 + G.room*4; const kind = (G.room===4?'Warden':'EclipseTwin');
  G.enemies.push({ x,y, r:7, hp, slowT:0, slowMul:1, kind, spd:0.6, phase:0, atkT:90 });
  $('#bossBar').style.display = 'block';
  $('#bossName').textContent = kind === 'Warden' ? 'The Warden' : 'Eclipse Twin';
}

function spawnWave(){
  const isBoss = (G.room===4 || G.room===8);
  if(isBoss){ spawnBoss(); return; }
  
  const n = 3 + G.room;
  for(let i=0;i<n;i++){
    const t = RNG.range(0,100);
    
    if(G.room <= 2) {
      if(t<70) spawnGrunt(); 
      else if(t<90) spawnArcher(); 
      else spawnBomber();
    }
    else if(G.room === 3) {
      if(t<40) spawnGrunt();
      else if(t<60) spawnArcher();
      else if(t<75) spawnBomber();
      else if(t<90) spawnDasher();
      else spawnOrbitMage();
    }
    else if(G.room <= 6) {
      if(t<25) spawnGrunt();
      else if(t<45) spawnArcher();
      else if(t<60) spawnDasher();
      else if(t<75) spawnOrbitMage();
      else if(t<90) spawnSplitter();
      else spawnTank();
    }
    else {
      if(t<20) spawnDasher();
      else if(t<40) spawnOrbitMage();
      else if(t<60) spawnSplitter();
      else if(t<80) spawnTank();
      else spawnSniper();
    }
  }
}

// =============== GAME FUNCTIONS =============
function emitBullet(x,y,dir,props){ const b={ x,y, dir, vx:Math.cos(dir)*(props.spd||2), vy:Math.sin(dir)*(props.spd||2), life:props.life||120, owner:'player', ...props }; G.bullets.push(b); }
function autoShoot(props){ const e=nearestEnemy(G.player.x,G.player.y); const dir = e? angleTo(G.player.x,G.player.y,e.x,e.y) : 0; emitBullet(G.player.x,G.player.y,dir,props); }
function chainLightning(origin, bounces, dmg){
  let src = origin; let remaining=bounces; let last = null;
  while(remaining>0){ const target = nearestEnemy(src.x, src.y, last); if(!target) break; hitEnemy(target, dmg, 'shock'); G.particles.push({x:src.x,y:src.y,vx:0,vy:0,life:10,kind:'zap',tx:target.x,ty:target.y}); src = target; last = target; remaining--; }
}
function aimDir(){ const e=nearestEnemy(G.player.x,G.player.y); return e? angleTo(G.player.x,G.player.y,e.x,e.y) : 0; }
function nearestEnemy(x,y,notThis){ let best=null, bd=1e9; for(const e of G.enemies){ if(e===notThis) continue; const d=dist(x,y,e.x,e.y); if(d<bd){ bd=d; best=e; } } return best; }
function dist(a,b,c,d){ const dx=a-c, dy=b-d; return Math.hypot(dx,dy); }
function angleTo(ax,ay,bx,by){ return Math.atan2(by-ay, bx-ax); }

// =============== INPUT HANDLING =============
window.addEventListener('keydown',e=>{ 
  const key = e.key.toLowerCase();
  G.keys[e.key]=true; 
  if(key==='q') { selectSlot(0); useSelected(); }
  else if(key==='w') { selectSlot(1); useSelected(); }
  else if(key==='e') { selectSlot(2); useSelected(); }
  else if(key==='p') togglePause(); 
});
window.addEventListener('keyup',e=>{ G.keys[e.key]=false; });

c.addEventListener('mousedown',(e)=>{ 
  const rect = c.getBoundingClientRect();
  const barEl = $('#bar');
  const barRect = barEl.getBoundingClientRect();
  
  if(e.clientY >= barRect.top && e.clientY <= barRect.bottom &&
     e.clientX >= barRect.left && e.clientX <= barRect.right) {
    return;
  }
  useSelected(); 
});

function togglePause(){ G.state = G.state==='play'?'paused':'play'; }

// =============== UI MANAGEMENT ==============
const bar = $('#bar');
const slotKeys = ['Q', 'W', 'E'];
function renderBar(){
  bar.innerHTML='';
  G.abilitySlots.forEach((ab,i)=>{
    const d=document.createElement('div'); 
    let className = 'slot'+(i===G.selectedSlot?' selected':'');
    
    const hasSynergyEffect = ab && G.activeSynergies.some(s => s.abilities.includes(ab.name));
    if(hasSynergyEffect) className += ' synergy';
    
    d.className = className;
    const t=document.createElement('div'); t.style.fontSize='14px'; const glyph = (txt)=>{ t.textContent = txt; };
    if(ab){ (Icons[ab.icon]||(()=>{}))(glyph); }
    d.appendChild(t);
    
    const keyHint = document.createElement('div');
    keyHint.className = 'keyhint';
    keyHint.textContent = slotKeys[i];
    d.appendChild(keyHint);
    
    if(ab && ab.cdLeft>0){ const cd=document.createElement('div'); cd.className='cd'; cd.textContent = ab.cdLeft.toFixed(1); d.appendChild(cd); }
    d.onclick=()=>{ selectSlot(i); };
    bar.appendChild(d);
  });
  
  const synergyText = G.activeSynergies.length > 0 ? 
    G.activeSynergies.map(s => s.name).join(' · ') : 'None';
  $('#activeSynergies').textContent = synergyText;
}
function selectSlot(i){ G.selectedSlot=i; renderBar(); }

// =============== SYNERGY SYSTEM =============
function addRecentCast(abilityName){
  const duration = relicVal('Synergy Master') ? 5000 : 3000;
  G.recentCasts.push({ name: abilityName, time: G.time });
  G.recentCasts = G.recentCasts.filter(cast => G.time - cast.time < duration);
}

function checkForSynergies(newCast){
  const synergyDuration = relicVal('Synergy Master') ? 8000 : 5000;
  
  for(const recent of G.recentCasts){
    if(recent.name === newCast) continue;
    
    const synergy = hasSynergy(recent.name, newCast);
    if(synergy){
      G.activeSynergies = G.activeSynergies.filter(s => s.name !== synergy.name);
      
      G.activeSynergies.push({
        name: synergy.name,
        abilities: [recent.name, newCast],
        timeLeft: synergyDuration,
        justActivated: true
      });
      
      AudioSys.synergy();
      showStatusMessage(`${synergy.name} activated!`);
    }
  }
}

function updateSynergies(dt){
  G.activeSynergies = G.activeSynergies.filter(synergy => {
    synergy.timeLeft -= dt;
    if(synergy.timeLeft <= 0){
      showStatusMessage(`${synergy.name} faded...`);
      return false;
    }
    synergy.justActivated = false;
    return true;
  });
}

function hasSynergyActive(name){
  return G.activeSynergies.some(s => s.name === name);
}

// =============== DRAFT SYSTEMS ==============
// Modify the showDraft function to use the new compact layout
function showDraft(){
  G.state='draft'; 
  $('#draft').classList.remove('hidden'); 
  $('#relicDraft').classList.add('hidden'); 
  $('#gameOver').classList.add('hidden');
  
  const pool = ABILITIES.slice();
  const current = new Set(G.abilitySlots.filter(Boolean).map(a=>a.name));
  const opts=[]; 
  while(opts.length<3 && pool.length){ 
    const k=pool.splice(RNG.range(0,pool.length-1),1)[0]; 
    if(!current.has(k.name)) opts.push(k); 
  }
  
  const box=$('#draftChoices'); 
  box.innerHTML='';
  
  opts.forEach(opt=>{ 
    const b=document.createElement('div'); 
    b.className='slot'; 
    const t=document.createElement('div'); 
    t.style.fontSize='12px'; // Smaller font
    (Icons[opt.icon]||(()=>{}))((txt)=>{ t.textContent=txt; }); 
    b.appendChild(t); 
    b.title=`${opt.name} (${opt.cd}s CD) | Tags: ${opt.tags.join(', ')}`; 
    b.onclick=()=>{ 
      G.abilitySlots[G.selectedSlot] = newAbility(opt); 
      $('#draft').classList.add('hidden'); 
      maybeRelic(); 
    }; 
    box.appendChild(b); 
  });
  
  // Setup skip button
  $('#skipBtn').onclick = () => {
    $('#draft').classList.add('hidden');
    maybeRelic();
  };
  
  // Update synergy text
  const names = G.abilitySlots.filter(Boolean).map(a=>a.name);
  const syn = [];
  for(let i=0;i<names.length;i++){
    for(let j=i+1;j<names.length;j++){ 
      const s=hasSynergy(names[i],names[j]); 
      if(s) syn.push(`${s.name}`); 
    }
  }
  $('#synergiesText').textContent = syn.length ? syn.join(', ') : 'None';
}

function showRelicDraft(){
  G.state='relic'; 
  $('#relicDraft').classList.remove('hidden'); 
  $('#draft').classList.add('hidden');
  
  const pool = RELICS.filter(r=>!relicVal(r.name));
  const picks=[]; 
  while(picks.length<3 && pool.length){ 
    picks.push(pool.splice(RNG.range(0,pool.length-1),1)[0]); 
  }
  
  const box=$('#relicChoices'); 
  box.innerHTML='';
  
  picks.forEach(opt=>{ 
    const b=document.createElement('div'); 
    b.className='slot'; 
    const t=document.createElement('div'); 
    t.style.fontSize='14px'; 
    t.textContent=opt.icon; 
    b.appendChild(t); 
    b.title=`${opt.name} — ${opt.desc}`; 
    b.onclick=()=>{ 
      opt.apply(); 
      AudioSys.relic(); 
      $('#relicDraft').classList.add('hidden'); 
      startRoom(); 
    }; 
    box.appendChild(b); 
  });
}

function maybeRelic(){
  if((G.room)%2===0) showRelicDraft(); 
  else startRoom();
}

function newAbility(proto){ return { ...proto, cdLeft: 0 }; }

// =============== GAME FLOW ==================
function startRun(){
  G.room=1; G.kills=0; G.roomsCleared=0; 
  G.player.x=160; G.player.y=120; G.player.hp=8; 
  G.player.hpMax=8; G.player.iTimer=0; G.player.eclipse=0; 
  G.enemies.length=0; G.bullets.length=0; 
  G.ebullets.length=0; G.particles.length=0; 
  G.state='play'; G.relics=[]; 
  G.recentCasts=[]; G.activeSynergies=[];
  
  const starters = ['Firebolt','IceShard','Shield'];
  G.abilitySlots = starters.map(n=> newAbility(ABILITIES.find(a=>a.name===n)));
  G.selectedSlot=0; 
  renderBar(); 
  
  $('#bossBar').style.display = 'none';
  startRoom();
}

function startRoom(){
  G.enemies.length=0; 
  G.bullets.length=0; 
  G.ebullets.length=0; 
  G.particles.length=0; 
  G.player.x=160; 
  G.player.y=120; 
  G.player.iTimer=0; 
  G.state='play';
  spawnWave();
}

function endRoom(){
  G.roomsCleared++; 
  if(G.room>=G.maxRooms){ gameOver(true); return; }
  G.room++; 
  $('#bossBar').style.display = 'none';
  showDraft();
}

function gameOver(victory){
  G.state='over'; 
  $('#gameOver').classList.remove('hidden'); 
  $('#draft').classList.add('hidden'); 
  $('#relicDraft').classList.add('hidden');
  $('#finalStats').textContent = (victory?'Victory! ':'Defeat. ') + `Rooms cleared: ${G.room-1}/${G.maxRooms} · Kills: ${G.kills} · Relics: ${G.relics.length}`;
  $('#bossBar').style.display = 'none';
}

$('#restartBtn').onclick=()=>{ 
  $('#gameOver').classList.add('hidden');
  startRun(); 
};

// =============== GAME MECHANICS =============
function particles(x,y,speed,count){ 
  for(let a=0;a<count;a++){ 
    const ang= a/count*6.283; 
    G.particles.push({x,y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,life:18,kind:'p'}); 
  } 
}

function hitEnemy(e, dmg, kind){ 
  e.hp-=dmg; AudioSys.hit(); 
  if(e.hp<=0){ 
    G.kills++; AudioSys.kill(); particles(e.x,e.y,1.2,8); 
    
    if(e.kind==='splitter'){
      for(let i=0; i<3; i++){
        const angle = (i/3) * Math.PI * 2;
        const mx = e.x + Math.cos(angle)*10;
        const my = e.y + Math.sin(angle)*10;
        spawnMinion(mx, my);
      }
    }
    
    const idx=G.enemies.indexOf(e); 
    if(idx>=0) G.enemies.splice(idx,1); 
    
    if(e.kind === 'Warden' || e.kind === 'EclipseTwin') {
      $('#bossBar').style.display = 'none';
    }
  }
  
  if(kind==='shock' && hasSynergyActive('ShatterShock') && e.slowT > 0){ 
    hitEnemy(e,2,'shatter'); 
    G.particles.push({x: e.x, y: e.y, vx: 0, vy: 0, life: 15, kind: 'shatter'});
  }
}

function radialExplosion(x,y,r,dmg){ 
  for(let a=0;a<12;a++) {
    G.particles.push({
      x,y,
      vx:Math.cos(a/12*6.283)*1.2,
      vy:Math.sin(a/12*6.283)*1.2,
      life:18,
      kind:'explosion'
    });
  }
  
  for(const e of G.enemies){ 
    if(dist(x,y,e.x,e.y)<=r){ 
      hitEnemy(e,dmg,'explosion'); 
      if(relicVal('Grounded')) e.stun=30; 
    } 
  } 
}

function stunInRadius(x,y,r,t){ 
  for(const e of G.enemies){ 
    if(dist(x,y,e.x,e.y)<=r){ 
      e.slowT=t; e.slowMul=0.1; 
    } 
  } 
}

function heal(v){ 
  G.player.hp=Math.min(G.player.hpMax,G.player.hp+v); 
  
  if(hasSynergyActive('LifeSpark')){
    for(let i=0; i<3; i++){
      const angle = (i/3) * Math.PI * 2 + Math.random() * 0.5;
      G.particles.push({
        x: G.player.x, y: G.player.y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 30, kind: 'lifespark'
      });
    }
  }
}

function blink(){ 
  const mvx = (G.keys['d']||G.keys['ArrowRight']?1:0) - (G.keys['a']||G.keys['ArrowLeft']?1:0);
  const mvy = (G.keys['s']||G.keys['ArrowDown']?1:0) - (G.keys['w']||G.keys['ArrowUp']?1:0);
  const len = Math.hypot(mvx,mvy)||1; 
  const dx = (mvx/len)*24; 
  const dy=(mvy/len)*24; 
  
  const oldX = G.player.x, oldY = G.player.y;
  G.player.x = Math.max(8,Math.min(c.width-8,G.player.x+dx)); 
  G.player.y = Math.max(8,Math.min(c.height-8,G.player.y+dy)); 
  G.player.iTimer=Math.max(G.player.iTimer, 50);
  
  if(hasSynergyActive('StormWalk')){
    const steps = 5;
    for(let i=0; i<=steps; i++){
      const t = i / steps;
      const x = oldX + (G.player.x - oldX) * t;
      const y = oldY + (G.player.y - oldY) * t;
      G.particles.push({
        x, y, vx: 0, vy: 0, life: 30, kind: 'lightning'
      });
      
      for(const e of G.enemies){
        if(dist(x, y, e.x, e.y) < 12){
          hitEnemy(e, 1, 'shock');
        }
      }
    }
  }
  
  for(let i=0; i<8; i++){
    const angle = (i/8) * Math.PI * 2;
    G.particles.push({
      x: oldX, y: oldY,
      vx: Math.cos(angle) * 1.5,
      vy: Math.sin(angle) * 1.5,
      life: 20, kind: 'blink'
    });
  }
}

function useSelected(){ 
  if(G.state!=='play') return; 
  const ab=G.abilitySlots[G.selectedSlot]; 
  if(!ab||ab.cdLeft>0) return; 
  
  addRecentCast(ab.name);
  checkForSynergies(ab.name);
  
  ab.cast(); 
  AudioSys.cast();
  
  if(ab.name === 'Shield' && hasSynergyActive('Aegis')){
    G.player.iTimer = Math.max(G.player.iTimer, 180);
    heal(1);
  }
  
  if(ab.name === 'VoidNova' && hasSynergyActive('Eclipse')){
    G.player.eclipse = 200;
    for(let i=0; i<20; i++){
      const angle = (i/20) * Math.PI * 2;
      G.particles.push({
        x: G.player.x, y: G.player.y,
        vx: Math.cos(angle) * 2.5,
        vy: Math.sin(angle) * 2.5,
        life: 60, kind: 'eclipse'
      });
    }
  }
  
  if(ab.name === 'Quake' && hasSynergyActive('Thunderquake')){
    stunInRadius(G.player.x,G.player.y,35,60);
    chainLightning(G.player, 5, baseDmg());
  }
  
  if(ab.name === 'Quake' && hasSynergyActive('Frostquake')){
    radialExplosion(G.player.x,G.player.y,30,baseDmg());
    stunInRadius(G.player.x,G.player.y,30,40);
    for(const e of G.enemies){
      if(dist(G.player.x, G.player.y, e.x, e.y) < 30){
        e.slowT = 120;
        e.slowMul = 0.2;
      }
    }
  }
  
  if(ab.name === 'Shield' && hasSynergyActive('Fortress')){
    G.player.iTimer = Math.max(G.player.iTimer, 200);
    radialExplosion(G.player.x, G.player.y, 20, baseDmg());
  }
  
  ab.cdLeft = ab.cd; 
  if(relicVal('Focusing Core')) ab.cdLeft *= 0.85;
  
  G.lastCast = { name: ab.name, t: G.time };
  renderBar();
}

function bossAI(e){
  e.atkT--; 
  if(e.kind==='Warden'){
    if(e.atkT<=0){ 
      e.atkT=90; 
      for(let a=0;a<8;a++){ 
        const ang=a/8*6.283; 
        G.ebullets.push({x:e.x,y:e.y,vx:Math.cos(ang)*1.2,vy:Math.sin(ang)*1.2,life:120}); 
      }
    }
    const a = angleTo(e.x,e.y,G.player.x,G.player.y); 
    e.x += Math.cos(a)*e.spd*0.7; e.y += Math.sin(a)*e.spd*0.7;
  } else { 
    if(e.atkT<=0){ 
      e.atkT=70;
      const a = angleTo(e.x,e.y,G.player.x,G.player.y); 
      for(let k=-2;k<=2;k++){ 
        const ang=a+k*0.1; 
        G.ebullets.push({x:e.x,y:e.y,vx:Math.cos(ang)*1.5,vy:Math.sin(ang)*1.5,life:130}); 
      }
    }
    const ang = (G.time/600) + (e.phase*2.1); 
    e.x = 160 + Math.cos(ang)*40; 
    e.y = 120 + Math.sin(ang)*30;
  }
}

// =============== UPDATE LOOP ================
function update(dt){
  G.time += dt; 
  const p=G.player; const k=G.keys; 
  let vx=0,vy=0; 
  const sp=p.spd*(relicVal('Fleet Boots')?1.15:1);
  
  if(k['a']||k['ArrowLeft']) vx-=sp; 
  if(k['d']||k['ArrowRight']) vx+=sp; 
  if(k['w']||k['ArrowUp']) vy-=sp; 
  if(k['s']||k['ArrowDown']) vy+=sp;
  
  const oldX = p.x, oldY = p.y;
  p.x = Math.max(8, Math.min(c.width-8, p.x+vx)); 
  p.y = Math.max(8, Math.min(c.height-8, p.y+vy));
  
  if(hasSynergyActive('StormWalk') && (Math.abs(p.x-oldX) > 0.5 || Math.abs(p.y-oldY) > 0.5)){
    if(Math.random() < 0.3){
      G.particles.push({x:oldX, y:oldY, vx:0, vy:0, life:20, kind:'lightning'});
      for(const e of G.enemies){
        if(dist(oldX, oldY, e.x, e.y) < 16){
          hitEnemy(e, 1, 'shock');
        }
      }
    }
  }
  
  if(p.iTimer>0) p.iTimer-=1; 
  if(p.eclipse>0) p.eclipse--;
  
  updateSynergies(dt);

  for(const ab of G.abilitySlots){ 
    if(!ab) continue; 
    if(ab.cdLeft>0){ 
      const rate = (relicVal('Focusing Core')?0.85:1); 
      ab.cdLeft = Math.max(0, ab.cdLeft - dt/1000 * (1/rate)); 
    } 
  }

  for(let ei=G.enemies.length-1; ei>=0; ei--){ 
    const e=G.enemies[ei];
    
    if(e.kind==='archer'){
      const d = dist(e.x,e.y,p.x,p.y); 
      if(d>46){ const a = Math.atan2(p.y-e.y, p.x-e.x); e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd; }
      if(--e.shootT<=0){ 
        const a = angleTo(e.x,e.y,p.x,p.y); 
        G.ebullets.push({x:e.x,y:e.y,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3,life:160}); 
        e.shootT = RNG.range(45,80); 
      }
    } else if(e.kind==='bomber'){
      const a = Math.atan2(p.y-e.y, p.x-e.x); 
      e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd; 
      if(dist(e.x,e.y,p.x,p.y)<10){ 
        radialExplosion(e.x,e.y,20,2); 
        G.enemies.splice(ei,1); 
        continue; 
      }
    } else if(e.kind==='dasher'){
      if(--e.dashT<=0 && !e.dashing){ e.dashing=true; e.dashDir=angleTo(e.x,e.y,p.x,p.y); e.dashT=20; }
      if(e.dashing){ 
        e.x+=Math.cos(e.dashDir)*2.5; e.y+=Math.sin(e.dashDir)*2.5; 
        if(--e.dashT<=0){ e.dashing=false; e.dashT=80; } 
      } else { 
        const a = Math.atan2(p.y-e.y, p.x-e.x); 
        e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd; 
      }
    } else if(e.kind==='orbitMage'){
      e.angle += 0.02; 
      const orbitDist = 60; 
      const tx = p.x + Math.cos(e.angle)*orbitDist; 
      const ty = p.y + Math.sin(e.angle)*orbitDist;
      const a = angleTo(e.x,e.y,tx,ty); 
      e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd;
      if(--e.shootT<=0){ 
        const sa = angleTo(e.x,e.y,p.x,p.y); 
        G.ebullets.push({x:e.x,y:e.y,vx:Math.cos(sa)*1.1,vy:Math.sin(sa)*1.1,life:120}); 
        e.shootT=60; 
      }
    } else if(e.kind==='splitter'){
      const a = Math.atan2(p.y-e.y, p.x-e.x); 
      const mul = (e.slowT>0? e.slowMul : 1); 
      e.x += Math.cos(a)*e.spd*mul; e.y += Math.sin(a)*e.spd*mul; 
      if(e.slowT>0) e.slowT--;
    } else if(e.kind==='tank'){
      const a = Math.atan2(p.y-e.y, p.x-e.x); 
      e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd;
    } else if(e.kind==='sniper'){
      const d = dist(e.x,e.y,p.x,p.y);
      if(d>80 && !e.charging){ 
        const a = Math.atan2(p.y-e.y, p.x-e.x); 
        e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd; 
      } else if(!e.charging){ 
        e.charging=true; e.chargeT=40; 
      }
      if(e.charging){ 
        if(--e.chargeT<=0){ 
          const a = angleTo(e.x,e.y,p.x,p.y); 
          G.ebullets.push({x:e.x,y:e.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:100}); 
          e.charging=false; 
        } 
      }
    } else if(e.kind==='minion'){
      const a = Math.atan2(p.y-e.y, p.x-e.x); 
      e.x += Math.cos(a)*e.spd; e.y += Math.sin(a)*e.spd;
    } else if(e.kind==='Warden' || e.kind==='EclipseTwin'){
      bossAI(e);
    } else { 
      const a = Math.atan2(p.y-e.y, p.x-e.x); 
      const mul = (e.slowT>0? e.slowMul : 1); 
      e.x += Math.cos(a)*e.spd*mul; e.y += Math.sin(a)*e.spd*mul; 
      if(e.slowT>0) e.slowT--; 
    }

    if(dist(e.x,e.y,p.x,p.y) < e.r+p.r){ 
      if(p.iTimer<=0){ 
        p.hp--; p.iTimer=60; AudioSys.hurt(); 
        if(p.hp<=0){ gameOver(false); return; } 
      } 
    }
  }

  for(let i=G.ebullets.length-1;i>=0;i--){ 
    const b=G.ebullets[i]; 
    b.x+=b.vx; b.y+=b.vy; 
    if(--b.life<=0 || b.x<0||b.y<0||b.x>c.width||b.y>c.height){ 
      G.ebullets.splice(i,1); 
      continue; 
    } 
    if(dist(b.x,b.y,p.x,p.y)<p.r+2 && p.iTimer<=0){ 
      p.hp--; p.iTimer=60; AudioSys.hurt(); 
      G.ebullets.splice(i,1); 
      if(p.hp<=0){ gameOver(false); return; } 
    } 
  }

  for(let i=G.bullets.length-1;i>=0;i--){ 
    const b=G.bullets[i]; 
    b.x+=b.vx; b.y+=b.vy; 
    b.life--; 
    
    if(b.boomerang){ 
      if(b.life===45){ 
        const a=angleTo(b.x,b.y,G.player.x,G.player.y); 
        b.vx=Math.cos(a)*b.spd; b.vy=Math.sin(a)*b.spd; 
      } 
    }
    
    if(b.x<0||b.x>c.width||b.y<0||b.y>c.height||b.life<=0){ 
      G.bullets.splice(i,1); 
      continue; 
    }
    
    for(let j=G.enemies.length-1;j>=0;j--){ 
      const e=G.enemies[j]; 
      if(dist(b.x,b.y,e.x,e.y) < 4+e.r){
        let dmg=b.dmg||1; 
        
        if(b.kind==='ice'){ 
          e.slowT=b.slowT||60; 
          e.slowMul=b.slow||0.5; 
        }
        
        if(b.kind==='poison'){ 
          e.poisonT = (e.poisonT||0) + (b.poisonT||100); 
          e.poison = Math.max(e.poison||0, b.poison||1); 
        }
        
        if(b.kind==='fire' && hasSynergyActive('Firestorm')){ 
          const rad = relicVal('Cinder Bloom')?30:24; 
          radialExplosion(e.x,e.y,rad,1);
          for(let k=0;k<8;k++){
            const angle = k/8 * Math.PI * 2;
            G.particles.push({
              x: e.x, y: e.y,
              vx: Math.cos(angle) * 2,
              vy: Math.sin(angle) * 2,
              life: 30, kind: 'fire'
            });
          }
        }
        
        if(b.kind==='poison' && hasSynergyActive('VenomRend')){
          for(const ne of G.enemies){
            if(ne !== e && dist(e.x, e.y, ne.x, ne.y) < 20){
              ne.poisonT = (ne.poisonT||0) + 60;
              ne.poison = Math.max(ne.poison||0, 1);
            }
          }
        }
        
        if(b.kind==='poison' && hasSynergyActive('Hellfire')){
          dmg += 1;
          G.particles.push({x: e.x, y: e.y, vx: 0, vy: -1, life: 40, kind: 'hellfire'});
        }
        
        if(b.kind==='void' && hasSynergyActive('VoidStorm')){
          chainLightning(e, 2, 1);
        }
        
        if(b.kind==='void' && hasSynergyActive('VoidTornado')){
          for(let k=0;k<12;k++){
            const angle = k/12 * Math.PI * 2;
            G.particles.push({
              x: e.x, y: e.y,
              vx: Math.cos(angle) * 1.5,
              vy: Math.sin(angle) * 1.5,
              life: 25, kind: 'void'
            });
          }
        }
        
        if(b.kind==='radiant' && hasSynergyActive('PrismIce')){
          for(let k=0;k<6;k++){
            const angle = k/6 * Math.PI * 2;
            emitBullet(e.x, e.y, angle, {spd:1.5, dmg:1, pierce:1, kind:'radiant', life:60});
          }
        }
        
        hitEnemy(e, dmg, b.kind);
        if(b.pierce>0){ b.pierce--; } else { G.bullets.splice(i,1); break; }
      } 
    }
  }

  for(const e of G.enemies){ 
    if(e.poisonT>0){ 
      if((e.poisonTick||0)<=0){ 
        let poisonDmg = e.poison||1;
        if(hasSynergyActive('Hellfire')){
          poisonDmg += 1;
          G.particles.push({x: e.x, y: e.y, vx: 0, vy: -0.5, life: 20, kind: 'hellfire'});
        }
        hitEnemy(e, poisonDmg, 'poison'); 
        e.poisonTick=30; 
      } else e.poisonTick--; 
      e.poisonT--; 
    } 
  }

  for(let i=G.particles.length-1;i>=0;i--){ 
    const pz=G.particles[i]; 
    pz.x+=pz.vx; pz.y+=pz.vy; 
    pz.life--; 
    if(pz.life<=0) G.particles.splice(i,1); 
  }

  if(G.enemies.length===0 && G.state==='play'){ endRoom(); }
}

// =============== RENDERING ==================
function draw(){
  pRect(0,0,c.width,c.height,'#000'); 
  
  ctx.globalAlpha=.08; 
  for(let x=0;x<c.width;x+=8) pRect(x,0,1,c.height,'#fff'); 
  for(let y=0;y<c.height;y+=8) pRect(0,y,c.width,1,'#fff'); 
  ctx.globalAlpha=1;

  const p=G.player; 
  
  if(p.eclipse > 0){
    ctx.globalAlpha = 0.8;
    pRect(p.x-4,p.y-4,8,8,'#fff');
    ctx.globalAlpha = 1;
  }
  pRect(p.x-2,p.y-2,4,4,'#fff'); 
  
  if(p.iTimer>0){ 
    ctx.globalAlpha=.4; 
    pRect(p.x-3,p.y-3,6,6,'#fff'); 
    ctx.globalAlpha=1; 
  }

  for(const e of G.enemies){ 
    if(e.kind === 'Warden' || e.kind === 'EclipseTwin') {
      if(e.kind === 'Warden') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(e.x, e.y - 6);
        ctx.lineTo(e.x + 6, e.y);
        ctx.lineTo(e.x, e.y + 6);
        ctx.lineTo(e.x - 6, e.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for(let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? 7 : 4;
          const px = e.x + Math.cos(angle) * r;
          const py = e.y + Math.sin(angle) * r;
          if(i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      pRect(e.x-8,e.y-10,16,2,'#555'); 
      const baseHP = e.hp / (30 + G.room*4); 
      pRect(e.x-8,e.y-10,Math.max(0, 16*baseHP),2,'#fff');
    } else if(e.kind === 'grunt') {
      pRect(e.x-2,e.y-2,4,4,'#fff');
    } else if(e.kind === 'archer') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(e.x, e.y + 3);
      ctx.lineTo(e.x - 3, e.y - 3);
      ctx.lineTo(e.x + 3, e.y - 3);
      ctx.closePath();
      ctx.fill();
    } else if(e.kind === 'bomber') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if(e.kind === 'dasher') {
      if(e.dashing) {
        pRect(e.x-5,e.y-1,10,2,'#fff');
      } else {
        pRect(e.x-3,e.y-1,6,2,'#fff');
      }
    } else if(e.kind === 'orbitMage') {
      pRect(e.x-4,e.y-1,8,2,'#fff');
      pRect(e.x-1,e.y-4,2,8,'#fff');
    } else if(e.kind === 'splitter') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      for(let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const px = e.x + Math.cos(angle) * 4;
        const py = e.y + Math.sin(angle) * 4;
        if(i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if(e.kind === 'tank') {
      pRect(e.x-3,e.y-3,6,6,'#fff');
      pRect(e.x-2,e.y-2,4,4,'#000');
      pRect(e.x-1,e.y-1,2,2,'#fff');
    } else if(e.kind === 'sniper') {
      if(e.charging) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.time/50);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x-3,e.y-3);
      ctx.lineTo(e.x+3,e.y+3);
      ctx.moveTo(e.x+3,e.y-3);
      ctx.lineTo(e.x-3,e.y+3);
      ctx.stroke();
      if(e.charging) ctx.globalAlpha = 1;
    } else if(e.kind === 'minion') {
      pRect(e.x-1,e.y-1,2,2,'#fff');
    }
    
    if(e.kind !== 'Warden' && e.kind !== 'EclipseTwin') {
      const barWidth = e.kind === 'tank' ? 10 : (e.kind === 'minion' ? 4 : 8);
      const maxHP = e.kind === 'minion' ? 1 : 
                    e.kind === 'tank' ? (8 + G.room) :
                    e.kind === 'splitter' ? (5 + Math.floor(G.room/2)) :
                    (2 + Math.floor(G.room/2));
      pRect(e.x-barWidth/2,e.y-6,barWidth,2,'#555'); 
      const hpRatio = e.hp / maxHP;
      pRect(e.x-barWidth/2,e.y-6,Math.max(0, barWidth*hpRatio),2,'#fff');
    }
  }

  for(const b of G.bullets){ pRect(b.x-1,b.y-1,2,2,'#fff'); }
  for(const b of G.ebullets){ pRect(b.x-1,b.y-1,2,2,'#fff'); }

  for(const q of G.particles){ 
    if(q.kind==='zap'){ 
      ctx.strokeStyle='#fff'; 
      ctx.globalAlpha=.7; 
      ctx.beginPath(); 
      ctx.moveTo(q.x,q.y); 
      ctx.lineTo(q.tx,q.ty); 
      ctx.stroke(); 
      ctx.globalAlpha=1; 
    } else if(q.kind === 'lightning'){
      ctx.globalAlpha = 0.8;
      pRect(q.x-1,q.y-1,3,3,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'fire'){
      const alpha = q.life / 30;
      ctx.globalAlpha = alpha;
      pRect(q.x-1,q.y-1,2,2,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'hellfire'){
      const alpha = q.life / 40;
      ctx.globalAlpha = alpha;
      pRect(q.x-2,q.y-2,4,4,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'void'){
      ctx.globalAlpha = 0.6;
      pRect(q.x-1,q.y-1,2,2,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'eclipse'){
      const size = (60 - q.life) / 10;
      ctx.globalAlpha = q.life / 60;
      pRect(q.x-size/2,q.y-size/2,size,size,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'shatter'){
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = q.life / 15;
      ctx.beginPath();
      for(let i=0; i<6; i++){
        const angle = (i/6) * Math.PI * 2;
        const len = 5 + (15-q.life);
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(q.x + Math.cos(angle) * len, q.y + Math.sin(angle) * len);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if(q.kind === 'lifespark'){
      ctx.globalAlpha = 0.7;
      pRect(q.x-1,q.y-1,3,3,'#fff');
      if(q.life % 3 === 0){
        pRect(q.x-2,q.y-2,5,5,'#fff');
      }
      ctx.globalAlpha = 1;
    } else if(q.kind === 'blink'){
      ctx.globalAlpha = q.life / 20;
      pRect(q.x,q.y,2,2,'#fff');
      ctx.globalAlpha = 1;
    } else if(q.kind === 'explosion'){
      const alpha = q.life / 18;
      ctx.globalAlpha = alpha;
      pRect(q.x-1,q.y-1,3,3,'#fff');
      ctx.globalAlpha = 1;
    } else { 
      pRect(q.x,q.y,1,1,'#fff'); 
    } 
  }

  $('#hp').textContent = `HP ${'♥'.repeat(p.hp)}${'·'.repeat(p.hpMax-p.hp)}`;
  $('#room').textContent = `Room ${G.room}/${G.maxRooms}`;

  renderBar();
  
  const boss = G.enemies.find(e => e.kind === 'Warden' || e.kind === 'EclipseTwin');
  if (boss) {
    const maxHp = 30 + G.room * 4;
    const healthPercent = Math.max(0, boss.hp) / maxHp;
    $('#bossHealth').style.width = `${healthPercent * 100}%`;
    $('#bossHealthText').textContent = `${Math.ceil(healthPercent * 100)}%`;
  }
}

// =============== MAIN LOOP ==================
let last=0; 
function frame(t){ 
  const dt = (t-last)||16; 
  last=t; 
  if(G.state==='play') update(dt); 
  draw(); 
  requestAnimationFrame(frame); 
} 

// Initialize game
startRun();
requestAnimationFrame(frame);