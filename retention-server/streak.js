const db = require('./db');

const STREAK_LENGTH = 30;
const GENE_FRAGMENT = { item_type: 'gene_fragment', item_name: 'Alpha Genome Shard' };

function todayUTC()     { return new Date().toISOString().slice(0, 10); }
function yesterdayUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Called on every player login. Resets streak if a day was missed.
 * Does NOT fill today's slot — that requires watching an ad.
 */
function processLogin(playerId) {
  const streak = db.getStreak(playerId);
  if (!streak) throw new Error(`No streak record for player ${playerId}`);

  const today = todayUTC();
  const yesterday = yesterdayUTC();
  let resetOccurred = false;

  if (streak.last_claim_date && streak.last_claim_date !== today && streak.last_claim_date !== yesterday) {
    db.updateStreak(playerId, { streak_count: 0 });
    streak.streak_count = 0;
    resetOccurred = true;
  }

  db.updateStreak(playerId, { last_login_date: today });

  const todayFilled = streak.last_claim_date === today;
  return {
    streakCount: streak.streak_count,
    streakLength: STREAK_LENGTH,
    lastClaimDate: streak.last_claim_date,
    todayFilled,
    canClaimToday: !todayFilled,
    resetOccurred,
    geneFragmentGranted: streak.gene_fragment_granted === true,
  };
}

/**
 * Called after an ad watch. Marks today's capsule slot filled and increments streak.
 * Grants Alpha Genome Shard on day 30 completion.
 */
function claimDailyReward(playerId) {
  const streak = db.getStreak(playerId);
  if (!streak) throw new Error(`No streak record for player ${playerId}`);

  const today = todayUTC();
  if (streak.last_claim_date === today) {
    return { alreadyClaimed: true, streakCount: streak.streak_count };
  }

  const newStreak = streak.streak_count + 1;
  db.updateStreak(playerId, { streak_count: newStreak, last_claim_date: today });

  let geneFragmentGranted = false;
  if (newStreak >= STREAK_LENGTH && !streak.gene_fragment_granted) {
    db.updateStreak(playerId, { gene_fragment_granted: true });
    db.insertInventoryItem(playerId, GENE_FRAGMENT);
    geneFragmentGranted = true;
  }

  return { alreadyClaimed: false, streakCount: newStreak, geneFragmentGranted, streakLength: STREAK_LENGTH };
}

module.exports = { processLogin, claimDailyReward, STREAK_LENGTH };
