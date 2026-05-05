/**
 * Lightweight JSON file store — server-side persistence without native compilation.
 * All writes are synchronous and atomic (write-then-rename is overkill for prototype;
 * we just use JSON.stringify direct writes since this is a single-process dev server).
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'game-db.json');

const EMPTY_DB = {
  players: {},      // keyed by player id
  monsters: {},     // keyed by player id, array of monster objects
  decayEvents: {},  // keyed by player id, array of events
  streaks: {},      // keyed by player id
  inventory: {},    // keyed by player id, array of items
  _nextMonsterId: 1,
  _nextEventId: 1,
  _nextInventoryId: 1,
};

function load() {
  if (!fs.existsSync(DB_PATH)) return JSON.parse(JSON.stringify(EMPTY_DB));
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return JSON.parse(JSON.stringify(EMPTY_DB));
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ── Seed demo player ──────────────────────────────────────────────────────────

let _db = load();
if (!_db.players['demo-player']) {
  const now = Math.floor(Date.now() / 1000);
  _db.players['demo-player'] = { id: 'demo-player', name: 'Test Administrator', last_login_at: now, created_at: now };
  _db.streaks['demo-player'] = { player_id: 'demo-player', streak_count: 0, last_claim_date: null, last_login_date: null, gene_fragment_granted: false };
  _db.monsters['demo-player'] = [];
  _db.decayEvents['demo-player'] = [];
  _db.inventory['demo-player'] = [];

  const DEMO_MONSTERS = [
    { name: 'Grub Larvae',      species: 'grub_larvae',      power: 1 },
    { name: 'Mud Slime',        species: 'mud_slime',         power: 2 },
    { name: 'Spore Cloud',      species: 'spore_cloud',       power: 2 },
    { name: 'Tunnel Worm',      species: 'tunnel_worm',       power: 3 },
    { name: 'Shadow Bat',       species: 'shadow_bat',        power: 4 },
    { name: 'Plague Rat',       species: 'plague_rat',        power: 4 },
    { name: 'Iron Beetle',      species: 'iron_beetle',       power: 5 },
    { name: 'Void Leech',       species: 'void_leech',        power: 6 },
    { name: 'Bone Crawler',     species: 'bone_crawler',      power: 7 },
    { name: 'Tentacle Goliath', species: 'tentacle_goliath',  power: 20 },
  ];
  DEMO_MONSTERS.forEach(m => {
    _db.monsters['demo-player'].push({ id: _db._nextMonsterId++, player_id: 'demo-player', alive: true, ...m });
  });
  save(_db);
}

// ── Public API — mirrors better-sqlite3 semantics ─────────────────────────────

const db = {
  getPlayer(id) {
    const data = load();
    return data.players[id] || null;
  },
  upsertPlayer(player) {
    const data = load();
    data.players[player.id] = { ...data.players[player.id], ...player };
    save(data);
  },
  getMonsters(playerId, options = {}) {
    const data = load();
    let list = (data.monsters[playerId] || []);
    if (options.aliveOnly) list = list.filter(m => m.alive);
    if (options.order === 'power_asc') list = [...list].sort((a, b) => a.power - b.power);
    if (options.order === 'power_desc') list = [...list].sort((a, b) => b.power - a.power);
    return list;
  },
  setMonstersAlive(playerId, ids, alive) {
    const data = load();
    (data.monsters[playerId] || []).forEach(m => {
      if (ids.includes(m.id)) m.alive = alive;
    });
    save(data);
  },
  reviveAllMonsters(playerId) {
    const data = load();
    (data.monsters[playerId] || []).forEach(m => { m.alive = true; });
    save(data);
  },
  insertMonster(playerId, monster) {
    const data = load();
    if (!data.monsters[playerId]) data.monsters[playerId] = [];
    const m = { id: data._nextMonsterId++, player_id: playerId, alive: true, ...monster };
    data.monsters[playerId].push(m);
    save(data);
    return m;
  },
  getLastDecayEvent(playerId) {
    const data = load();
    const events = data.decayEvents[playerId] || [];
    return events.length ? events[events.length - 1] : null;
  },
  insertDecayEvent(playerId, event) {
    const data = load();
    if (!data.decayEvents[playerId]) data.decayEvents[playerId] = [];
    const e = { id: data._nextEventId++, player_id: playerId, monsters_restored: 0, ...event };
    data.decayEvents[playerId].push(e);
    save(data);
    return e;
  },
  updateDecayEventRestored(playerId, eventId, count) {
    const data = load();
    const events = data.decayEvents[playerId] || [];
    const ev = events.find(e => e.id === eventId);
    if (ev) ev.monsters_restored = count;
    save(data);
  },
  clearDecayEvents(playerId) {
    const data = load();
    data.decayEvents[playerId] = [];
    save(data);
  },
  getStreak(playerId) {
    const data = load();
    return data.streaks[playerId] || null;
  },
  updateStreak(playerId, patch) {
    const data = load();
    if (!data.streaks[playerId]) data.streaks[playerId] = { player_id: playerId, streak_count: 0, last_claim_date: null, last_login_date: null, gene_fragment_granted: false };
    Object.assign(data.streaks[playerId], patch);
    save(data);
  },
  getInventory(playerId) {
    const data = load();
    return data.inventory[playerId] || [];
  },
  insertInventoryItem(playerId, item) {
    const data = load();
    if (!data.inventory[playerId]) data.inventory[playerId] = [];
    const it = { id: data._nextInventoryId++, player_id: playerId, granted_at: Math.floor(Date.now() / 1000), quantity: 1, ...item };
    data.inventory[playerId].push(it);
    save(data);
    return it;
  },
  createPlayer(id, name) {
    const data = load();
    if (data.players[id]) throw new Error('Player already exists');
    const now = Math.floor(Date.now() / 1000);
    data.players[id] = { id, name, last_login_at: now, created_at: now };
    data.streaks[id] = { player_id: id, streak_count: 0, last_claim_date: null, last_login_date: null, gene_fragment_granted: false };
    data.monsters[id] = [];
    data.decayEvents[id] = [];
    data.inventory[id] = [];
    save(data);
    return data.players[id];
  },
};

module.exports = db;
