'use strict';

// ════════ GAME STATE ════════
let currentLang='fr';
let L=LANG.fr;
let isTestMode=false;
let G={
  username:'@Umutesi_RW',
  plate:'RAB 314 PI',
  piBalance:0,
  sessionsLeft:3,
  sessionsMax:3,
  totalScore:0,
  totalGames:0,
  isPremium:false,
  lastPlayDate:null
};

let gameState={
  active:false,paused:false,
  route:'rubavu',capital:100,
  speed:60,distance:0,maxDistance:165,
  time:0,timer:null,
  infractions:[],vigilanceBonus:0,
  busX:0.5,
  obstacles:[],
  iaActive:false,iaTimeout:null,
  lastInfraction:0
};

const ROUTES={
  rubavu:{name:'Kigali → Rubavu',maxDist:165,events:['speed_bump','radar','animal','rain','speed_bump','radar'],speed:65},
  huye:{name:'Kigali → Huye',maxDist:130,events:['radar','speed_bump','red_light','school','radar','speed_bump'],speed:60},
  nyagatare:{name:'Kigali → Nyagatare',maxDist:175,events:['animal','speed_bump','radar','animal','radar'],speed:70},
  gatuna:{name:'Kigali → Gatuna',maxDist:85,events:['truck','speed_bump','red_light','truck','radar'],speed:65},
  ville:{name:'Kigali Ville',maxDist:120,events:['red_light','speed_bump','red_light','school','red_light','speed_bump'],speed:40}
};

// ════════ PI AUTH ════════
const piSvc={
  user:null,ok:false,
  async init(){try{if(typeof Pi==='undefined'){this.ok=false;return;}Pi.init({version:'2.0',sandbox:true});this.ok=true;}catch(e){this.ok=false;}},
  async login(){try{if(typeof Pi==='undefined')return this._demo();if(!this.ok)await this.init();const a=await Pi.authenticate(['username'],()=>{});this.user=a.user;return{ok:true,user:a.user};}catch(e){return{ok:false,err:e.message};}},
  _demo(){const u={username:'Umutesi_RW'};this.user=u;return{ok:true,user:u};}
};

async function handleLogin(){
  const btn=document.getElementById('loginBtn');
  const st=document.getElementById('authSt');
  btn.disabled=true;
  st.innerHTML='<span class="spin"></span> '+L.connecting;
  await piSvc.init();
  const r=await piSvc.login();
  if(r.ok){
    G.username='@'+(r.user.username||'PiPlayer_RW');
    G.plate=generatePlate(r.user.username||'PLAYER');
    st.innerHTML='✅ '+G.username+' — '+G.plate;
    setTimeout(startApp,800);
  }else{
    st.innerHTML=L.login_fail;
    btn.disabled=false;
  }
}

function guestMode(){
  G.username='@Demo_Player';
  G.plate='RAB 000 PI';
  startApp();
}

function testMode(){
  isTestMode=true;
  G.username='@Test_Player';
  G.plate='RAT 999 PI';
  startApp();
}

function generatePlate(username){
  const letters=['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'];
  const l1=letters[username.charCodeAt(0)%letters.length];
  const l2=letters[username.charCodeAt(Math.min(1,username.length-1))%letters.length];
  const num=100+username.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%900;
  return `RA${l1} ${num} PI`;
}

function startApp(){
  loadState();
  updateLangUI();
  updateHomeUI();
  showScreen('s-home');
  showToast(L.welcome+' '+G.username+' !');
}

// ════════ LANG ════════
function setLang(lang){
  currentLang=lang;L=LANG[lang];
  document.getElementById('topLang').textContent=lang.toUpperCase();
  document.querySelectorAll('.lang-item').forEach(el=>el.classList.remove('active'));
  const li=document.getElementById('lang-'+lang);if(li)li.classList.add('active');
  updateLangUI();
  closeLangPicker();
}

