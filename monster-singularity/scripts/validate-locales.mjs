#!/usr/bin/env node
/**
 * Locale string validation script.
 *
 * Checks all locale JSON files against the English reference (en.json) for:
 *   1. Missing keys — locale is missing a key present in en.json
 *   2. Extra keys  — locale has keys not in en.json (drift / dead strings)
 *   3. Over-length strings — translated string exceeds the allowed character limit
 *   4. Placeholder mismatch — translated string is missing or adds {placeholders}
 *                             that differ from the reference
 *
 * Length limits are determined by key suffix convention:
 *   _tab, _button, _link  → 30 chars
 *   _title                → 80 chars
 *   _label, _placeholder  → 60 chars
 *   _toast, _warning, _hint, _subtitle → 150 chars
 *   (default)             → 300 chars
 *
 * Usage:
 *   node scripts/validate-locales.mjs [--strict]
 *
 * Exit code 0 = all checks pass
 * Exit code 1 = errors found (missing keys / placeholder mismatches)
 * Exit code 2 = warnings only (over-length strings, extra keys) with --strict
 *
 * With --strict, over-length and extra-key warnings also exit 1.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = resolve(__dirname, '../src/locales');
const REFERENCE_LOCALE = 'en';
const STRICT = process.argv.includes('--strict');

// ── Length limit table ──────────────────────────────────────────────────────
// Each entry: [test(fullKey), limit]
const LENGTH_LIMITS = [
  // Tab names and short UI labels
  [k => /^tabs\./.test(k) || /\.(?:button|link)$/.test(k), 30],
  // Titles
  [k => /\.(?:title|modal_title)$/.test(k), 80],
  // Labels and placeholders
  [k => /\.(?:label|placeholder)$/.test(k), 60],
  // Toasts and banners
  [k => /\.(?:toast|warning|hint|subtitle|banner_active|banner_subtitle)$/.test(k), 150],
];
const DEFAULT_LIMIT = 300;

function limitForKey(key) {
  for (const [test, limit] of LENGTH_LIMITS) {
    if (test(key)) return limit;
  }
  return DEFAULT_LIMIT;
}

// ── Placeholder extraction ──────────────────────────────────────────────────
function extractPlaceholders(str) {
  const matches = str.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g);
  return new Set(matches ?? []);
}

// ── Flatten nested JSON to dot-paths ───────────────────────────────────────
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, path));
    } else {
      out[path] = String(v);
    }
  }
  return out;
}

// ── Load all locale files ───────────────────────────────────────────────────
function loadLocales() {
  const files = readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  const locales = {};
  for (const file of files) {
    const code = file.replace('.json', '');
    const raw = readFileSync(join(LOCALES_DIR, file), 'utf8');
    try {
      locales[code] = flatten(JSON.parse(raw));
    } catch (err) {
      console.error(`ERROR  [${code}] Invalid JSON: ${err.message}`);
      process.exit(1);
    }
  }
  return locales;
}

// ── Main ───────────────────────────────────────────────────────────────────
const locales = loadLocales();

if (!locales[REFERENCE_LOCALE]) {
  console.error(`ERROR  Reference locale '${REFERENCE_LOCALE}.json' not found in ${LOCALES_DIR}`);
  process.exit(1);
}

const reference = locales[REFERENCE_LOCALE];
const refKeys = new Set(Object.keys(reference));

let errors = 0;
let warnings = 0;

function error(msg) { console.error(`ERROR  ${msg}`); errors++; }
function warn(msg)  { console.warn(`WARN   ${msg}`);  warnings++; }
function info(msg)  { console.log(`OK     ${msg}`); }

for (const [locale, strings] of Object.entries(locales)) {
  if (locale === REFERENCE_LOCALE) continue;

  const localeKeys = new Set(Object.keys(strings));
  let localeErrors = 0;
  let localeWarns = 0;

  // 1. Missing keys
  for (const key of refKeys) {
    if (!localeKeys.has(key)) {
      error(`[${locale}] Missing key: ${key}`);
      localeErrors++;
    }
  }

  // 2. Extra keys (dead strings)
  for (const key of localeKeys) {
    if (!refKeys.has(key)) {
      warn(`[${locale}] Extra key not in en.json: ${key}`);
      localeWarns++;
    }
  }

  // 3 & 4. Length and placeholder checks for present keys
  for (const key of refKeys) {
    if (!localeKeys.has(key)) continue; // already reported as missing

    const refVal = reference[key];
    const locVal = strings[key];
    const limit = limitForKey(key);

    // Length check
    if (locVal.length > limit) {
      warn(`[${locale}] Over-length (${locVal.length} > ${limit} chars): ${key} = "${locVal.slice(0, 60)}…"`);
      localeWarns++;
    }

    // Placeholder check
    const refPlaceholders = extractPlaceholders(refVal);
    const locPlaceholders = extractPlaceholders(locVal);

    const missing = [...refPlaceholders].filter(p => !locPlaceholders.has(p));
    const extra   = [...locPlaceholders].filter(p => !refPlaceholders.has(p));

    if (missing.length > 0) {
      error(`[${locale}] Missing placeholders in ${key}: ${missing.join(', ')} (ref: "${refVal}")`);
      localeErrors++;
    }
    if (extra.length > 0) {
      error(`[${locale}] Extra placeholders in ${key}: ${extra.join(', ')} (ref: "${refVal}")`);
      localeErrors++;
    }
  }

  if (localeErrors === 0 && localeWarns === 0) {
    info(`[${locale}] All checks passed (${localeKeys.size} keys)`);
  }
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log('');
console.log(`Locales checked: ${Object.keys(locales).length - 1} (reference: ${REFERENCE_LOCALE})`);
console.log(`Errors: ${errors}  Warnings: ${warnings}`);

if (errors > 0) {
  console.error('\nValidation FAILED — errors must be fixed before release.');
  process.exit(1);
}

if (STRICT && warnings > 0) {
  console.error('\nValidation FAILED — warnings treated as errors in --strict mode.');
  process.exit(1);
}

if (warnings > 0) {
  console.warn('\nValidation passed with warnings. Run with --strict to treat these as errors.');
}

console.log('\nValidation PASSED.');
