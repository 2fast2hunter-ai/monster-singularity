const express = require('express');
const path = require('path');
const db = require('./db');
const { runDecay, restoreAfterAd, hoursOffline, DECAY_THRESHOLD_HOURS } = require('./decay');
const { processLogin, claimDailyReward } = require('./streak');
const { getCurrentStorm } = require('./storm');

const app = express();
const PORT = process.env.PORT || 3200;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Player ───────────────────────────────────────────────────────────────────

app.get('/api/players/:id', (req, res) => {
  const player = db.getPlayer(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json(player);
});

app.post('/api/players', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  try {
    const player = db.createPlayer(id, name);
    res.json(player);
  } catch (e) {
    res.status(409).json({ error: 'Player already exists' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/players/:id/login
 *
 * 1. Check offline duration — run decay if > 48h
 * 2. Process streak state (reset if day missed)
 * 3. Update last_login_at
 * Returns: { decay, streak, ecosystem }
 */
app.post('/api/players/:id/login', (req, res) => {
  const playerId = req.params.id;
  const player = db.getPlayer(playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const hours = hoursOffline(player.last_login_at);

  // Decay calculated BEFORE updating last_login_at (uses old timestamp)
  const decayReport = runDecay(playerId);
  const streakState = processLogin(playerId);

  // Now stamp the login time
  db.upsertPlayer({ id: playerId, last_login_at: Math.floor(Date.now() / 1000) });

  const aliveMonsters = db.getMonsters(playerId, { aliveOnly: true, order: 'power_desc' });

  res.json({
    hoursOffline: Math.round(hours * 10) / 10,
    decayThresholdHours: DECAY_THRESHOLD_HOURS,
    decay: decayReport,
    streak: streakState,
    ecosystem: {
      aliveCount: aliveMonsters.length,
      monsters: aliveMonsters,
    },
  });
});

// ─── Ecosystem ────────────────────────────────────────────────────────────────

app.get('/api/players/:id/ecosystem', (req, res) => {
  const playerId = req.params.id;
  const monsters = db.getMonsters(playerId, { order: 'power_desc' });
  const lastDecay = db.getLastDecayEvent(playerId);
  res.json({ monsters, lastDecay: lastDecay || null });
});

/**
 * POST /api/players/:id/decay/simulate
 * Dev endpoint: backdates last_login_at to trigger decay on next login.
 * Body: { hoursAgo: 72 }
 */
app.post('/api/players/:id/decay/simulate', (req, res) => {
  const playerId = req.params.id;
  const hoursAgo = Number(req.body.hoursAgo) || 72;
  const fakePast = Math.floor(Date.now() / 1000) - hoursAgo * 3600;
  db.upsertPlayer({ id: playerId, last_login_at: fakePast });
  db.reviveAllMonsters(playerId);
  db.clearDecayEvents(playerId);
  res.json({
    ok: true,
    lastLoginSetTo: new Date(fakePast * 1000).toISOString(),
    hoursAgo,
  });
});

/**
 * POST /api/players/:id/decay/restore-ad
 * Called when player watches an ad — restores up to 30% of last decay victims.
 */
app.post('/api/players/:id/decay/restore-ad', (req, res) => {
  const result = restoreAfterAd(req.params.id);
  res.json(result);
});

// ─── Daily Streak ─────────────────────────────────────────────────────────────

app.get('/api/players/:id/streak', (req, res) => {
  const streak = db.getStreak(req.params.id);
  if (!streak) return res.status(404).json({ error: 'Streak not found' });
  res.json(streak);
});

/**
 * POST /api/players/:id/streak/claim
 * Called after ad watch. Marks today's capsule slot filled.
 */
app.post('/api/players/:id/streak/claim', (req, res) => {
  try {
    const result = claimDailyReward(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * POST /api/players/:id/streak/simulate-miss
 * Dev endpoint: sets last_claim_date to 3 days ago to trigger a streak reset on next login.
 */
app.post('/api/players/:id/streak/simulate-miss', (req, res) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 3);
  const threeAgo = d.toISOString().slice(0, 10);
  db.updateStreak(req.params.id, { last_claim_date: threeAgo, streak_count: 15 });
  res.json({ ok: true, lastClaimDateSetTo: threeAgo });
});

// ─── Inventory ────────────────────────────────────────────────────────────────

app.get('/api/players/:id/inventory', (req, res) => {
  res.json(db.getInventory(req.params.id));
});

// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Monster Singularity Retention Server running at http://localhost:${PORT}`);
});