function updateLangUI(){
  const m=(id,txt)=>{const el=document.getElementById(id);if(el)el.innerHTML=txt;};
  const t=(id,txt)=>{const el=document.getElementById(id);if(el)el.textContent=txt;};
  m('auth-sub',L.auth_sub);m('auth-tagline',L.auth_tagline);
  t('f1t',L.f1t);t('f1d',L.f1d);t('f2t',L.f2t);t('f2d',L.f2d);
  t('f3t',L.f3t);t('f3d',L.f3d);t('f4t',L.f4t);t('f4d',L.f4d);
  m('free-badge-txt',L.free_badge);
  t('login-btn-txt',L.login_btn);
  t('demo-btn-txt',L.demo_btn);
  t('test-btn-txt',L.test_btn);
  t('games-section-lbl',L.games_lbl);
  t('g1-name',L.g1_name);t('g1-desc',L.g1_desc);t('g1-tag1',L.g1_tag);
  t('g2-desc',L.g2_desc);t('g2-tag',L.g2_tag);
  t('g3-desc',L.g3_desc);t('g3-tag',L.g3_tag);
  t('prize-title-lbl',L.prize_title);
  t('leaderboard-btn-lbl',L.leaderboard_btn);t('pihub-btn-lbl',L.pihub_btn);
  t('sess-left-lbl',L.sess_left);t('sess-today-lbl',L.sess_today);
  t('choose-route-lbl',L.choose_route);
  t('r1-desc',L.r1_desc);t('r2-desc',L.r2_desc);t('r3-desc',L.r3_desc);
  t('r4-desc',L.r4_desc);t('r5-desc',L.r5_desc);
  t('capital-lbl',L.capital_lbl);t('brake-lbl',L.brake_lbl);
  t('r-route-lbl',L.r_route);t('r-cap-lbl',L.r_cap);
  t('r-dist-lbl',L.r_dist);t('r-infractions-lbl',L.r_infr);
  t('r-bonus-lbl',L.r_bonus);t('r-total-lbl',L.r_total);
  t('play-again-btn',L.play_again);t('change-route-btn',L.change_route);
  t('see-rank-btn',L.see_rank);
  t('rank-title-lbl',L.rank_title);
  t('prize-reminder-lbl',L.prize_reminder);t('prize-details',L.prize_details);
  t('pw-title',L.pw_title);t('pw-sub',L.pw_sub);
  t('pw-single',L.pw_single);t('pw-single-desc',L.pw_single_desc);
  t('pw-weekly',L.pw_weekly);t('pw-weekly-desc',L.pw_weekly_desc);
  t('pw-monthly',L.pw_monthly);t('pw-monthly-desc',L.pw_monthly_desc);
  t('pw-note',L.pw_note);t('pw-close-btn',L.pw_close);
  t('pw-weekly-badge',L.pw_weekly_badge);
  t('stat-sessions-lbl',L.stat_sessions);t('stat-score-lbl',L.stat_score);
  t('accel-lbl',L.accel_lbl);
  t('quit-btn-lbl',L.quit_btn);
  t('quit-confirm-txt',L.quit_confirm);t('quit-yes-btn',L.quit_yes);t('quit-no-btn',L.quit_no);
  t('testBadge',L.test_mode_lbl);
  const rn=L.route_names||{};
  t('r1-name',rn.rubavu);t('r2-name',rn.huye);t('r3-name',rn.nyagatare);
  t('r4-name',rn.gatuna);t('r5-name',rn.ville);
}

function showLangPicker(){document.getElementById('langOverlay').classList.add('show');}
function closeLangPicker(){document.getElementById('langOverlay').classList.remove('show');}

