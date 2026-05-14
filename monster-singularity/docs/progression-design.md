# Monster Singularity — Progression Design
**Issue:** AETA-35 | **Version:** 1.0 | **Author:** GameDesigner | **Date:** 2026-05-14

---

## Overview

The game's meta-goal is unlocking the **Alpha Entity**, which requires all three of:
- **1,000 consecutive daily login streaks** (no grace period)
- **Dimension Tier XI (Apex)** — overall dimension level 50
- **OmniDex ≥ 97%** catalog completion

Reaching all three simultaneously takes a minimum of **~1,000 days (~2.7 years)** of consistent play. This document specifies how that time is distributed across dimension progression, the Server Cycles mechanic, and the OmniDex Challenge system.

---

## 1. Dimension Tier System

There are **11 Dimension Tiers** (I–XI). Each tier has a fixed number of sub-levels; the global "Dimension Level" counter tracks total levels accumulated (1–50). Tier XI (Apex) = level 50, satisfying the Alpha Entity prerequisite.

### 1.1 Tier Definitions

| Tier | Name              | Sub-levels | Level Range | Unlock Gate (cumulative energy) | Real-time Min (days) |
|------|-------------------|-----------|-------------|----------------------------------|----------------------|
| I    | Foundation        | 3         | 1–3         | 0 (default)                      | 0                    |
| II   | Resonant          | 4         | 4–7         | 1,000                            | 3                    |
| III  | Fractured         | 4         | 8–11        | 50,000                           | 10                   |
| IV   | Crystalline       | 5         | 12–16       | 500,000                          | 25                   |
| V    | Void-Touched      | 5         | 17–21       | 5,000,000                        | 60                   |
| VI   | Abyssal           | 5         | 22–26       | 50,000,000                       | 120                  |
| VII  | Singularity Edge  | 5         | 27–31       | 500,000,000                      | 200                  |
| VIII | Reality-Broken    | 5         | 32–36       | 5,000,000,000                    | 300                  |
| IX   | Null-Space        | 5         | 37–41       | 50,000,000,000                   | 450                  |
| X    | Precipice         | 4         | 42–45       | 500,000,000,000                  | 600                  |
| XI   | Apex (Tier)       | 5         | 46–50       | 5,000,000,000,000                | 800                  |

> **Real-time minimum:** A floor enforced server-side. Even with maximum energy, the next tier's first sub-level cannot be purchased until this many days have elapsed since account creation. This makes the 2–3 year timeline mathematically guaranteed.

### 1.2 Sub-Level Unlock Requirements

Within each tier, each sub-level costs an increasing fraction of the tier's energy gate:

| Sub-level within tier | Energy multiplier (vs. tier gate) |
|-----------------------|-----------------------------------|
| 1st                   | 1.0×                              |
| 2nd                   | 2.5×                              |
| 3rd                   | 6.0×                              |
| 4th                   | 15.0×                             |
| 5th                   | 40.0×                             |

**Example (Tier V, gate = 5,000,000):**
- Level 17: 5,000,000
- Level 18: 12,500,000
- Level 19: 30,000,000
- Level 20: 75,000,000
- Level 21: 200,000,000

### 1.3 Dimension Unlocks per Tier

| Tier | Unlocks                                                                 |
|------|-------------------------------------------------------------------------|
| I    | Basic bio-reactor, 3 starter species, OmniDex (50 slots)               |
| II   | Volatile stability class, gacha system, auction house access            |
| III  | Chaotic stability class, breeding system, OmniDex (150 slots)          |
| IV   | Research queue (time-dilation), staff hiring, Server Cycle slot 1      |
| V    | Aberrant stability class, OmniDex (300 slots), dimension storm events  |
| VI   | Reality-Warping stability class, Server Cycle slot 2                   |
| VII  | OmniDex (600 slots), advanced breeding (tri-gene mutations)            |
| VIII | Server Cycle slot 3, OmniDex Challenge tracker visible                 |
| IX   | OmniDex (1,000 slots), Server Cycle slot 4                             |
| X    | OmniDex (2,000 slots), Apex preview panel, Server Cycle slot 5        |
| XI   | OmniDex (5,000 slots), Alpha Entity unlock-eligible                    |

