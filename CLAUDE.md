# Cookie Clicker — Complete Game Design Reference

> **Purpose:** Single source of truth for recreating Cookie Clicker (by Orteil) from scratch.
> Every formula, data table, and system mechanic needed for a full implementation.

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Number System](#2-number-system)
3. [Core Game Loop](#3-core-game-loop)
4. [Buildings](#4-buildings)
5. [Upgrade System](#5-upgrade-system)
6. [CPS Calculation Pipeline](#6-cps-calculation-pipeline)
7. [Click Value Calculation](#7-click-value-calculation)
8. [Golden Cookies](#8-golden-cookies)
9. [Prestige & Ascension](#9-prestige--ascension)
10. [Grandmapocalypse](#10-grandmapocalypse)
11. [Seasonal Events](#11-seasonal-events)
12. [Sugar Lumps](#12-sugar-lumps)
13. [Wrinklers](#13-wrinklers)
14. [Milk & Achievements](#14-milk--achievements)
15. [Dragon (Krumblor)](#15-dragon-krumblor)
16. [Minigames](#16-minigames)
17. [News Ticker & Fortunes](#17-news-ticker--fortunes)
18. [Save System](#18-save-system)

---

## 1. Project Overview & Architecture

### Recommended Tech Stack

| Layer       | Technology                      |
| ----------- | ------------------------------- |
| Language    | TypeScript (strict mode)        |
| Rendering   | HTML5 DOM + CSS (UI), Canvas (particles/effects) |
| Build       | Vite                            |
| State       | Plain objects + Observer pattern |
| Persistence | localStorage (Base64 encoded)   |

### Folder Structure

```
src/
  main.ts              # Entry point, game loop
  state.ts             # Game state interface & defaults
  systems/
    buildings.ts        # Building registry, purchase, CPS
    upgrades.ts         # Upgrade registry, unlock checks, effects
    clicks.ts           # Click handler, click value calc
    cps.ts              # Full CPS pipeline
    golden.ts           # Golden cookie spawning & effects
    prestige.ts         # Ascension, heavenly chips
    grandmapocalypse.ts # Research, stages, elder actions
    seasons.ts          # Seasonal event logic
    lumps.ts            # Sugar lump growth & harvesting
    wrinklers.ts        # Wrinkler spawning, withering, popping
    dragon.ts           # Krumblor training & auras
    milk.ts             # Achievement milk calculation
    minigames/
      pantheon.ts
      grimoire.ts
      garden.ts
      market.ts
    ticker.ts           # News ticker & fortune upgrades
    save.ts             # Save/load/export/import
  data/
    buildings.json      # Static building definitions
    upgrades.json       # Static upgrade definitions
    achievements.json   # Achievement definitions
  ui/
    renderer.ts         # DOM updates
    particles.ts        # Canvas click particles
    notifications.ts    # Popups, golden cookie effects
  utils/
    format.ts           # Number formatting
    math.ts             # Geometric series, etc.
```

### Key Design Patterns

- **Pipeline:** CPS calculation flows through an ordered chain of multiplier steps
- **Registry:** Buildings, upgrades, and achievements stored in indexed maps for O(1) lookup
- **Observer:** State changes emit events; UI subscribes and re-renders only affected elements
- **Delta-time accumulator:** Fixed 30 FPS logic tick with variable render frame

### Game Loop

```ts
const TICK_RATE = 1000 / 30; // ~33.33ms per tick
let lastTime = performance.now();
let accumulator = 0;

function gameLoop(now: number) {
  const delta = now - lastTime;
  lastTime = now;
  accumulator += delta;

  while (accumulator >= TICK_RATE) {
    update(TICK_RATE / 1000); // pass deltaSeconds
    accumulator -= TICK_RATE;
  }

  render();
  requestAnimationFrame(gameLoop);
}
```

---

## 2. Number System

### Precision

JavaScript `number` type (IEEE 754 double): safe up to ~1.8e308. No BigInt needed — Cookie Clicker uses standard doubles.

### Display Formatting

| Threshold  | Name            | Example          |
| ---------- | --------------- | ---------------- |
| 1e6        | million         | 1.234 million    |
| 1e9        | billion         | 5.678 billion    |
| 1e12       | trillion        | 2.345 trillion   |
| 1e15       | quadrillion     | 9.012 quadrillion |
| 1e18       | quintillion     | 3.456 quintillion |
| 1e21       | sextillion      | 7.890 sextillion |
| 1e24       | septillion      | 1.234 septillion |
| 1e27       | octillion       | 5.678 octillion  |
| 1e30       | nonillion       | 2.345 nonillion  |
| 1e33       | decillion       | 9.012 decillion  |
| 1e36       | undecillion     | 3.456 undecillion |
| 1e39       | duodecillion    | 7.890 duodecillion |
| 1e42       | tredecillion    | 1.234 tredecillion |
| 1e45       | quattuordecillion | 5.678 quattuordecillion |
| 1e48       | quindecillion   | 2.345 quindecillion |
| 1e51       | sexdecillion    | 9.012 sexdecillion |
| 1e54       | septendecillion | 3.456 septendecillion |
| 1e57       | octodecillion   | 7.890 octodecillion |
| 1e60       | novemdecillion  | 1.234 novemdecillion |
| 1e63       | vigintillion    | 5.678 vigintillion |
| > 1e66     | Scientific      | 1.234e69         |

### Formatting Rules

```ts
function formatNumber(n: number): string {
  if (n < 1e6) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n >= 1e66) return n.toExponential(3);
  // Find highest matching suffix
  const suffixIndex = Math.floor(Math.log10(n) / 3) - 2; // 0 = million
  const divisor = Math.pow(10, (suffixIndex + 2) * 3);
  return (n / divisor).toFixed(3) + ' ' + SUFFIXES[suffixIndex];
}
```

---

## 3. Core Game Loop

### Game State (Key Fields)

```ts
interface GameState {
  cookies: number;              // Current cookie count (spendable)
  cookiesBaked: number;         // All-time cookies baked (this ascension)
  cookiesBakedAllTime: number;  // All-time cookies baked (all ascensions)
  cps: number;                  // Computed cookies per second
  cpc: number;                  // Computed cookies per click
  clickCount: number;           // Total clicks this ascension
  buildings: BuildingState[];   // Array of 20 building states
  upgrades: Set<number>;        // Purchased upgrade IDs
  achievements: Set<number>;    // Unlocked achievement IDs
  prestigeLevel: number;        // Current prestige level
  heavenlyChips: number;        // Spendable heavenly chips
  heavenlyUpgrades: Set<number>;
  lumps: number;                // Sugar lumps held
  lumpRipeTime: number;        // Timestamp when current lump ripens
  dragonLevel: number;
  dragonAura1: number;
  dragonAura2: number;
  season: string;               // '' | 'christmas' | 'easter' | 'halloween' | 'valentines' | 'fools'
  grandmapocalypse: number;     // 0=dormant, 1=awoken, 2=displeased, 3=angered
  pledgeTimer: number;
  wrinklers: WrinklerState[];
  buffs: Buff[];                // Active golden cookie buffs
  // ... minigame sub-states
}
```

### Tick Logic

```ts
function update(dt: number) {
  // 1. Update buff timers, remove expired
  updateBuffs(dt);

  // 2. Calculate current CPS (full pipeline)
  state.cps = calculateCPS(state);

  // 3. Earn cookies (accounting for wrinkler withering)
  const effectiveCPS = getEffectiveCPS(state); // CPS after wrinkler drain
  const earned = effectiveCPS * dt;
  state.cookies += earned;
  state.cookiesBaked += earned;
  state.cookiesBakedAllTime += earned;

  // 4. Feed wrinklers their share
  feedWrinklers(state, dt);

  // 5. Golden cookie spawn timer
  updateGoldenCookieTimer(dt);

  // 6. Sugar lump growth
  updateLumps(dt);

  // 7. Reindeer timer (if Christmas season)
  if (state.season === 'christmas') updateReindeer(dt);

  // 8. Minigame ticks
  updateMinigames(dt);

  // 9. Check unlock conditions (upgrades, achievements)
  checkUnlocks(state);
}
```

### Click Handler

```ts
function handleClick() {
  const value = calculateClickValue(state);
  state.cookies += value;
  state.cookiesBaked += value;
  state.cookiesBakedAllTime += value;
  state.clickCount++;
  spawnClickParticle(value);
}
```

### Offline Production

When the game loads after being closed:

```ts
const elapsedSeconds = (Date.now() - state.lastSaveTime) / 1000;
const offlineEarnings = state.cps * elapsedSeconds * offlineMultiplier;
// offlineMultiplier is typically 0.05 (5%) by default
// Heavenly upgrade "Twin Gates of Transcendence" raises it
```

---

## 4. Buildings

### Building Data Table

| #  | Building          | Base Cost       | Base CPS     |
| -- | ----------------- | --------------- | ------------ |
| 0  | Cursor            | 15              | 0.1          |
| 1  | Grandma           | 100             | 1            |
| 2  | Farm              | 1,100           | 8            |
| 3  | Mine              | 12,000          | 47           |
| 4  | Factory           | 130,000         | 260          |
| 5  | Bank              | 1,400,000       | 1,400        |
| 6  | Temple            | 20,000,000      | 7,800        |
| 7  | Wizard Tower      | 330,000,000     | 44,000       |
| 8  | Shipment          | 5,100,000,000   | 260,000      |
| 9  | Alchemy Lab       | 75,000,000,000  | 1,600,000    |
| 10 | Portal            | 1,000,000,000,000 | 10,000,000 |
| 11 | Time Machine      | 14,000,000,000,000 | 65,000,000 |
| 12 | Antimatter Condenser | 170,000,000,000,000 | 430,000,000 |
| 13 | Prism             | 2,100,000,000,000,000 | 2,900,000,000 |
| 14 | Chancemaker       | 26,000,000,000,000,000 | 21,000,000,000 |
| 15 | Fractal Engine    | 310,000,000,000,000,000 | 150,000,000,000 |
| 16 | Javascript Console | 7,100,000,000,000,000,000 | 1,100,000,000,000 |
| 17 | Idleverse         | 1.2e20          | 8,300,000,000,000 |
| 18 | Cortex Baker      | 1.9e21          | 64,000,000,000,000 |
| 19 | You               | 5.4e22          | 510,000,000,000,000 |

### Cost Formula

```
cost(n) = ceil(baseCost * 1.15^n)
```

Where `n` = number currently owned.

### Bulk Purchase (Buy X)

Cost of buying `k` buildings when you own `n`:

```
bulkCost(n, k) = ceil(baseCost * (1.15^n) * (1.15^k - 1) / 0.15)
```

This is the geometric series: `sum(baseCost * 1.15^i, i=n..n+k-1)`.

### Sell Price

```
sellPrice(n) = ceil(baseCost * 1.15^(n-1)) * 0.25
```

Buildings sell for 25% of the cost of the most recently purchased one. With the "Earth Shatterer" dragon aura, sell price increases to 50%.

### Building CPS (Before Global Multipliers)

```
buildingCPS(id) = baseCPS * count * buildingMultiplier
```

Where `buildingMultiplier` is the product of all upgrades that boost that specific building.

---

## 5. Upgrade System

Cookie Clicker has approximately 716 upgrades. They fall into several categories detailed below.

### 5a. Tiered Building Upgrades

Each of the 20 buildings has **15 tiers** of upgrades. Each tier **doubles** that building's CPS.

#### Tier Definitions

| Tier | Name           | Unlock Threshold | Cost Multiplier (x baseCost) |
| ---- | -------------- | ---------------- | --------------------------- |
| 1    | Plain          | 1 owned          | 10x                        |
| 2    | Bezel          | 5 owned          | 50x                        |
| 3    | Festive        | 25 owned         | 500x                       |
| 4    | Self-referential | 50 owned       | 50,000x                    |
| 5    | Turbo          | 100 owned        | 5,000,000x                 |
| 6    | Luxurious      | 150 owned        | 500,000,000x               |
| 7    | Magical        | 200 owned        | 50,000,000,000x             |
| 8    | Festive (alt)  | 250 owned        | 5,000,000,000,000x          |
| 9    | Cyberpunk      | 300 owned        | 500,000,000,000,000x        |
| 10   | Fortune        | 350 owned        | 50,000,000,000,000,000x     |
| 11   | Hemmed         | 400 owned        | 5e18x                      |
| 12   | Steampunk      | 450 owned        | 5e20x                      |
| 13   | Verdant        | 500 owned        | 5e22x                      |
| 14   | Otherworldly   | 550 owned        | 5e24x                      |
| 15   | Last tier      | 600 owned        | 5e26x                      |

**Effect:** Each purchased tier multiplies that building's CPS by 2.

**Cost:** `buildingBaseCost * costMultiplier`

**Unlock condition:** Own at least `threshold` of that building.

#### Total Building Multiplier from Tiers

If all 15 tiers are purchased for a building:

```
tierMultiplier = 2^15 = 32,768
```

### 5b. Cursor / "Finger" Upgrades

Cursors gain a special bonus from non-cursor buildings. There are **15** "Thousand Fingers"-style upgrades.

| # | Name                    | Unlock       | Cost            | Effect                        |
|---|-------------------------|--------------|-----------------|-------------------------------|
| 1 | Thousand Fingers        | 1 Cursor     | 100,000         | +0.1 CPS per non-cursor bldg  |
| 2 | Million Fingers         | 1 Cursor     | 10,000,000      | x5 (becomes 0.5)             |
| 3 | Billion Fingers         | 5 Cursors    | 100,000,000     | x10 (becomes 5)              |
| 4 | Trillion Fingers        | 10 Cursors   | 1,000,000,000   | x20 (becomes 100)            |
| 5 | Quadrillion Fingers     | 15 Cursors   | 10,000,000,000  | x20 (becomes 2,000)          |
| 6 | Quintillion Fingers     | 20 Cursors   | 10,000,000,000  | x20 (becomes 40,000)         |
| 7 | Sextillion Fingers      | 25 Cursors   | 10,000,000,000  | x20 (becomes 800,000)        |
| 8 | Septillion Fingers      | 30 Cursors   | 10,000,000,000  | x20 (becomes 16,000,000)     |
| 9 | Octillion Fingers       | 35 Cursors   | 10,000,000,000  | x20                          |
| 10| Nonillion Fingers       | 40 Cursors   | 10,000,000,000  | x20                          |
| 11| Decillion Fingers       | 45 Cursors   | 10,000,000,000  | x20                          |
| 12| Undecillion Fingers     | 50 Cursors   | 10,000,000,000  | x20                          |
| 13| Duodecillion Fingers    | 55 Cursors   | 10,000,000,000  | x20                          |
| 14| Tredecillion Fingers    | 60 Cursors   | 10,000,000,000  | x20                          |
| 15| Quattuordecillion Fingers | 65 Cursors | 10,000,000,000  | x20                          |

**Finger bonus formula:**

```
fingerBonus = baseFingerValue * totalNonCursorBuildings
cursorCPS = (baseCPS * tierMultiplier + fingerBonus) * count
```

Where `baseFingerValue` starts at 0.1 and is multiplied by each successive Fingers upgrade.

### 5c. Grandma Type Upgrades

Each non-cursor, non-grandma building unlocks a **grandma type** that gives grandmas a CPS bonus based on how many of that building you own.

| Grandma Type       | Linked Building       | Unlock         | Cost      |
| ------------------ | --------------------- | -------------- | --------- |
| Farmer grandmas    | Farm                  | 1 Grandma + 15 Farms | 55,000    |
| Miner grandmas     | Mine                  | 1 Grandma + 15 Mines | 600,000   |
| Worker grandmas    | Factory               | 1 Grandma + 15 Factories | 6,500,000 |
| Banker grandmas    | Bank                  | 1 Grandma + 15 Banks | 70,000,000 |
| Priestess grandmas | Temple                | 1 Grandma + 15 Temples | 1e9 |
| Witch grandmas     | Wizard Tower          | 1 Grandma + 15 Wiz Towers | 1.65e10 |
| Cosmic grandmas    | Shipment              | 1 Grandma + 15 Shipments | 2.55e11 |
| Transmuted grandmas | Alchemy Lab          | 1 Grandma + 15 Alch Labs | 3.75e12 |
| Altered grandmas   | Portal                | 1 Grandma + 15 Portals | 5e13 |
| Grandmas' grandmas | Time Machine          | 1 Grandma + 15 Time Mach. | 7e14 |
| Antigrandmas       | Antimatter Condenser  | 1 Grandma + 15 Antimatter | 8.5e15 |
| Rainbow grandmas   | Prism                 | 1 Grandma + 15 Prisms | 1.05e17 |
| Lucky grandmas     | Chancemaker           | 1 Grandma + 15 Chance. | 1.3e18 |
| Metagrandmas       | Fractal Engine        | 1 Grandma + 15 Fractals | 1.55e19 |
| Binary grandmas    | Javascript Console    | 1 Grandma + 15 JS Consoles | 3.55e20 |
| Alternate grandmas | Idleverse             | 1 Grandma + 15 Idleverses | 6e21 |
| Brainy grandmas    | Cortex Baker          | 1 Grandma + 15 Cortex | 9.5e22 |
| Clone grandmas     | You                   | 1 Grandma + 15 Yous | 2.7e24 |

**Effect formula:**

```
grandmaCPSBonus = sum(floor(linkedBuildingCount / N) * grandmaBaseCPS * 0.01)
```

Typically `N` varies per type but the general pattern is: each grandma type adds `+1% of grandma base CPS per linked building owned`, applied per grandma.

More precisely:

```
For each grandma type upgrade owned:
  grandmaCPS += grandmaCount * baseCPS * (linkedBuildingCount / N)
```

Where `N` is typically a divisor (commonly the number that produces the right scaling).

### 5d. Synergy Upgrades

**36 synergy upgrades** create cross-building bonuses. Each synergy links two buildings (A and B):

- Building A gains **+5%** CPS per Building B owned
- Building B gains **+0.1%** CPS per Building A owned

**Unlock:** Own 15 of both linked buildings.

Example synergy pairs:

| Building A        | Building B           |
| ----------------- | -------------------- |
| Farm              | Mine                 |
| Mine              | Factory              |
| Factory           | Bank                 |
| Bank              | Temple               |
| Temple            | Wizard Tower         |
| Wizard Tower      | Shipment             |
| Shipment          | Alchemy Lab          |
| Alchemy Lab       | Portal               |
| Portal            | Time Machine         |
| Time Machine      | Antimatter Condenser |
| Antimatter Condenser | Prism              |
| Prism             | Chancemaker          |
| Chancemaker       | Fractal Engine       |
| Fractal Engine    | Javascript Console   |
| Javascript Console | Idleverse           |
| Idleverse         | Cortex Baker         |
| Cortex Baker      | You                  |
| Farm              | Bank                 |

(Each pair appears twice — once for each direction — yielding 36 total upgrades for the ~18 pairs.)

**Formula:**

```
For synergy(A, B):
  buildingA.cpsMultiplier *= (1 + 0.05 * countB)
  buildingB.cpsMultiplier *= (1 + 0.001 * countA)
```

### 5e. Clicking Upgrades (Mouse Upgrades)

**15 upgrades** that add a percentage of your CPS to each click.

| # | Name                | Cost           | Effect              |
|---|---------------------|----------------|---------------------|
| 1 | Plastic mouse       | 50,000         | +1% of CPS per click |
| 2 | Iron mouse          | 5,000,000      | +1% of CPS per click |
| 3 | Titanium mouse      | 500,000,000    | +1% of CPS per click |
| 4 | Adamantium mouse    | 50,000,000,000 | +1% of CPS per click |
| 5 | Unobtainium mouse   | 5,000,000,000,000 | +1% of CPS per click |
| 6 | Eludium mouse       | 500,000,000,000,000 | +1% of CPS per click |
| 7 | Wishalloy mouse     | 50,000,000,000,000,000 | +1% of CPS per click |
| 8 | Fantasteel mouse    | 5e18           | +1% of CPS per click |
| 9 | Nevercrack mouse    | 5e20           | +1% of CPS per click |
| 10| Armythril mouse     | 5e22           | +1% of CPS per click |
| 11| Technobsidian mouse | 5e24           | +1% of CPS per click |
| 12| Plasmarble mouse    | 5e26           | +1% of CPS per click |
| 13| Miraculite mouse    | 5e28           | +1% of CPS per click |
| 14| Aetherice mouse     | 5e30           | +1% of CPS per click |
| 15| Omnite mouse        | 5e32           | +1% of CPS per click |

**Cumulative effect:** With all 15 purchased, each click adds **+15% of CPS**.

### 5f. Flavored Cookies (Flat CPS Multipliers)

Approximately **245 upgrades** that each provide a flat **+X% multiplier** to total CPS. These are the bulk of the upgrade pool.

Categories include:
- **Cookie types** ("Plain cookies", "Sugar cookies", etc.) — typically +1% to +5% each
- **Heavenly cookies** — larger multipliers (+5% to +25%)
- **Prestige-tier cookies** — very large multipliers

**Stacking:** All flavored cookie multipliers stack **multiplicatively**:

```
totalFlavoredMultiplier = product(1 + upgradeBonus[i]) for each owned flavored cookie upgrade
```

Example:
- "Plain cookies" gives +1%, "Sugar cookies" gives +1%
- Combined: `1.01 * 1.01 = 1.0201` (not 1.02)

### 5g. Kitten Upgrades

**17 kitten upgrades** that scale with your **milk percentage** (which comes from achievements).

| # | Name                      | Cost    | Milk Factor |
|---|---------------------------|---------|-------------|
| 1 | Kitten helpers            | 9e6     | 0.1         |
| 2 | Kitten workers            | 9e8     | 0.125       |
| 3 | Kitten engineers          | 9e12    | 0.15        |
| 4 | Kitten overseers          | 9e16    | 0.175       |
| 5 | Kitten managers           | 9e20    | 0.2         |
| 6 | Kitten accountants        | 9e24    | 0.2         |
| 7 | Kitten specialists        | 9e28    | 0.2         |
| 8 | Kitten experts            | 9e32    | 0.2         |
| 9 | Kitten consultants        | 9e36    | 0.2         |
| 10| Kitten assistants to the regional manager | 9e40 | 0.175 |
| 11| Kitten marketeers         | 9e44    | 0.15        |
| 12| Kitten analysts           | 9e48    | 0.125       |
| 13| Kitten executives         | 9e52    | 0.115       |
| 14| Kitten angels             | 9e56    | 0.11        |
| 15| Kitten wages              | 9e60    | 0.105       |
| 16| Kitten dew                | 9e64    | 0.1         |
| 17| Kitten admins             | 9e68    | 0.1         |

**Kitten multiplier formula:**

```
milk = achievementCount * 0.04;  // 4% per achievement
kittenMultiplier = 1;
for each owned kitten upgrade:
  kittenMultiplier *= (1 + milk * kittenFactor[i]);
```

**Example:** With 200 achievements (800% milk) and first 3 kittens:
```
= (1 + 8.0 * 0.1) * (1 + 8.0 * 0.125) * (1 + 8.0 * 0.15)
= 1.8 * 2.0 * 2.2
= 7.92x multiplier
```

---

## 6. CPS Calculation Pipeline

The full CPS calculation follows this **exact order** of operations:

```
Step  1: baseCPS = sum of all building raw CPS (baseCPS * count for each)
Step  2: Apply per-building tier multipliers (each tier = x2)
Step  3: Apply cursor finger bonuses (add flat CPS from non-cursor buildings)
Step  4: Apply grandma type bonuses (per-building CPS additions)
Step  5: Apply synergy bonuses (+5% / +0.1% cross-building)
Step  6: Multiply by flavored cookie upgrades (multiplicative product)
Step  7: Apply century egg multiplier (garden plant, if active)
Step  8: Apply prestige CPS multiplier: * (1 + prestigeLevel * 0.01)
         (only if "Heavenly Chips" heavenly upgrade is owned)
Step  9: Apply kitten multipliers (product of all owned kittens * milk)
Step 10: Apply dragon aura multipliers (Breath of Milk, Dragon Cursor, etc.)
Step 11: Apply building special multipliers (building level bonuses from sugar lumps: +1% per level)
Step 12: Apply Pantheon spirit bonuses/penalties (if Temple minigame active)
Step 13: Apply golden cookie buff multipliers (Frenzy x7, Elder Frenzy x666, etc.)
Step 14: Apply Santa multiplier (+1% per Santa level, up to +14% at max)
Step 15: Apply Easter egg multiplier (if all 20 eggs found)
Step 16: Apply stock market loan multipliers (if any active loans)
Step 17: Apply wrinkler wither reduction (effective CPS = CPS * (1 - 0.05 * activeWrinklers))
Step 18: Apply any active debuffs (Clot = x0.5)
Step 19: Apply golden switch bonus (+50% CPS when golden switch is ON, but no golden cookies spawn)
Step 20: Apply shimmering veil bonus (+50% CPS when active, breaks on golden cookie click)
Step 21: Final CPS value
```

**Important:** Most multipliers are **multiplicative** with each other. The pipeline produces the final `state.cps` used in the tick function.

---

## 7. Click Value Calculation

```
Step  1: Base click value = 1 cookie
Step  2: If "Reinforced index finger" upgrade owned, +1
Step  3: If "Carpal tunnel prevention cream" owned, +1
Step  4: If "Ambidextrous" owned, +1
         (Various flat +1 clicking upgrades, ~10 total, cumulative base)
Step  5: Apply cursor finger bonus to clicks:
         clickValue += fingerBonus * totalNonCursorBuildings
Step  6: Apply mouse upgrade percentage:
         clickValue += CPS * 0.01 * mouseUpgradeCount
         (Each of the 15 mouse upgrades adds +1% of CPS)
Step  7: Apply click multiplier buffs:
         If "Click frenzy" active: x777
         If "Dragonflight" active: x1111
Step  8: Apply Cursed Finger (if active):
         clickValue = CPS * buffDuration (replaces normal calculation)
Step  9: Apply dragon aura "Dragon Cursor" (+5% of CPS added to clicks)
Step 10: Apply Pantheon spirit "Mokalsium" click bonus (if slotted)
Step 11: Apply "Clicking" prestige upgrades
Step 12: Final click value
```

---

## 8. Golden Cookies

### Spawn Mechanics

```
baseInterval = random(300, 900) seconds  (5-15 minutes)
effectiveInterval = baseInterval / goldenCookieFrequencyMultiplier

// Frequency multipliers come from:
// - "Lucky day" upgrade: x2
// - "Serendipity" upgrade: x2
// - "Golden goose egg" upgrade: x1.05
// - Dragon aura "Dragon's Fortune": +123% spawn rate
// Total with all: roughly every ~40-100 seconds
```

### Golden Cookie Effects

| Effect         | Probability | Duration    | Formula / Description |
| -------------- | ----------- | ----------- | --------------------- |
| **Frenzy**     | 62.1%       | 77 sec      | CPS x7 |
| **Lucky**      | 27.6%       | Instant     | `min(bank * 0.15, CPS * 900) + 13` |
| **Click Frenzy** | 4.4%     | 13 sec      | Click value x777 |
| **Cookie Storm** | 1.1%     | 7 sec       | Rapid-fire golden cookies with small payouts |
| **Building Special** | 4.4% | 30 sec      | One random building gets x10 CPS |
| **Cookie Storm Drop** | —   | Instant     | `max(cookies * 0.02, CPS * 60) / 20` per cookie |
| **Blab**       | 0.4%        | —           | Does nothing (flavor text only) |
| **Sweet** (rare) | 0.01%    | —           | +10% CPS for rest of ascension |

### Wrath Cookie Exclusive Effects

Wrath cookies replace golden cookies during Grandmapocalypse stages.

| Effect           | Probability | Duration | Formula / Description |
| ---------------- | ----------- | -------- | --------------------- |
| **Clot**         | 28%         | 66 sec   | CPS x0.5 (halved) |
| **Ruin**         | 14%         | Instant  | Lose `min(bank * 0.05, CPS * 600) + 13` |
| **Elder Frenzy** | 3.5%        | 6 sec    | CPS x666 |
| **Cursed Finger**| 3.5%       | 10 sec   | CPS = 0, clicks give `normalCPS * 10` each |

Wrath cookies can also give Frenzy, Lucky, and Click Frenzy (at reduced probabilities).

### Lucky Banking Formula

To maximize "Lucky" payouts, maintain a bank of:

```
optimalBank = CPS * 6000
// Because Lucky caps at min(bank * 0.15, CPS * 900)
// To hit the CPS * 900 cap: bank * 0.15 >= CPS * 900
// Solving: bank >= CPS * 6000
```

With "Get Lucky" upgrade (doubles duration), golden cookie effects last twice as long. Lucky cap also doubles to `CPS * 1800`, requiring `bank >= CPS * 12000`.

### Combo Stacking

Buff effects are **multiplicative** with each other:

```
// Example: Frenzy + Click Frenzy
effectiveCPS = baseCPS * 7        // Frenzy
clickValue = baseClick * 777      // Click Frenzy
// Combined click = baseClick * 777 * 7 = x5,439

// Example: Frenzy + Elder Frenzy
effectiveCPS = baseCPS * 7 * 666  // = x4,662
```

---

## 9. Prestige & Ascension

### Prestige Level Formula

```
prestigeLevel = floor(cbrt(totalCookiesBakedAllTime / 1e12))
```

Where `totalCookiesBakedAllTime` includes all cookies ever baked across all ascensions.

**Inverse (cookies needed for level N):**

```
cookiesNeeded = 1e12 * N^3
```

### Heavenly Chips

```
heavenlyChips = prestigeLevel  (1:1 ratio)
```

Heavenly chips are spent on **heavenly upgrades** during ascension. Unspent chips remain for future ascensions.

### Prestige CPS Bonus

```
// Requires "Heavenly chips" heavenly upgrade to activate
prestigeMultiplier = 1 + (prestigeLevel * 0.01)
```

Each prestige level adds **+1% CPS**.

### Key Heavenly Upgrades

| Name                        | Cost (HC) | Effect |
| --------------------------- | --------- | ------ |
| Legacy                      | 1         | Unlocks prestige system |
| Heavenly cookies            | 3         | +10% CPS |
| Tin of butter cookies       | 25        | +10% CPS |
| Heavenly key                | 1         | Unlocks cookie box |
| How to bake your dragon     | 9         | Unlocks Krumblor |
| Starter kit                 | 50        | Start with 10 free Cursors |
| Starter kitchen             | 5,000     | Start with 10 free Grandmas |
| Persistent memory           | 500       | Minigames don't reset |
| Season switcher             | 1,111     | Unlocks seasonal controls |
| Heavenly luck               | 77        | Golden cookies appear 5% more |
| Lasting fortune             | 777       | Golden cookie effects last 10% longer |
| Twin Gates of Transcendence | 2e25      | +30% offline CPS |
| Golden switch               | 999,999   | Toggle: +50% CPS but no golden cookies |
| Shimmering veil             | 999,999   | +50% CPS, breaks on golden click |
| Classic dairy selection     | 5e6       | Lets you pick milk appearance |

### Ascension Process

1. Player clicks "Ascend" (requires at least 1 new prestige level worth of cookies)
2. All cookies, buildings, upgrades, and progress reset
3. New heavenly chips awarded based on `newPrestigeLevel - previousPrestigeLevel`
4. Player purchases heavenly upgrades with accumulated chips
5. Player clicks "Reincarnate" to start new run with prestige bonuses active

---

## 10. Grandmapocalypse

### Research Chain

The Grandmapocalypse is triggered by purchasing research upgrades in sequence:

| # | Research Upgrade         | Cost       | Time  | Effect |
|---|--------------------------|------------|-------|--------|
| 1 | Bingo center/Research facility | 1e14 | —     | Unlocks research, starts chain |
| 2 | Specialized chocolate chips | 1e14   | 30 min | +1% Grandma CPS |
| 3 | Designer cocoa beans     | 2e14       | 30 min | +2% Grandma CPS |
| 4 | Ritual rolling pins      | 4e14       | 30 min | +2% Grandma CPS |
| 5 | Underworld ovens         | 8e14       | 30 min | +3% Grandma CPS |
| 6 | One mind                 | 1.6e15     | 30 min | +2% Grandma CPS, **Stage 1: Awoken** |
| 7 | Exotic nuts              | 3.2e15     | 30 min | +4% Grandma CPS |
| 8 | Communal brainsweep      | 6.4e15     | 30 min | +2% Grandma CPS, **Stage 2: Displeased** |
| 9 | Arcane sugar             | 1.28e16    | 30 min | +5% Grandma CPS |
| 10| Elder Pact               | 2.56e16    | 30 min | +2% Grandma CPS, **Stage 3: Angered** |

### Grandmapocalypse Stages

| Stage | Name       | Wrath Cookie % | Background    | Wrinklers |
| ----- | ---------- | -------------- | ------------- | --------- |
| 0     | Dormant    | 0% (all golden)| Normal        | None      |
| 1     | Awoken     | 33% wrath      | Grandma tint  | Can spawn |
| 2     | Displeased | 66% wrath      | Darker tint   | More spawn |
| 3     | Angered    | 100% wrath     | Full corruption| Max spawn |

### Elder Pledge & Covenant

| Action          | Cost                 | Duration | Effect |
| --------------- | -------------------- | -------- | ------ |
| Elder Pledge    | Scales (starts 6.66e13) | 30 min | Reverts to Stage 0 temporarily |
| Elder Covenant  | 5x current CPS cost | Permanent| Reverts to Stage 0, but **-5% CPS** |
| Revoke Covenant | Free                 | —        | Returns to Angered stage |

Elder Pledge cost doubles each use, capping at about `6.66e20`.

---

## 11. Seasonal Events

Seasons are activated via the **Season Switcher** heavenly upgrade. Only one season active at a time. Each lasts until switched or until the event timer expires.

### 11a. Christmas

**Duration:** Dec 15 - Dec 31 (automatic), or manually activated

**Santa Levels:** 15 levels, each adding **+1% CPS** (cumulative max +14% at level 14, 0-indexed).

| Level | Santa Name           | Cost to Upgrade        |
| ----- | -------------------- | ---------------------- |
| 0     | Festive test tube    | cookies * 0.25         |
| 1     | Festive ornament     | cookies * 0.25         |
| 2     | Festive wreath       | cookies * 0.25         |
| 3     | Festive tree         | cookies * 0.25         |
| 4     | Festive present      | cookies * 0.25         |
| 5     | Festive elf fetus    | cookies * 0.25         |
| 6     | Elf toddler          | cookies * 0.25         |
| 7     | Abstract elf         | cookies * 0.25         |
| 8     | Elfling              | cookies * 0.25         |
| 9     | Young elf            | cookies * 0.25         |
| 10    | Bulky elf            | cookies * 0.25         |
| 11    | Nick                 | cookies * 0.25         |
| 12    | Santa Claus          | cookies * 0.25         |
| 13    | Elder Santa          | cookies * 0.25         |
| 14    | True Santa           | cookies * 0.25         |

Each level costs 25% of your current cookie bank.

**Christmas Cookies:** 7 upgrades, each +2-5% CPS, drop randomly from reindeer or golden cookies during Christmas.

**Reindeer:**
- Spawn every 3-5 minutes (base)
- Click to collect: `max(25, CPS * 60)` cookies
- With "Ho ho ho-flavored frosting": doubled payout

### 11b. Easter

**20 Easter Eggs** — drop from golden/wrath cookies, wrinklers, or reindeer during Easter.

| Type       | Count | Drop Rate | Effect |
| ---------- | ----- | --------- | ------ |
| Common eggs | 15   | ~10% each | Various +1-3% CPS, cosmetics |
| Rare eggs   | 4    | ~2% each  | +2-10% CPS |
| "Egg" egg   | 1    | ~1%       | +9% CPS, +9% click, +9% golden freq |

**Century Egg** (special): +1% CPS compounding over time (based on playtime).

### 11c. Halloween

**7 Halloween Cookies** — drop from wrinklers when popped during Halloween.

| Cookie               | Drop Rate | Effect |
| -------------------- | --------- | ------ |
| Skull cookies         | ~5%       | +2% CPS |
| Ghost cookies         | ~5%       | +2% CPS |
| Bat cookies           | ~5%       | +2% CPS |
| Slime cookies         | ~5%       | +2% CPS |
| Spider cookies        | ~5%       | +2% CPS |
| Eyeball cookies       | ~5%       | +2% CPS |
| Pumpkin cookies       | ~5%       | +2% CPS |

### 11d. Valentine's Day

**7 Heart Biscuits** — appear in the store during Valentine's season.

Each gives a small CPS bonus (+2-5%). Purely purchasable (no RNG drops).

### 11e. Business Day

- Cosmetic office-themed reskin
- **"Everything Must Go"** sale upgrade: all buildings cost 5% less

---

## 12. Sugar Lumps

Sugar lumps are a secondary currency that grows over time above the cookie counter.

### Growth Cycle

```
Phase 1: Growing     — 20 hours
Phase 2: Mature      — 23 hours (can harvest with 50% chance of success)
Phase 3: Ripe        — 24 hours (guaranteed harvest)
Phase 4: Overripe    — auto-harvested after ~25 hours
```

### Lump Types

| Type      | Probability | Yield  | Special |
| --------- | ----------- | ------ | ------- |
| Normal    | 90.69%      | 1 lump | — |
| Bifurcated | 4.545%     | 1-2 lumps | 50% chance of 2 |
| Golden    | 1.515%      | 2-3 lumps | — |
| Meaty     | 3.03%       | 0-2 lumps (usually 0-1) | — |
| Caramelized | 0.22%    | 1-3 lumps | +3% CPS for 1 hour |

### Building Levels

Sugar lumps are spent to **level up buildings**. Cost = `level + 1` lumps per level.

| Level | Benefit |
| ----- | ------- |
| 1     | Unlocks minigame (for applicable buildings) |
| 1+    | +1% CPS bonus per level for that building |
| 10    | Building achieves "max level" achievement |

**Minigame unlocks:**

| Building      | Minigame       |
| ------------- | -------------- |
| Temple (6)    | Pantheon       |
| Wizard Tower (7) | Grimoire    |
| Farm (2)      | Garden         |
| Bank (5)      | Stock Market   |

---

## 13. Wrinklers

Wrinklers appear during Grandmapocalypse. Up to **10 normal wrinklers** + **1 shiny wrinkler** can attach to the big cookie.

### Withering

Each wrinkler **drains 5%** of CPS while attached:

```
totalDrain = 0.05 * activeWrinklerCount
effectiveCPS = baseCPS * (1 - totalDrain)
```

With 10 wrinklers: effective CPS = 50% of base (half goes to wrinklers).

### Popping Wrinklers

When popped, a wrinkler returns **1.1x** (110%) of everything it consumed:

```
wrinklerPayout = totalCookiesConsumed * 1.1   // normal
wrinklerPayout = totalCookiesConsumed * 3.3   // shiny wrinkler
```

### Net CPS Formula (With N Wrinklers)

```
netMultiplier = 1 + N * 0.05 * (1.1 * N - 1)
```

With 10 wrinklers:
```
netMultiplier = 1 + 10 * 0.05 * (11 - 1) = 1 + 5 = 6x
```

**10 wrinklers yield 6x the CPS** compared to having none — making them extremely valuable.

### Shiny Wrinkler

- **Spawn chance:** 0.01% (1 in 10,000) per wrinkler spawn check
- Payout uses **3.3x** multiplier instead of 1.1x
- Visually distinct (golden/sparkly)

---

## 14. Milk & Achievements

### Milk Formula

```
milk = normalAchievementCount * 0.04   // 4% per achievement
```

**622 normal achievements** at max = **2488% milk** (24.88).

Milk is primarily consumed by **kitten upgrades** (see Section 5g).

### Achievement Categories

| Category           | Count | Examples |
| ------------------ | ----- | -------- |
| Cookie production  | ~80   | "Bake 1 million cookies" → "Bake 1 duodecillion" |
| Per-building count | ~300  | "Own 1 Cursor" → "Own 600 Cursors" (for each of 20 buildings) |
| Clicking           | ~15   | "Click 1,000 times" → "Click 30 billion times" |
| Golden cookies     | ~15   | "Click 1 golden cookie" → "Click 7,777 golden cookies" |
| CPS milestones     | ~30   | "Bake 1/second" → "Bake 1e40/second" |
| Prestige           | ~10   | "Reach prestige level 1" → "Level 1 billion" |
| Seasonal           | ~50   | Collect all eggs, Christmas cookies, etc. |
| Miscellaneous      | ~120  | Wrinklers, sugar lumps, combos, minigames |

### Shadow Achievements

**17 shadow achievements** that do **NOT** count toward milk. These are hidden/secret accomplishments:

- "Cheated cookies taste awful" (use console)
- "Third-party" (use an add-on)
- "Speed baking" (1M cookies in 35 minutes, no upgrades)
- "Hardcore" (1B cookies no upgrades)
- "Neverclick" (1M cookies with 15 or fewer clicks)
- "True Neverclick" (1M cookies with 0 clicks)
- "Endless cycle" (ascend 1,000 times)
- "Four-leaf cookie" (golden cookie quad-combo)
- And ~9 others

---

## 15. Dragon (Krumblor)

### Unlocking

Requires heavenly upgrade **"How to bake your dragon"** (9 HC).

### Training/Hatching

The dragon progresses through stages by sacrificing buildings:

| Level | Name              | Sacrifice                |
| ----- | ----------------- | ------------------------ |
| 0     | Dragon egg        | —                        |
| 1     | Shivering dragon egg | 1 million cookies (click) |
| 2     | Hatching          | Sacrifice 50 buildings   |
| 3     | Hatchling         | Sacrifice 200 buildings  |
| 4-20  | Growing stages    | Increasing building sacrifices |
| 21    | Full-grown        | Final sacrifice (varies) |

### Dragon Auras

You can equip **1 aura** (or **2** with "Reality Bending" heavenly upgrade). Key auras:

| Aura                | Effect |
| ------------------- | ------ |
| Breath of Milk      | +5% milk effect on kitten upgrades |
| Dragon Cursor       | +5% of CPS added to click value |
| Elder Battalion     | +10% CPS, but no milk |
| Reaper of Fields    | +15% CPS |
| Earth Shatterer     | Buildings sell for 50% instead of 25% |
| Master of the Armory | Upgrades are 2% cheaper |
| Fierce Hoarder      | Golden cookies appear 10% more |
| Dragon God           | +10% prestige level effect |
| Arcane Aura         | Golden cookies last 10% longer |
| Dragon's Fortune    | +123% golden cookie frequency |

### Dragon Drops

Petting the dragon (click it) has a **5% chance** per click to drop an item:

| Drop               | Effect |
| ------------------- | ------ |
| Dragon scale        | +3% CPS |
| Dragon claw         | +3% click value |
| Dragon fang         | +3% golden cookie effect |
| Dragon teddy bear   | +3% milk effect |

---

## 16. Minigames

### 16a. Pantheon (Temple — Level 1)

**11 spirits** that can be slotted into **3 slots** (Diamond, Ruby, Jade). Effects scale by slot:

- **Diamond:** Full effect
- **Ruby:** ~50% effect
- **Jade:** ~25% effect

| Spirit      | Diamond Effect                     |
| ----------- | ---------------------------------- |
| Holobore    | +15% CPS from buildings owned for 1 day |
| Vomitrax    | +15% golden cookie gains, -15% CPS |
| Godzamok    | Selling buildings gives click buff temporarily |
| Cyclius     | CPS fluctuates sinusoidally (+15% to -15%) |
| Selebrak    | +15% seasonal event gains |
| Dotjeiess   | +10% golden cookie frequency, -5% golden cookie duration |
| Muridal     | +15% click CPS bonus |
| Jeremy      | +10% CPS, -10% golden cookie effect |
| Mokalsium   | +10% milk effect |
| Skruuia     | +15% wrinkler CPS drain (makes wrinklers better) |
| Rigidel     | Sugar lump ripens 1 hour sooner |

**Swap cooldown:** Each slot has a cooldown after swapping (Diamond = longest).

### 16b. Grimoire (Wizard Tower — Level 1)

**Magic pool:** `floor(4 + power * 0.6 + towerCount * 0.0016)`

Where `power` is the total wizard tower CPS contribution.

Simplified: roughly `4 + 0.6 * wizardTowerCount` for early game.

**8 Spells:**

| Spell                | Cost (Magic) | Success Effect               | Backfire Effect |
| -------------------- | ------------ | ----------------------------- | --------------- |
| Conjure Baked Goods  | 25%          | +30 min CPS worth of cookies  | -15 min CPS |
| Force the Hand of Fate | 60%        | Spawn golden cookie           | Spawn wrath cookie |
| Spontaneous Edifice  | 75%          | Gain a free building          | Lose a building |
| Haggler's Charm      | 30%          | -2% building costs for 1 hour | +2% costs |
| Summon Crafty Pixies | 40%          | -2% upgrade costs for 1 hour  | +2% costs |
| Gambler's Fever Dream | 15%         | Cast a random spell            | Cast random backfire |
| Resurrect Abomination | 20%        | +15 min of wrinkler CPS       | -15 min wrinkler CPS |
| Diminish Ineptitude  | 45%          | +25% spell success for 5 min  | -10% success |

**Backfire chance:** starts at ~15%, affected by upgrades and buffs.

**Magic regeneration:** ~0.002 per second (refills over time).

### 16c. Garden (Farm — Level 1)

**Grid size:** scales with farm count.

| Farms     | Grid Size |
| --------- | --------- |
| 1-3       | 2x2       |
| 4-7       | 3x3       |
| 8-15      | 4x4       |
| 16-31     | 5x5       |
| 32+       | 6x6       |

**34 plant types.** Plants grow over time, provide CPS bonuses or effects, and can cross-breed.

**5 Soil types:**

| Soil       | Effect                                    | Tick Rate |
| ---------- | ----------------------------------------- | --------- |
| Dirt       | Default, no bonuses                       | Normal    |
| Fertilizer | +25% growth speed, -25% weed immunity     | Fast      |
| Clay       | +25% weed immunity, -25% growth           | Slow      |
| Pebbles    | No weeds, plants don't spread             | Very slow |
| Wood chips | +100% mutation chance, -50% growth        | Slow      |

**Key plants:**

| Plant           | Growth Time | Effect |
| --------------- | ----------- | ------ |
| Baker's wheat   | ~45 min     | +1% CPS |
| Thumbcorn       | ~30 min     | +2% click value |
| Cronerice       | ~60 min     | +3% grandma CPS |
| Queenbeet       | ~3 hours    | +2.5% golden cookie frequency |
| Bakeberry       | ~2 hours    | +1% CPS (stacks) |
| Chocoroot       | ~45 min     | +1% CPS |
| Nursetulip      | ~2 hours    | +2% CPS to adjacent plants |
| Drowsyfern      | ~4 hours    | +3% CPS when idle |
| Elderwort       | ~5 hours    | +1% grandma CPS, advances grandmapocalypse |
| Juicy queenbeet | ~24 hours   | Harvest for 1 sugar lump |
| Golden clover   | ~rare       | +3% golden cookie frequency |

**Harvesting:** Click a mature plant to harvest. Some plants give cookies, some give effects, some unlock seed.

### 16d. Stock Market (Bank — Level 1)

**18 stocks** corresponding to the 18 non-cursor, non-grandma buildings:

| # | Stock | Linked Building |
|---|-------|-----------------|
| 1 | CRL   | Farm            |
| 2 | CHC   | Mine            |
| 3 | BTR   | Factory         |
| ... | ... | ...            |

**Price movement:** Each stock has a resting price and fluctuates every ~minute.

```
restingPrice = buildingBaseCPS * 0.01 + floor(random * 10)
priceChange = random(-3, +3) + trend
// trend is a slow-moving bias that shifts over hours
```

**Buy/sell:**
- Buy: spend cookies equal to stock price * quantity
- Sell: gain cookies equal to stock price * quantity
- **Broker fee:** 5% on purchases (reduced by brokers)
- Max shares: floor(bankCount * 0.5)

**Loans (4 types):**

| Loan  | Effect                | Duration | Aftermath |
| ----- | --------------------- | -------- | --------- |
| Loan 1 | +50% CPS            | 5 min    | -25% CPS for 10 min |
| Loan 2 | +100% CPS           | 5 min    | -50% CPS for 15 min |
| Loan 3 | +200% CPS           | 5 min    | -75% CPS for 20 min |
| Loan 4 | +500% CPS           | 2 min    | -90% CPS for 30 min |

---

## 17. News Ticker & Fortunes

### News Ticker

Displays rotating messages at the top of the screen. Messages change every ~10 seconds and are selected from pools based on game state (buildings owned, upgrades purchased, season, etc.).

### Fortune Upgrades

**25 fortune upgrades** that appear as rare ticker messages. Clicking the ticker when a fortune appears unlocks the upgrade.

**Spawn chance:** ~2% per tick (4% with "Green yeast digestives" upgrade).

Each fortune gives:
- A building-specific CPS bonus (+7-10%)
- Or a global bonus (e.g., +1% CPS, +7% golden cookie effect)

Fortune upgrades persist through ascension once purchased.

---

## 18. Save System

### Format

Save data is **Base64-encoded**, containing **pipe-delimited** (`|`) sections:

```
Base64Encode(
  version|                           // Save format version
  reserved|                          // Empty/reserved
  runStartTime;currentTime|          // Timestamps
  cookies;cookiesBaked;cookiesReset;  // Cookie counters
  ... more pipe sections for each system
)
```

### Key Sections

```
Section 0:  Version number
Section 1:  Reserved
Section 2:  Run dates (start/current timestamps)
Section 3:  Preferences (settings flags)
Section 4:  Cookie counts (current, earned this ascension, earned all time, etc.)
Section 5:  Building counts (comma-separated, one per building)
Section 6:  Upgrades owned (bit flags or ID lists)
Section 7:  Achievements unlocked (bit flags or ID lists)
Section 8:  Prestige data (level, HC, heavenly upgrades)
Section 9:  Buffs (active buff IDs, durations)
Section 10: Grandmapocalypse state
Section 11: Seasonal state
Section 12: Wrinkler data
Section 13: Sugar lump data
Section 14: Dragon data
Section 15: Minigame states (sub-delimited per minigame)
```

### Auto-save

```
AUTO_SAVE_INTERVAL = 60; // seconds
```

Auto-save every 60 seconds to `localStorage`.

### Export/Import

- **Export:** Copy Base64 string to clipboard
- **Import:** Paste Base64 string, decode, validate version, load state

---

## Quick Reference Formulas

```
Building Cost:      ceil(baseCost * 1.15^owned)
Bulk Buy Cost:      ceil(baseCost * 1.15^n * (1.15^k - 1) / 0.15)
Prestige Level:     floor(cbrt(totalCookies / 1e12))
Milk:               achievements * 0.04
Kitten Mult:        product(1 + milk * factor_i) for each kitten
Lucky Payout:       min(bank * 0.15, CPS * 900) + 13
Optimal Bank:       CPS * 6000  (or CPS * 12000 with Get Lucky)
Wrinkler Net (10):  6x effective CPS
Frenzy:             CPS * 7 for 77 seconds
Elder Frenzy:       CPS * 666 for 6 seconds
Click Frenzy:       Clicks * 777 for 13 seconds
Offline Production: CPS * seconds * 0.05
Sugar Lump Cycle:   20h grow → 23h mature → 24h ripe
```