// ════════ HOME UI ════════
function updateHomeUI(){
  document.getElementById('homeName').textContent=G.username;
  document.getElementById('homePlate').textContent=G.plate;
  document.getElementById('topPi').textContent=G.piBalance.toFixed(2);
  document.getElementById('statSessions').textContent=G.sessionsLeft;
  document.getElementById('statScore').textContent=G.totalScore;
  document.getElementById('sessCount').textContent=G.sessionsLeft;
  updateSessionDots();
  renderLeaderboard();
}

function updateSessionDots(){
  const c=document.getElementById('sessDots');if(!c)return;
  let h='';
  for(let i=0;i<G.sessionsMax;i++){h+=`<div class="sdot${i>=G.sessionsLeft?' used':''}"></div>`;}
  c.innerHTML=h;
}

// ════════ SCREENS ════════
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const sc=document.getElementById(id);if(sc)sc.classList.add('active');
  if(id==='s-rank')renderLeaderboard();
  if(id==='s-home')updateHomeUI();
}

function goToRoutes(){showScreen('s-routes');}

// ════════ GAME LOGIC ════════
function startGame(route){
  if(G.sessionsLeft<=0&&!G.isPremium){showPaywall();return;}
  if(G.sessionsLeft>0&&!isTestMode)G.sessionsLeft--;
  saveState();updateHomeUI();
  const r=ROUTES[route];
  gameState={
    active:true,paused:false,route,
    capital:100,speed:r.speed,
    distance:0,maxDistance:r.maxDist,
    time:0,timer:null,
    infractions:[],vigilanceBonus:0,
    busX:0.5,
    obstacles:[],iaActive:false,iaTimeout:null,
    lastInfraction:0
  };
  document.getElementById('hudRoute').textContent=r.name;
  document.getElementById('hudPlate').textContent=G.plate;
  document.getElementById('hudDist').textContent='0 / '+r.maxDist+' km';
  document.getElementById('testBadge').classList.toggle('show',isTestMode);
  updateCapitalUI();
  updateSpeedUI();
  showScreen('s-game');
  initCanvas();
  gameState.timer=setInterval(gameTick,100);
  scheduleEvents();
}

let canvasCtx=null;
let animFrame=null;
let roadOffset=0;

function initCanvas(){
  const canvas=document.getElementById('roadCanvas');
  canvas.width=canvas.offsetWidth||360;
  canvas.height=canvas.offsetHeight||640;
  canvasCtx=canvas.getContext('2d');
  if(animFrame)cancelAnimationFrame(animFrame);
  renderGame();
}