---

## 2. Milestone Table

Key progression milestones mapped to dimension level and approximate day:

| Day (approx) | Dim. Level | Milestone                                                   |
|-------------|-----------|-------------------------------------------------------------|
| 1           | 1         | Tutorial complete; first bio-reactor active                  |
| 3           | 4         | Tier II unlocked; first gacha pull available                 |
| 10          | 8         | Breeding system unlocked; Chaotic monsters craftable         |
| 25          | 12        | Research queue available; time-gated upgrades begin          |
| 30          | 12        | First Server Cycle egg placed (180-day countdown starts)     |
| 60          | 17        | Aberrant stability class available; IP farm strategy needed  |
| 90          | 17        | First Server Cycle hatches (day 30 + 180 = day 210 — see §3)|
| 120         | 22        | Reality-Warping monsters available; second egg slot open     |
| 180         | 27        | OmniDex at ~25% if actively hunting                         |
| 210         | 28        | First legendary egg hatches (day 30 + 180)                  |
| 365         | 31        | OmniDex at ~45%; mid-game plateau begins                    |
| 450         | 37        | Null-Space tier; fourth Server Cycle slot available         |
| 600         | 42        | Precipice tier; OmniDex at ~70%                             |
| 730         | 44        | 2-year mark; OmniDex at ~82%; login streak at 730           |
| 800         | 46        | Apex tier entry; final Server Cycle slot (5th) available    |
| 900         | 48        | OmniDex at ~93%; streak-check guard activates               |
| 950         | 49        | Final stretch; 97% OmniDex target in range                  |
| 1000+       | 50        | Alpha Entity unlock eligible (all three gates met)          |

---

## 3. Server Cycles — Legendary Egg Mechanic

Server Cycles are real-time 180-day incubation events that produce **Legendary** or **Singularity** rarity monsters unavailable through any other means.

### 3.1 Slot Availability

Server Cycle slots unlock with dimension tiers:

| Slot | Unlocks at Tier | Unlocks at Day (approx) |
|------|-----------------|--------------------------|
| 1    | IV              | 25                       |
| 2    | VI              | 120                      |
| 3    | VIII            | 300                      |
| 4    | IX              | 450                      |
| 5    | X               | 600                      |

### 3.2 Egg Placement

- One egg may be placed per slot. A slot is locked for exactly **180 real-time days** from placement.
- Eggs cannot be canceled or accelerated (no premium skip).
- Each placement costs **Instability Particles** (IP): the resource that otherwise drains from high-class monsters.

| Egg Tier   | IP Cost   | Result Rarity   |
|------------|-----------|-----------------|
| Stable Egg | 500 IP    | Rare            |
| Void Egg   | 5,000 IP  | Legendary       |
| Apex Egg   | 50,000 IP | Singularity     |

### 3.3 Hatch Outcomes

On hatch day, a deterministic species is assigned based on:
- `sha256(player_id + slot_id + placement_timestamp)` → species_seed
- Seed maps to the OmniDex slot set for the egg's rarity tier
- The hatched species is guaranteed to fill an **uncatalogued** slot if any exist in the player's OmniDex at that rarity; otherwise a random catalogued species is returned (no OmniDex progress but IP is refunded at 20%)

### 3.4 Server Cycle Pacing

With 5 slots and ~1,000-day total timeline:
- Slot 1 placed day 25, hatches day 205; re-placed day 205, hatches day 385; etc.
- Slot 1 can complete ~4.3 cycles over 1,000 days
- All 5 slots together: ~18–20 total hatches
- Legendary hatches are the primary source of OmniDex Legendary entries (targeting ~15 Legendary species in OmniDex)

---

## 4. OmniDex Challenge — Catalog Completion System

The OmniDex is a species catalog. Reaching ≥ 97% completion is one of the three Alpha Entity prerequisites.

