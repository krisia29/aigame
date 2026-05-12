const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreEl = document.getElementById('score');
const creditsEl = document.getElementById('credits');
const coinsEl = document.getElementById('coins');
const highScoreEl = document.getElementById('highScore');
const integrityEl = document.getElementById('integrity');
const distanceEl = document.getElementById('distance');
const buildNameEl = document.getElementById('buildName');
const buildNameInput = document.getElementById('buildNameInput');
const previewPane = document.querySelector('.preview-body');
const engineLevelEl = document.getElementById('engineLevel');
const tiresLevelEl = document.getElementById('tiresLevel');
const brakesLevelEl = document.getElementById('brakesLevel');
const nitroLevelEl = document.getElementById('nitroLevel');
const engineCostEl = document.getElementById('engineCost');
const tiresCostEl = document.getElementById('tiresCost');
const brakesCostEl = document.getElementById('brakesCost');
const nitroCostEl = document.getElementById('nitroCost');
const buyPremiumButton = document.getElementById('buyPremium');
const premiumBadge = document.getElementById('proBadge');
const desktopViewBtn = document.getElementById('desktopViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const authUsername = document.getElementById('authUsername');
const authPassword = document.getElementById('authPassword');
const signInBtn = document.getElementById('signInBtn');
const registerBtn = document.getElementById('registerBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authMessage = document.getElementById('authMessage');
const signedInUser = document.getElementById('signedInUser');
const leaderboardList = document.getElementById('leaderboardList');
let accounts = {};
let currentUser = localStorage.getItem('race-current-user') || null;
let viewMode = localStorage.getItem('viewMode') || 'desktop';

const state = {
  width: 800,
  height: 500,
  keys: {},
  score: 0,
  credits: 520,
  coins: 2,
  highScore: 0,
  integrity: 3,
  raceDistance: 2800,
  progress: 0,
  trackSpeed: 3.2,
  playing: false,
  paused: false,
  gameOver: false,
  raceFinished: false,
  lastTime: 0,
  obstacleTimer: 0,
  obstacleInterval: 1200,
  oilTimer: 0,
  premiumAccess: false,
  buildName: 'Urban Racer',
};

const player = {
  x: 380,
  y: 380,
  width: 48,
  height: 72,
  color: '#38bdf8',
  wheel: 'sport',
  spoiler: 'wing',
  nitro: { charge: 100, active: false },
};

const shop = {
  engine: { level: 1, baseCost: 120 },
  tires: { level: 1, baseCost: 100 },
  brakes: { level: 1, baseCost: 90 },
  nitro: { level: 1, baseCost: 150 },
};

const obstacles = [];

function loadAccounts() {
  return JSON.parse(localStorage.getItem('race-accounts') || '{}');
}

function saveAccounts() {
  localStorage.setItem('race-accounts', JSON.stringify(accounts));
}

function loadAccountData(account) {
  state.credits = account.credits ?? state.credits;
  state.coins = account.coins ?? state.coins;
  state.highScore = account.highScore ?? state.highScore;
  state.premiumAccess = account.premiumAccess ?? state.premiumAccess;
  state.buildName = account.buildName || state.buildName;
  player.color = account.color || player.color;
  player.wheel = account.wheel || player.wheel;
  player.spoiler = account.spoiler || player.spoiler;
  shop.engine.level = account.engineLevel || shop.engine.level;
  shop.tires.level = account.tiresLevel || shop.tires.level;
  shop.brakes.level = account.brakesLevel || shop.brakes.level;
  shop.nitro.level = account.nitroLevel || shop.nitro.level;
}

function saveUserAccount() {
  if (!currentUser) return;
  const account = accounts[currentUser] || {};
  accounts[currentUser] = {
    password: account.password,
    credits: state.credits,
    coins: state.coins,
    highScore: state.highScore,
    premiumAccess: state.premiumAccess,
    buildName: state.buildName,
    color: player.color,
    wheel: player.wheel,
    spoiler: player.spoiler,
    engineLevel: shop.engine.level,
    tiresLevel: shop.tires.level,
    brakesLevel: shop.brakes.level,
    nitroLevel: shop.nitro.level,
  };
  saveAccounts();
}

function loadSave() {
  accounts = loadAccounts();
  currentUser = localStorage.getItem('race-current-user') || null;
  updateAuthDisplay();
  if (currentUser && accounts[currentUser]) {
    loadAccountData(accounts[currentUser]);
    return;
  }
  const saved = JSON.parse(localStorage.getItem('race-save') || '{}');
  state.credits = saved.credits ?? state.credits;
  state.coins = saved.coins ?? state.coins;
  state.highScore = saved.highScore ?? state.highScore;
  state.premiumAccess = saved.premiumAccess ?? state.premiumAccess;
  state.buildName = saved.buildName || state.buildName;
  player.color = saved.color || player.color;
  player.wheel = saved.wheel || player.wheel;
  player.spoiler = saved.spoiler || player.spoiler;
  shop.engine.level = saved.engineLevel || shop.engine.level;
  shop.tires.level = saved.tiresLevel || shop.tires.level;
  shop.brakes.level = saved.brakesLevel || shop.brakes.level;
  shop.nitro.level = saved.nitroLevel || shop.nitro.level;
}

function saveProgress() {
  if (currentUser) {
    saveUserAccount();
    return;
  }
  localStorage.setItem(
    'race-save',
    JSON.stringify({
      credits: state.credits,
      coins: state.coins,
      highScore: state.highScore,
      premiumAccess: state.premiumAccess,
      buildName: state.buildName,
      color: player.color,
      wheel: player.wheel,
      spoiler: player.spoiler,
      engineLevel: shop.engine.level,
      tiresLevel: shop.tires.level,
      brakesLevel: shop.brakes.level,
      nitroLevel: shop.nitro.level,
    })
  );
}

function updateLeaderBoard() {
  const entries = Object.entries(accounts)
    .map(([username, data]) => ({ username, score: data.highScore || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  leaderboardList.innerHTML = entries
    .map(
      (entry, index) => `
        <li>
          <span>${index + 1}. ${entry.username}</span>
          <span>${entry.score}</span>
        </li>`
    )
    .join('');
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#fb7185' : '#93c5fd';
}

function updateAuthDisplay() {
  signedInUser.textContent = currentUser ? currentUser : 'Guest';
  signOutBtn.classList.toggle('hidden', !currentUser);
}

function signIn() {
  const username = authUsername.value.trim();
  const password = authPassword.value;
  if (!username || !password) {
    showAuthMessage('Enter username and password.', true);
    return;
  }
  if (!accounts[username]) {
    showAuthMessage('User not found.', true);
    return;
  }
  if (accounts[username].password !== password) {
    showAuthMessage('Password incorrect.', true);
    return;
  }
  currentUser = username;
  localStorage.setItem('race-current-user', currentUser);
  loadAccountData(accounts[currentUser]);
  updateAuthDisplay();
  updateLeaderBoard();
  updateGarage();
  updateHUD();
  showAuthMessage(`Signed in as ${username}.`);
}

function registerUser() {
  const username = authUsername.value.trim();
  const password = authPassword.value;
  if (!username || !password) {
    showAuthMessage('Enter a username and password to register.', true);
    return;
  }
  if (accounts[username]) {
    showAuthMessage('Username already exists.', true);
    return;
  }
  accounts[username] = {
    password,
    credits: state.credits,
    coins: state.coins,
    highScore: state.highScore,
    premiumAccess: state.premiumAccess,
    buildName: state.buildName,
    color: player.color,
    wheel: player.wheel,
    spoiler: player.spoiler,
    engineLevel: shop.engine.level,
    tiresLevel: shop.tires.level,
    brakesLevel: shop.brakes.level,
    nitroLevel: shop.nitro.level,
  };
  saveAccounts();
  currentUser = username;
  localStorage.setItem('race-current-user', currentUser);
  updateAuthDisplay();
  updateLeaderBoard();
  showAuthMessage('Account created and signed in.');
}

function signOut() {
  currentUser = null;
  localStorage.removeItem('race-current-user');
  updateAuthDisplay();
  showAuthMessage('Signed out.');
}

function initAuth() {
  signInBtn.addEventListener('click', signIn);
  registerBtn.addEventListener('click', registerUser);
  signOutBtn.addEventListener('click', signOut);
}

function updateHUD() {
  creditsEl.textContent = state.credits;
  coinsEl.textContent = state.coins;
  highScoreEl.textContent = state.highScore;
  integrityEl.textContent = state.integrity;
  distanceEl.textContent = Math.max(0, Math.ceil(state.raceDistance - state.progress));
  scoreEl.textContent = state.score;
  buildNameEl.textContent = state.buildName;
}

function updateGarage() {
  buildNameInput.value = state.buildName;
  engineLevelEl.textContent = shop.engine.level;
  tiresLevelEl.textContent = shop.tires.level;
  brakesLevelEl.textContent = shop.brakes.level;
  nitroLevelEl.textContent = shop.nitro.level;
  engineCostEl.textContent = getUpgradeCost('engine');
  tiresCostEl.textContent = getUpgradeCost('tires');
  brakesCostEl.textContent = getUpgradeCost('brakes');
  nitroCostEl.textContent = getUpgradeCost('nitro');
  premiumBadge.classList.toggle('hidden', !state.premiumAccess);

  previewPane.innerHTML = `
    <div class="car-sprite" style="--car-color: ${player.color};">
      <div class="car-body"></div>
      <div class="car-window"></div>
      <div class="headlight left"></div>
      <div class="headlight right"></div>
      <div class="taillight left"></div>
      <div class="taillight right"></div>
      <div class="car-spoiler ${player.spoiler}"></div>
      <div class="wheel front ${player.wheel}"></div>
      <div class="wheel rear ${player.wheel}"></div>
    </div>
  `;
  updateHUD();
}

function getUpgradeCost(type) {
  const base = shop[type].baseCost;
  return Math.max(80, Math.round(base * Math.pow(1.55, shop[type].level - 1)));
}

let overlayAction = 'start';

function setOverlay(message, buttonText, showRestart = false, detail = '', action = 'start') {
  overlayAction = action;
  overlayTitle.textContent = message;
  overlayText.textContent = detail || (showRestart ? 'Ready for your next race.' : 'Press START to begin your build and race.');
  startButton.textContent = buttonText;
  restartButton.classList.toggle('hidden', !showRestart);
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function resetRace() {
  state.score = 0;
  state.integrity = 3;
  state.progress = 0;
  state.trackSpeed = 3.2;
  state.raceFinished = false;
  state.gameOver = false;
  state.oilTimer = 0;
  state.obstacleTimer = 0;
  state.obstacleInterval = 1200;
  obstacles.length = 0;
  player.x = 380;
  player.y = 380;
  updateHUD();
}

function startRace() {
  resetRace();
  hideOverlay();
  state.playing = true;
  state.lastTime = performance.now();
}

function endRace(won) {
  state.playing = false;
  state.raceFinished = true;
  const rewardCredits = won ? 220 + Math.round(state.progress / 14) : 0;
  const rewardCoins = won ? 1 + Math.floor(shop.engine.level / 2) : 0;
  state.credits += rewardCredits;
  state.coins += rewardCoins;
  if (state.score > state.highScore) {
    state.highScore = state.score;
  }
  saveProgress();
  updateLeaderBoard();
  const detail = won
    ? `Earned ${rewardCredits} credits and ${rewardCoins} premium coins.`
    : 'Your build needs more tuning before the next run.';
  setOverlay(won ? 'Race Complete' : 'Build Crashed', won ? 'NEXT RUN' : 'TRY AGAIN', true, detail);
}

function spawnObstacle() {
  const lanes = [state.width / 2 - 170, state.width / 2 - 70, state.width / 2 + 30];
  const laneX = lanes[Math.floor(Math.random() * lanes.length)];
  const typeRoll = Math.random();
  const type = typeRoll < 0.18 ? 'rival' : typeRoll < 0.48 ? 'oil' : 'cone';
  const obstacle = {
    x: laneX,
    y: -90,
    width: type === 'rival' ? 58 : type === 'oil' ? 60 : 26,
    height: type === 'rival' ? 42 : type === 'oil' ? 18 : 30,
    speed: 0.8 + Math.random() * 0.8,
    type,
    hit: false,
  };
  obstacles.push(obstacle);
}

function collision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateEntities(dt) {
  if (!state.playing || state.paused || state.gameOver) return;

  const delta = dt / 16;
  const handling = 3.4 + shop.tires.level * 0.55;
  const forwardSpeed = 2.2 + shop.engine.level * 0.55;
  const nitroBoost = player.nitro.active ? 1.9 + shop.nitro.level * 0.25 : 0;
  state.trackSpeed = forwardSpeed + nitroBoost;

  if (state.keys.ArrowLeft || state.keys.a) player.x -= handling * delta;
  if (state.keys.ArrowRight || state.keys.d) player.x += handling * delta;
  if (state.keys.ArrowUp || state.keys.w) player.y -= 0.9 * delta;
  if (state.keys.ArrowDown || state.keys.s) player.y += 0.9 * delta;

  const roadLeft = state.width / 2 - 230;
  const roadRight = state.width / 2 + 190 - player.width;
  player.x = Math.max(roadLeft, Math.min(roadRight, player.x));
  player.y = Math.max(300, Math.min(state.height - player.height - 10, player.y));

  const shiftPressed = state.keys.ShiftLeft || state.keys.ShiftRight;
  if (shiftPressed && player.nitro.charge > 0) {
    player.nitro.active = true;
    player.nitro.charge = Math.max(0, player.nitro.charge - dt * 0.12);
  } else {
    player.nitro.active = false;
    player.nitro.charge = Math.min(100, player.nitro.charge + dt * 0.05);
  }

  obstacles.forEach((obstacle) => {
    obstacle.y += (state.trackSpeed + obstacle.speed) * delta;
  });

  obstacles.forEach((obstacle) => {
    if (!obstacle.hit && collision(player, obstacle)) {
      obstacle.hit = true;
      if (obstacle.type === 'cone') {
        state.integrity -= 1;
        state.score = Math.max(0, state.score - 18);
      } else if (obstacle.type === 'oil') {
        state.oilTimer = 1300;
      } else {
        state.integrity -= 1;
        state.score = Math.max(0, state.score - 30);
      }
    }
  });

  if (state.oilTimer > 0) {
    state.oilTimer -= dt;
  }

  const remaining = obstacles.filter((obstacle) => obstacle.y < state.height + 80);
  obstacles.splice(0, obstacles.length, ...remaining);

  state.obstacleTimer += dt;
  if (state.obstacleTimer > state.obstacleInterval) {
    state.obstacleTimer = 0;
    spawnObstacle();
    state.obstacleInterval = Math.max(760, state.obstacleInterval - 18);
  }

  state.progress += (state.trackSpeed + 1.2) * delta * 3;
  state.score += Math.round((state.trackSpeed + 1) * delta * 0.4);

  if (state.integrity <= 0) {
    state.gameOver = true;
    endRace(false);
  }

  if (state.progress >= state.raceDistance) {
    endRace(true);
  }

  updateHUD();
}

function drawScene() {
  ctx.clearRect(0, 0, state.width, state.height);
  drawTrack();
  drawObstacles();
  drawPlayer();
  drawDriverHud();
}

function drawTrack() {
  ctx.save();
  ctx.fillStyle = '#0b1321';
  ctx.fillRect(0, 0, state.width, state.height);

  const roadX = state.width / 2 - 230;
  const roadW = 460;
  ctx.fillStyle = '#141d34';
  ctx.fillRect(roadX, 0, roadW, state.height);

  ctx.fillStyle = '#1e2b4c';
  ctx.fillRect(roadX, 0, 20, state.height);
  ctx.fillRect(roadX + roadW - 20, 0, 20, state.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(state.width / 2, 0);
  ctx.lineTo(state.width / 2, state.height);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(8, player.height * 0.28);
  ctx.quadraticCurveTo(14, 4, player.width * 0.38, 4);
  ctx.lineTo(player.width * 0.72, 4);
  ctx.quadraticCurveTo(player.width - 8, 4, player.width, player.height * 0.24);
  ctx.lineTo(player.width, player.height * 0.74);
  ctx.quadraticCurveTo(player.width * 0.95, player.height, player.width * 0.78, player.height);
  ctx.lineTo(player.width * 0.18, player.height);
  ctx.quadraticCurveTo(10, player.height, 8, player.height * 0.74);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(player.width * 0.32, player.height * 0.22);
  ctx.lineTo(player.width * 0.68, player.height * 0.22);
  ctx.lineTo(player.width * 0.64, player.height * 0.4);
  ctx.lineTo(player.width * 0.36, player.height * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(10, player.height * 0.72, 12, 10);
  ctx.fillRect(player.width - 22, player.height * 0.72, 12, 10);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(8, player.height * 0.28, 10, 8);
  ctx.fillRect(player.width - 18, player.height * 0.28, 10, 8);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(14, player.height - 10, 6, 0, Math.PI * 2);
  ctx.arc(player.width - 14, player.height - 10, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.save();
    if (obstacle.type === 'cone') {
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
      ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obstacle.x + 6, obstacle.y + 8, obstacle.width - 12, 8);
    } else if (obstacle.type === 'oil') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obstacle.x + 8, obstacle.y + 10, 12, 6);
      ctx.fillRect(obstacle.x + obstacle.width - 20, obstacle.y + 10, 12, 6);
    }
    ctx.restore();
  });
}

function drawDriverHud() {
  ctx.save();
  const barWidth = 180;
  const left = 18;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(left, 18, barWidth, 18);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(left, 18, (player.nitro.charge / 100) * barWidth, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px Inter, sans-serif';
  ctx.fillText(`Nitro ${Math.round(player.nitro.charge)}%`, left + 8, 32);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(left, 46, barWidth, 14);
  ctx.fillStyle = state.oilTimer > 0 ? '#f97316' : '#22c55e';
  ctx.fillRect(left, 46, state.oilTimer > 0 ? (barWidth * (state.oilTimer / 1300)) : barWidth, 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = '500 11px Inter, sans-serif';
  ctx.fillText(state.oilTimer > 0 ? 'Handling reduced' : 'Grip stable', left + 8, 56);

  ctx.restore();
}

function loop(timestamp) {
  const dt = timestamp - state.lastTime;
  state.lastTime = timestamp;
  if (state.playing && !state.paused && !state.raceFinished) {
    updateEntities(dt);
  }
  drawScene();
  requestAnimationFrame(loop);
}

function handleKeyDown(event) {
  state.keys[event.key] = true;
  state.keys[event.code] = true;
  if (event.key === 'p' || event.key === 'P') {
    state.paused = !state.paused;
    if (state.paused) {
      setOverlay('Paused', 'RESUME', false, 'Press P again to continue the race.');
    } else {
      hideOverlay();
    }
  }
}

function handleKeyUp(event) {
  state.keys[event.key] = false;
  state.keys[event.code] = false;
}

function handleUpgrade(type) {
  const cost = getUpgradeCost(type);
  if (state.credits < cost) {
    setOverlay('Not Enough Credits', 'OK', false, 'Earn more credits by finishing races and tuning your build.', 'close');
    return;
  }
  if (shop[type].level >= 5) {
    setOverlay('Max Level', 'OK', false, 'This upgrade is fully tuned.', 'close');
    return;
  }
  state.credits -= cost;
  shop[type].level += 1;
  if (type === 'nitro') {
    player.nitro.charge = 100;
  }
  saveProgress();
  updateGarage();
  updateHUD();
}

function buyPremium() {
  if (state.premiumAccess) {
    setOverlay('Already Unlocked', 'OK', false, 'Pro Suite is already active. Enjoy premium parts.', 'close');
    return;
  }
  if (state.coins < 5) {
    setOverlay('Need More Coins', 'OK', false, 'Collect more premium coins by winning races.', 'close');
    return;
  }
  state.coins -= 5;
  state.premiumAccess = true;
  saveProgress();
  updateGarage();
  updateHUD();
  setOverlay('Pro Suite Unlocked', 'START RACE', false, 'Premium visuals and exclusive tuning are now available.');
}

function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem('viewMode', mode);
  document.body.classList.toggle('mobile-view', mode === 'mobile');
  desktopViewBtn.classList.toggle('active', mode === 'desktop');
  mobileViewBtn.classList.toggle('active', mode === 'mobile');
  resizeCanvas();
}

function initViewMode() {
  desktopViewBtn.addEventListener('click', () => setViewMode('desktop'));
  mobileViewBtn.addEventListener('click', () => setViewMode('mobile'));
  setViewMode(viewMode);
}

function initSelectors() {
  document.querySelectorAll('.color-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('premium') && !state.premiumAccess) {
        setOverlay('Pro Feature', 'OK', false, 'Unlock Pro Suite to select premium paint options.', 'close');
        return;
      }
      player.color = button.dataset.color;
      saveProgress();
      updateGarage();
    });
  });

  document.querySelectorAll('[data-wheel]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('premium') && !state.premiumAccess) {
        setOverlay('Pro Feature', 'OK', false, 'Unlock Pro Suite to equip premium wheels.', 'close');
        return;
      }
      player.wheel = button.dataset.wheel;
      saveProgress();
      updateGarage();
    });
  });

  document.querySelectorAll('[data-spoiler]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('premium') && !state.premiumAccess) {
        setOverlay('Pro Feature', 'OK', false, 'Unlock Pro Suite to equip premium spoilers.', 'close');
        return;
      }
      player.spoiler = button.dataset.spoiler;
      saveProgress();
      updateGarage();
    });
  });

  document.querySelectorAll('[data-upgrade]').forEach((button) => {
    button.addEventListener('click', () => {
      handleUpgrade(button.dataset.upgrade);
    });
  });

  buildNameInput.addEventListener('input', (event) => {
    state.buildName = event.target.value || 'Urban Racer';
    saveProgress();
    updateHUD();
  });

  buyPremiumButton.addEventListener('click', buyPremium);
}

startButton.addEventListener('click', () => {
  if (overlayAction === 'close') {
    hideOverlay();
    return;
  }
  if (!state.playing || state.gameOver || state.raceFinished) {
    startRace();
  } else if (state.paused) {
    state.paused = false;
    hideOverlay();
  }
});

restartButton.addEventListener('click', () => {
  startRace();
});

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const dimensions = viewMode === 'mobile' ? { width: 360, height: 640 } : { width: 800, height: 500 };
  canvas.width = dimensions.width * ratio;
  canvas.height = dimensions.height * ratio;
  canvas.style.width = '100%';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  state.width = dimensions.width;
  state.height = dimensions.height;
}

function init() {
  loadSave();
  initViewMode();
  initAuth();
  resizeCanvas();
  initSelectors();
  updateGarage();
  updateHUD();
  updateLeaderBoard();
  setOverlay('Ready for the rally?', 'START RACE', false, 'Build your ride, tune upgrades, and race through the city.');
  state.lastTime = performance.now();
  requestAnimationFrame(loop);
}

init();