function renderGame(){
  if(!gameState.active)return;
  const canvas=document.getElementById('roadCanvas');
  if(!canvas||!canvasCtx){animFrame=requestAnimationFrame(renderGame);return;}
  const W=canvas.width,H=canvas.height;
  const ctx=canvasCtx;
  // Sky
  const sky=ctx.createLinearGradient(0,0,0,H*0.35);
  sky.addColorStop(0,'#050A05');sky.addColorStop(1,'#0A1A0A');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*0.35);
  // Ground
  ctx.fillStyle='#1A2A1A';ctx.fillRect(0,H*0.35,W,H*0.65);
  // Road perspective
  const rL=W*0.15,rR=W*0.85,rBL=W*0.02,rBR=W*0.98;
  const roadGrad=ctx.createLinearGradient(0,H*0.35,0,H);
  roadGrad.addColorStop(0,'#1A1A1A');roadGrad.addColorStop(1,'#252525');
  ctx.fillStyle=roadGrad;
  ctx.beginPath();ctx.moveTo(rL,H*0.35);ctx.lineTo(rR,H*0.35);
  ctx.lineTo(rBR,H);ctx.lineTo(rBL,H);ctx.closePath();ctx.fill();
  // Lane lines
  roadOffset=(roadOffset+(!gameState.paused?gameState.speed/30:0))%40;
  ctx.strokeStyle='rgba(255,255,0,0.6)';ctx.lineWidth=2;ctx.setLineDash([20,20]);
  ctx.lineDashOffset=-roadOffset;
  const mx=W/2;
  ctx.beginPath();ctx.moveTo(mx,H*0.35);ctx.lineTo(mx,H);ctx.stroke();
  // Shoulders
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(rL,H*0.35);ctx.lineTo(rBL,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(rR,H*0.35);ctx.lineTo(rBR,H);ctx.stroke();
  // Trees
  for(let i=0;i<5;i++){
    const tx=W*0.06*i+W*0.02;
    const ty=H*0.35+H*0.08*i;
    const ts=8+i*5;
    ctx.fillStyle='#0A3A0A';
    ctx.beginPath();ctx.arc(tx,ty,ts,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#0D4A0D';
    ctx.beginPath();ctx.arc(tx,ty-ts*0.3,ts*0.7,0,Math.PI*2);ctx.fill();
    const tx2=W-tx;
    ctx.fillStyle='#0A3A0A';
    ctx.beginPath();ctx.arc(tx2,ty,ts,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#0D4A0D';
    ctx.beginPath();ctx.arc(tx2,ty-ts*0.3,ts*0.7,0,Math.PI*2);ctx.fill();
  }
  // Obstacles
  gameState.obstacles.forEach(obs=>{
    if(!obs.active)return;
    const ox=W*0.2+obs.laneX*(W*0.6);
    const oy=H*0.4+obs.y*(H*0.5);
    const os=8+obs.y*30;
    ctx.font=os+'px serif';ctx.textAlign='center';
    ctx.fillText(obs.ico,ox,oy);
  });
  // Bus (player)
  const busX=W*0.15+gameState.busX*(W*0.7);
  const busY=H*0.78;
  const bw=42,bh=28;
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.beginPath();ctx.ellipse(busX,busY+bh/2+3,bw*0.6,6,0,0,Math.PI*2);ctx.fill();
  const busGrad=ctx.createLinearGradient(busX-bw/2,busY-bh/2,busX+bw/2,busY+bh/2);
  busGrad.addColorStop(0,'#16C979');busGrad.addColorStop(1,'#0A7C4E');
  ctx.fillStyle=busGrad;
  ctx.beginPath();ctx.roundRect(busX-bw/2,busY-bh/2,bw,bh,4);ctx.fill();
  ctx.fillStyle='rgba(200,240,255,0.7)';
  for(let i=0;i<3;i++){ctx.fillRect(busX-bw/2+5+i*12,busY-bh/2+4,9,8);}
  ctx.fillStyle='#FFD700';
  ctx.fillRect(busX-bw/2,busY-2,4,4);
  ctx.fillRect(busX+bw/2-4,busY-2,4,4);
  ctx.fillStyle='#FFD700';ctx.font='bold 7px Orbitron,monospace';ctx.textAlign='center';
  ctx.fillText(G.plate.substring(0,8),busX,busY+bh/2-3);
  // Horizon glow
  const hg=ctx.createLinearGradient(0,H*0.32,0,H*0.38);
  hg.addColorStop(0,'rgba(0,100,30,0.3)');hg.addColorStop(1,'transparent');
  ctx.fillStyle=hg;ctx.fillRect(0,H*0.32,W,H*0.06);
  animFrame=requestAnimationFrame(renderGame);
}

function gameTick(){
  if(!gameState.active||gameState.paused)return;
  gameState.time+=0.1;
  const seconds=Math.floor(gameState.time);
  const mins=Math.floor(seconds/60);
  const secs=seconds%60;
  document.getElementById('hudTime').textContent=
    (mins<10?'0':'')+mins+':'+(secs<10?'0':'')+secs;
  gameState.distance+=gameState.speed/3600*0.1*(isTestMode?6:1);
  const r=ROUTES[gameState.route];
  document.getElementById('hudDist').textContent=
    Math.floor(gameState.distance)+' / '+r.maxDist+' km';
  const pct=Math.min(100,(gameState.distance/r.maxDist)*100);
  const pf=document.getElementById('distProgFill');
  if(pf)pf.style.width=pct+'%';
  gameState.obstacles.forEach(obs=>{
    obs.y+=isTestMode?0.04:0.008;
    if(obs.y>1){obs.active=false;}
    if(obs.active&&obs.y>0.8&&!obs.triggered){
      obs.triggered=true;
      checkObstacleReaction(obs);
    }
  });
  if(gameState.distance>=r.maxDist){endGame(true);}
}

// ════════ OBSTACLES ════════
function scheduleEvents(){
  const r=ROUTES[gameState.route];
  const interval=isTestMode?2500:8000;
  r.events.forEach((ev,i)=>{
    setTimeout(()=>{
      if(!gameState.active)return;
      spawnObstacle(ev,i);
    },(i+1)*interval+Math.random()*(isTestMode?800:4000));
  });
}

const OBS_CONFIG={
  speed_bump:{ico:'🚧',laneX:0.5,action:'brake',warn:'speed_bump'},
  radar:{ico:'📸',laneX:0.5,action:'speed',warn:'radar'},
  red_light:{ico:'🚦',laneX:0.5,action:'brake',warn:'red_light'},
  animal:{ico:'🐄',laneX:0.3,action:'dodge',warn:'animal'},
  child:{ico:'👦',laneX:0.4,action:'brake',warn:'child'},
  truck:{ico:'🚛',laneX:0.45,action:'dodge',warn:'truck'},
  pedestrian:{ico:'🚶',laneX:0.4,action:'brake',warn:'child'},
  rain:{ico:'🌧️',laneX:0.5,action:'speed',warn:'rain'},
  school:{ico:'🏫',laneX:0.5,action:'speed',warn:'school'}
};

function spawnObstacle(type,idx){
  const cfg=OBS_CONFIG[type]||OBS_CONFIG.speed_bump;
  const obs={type,ico:cfg.ico,laneX:cfg.laneX+Math.random()*0.2-0.1,y:0,active:true,triggered:false,action:cfg.action,warn:cfg.warn};
  gameState.obstacles.push(obs);
  showIAWarning(cfg.warn);
}

function showIAWarning(warnType){
  const txt=L.ia[warnType]||L.ia.speed_bump;
  const strip=document.getElementById('iaStrip');
  const iaTxt=document.getElementById('iaTxt');
  const iaTimer=document.getElementById('iaTimer');
  strip.classList.add('show');
  iaTxt.textContent=txt;
  let t=3;iaTimer.textContent=t;
  gameState.iaActive=true;
  if(gameState.iaTimeout)clearInterval(gameState.iaTimeout);
  gameState.iaTimeout=setInterval(()=>{
    t--;iaTimer.textContent=t;
    if(t<=0){clearInterval(gameState.iaTimeout);strip.classList.remove('show');gameState.iaActive=false;}
  },1000);
  if('speechSynthesis' in window){
    try{
      const cleanTxt=txt.replace(/[🚧📸🚦🐄👦🚛🚶🌫️🏫⚠️🌧️🤖🚨📱]/g,'').trim();
      const targetLang=currentLang==='kin'?'rw-RW':currentLang==='sw'?'sw-KE':currentLang==='fr'?'fr-FR':'en-US';
      const voices=window.speechSynthesis.getVoices();
      let voice=voices.find(v=>v.lang===targetLang)||voices.find(v=>v.lang.startsWith(targetLang.split('-')[0]));
      // Kinyarwanda/Swahili often have no installed voice -> avoid letter-by-letter spelling.
      // Fall back to French (closer phonetics for KIN) or English, but keep visual alert as primary info.
      if(!voice&&(currentLang==='kin'||currentLang==='sw')){
        voice=voices.find(v=>v.lang.startsWith('fr'))||voices.find(v=>v.lang.startsWith('en'));
      }
      const u=new SpeechSynthesisUtterance(cleanTxt);
      if(voice){u.voice=voice;u.lang=voice.lang;}else{u.lang=targetLang;}
      u.rate=1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
}

function checkObstacleReaction(obs){
  const now=Date.now();
  if(now-gameState.lastInfraction<2000)return;
  const reactedRecently=ctrl.lastAction&&(now-ctrl.lastActionTime<1500);
  const reaction=reactedRecently?ctrl.lastAction:null;
  let infracted=false;
  if(obs.action==='brake'&&reaction!=='brake'){
    applyInfraction(obs.warn==='red_light'?'redlight':obs.warn==='school'?'speeding':'badstopping');infracted=true;
  }else if(obs.action==='speed'&&gameState.speed>55){
    applyInfraction('speeding');infracted=true;
  }else if(obs.action==='dodge'&&!(reaction==='left'||reaction==='right'||reaction==='brake')){
    applyInfraction('badstopping');infracted=true;
  }
  if(!infracted&&gameState.iaActive){
    gameState.vigilanceBonus+=5;
    showToast(L.bonus_vigilance,'gold');
  }
}

function applyInfraction(type){
  const inf=L.infractions[type];if(!inf)return;
  if(type==='presidential'){endGame(false,'presidential');return;}
  gameState.capital=Math.max(0,gameState.capital+inf.pts);
  gameState.infractions.push(inf);
  gameState.lastInfraction=Date.now();
  updateCapitalUI();
  showAlert(inf);
  if(gameState.capital<=0){setTimeout(()=>endGame(false,type),1500);}
}

function showAlert(inf){
  const box=document.getElementById('alertBox');
  const flash=document.getElementById('infraFlash');
  document.getElementById('alertIco').textContent='🚨';
  document.getElementById('alertTitle').textContent=L.infraction_label;
  document.getElementById('alertDesc').textContent=inf.name+' — '+inf.code;
  document.getElementById('alertPenalty').textContent=inf.pts+' pts';
  box.classList.add('show');flash.classList.add('show');
  if(navigator.vibrate)navigator.vibrate([100,50,100]);
  setTimeout(()=>{box.classList.remove('show');flash.classList.remove('show');},2000);
}

function updateCapitalUI(){
  const pct=Math.max(0,gameState.capital);
  document.getElementById('capVal').textContent=gameState.capital+' pts';
  const bar=document.getElementById('capBar');
  bar.style.width=pct+'%';
  bar.style.background=pct>60?'linear-gradient(90deg,#16C979,#27FF9A)':
                        pct>30?'linear-gradient(90deg,#FF8C00,#FFD700)':
                               'linear-gradient(90deg,#FF3B3B,#FF8C00)';
}

function updateSpeedUI(){
  document.getElementById('speedVal').textContent=Math.floor(gameState.speed);
}

// ════════ CONTROLS ════════
const ctrl={currentAction:null,lastAction:null,lastActionTime:0};
const SPEED_MIN=10,SPEED_MAX=110;
function startCtrl(action){
  ctrl.currentAction=action;
  ctrl.lastAction=action;
  ctrl.lastActionTime=Date.now();
  if(action==='brake'){
    gameState.speed=Math.max(SPEED_MIN,gameState.speed-10);
    updateSpeedUI();
  }else if(action==='accel'){
    gameState.speed=Math.min(SPEED_MAX,gameState.speed+10);
    updateSpeedUI();
  }else if(action==='left'){
    gameState.busX=Math.max(0.05,gameState.busX-0.15);
  }else if(action==='right'){
    gameState.busX=Math.min(0.95,gameState.busX+0.15);
  }
}
function stopCtrl(){ctrl.currentAction=null;}

// ════════ QUIT ════════
function confirmQuit(){
  if(!gameState.paused)togglePause();
  document.getElementById('quitOverlay').classList.add('show');
}
function closeQuitConfirm(){
  document.getElementById('quitOverlay').classList.remove('show');
  if(gameState.paused)togglePause();
}
function doQuit(){
  gameState.active=false;
  if(gameState.timer)clearInterval(gameState.timer);
  if(gameState.iaTimeout)clearInterval(gameState.iaTimeout);
  if(animFrame)cancelAnimationFrame(animFrame);
  document.getElementById('quitOverlay').classList.remove('show');
  showScreen('s-home');
}

// ════════ PAUSE ════════
function togglePause(){
  gameState.paused=!gameState.paused;
  document.getElementById('pauseBtn').textContent=gameState.paused?'▶':'⏸';
  if(gameState.paused)showToast(L.pause_txt,'');
}

// ════════ END GAME ════════
function endGame(won,reason){
  gameState.active=false;
  if(gameState.timer)clearInterval(gameState.timer);
  if(gameState.iaTimeout)clearInterval(gameState.iaTimeout);
  if(animFrame)cancelAnimationFrame(animFrame);
  const r=ROUTES[gameState.route];
  const totalScore=Math.max(0,gameState.capital)+gameState.vigilanceBonus;
  G.totalScore+=totalScore;G.totalGames++;
  G.piBalance+=totalScore*0.0001;
  saveState();
  document.getElementById('resultIco').textContent=won?'🏆':'💥';
  const titleEl=document.getElementById('resultTitle');
  titleEl.textContent=won?L.result_win:L.result_lose;
  titleEl.className='result-title '+(won?'win':'lose');
  document.getElementById('resultPlate').textContent=G.plate;
  document.getElementById('rRoute').textContent=r.name;
  document.getElementById('rCap').textContent=gameState.capital+' pts';
  document.getElementById('rCap').className='score-val '+(gameState.capital>60?'good':gameState.capital>30?'warn':'bad');
  document.getElementById('rDist').textContent=Math.floor(gameState.distance)+' km';
  document.getElementById('rInfr').textContent=gameState.infractions.length;
  document.getElementById('rBonus').textContent='+'+gameState.vigilanceBonus+' pts';
  document.getElementById('rTotal').textContent=totalScore+' pts';
  const il=document.getElementById('infractionsList');
  if(gameState.infractions.length){
    il.innerHTML=gameState.infractions.map(i=>
      '<div class="infr-item"><span class="infr-code">'+i.code+'</span><span class="infr-name">'+i.name+'</span><span class="infr-pts">'+i.pts+' pts</span></div>'
    ).join('');
  }else{
    il.innerHTML='<div style="text-align:center;color:var(--pi);font-size:.72rem;padding:8px">'+L.no_infractions+'</div>';
  }
  showScreen('s-results');
}

function playAgain(){startGame(gameState.route);}

// ════════ LEADERBOARD ════════
const MOCK_PLAYERS=[
  {name:'@Kagabo_RW',plate:'RAK 251 PI',score:2840,games:12,region:'Kigali'},
  {name:'@Mukamana',plate:'RAC 187 PI',score:2510,games:9,region:'Nord'},
  {name:'@Habimana_J',plate:'RAD 429 PI',score:2200,games:15,region:'Est'},
  {name:'@Nyira_Grace',plate:'RAB 873 PI',score:1950,games:8,region:'Sud'},
  {name:'@Bizimana_P',plate:'RAE 612 PI',score:1720,games:11,region:'Kigali'},
  {name:'@Uwimana_S',plate:'RAF 344 PI',score:1480,games:7,region:'Ouest'},
  {name:'@Gasana_R',plate:'RAG 915 PI',score:1250,games:6,region:'Nord'}
];

function renderLeaderboard(){
  const allP=[...MOCK_PLAYERS,{name:G.username,plate:G.plate,score:G.totalScore,games:G.totalGames,region:'Kigali'}];
  allP.sort((a,b)=>b.score-a.score);
  const top3=allP.slice(0,3);
  const rest=allP.slice(3,10);
  const podium=document.getElementById('podiumEl');
  if(podium&&top3.length>=3){
    const order=[top3[1],top3[0],top3[2]];
    const classes=['pod-2','pod-1','pod-3'];
    const heights=['55','70','45'];
    const crowns=['🥈','🥇','🥉'];
    podium.innerHTML=order.map((p,i)=>
      '<div class="podium-item '+classes[i]+'"><div class="pod-avatar">'+p.name.charAt(1).toUpperCase()+'</div><div class="pod-name">'+p.name.substring(0,10)+'</div><div class="pod-plate">'+p.plate+'</div><div class="pod-score">'+p.score+'</div><div class="pod-base" style="height:'+heights[i]+'px">'+crowns[i]+'</div></div>'
    ).join('');
  }
  const lb=document.getElementById('lbList');
  if(!lb)return;
  lb.innerHTML=rest.map((p,i)=>{
    const isMe=p.name===G.username;
    return '<div class="lb-row'+(isMe?' me':'')+'"><div class="lb-pos">'+(i+4)+'</div><div class="lb-info"><div class="lb-pname">'+(isMe?'👤 ':'')+' '+p.name+'</div><div class="lb-pplate">'+p.plate+'</div><div class="lb-pstats">'+p.games+' parties · '+p.region+'</div></div><div class="lb-score"><div class="lb-pts">'+p.score+' pts</div><div class="lb-rank-badge">Top '+(i+4)+'</div></div></div>';
  }).join('');
}

// ════════ PAYWALL ════════
function showPaywall(){document.getElementById('paywallOverlay').classList.add('show');}
function closePaywall(){document.getElementById('paywallOverlay').classList.remove('show');}
function buySession(days){
  showToast(L.payment_loading,'gold');
  setTimeout(()=>{
    if(days===1){G.sessionsLeft=1;}
    else if(days===7){G.isPremium=true;G.sessionsLeft=99;}
    else if(days===30){G.isPremium=true;G.sessionsLeft=999;}
    closePaywall();saveState();updateHomeUI();
    showToast(L.sessions_recharged,'gold');
  },1500);
}

// ════════ MISC ════════
function showComingSoon(name){showToast(L.coming_soon+' '+name,'');}
function goToPiHub(){window.location.href='index.html';}
let toastTimeout=null;
function showToast(msg,type){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show'+(type?' '+type:'');
  if(toastTimeout)clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{t.className='toast';},2000);
}

// ════════ SAVE/LOAD ════════
function saveState(){localStorage.setItem('piganza_state',JSON.stringify(G));}
function loadState(){
  try{
    const d=JSON.parse(localStorage.getItem('piganza_state')||'{}');
    if(d.username)Object.assign(G,d);
    const today=new Date().toDateString();
    if(d.lastPlayDate!==today){G.sessionsLeft=3;G.lastPlayDate=today;saveState();}
  }catch(e){}
}

// ════════ INIT ════════
if('speechSynthesis' in window){
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged=()=>{window.speechSynthesis.getVoices();};
}
window.addEventListener('DOMContentLoaded',()=>{
  const saved=localStorage.getItem('piganza_state');
  if(saved){
    try{
      const d=JSON.parse(saved);
      if(d.username&&d.username!=='@Umutesi_RW'){
        loadState();
        updateLangUI();updateHomeUI();showScreen('s-home');
        showToast(L.welcome_back+' '+G.username+' !');
        return;
      }
    }catch(e){}
  }
});

// Keyboard support (for test mode on laptop)
document.addEventListener('keydown',e=>{
  if(!gameState.active)return;
  if(e.key==='ArrowLeft')startCtrl('left');
  if(e.key==='ArrowRight')startCtrl('right');
  if(e.key===' '||e.key==='ArrowDown'){e.preventDefault();startCtrl('brake');}
  if(e.key==='p'||e.key==='Escape')togglePause();
});
