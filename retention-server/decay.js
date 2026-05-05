const db = require('./db');

const DECAY_THRESHOLD_HOURS = 48;
const DECAY_RATE_PER_HOUR = 0.02;  // 2% of alive monsters per hour past threshold
const MAX_DECAY_FRACTION = 0.85;   // never wipe more than 85%

function hoursOffline(lastLoginAt) {
  return (Math.floor(Date.now() / 1000) - lastLoginAt) / 3600;
}

/**
 * Runs ecosystem decay if player has been offline > 48h.
 * Stronger monsters survive; weakest are consumed first.
 * Server-authoritative: uses stored last_login_at, so server downtime doesn't help.
 */
function runDecay(playerId) {
  const player = db.getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const hours = hoursOffline(player.last_login_at);
  if (hours <= DECAY_THRESHOLD_HOURS) return null;

  const hoursOver = hours - DECAY_THRESHOLD_HOURS;
  const decayFraction = Math.min(hoursOver * DECAY_RATE_PER_HOUR, MAX_DECAY_FRACTION);

  const alive = db.getMonsters(playerId, { aliveOnly: true, order: 'power_asc' });
  if (alive.length === 0) return null;

  const consumeCount = Math.max(1, Math.floor(alive.length * decayFraction));
  const toConsume = alive.slice(0, consumeCount);
  const consumed = toConsume.map(m => ({ id: m.id, name: m.name, species: m.species, power: m.power }));

  db.setMonstersAlive(playerId, consumed.map(m => m.id), false);

  const event = db.insertDecayEvent(playerId, {
    triggered_at: Math.floor(Date.now() / 1000),
    hours_offline: hours,
    monsters_consumed: consumed.length,
    detail: consumed,
  });

  return {
    eventId: event.id,
    hoursOffline: Math.round(hours * 10) / 10,
    decayFraction: Math.round(decayFraction * 1000) / 1000,
    consumed,
    surviving: alive.length - consumed.length,
  };
}

/**
 * Restores up to 30% of most recently consumed monsters after an ad watch.
 */
function restoreAfterAd(playerId) {
  const event = db.getLastDecayEvent(playerId);
  if (!event || event.monsters_restored > 0) {
    return { restored: 0, message: 'Nothing to restore or already restored.' };
  }

  const consumed = event.detail;
  const restoreCount = Math.max(1, Math.ceil(consumed.length * 0.30));
  const toRestore = consumed.slice(0, restoreCount);

  db.setMonstersAlive(playerId, toRestore.map(m => m.id), true);
  db.updateDecayEventRestored(playerId, event.id, restoreCount);

  return { restored: restoreCount, monsters: toRestore };
}

module.exports = { runDecay, restoreAfterAd, hoursOffline, DECAY_THRESHOLD_HOURS };
