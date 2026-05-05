const PLAYER_ID = 'demo-player';
let pendingAdAction = null; // 'streak' or 'decay'
let adTimer = null;

function log(msg) {
  const el = document.getElementById('log');
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.prepend(line);
}

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  return r.json();
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function doLogin() {
  log('Logging in...');
  const data = await api('POST', `/api/players/${PLAYER_ID}/login`);
  log(`Login complete. Hours offline: ${data.hoursOffline}`);

  document.getElementById('hours-offline').textContent = `${data.hoursOffline}h`;
  document.getElementById('alive-count').textContent = data.ecosystem.aliveCount;

  renderMonsters(data.ecosystem.monsters);
  renderDecayAlert(data);
  renderStreak(data.streak);

  // Refresh inventory in case gene fragment was granted
  refreshInventory();
}

function renderMonsters(monsters) {
  const list = document.getElementById('monster-list');
  list.innerHTML = '';

  // Show all monsters (alive and dead) from ecosystem endpoint
  api('GET', `/api/players/${PLAYER_ID}/ecosystem`).then(data => {
    list.innerHTML = '';
    (data.monsters || []).forEach(m => {
      const row = document.createElement('div');
      row.className = `monster-row ${m.alive ? 'alive' : 'dead'}`;
      row.innerHTML = `
        <span>${m.name}</span>
        <span class="power-badge">⚡${m.power}</span>
      `;
      list.appendChild(row);
    });
  });
}

function renderDecayAlert(data) {
  const el = document.getElementById('decay-alert');
  if (!data.decay) {
    el.innerHTML = `<div class="alert blue" style="margin-top:10px">
      No decay — offline for ${data.hoursOffline}h (threshold: ${data.decayThresholdHours}h)
    </div>`;
    // Hide restore button state
    return;
  }

  const d = data.decay;
  el.innerHTML = `
    <div class="alert" style="margin-top:10px">
      <strong>⚠️ Ecosystem Decay Triggered!</strong><br/>
      Offline for ${d.hoursOffline}h — ${d.consumed.length} monster(s) consumed:<br/>
      ${d.consumed.map(m => `• ${m.name} (⚡${m.power})`).join('<br/>')}
      <br/><br/>
      <button class="btn btn-ad btn-sm" onclick="openAdModal('decay')">
        Watch Ad — Restore 30%
      </button>
    </div>`;

  log(`DECAY: ${d.consumed.length} monsters lost after ${d.hoursOffline}h offline`);
}

// ── Streak / Capsule ──────────────────────────────────────────────────────────

function renderStreak(streak) {
  document.getElementById('streak-count').textContent = streak.streakCount;
  document.getElementById('days-remaining').textContent = Math.max(0, streak.streakLength - streak.streakCount);

  const grid = document.getElementById('capsule-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= streak.streakLength; i++) {
    const slot = document.createElement('div');
    slot.className = 'capsule-slot';

    const filled = i <= streak.streakCount;
    const isToday = i === streak.streakCount + 1 && streak.canClaimToday;
    const isReward = i === streak.streakLength;

    if (filled) slot.classList.add('filled');
    if (isToday) slot.classList.add('today');
    if (isReward && !filled) slot.classList.add('reward');

    slot.textContent = isReward ? '★' : i;
    slot.title = isReward ? 'Day 30: Alpha Genome Shard' : `Day ${i}`;
    grid.appendChild(slot);
  }

  const alertEl = document.getElementById('streak-alert');
  if (streak.resetOccurred) {
    alertEl.innerHTML = `<div class="alert" style="margin-top:10px">
      💀 Streak reset — you missed a day! Start over from Day 1.
    </div>`;
    log('STREAK RESET — missed a day');
  } else if (streak.geneFragmentGranted) {
    alertEl.innerHTML = `<div class="alert green" style="margin-top:10px">
      🧬 30-day streak complete! Alpha Genome Shard granted!
    </div>`;
  } else {
    alertEl.innerHTML = '';
  }

  const btn = document.getElementById('watch-ad-btn');
  btn.disabled = !streak.canClaimToday;
  btn.textContent = streak.todayFilled ? '✓ Today Claimed' : 'Watch Ad — Claim Today';
}