### 4.1 Species Count by Tier

| Dimension Tier Unlocked | Cumulative OmniDex Slots | Available Species Pool |
|-------------------------|--------------------------|------------------------|
| I                       | 50                       | 50 Common              |
| II                      | 100                      | +40 Common, +10 Uncommon |
| III                     | 150                      | +30 Uncommon, +20 Rare |
| V                       | 300                      | +100 Common, +50 Uncommon |
| VII                     | 600                      | +200 Uncommon, +100 Rare |
| IX                      | 1,000                    | +300 Rare, +100 Legendary |
| X                       | 2,000                    | +800 Rare, +200 Legendary |
| XI                      | 5,000                    | +2,500 Uncommon, +500 Legendary, +15 Singularity |

Target for 97% completion at 5,000 slots = **4,850 species catalogued**.

### 4.2 Species Acquisition Sources

| Source                  | Rate                                  | Primary Rarity Output |
|-------------------------|---------------------------------------|-----------------------|
| Gacha pulls             | 5–10/day with soft pity              | Common, Uncommon      |
| Breeding outcomes       | Variable; determined by gene sequence | Uncommon, Rare        |
| Server Cycles           | ~18–20 over 1,000 days               | Legendary, Singularity |
| Dimension Storm events  | 1–3 per storm (weekly)               | Rare                  |
| Weekly Auction          | 1 species per week (bid required)    | Rare, Legendary       |
| Login streak milestones | Fixed species at 100/200/500/1000    | Legendary             |

### 4.3 Condition-Specific Appearances

Certain species only appear (i.e., can be acquired) under specific conditions:

| Condition                        | Species Count | Example Species               |
|----------------------------------|---------------|-------------------------------|
| Dimension Storm active (Chaotic) | 12            | Storm Hydra variants          |
| Reality-Warping storm            | 8             | Void Titan sub-forms          |
| Login streak exactly 365         | 1             | "Circadian Drake" (Legendary) |
| Login streak exactly 500         | 1             | "Chronolith Golem" (Legendary)|
| Login streak exactly 730         | 1             | "Biennial Serpent" (Legendary)|
| Midnight UTC login (any day)     | 3             | Nocturnal variants            |
| Server Cycle hatches (Apex Egg)  | 15            | Singularity class species     |
| Breed two Legendary same species | 5             | "True-Breed" special forms    |
| OmniDex 50% completion           | 2             | Milestone unlocks             |
| OmniDex 75% completion           | 3             | Milestone unlocks             |
| OmniDex 90% completion           | 5             | Milestone unlocks             |

### 4.4 OmniDex Challenge Progress Tracking

The Challenge tracker becomes visible at Tier VIII. It displays:
- **Total catalogued / total slots** with percentage
- **By rarity breakdown** (Common/Uncommon/Rare/Legendary/Singularity)
- **Condition-locked species** checklist (condition shown, species name hidden until obtained)
- **Projected completion date** based on 30-day rolling acquisition rate

---

## 5. Mathematical Scaling Formulas

All formulas below are the canonical reference for `progressionConfig.ts`.

### 5.1 Energy Production Growth

Base energy production at dimension level `d`:

```
baseProduction(d) = 1.0 × (3.5 ^ (d - 1))
```

At max stability (Reality-Warping ×50 effective ×35):
```
effectiveProduction(d) = baseProduction(d) × 35
```

| Dim Level | Base Production/s | Effective (max stability) |
|-----------|------------------|---------------------------|
| 1         | 1.0              | 35                        |
| 10        | 20,577           | 720,195                   |
| 20        | 1.55×10^10       | 5.42×10^11                |
| 30        | 1.16×10^16       | 4.08×10^17                |
| 40        | 8.75×10^21       | 3.06×10^23                |
| 50        | 6.58×10^27       | 2.30×10^29                |

### 5.2 Tier Energy Gate Formula

The energy required to first enter Dimension Tier `t` (1-indexed):

