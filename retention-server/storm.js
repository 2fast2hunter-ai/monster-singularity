// Dimension Storm — deterministic weekly meta-shift event.
// Cycles through all 5 stability classes using ISO week number mod 5.
// Identical algorithm to src/game/storm.ts (client-side fallback).

const STABILITY_CLASSES = ['Stable', 'Volatile', 'Chaotic', 'Aberrant', 'Reality-Warping'];
const STORM_MULTIPLIER = 3;

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getMondayMidnightUTC(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = d.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setUTCDate(d.getUTCDate() + daysToMonday);
  return d;
}

function getCurrentStorm(now = new Date()) {
  const startedAt = getMondayMidnightUTC(now);
  const endsAt = new Date(startedAt.getTime() + 7 * 24 * 3600 * 1000);
  const isoWeek = getISOWeek(startedAt);
  const classIndex = isoWeek % STABILITY_CLASSES.length;
  return {
    activeStabilityClass: STABILITY_CLASSES[classIndex],
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    multiplier: STORM_MULTIPLIER,
  };
}

module.exports = { getCurrentStorm, STABILITY_CLASSES, STORM_MULTIPLIER };