async function refreshInventory() {
  const items = await api('GET', `/api/players/${PLAYER_ID}/inventory`);
  const el = document.getElementById('inventory-display');
  if (items.length === 0) { el.textContent = ''; return; }
  el.innerHTML = '<strong>Inventory:</strong> ' + items.map(i => `${i.item_name} ×${i.quantity}`).join(', ');
}

// ── Simulations ───────────────────────────────────────────────────────────────

async function simulate(hoursAgo) {
  await api('POST', `/api/players/${PLAYER_ID}/decay/simulate`, { hoursAgo });
  log(`Simulated ${hoursAgo}h offline. Click Login to trigger decay.`);
  document.getElementById('hours-offline').textContent = `~${hoursAgo}h (simulated)`;
  document.getElementById('decay-alert').innerHTML = `
    <div class="alert blue" style="margin-top:10px">
      Last login backdated by ${hoursAgo}h. Click <strong>Login</strong> to trigger decay.
    </div>`;
  // Refresh monster list
  renderMonsters([]);
}

async function simulateMiss() {
  await api('POST', `/api/players/${PLAYER_ID}/streak/simulate-miss`);
  log('Simulated missed day (streak was at 15, last claim set to 3 days ago). Click Login to reset.');
  document.getElementById('streak-alert').innerHTML = `
    <div class="alert blue" style="margin-top:10px">
      Simulated missed day. Streak was set to 15 with an old claim date. Click <strong>Login</strong> to see reset.
    </div>`;
}

// ── Ad Modal ──────────────────────────────────────────────────────────────────

function openAdModal(action) {
  pendingAdAction = action;
  document.getElementById('ad-modal').classList.add('open');
  document.getElementById('ad-skip-btn').style.display = 'none';
  let seconds = 5;
  document.getElementById('ad-timer').textContent = seconds;

  adTimer = setInterval(() => {
    seconds--;
    document.getElementById('ad-timer').textContent = seconds;
    if (seconds <= 0) {
      clearInterval(adTimer);
      document.getElementById('ad-timer').textContent = '✓';
      document.getElementById('ad-skip-btn').style.display = 'inline-block';
    }
  }, 1000);
}

async function onAdComplete() {
  clearInterval(adTimer);
  document.getElementById('ad-modal').classList.remove('open');
  log(`Ad watched (simulated). Action: ${pendingAdAction}`);

  if (pendingAdAction === 'streak') {
    const result = await api('POST', `/api/players/${PLAYER_ID}/streak/claim`);
    log(`Streak claimed. New streak: ${result.streakCount}. Gene fragment: ${result.geneFragmentGranted}`);
    renderStreak({
      streakCount: result.streakCount,
      streakLength: result.streakLength,
      canClaimToday: false,
      todayFilled: true,
      resetOccurred: false,
      geneFragmentGranted: result.geneFragmentGranted,
    });
    if (result.geneFragmentGranted) refreshInventory();
  } else if (pendingAdAction === 'decay') {
    const result = await api('POST', `/api/players/${PLAYER_ID}/decay/restore-ad`);
    log(`Decay restore: ${result.restored} monster(s) revived`);
    document.getElementById('decay-alert').innerHTML += `
      <div class="alert green" style="margin-top:8px">
        ✓ ${result.restored} monster(s) restored via ad watch.
      </div>`;
    renderMonsters([]);
    const eco = await api('GET', `/api/players/${PLAYER_ID}/ecosystem`);
    document.getElementById('alive-count').textContent =
      eco.monsters.filter(m => m.alive).length;
  }

  pendingAdAction = null;
}

// Close modal on backdrop click
document.getElementById('ad-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('ad-modal')) {
    clearInterval(adTimer);
    document.getElementById('ad-modal').classList.remove('open');
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

doLogin();