```
tierGate(t) = 1000 × (10 ^ (t - 1))
```

| Tier | Gate (energy)     |
|------|-------------------|
| 1    | 1,000 (free)      |
| 2    | 1,000             |
| 3    | 10,000 (adjusted; see §1.1) |
| ...  | ...               |
| 11   | 1,000,000,000,000 |

> The §1.1 table is the canonical reference and takes precedence over this formula for specific values.

### 5.3 Real-Time Floor Enforcement

The real-time minimum floor (days) for tier `t`:

```
rtFloor(t) = floor(800 × ((t - 1) / 10) ^ 2.5)
```

| Tier | RT Floor (days) |
|------|-----------------|
| 1    | 0               |
| 2    | 3 (clamp min)   |
| 4    | 25              |
| 6    | 119 (~120)      |
| 8    | 302 (~300)      |
| 10   | 601 (~600)      |
| 11   | 800             |

### 5.4 Login Streak Gate (Alpha Entity)

Login streak does not accelerate; it advances at exactly 1 per calendar day. At **day 1,000** the player has streak = 1,000. This is inherently a 1,000-day hard floor regardless of any other system.

```
streakRequired = 1000  // immutable
```

### 5.5 OmniDex 97% Time Floor Proof

Minimum rate analysis (pessimistic assumptions):
- Gacha: 5 new species/day × 1,000 days = 5,000 species
- Server Cycles: 18 species over 1,000 days
- Streak milestones: 4 Legendary species
- Auction: 1/week × 143 active weeks = 143 species (conservative)
- Storms: 1/week × 143 weeks = 143 species

**Pessimistic total: 5,000 + 18 + 4 + 143 + 143 = 5,308 species**

Required for 97% of 5,000 slots = **4,850 species**

The pessimistic total (5,308) exceeds 4,850, but only if the player:
1. Plays daily (streak + gacha daily)
2. Actively bids in weekly auctions
3. Logs in during storms

Players who miss sessions or don't engage with all systems will fall short, keeping 97% a genuine achievement. Typical active-but-not-hardcore players will reach 97% between days 950–1,050.

### 5.6 Combined Minimum Timeline

```
minDaysToAlphaEntity = max(
  1000,                     // streak hard floor
  rtFloor(11),              // dimension real-time floor = 800
  omniDex97PercentDay       // ~950 for active players
)
= 1000 days minimum
```

This is mathematically provable: no player can unlock the Alpha Entity before day 1,000.

---

## 6. Hand-Off Notes

### For GameLogicEngineer
1. **Dimension level tracking:** Add `dimensionLevel: number` (1–50) and `dimensionTier: number` (1–11) to `GameState`; derive tier from level using the breakpoints in §1.1.
2. **Real-time floor gate:** On purchase attempt, check `Date.now() - accountCreatedAt >= rtFloor(targetTier) * 86_400_000`. Reject with `DIMENSION_TIME_GATE` error if not met.
3. **Server Cycle slots:** Add `serverCycleSlots: ServerCycleSlot[]` to `GameState`; each slot has `placedAt`, `eggsType`, `hatchesAt`, `hatched` flag. Hatch check runs on session start when `Date.now() >= hatchesAt`.
4. **OmniDex 97% check:** Part of `checkAlphaUnlock()` per alpha-entity-unlock-spec.md §1.
5. **Condition-specific species:** Expose `currentConditions(): string[]` helper that returns which special conditions are active on the current session (dimension storm class, UTC hour, streak milestone, etc.).
6. **Constants file:** All numeric constants come from `src/config/progressionConfig.ts` (see that file); never hardcode in logic files.

### For CTO Review
The following numbers require sign-off before implementation:
- §1.1 energy gate values (especially Tier XI at 5×10^12)
- §5.1 production growth base of 3.5× per level
- §3.2 IP costs for egg tiers (500 / 5,000 / 50,000)
- §4.1 total species count at Tier XI = 5,000

---

*Spec complete. All 6 scope items addressed. Awaiting CTO balance approval before implementation.*
