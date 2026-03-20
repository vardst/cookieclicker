# Cookie Clicker

A faithful recreation of [Orteil's Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) built from scratch with vanilla HTML, CSS, and JavaScript.

**[Play Now](https://famous-concha-bead77.netlify.app/)**

---

## Architecture

Vanilla HTML/CSS/JS — no frameworks, no build tools. ~3,800 lines across 17 source files sharing a single `Game` namespace via the IIFE module pattern.

### Script Load Order

Files load in strict dependency order:

| Order | File | Role |
|-------|------|------|
| 1 | `format.js` | Number formatting (million, billion, etc.) |
| 2 | `data.js` | Static data — buildings, upgrades, achievements |
| 3 | `state.js` | Game state initialization and defaults |
| 4 | `buildings.js` | Building purchase, cost calculation, CPS |
| 5 | `upgrades.js` | Upgrade registry, unlock checks, effects |
| 6 | `cps.js` | Full CPS + click value pipeline |
| 7 | `clicks.js` | Click handler, particles |
| 8 | `golden.js` | Golden cookie spawning and effects |
| 9 | `achievements.js` | Achievement checks and milk calculation |
| 10 | `prestige.js` | Ascension, heavenly chips, prestige multiplier |
| 11 | `save.js` | localStorage save/load (Base64 JSON) |
| 12 | `ticker.js` | News ticker messages |
| 13 | `ui.js` | DOM rendering, store panel, stats |
| 14 | `cursors.js` | Cursor orbit animation around cookie |
| 15 | `main.js` | Entry point, game loop (30 FPS delta-time) |

### Game Loop

A fixed-timestep accumulator at 30 FPS:

```
each frame:
  accumulate delta time
  while accumulator >= 33.33ms:
    update CPS, earn cookies, tick golden cookie timer,
    check unlocks, update buffs
  render UI
```

---

## Game Mechanics & Formulas

### Buildings

20 building types from Cursor (15 cookies) to You (5.4e22 cookies).

| # | Building | Base Cost | Base CPS |
|---|----------|-----------|----------|
| 0 | Cursor | 15 | 0.1 |
| 1 | Grandma | 100 | 1 |
| 2 | Farm | 1,100 | 8 |
| 3 | Mine | 12,000 | 47 |
| 4 | Factory | 130,000 | 260 |
| 5 | Bank | 1,400,000 | 1,400 |
| 6 | Temple | 20,000,000 | 7,800 |
| 7 | Wizard Tower | 330,000,000 | 44,000 |
| 8 | Shipment | 5,100,000,000 | 260,000 |
| 9 | Alchemy Lab | 75,000,000,000 | 1,600,000 |
| 10 | Portal | 1,000,000,000,000 | 10,000,000 |
| 11 | Time Machine | 14,000,000,000,000 | 65,000,000 |
| 12 | Antimatter Condenser | 170,000,000,000,000 | 430,000,000 |
| 13 | Prism | 2,100,000,000,000,000 | 2,900,000,000 |
| 14 | Chancemaker | 26,000,000,000,000,000 | 21,000,000,000 |
| 15 | Fractal Engine | 310,000,000,000,000,000 | 150,000,000,000 |
| 16 | Javascript Console | 7,100,000,000,000,000,000 | 1,100,000,000,000 |
| 17 | Idleverse | 1.2e20 | 8,300,000,000,000 |
| 18 | Cortex Baker | 1.9e21 | 64,000,000,000,000 |
| 19 | You | 5.4e22 | 510,000,000,000,000 |

**Cost formula:**

```
cost(n) = ceil(baseCost * 1.15^n)
```

**Bulk buy (k units starting from n owned):**

```
bulkCost(n, k) = ceil(baseCost * 1.15^n * (1.15^k - 1) / 0.15)
```

**Sell price:** 25% of last unit cost.

### CPS Calculation Pipeline

CPS flows through a multiplicative chain, computed every tick:

| Step | Multiplier | Formula |
|------|-----------|---------|
| 1 | Base CPS | `sum(baseCPS * count)` for each building |
| 2 | Tier upgrades | x2 per tier owned (15 tiers per building, max x32,768) |
| 3 | Cursor fingers | `+fingerBonus * nonCursorBuildings` per cursor |
| 4 | Grandma types | `+linkedBuildingCount * grandmaBaseCPS * 0.01` per grandma |
| 5 | Synergies | Building A: `+5% per B owned`, Building B: `+0.1% per A owned` |
| 6 | Flavored cookies | Multiplicative product of all `(1 + bonus)` |
| 7 | Prestige | `* (1 + prestigeLevel * 0.01)` |
| 8 | Kittens | `product(1 + milk * factor_i)` per kitten upgrade |
| 9 | Golden cookie buffs | Frenzy x7, Elder Frenzy x666, etc. |
| 10 | Santa | `+1% per Santa level` (max +14%) |
| 11 | Easter eggs | Bonus if all 20 found |
| 12 | Golden switch | +50% CPS (no golden cookies spawn) |
| 13 | Debuffs | Clot x0.5 |

### Click Value

```
clickValue = (1 + flatBonuses) + (fingerBonus * nonCursorBuildings)
clickValue += CPS * 0.01 * mouseUpgradeCount
clickValue *= buffMultiplier   // Click Frenzy: x777
```

### Upgrades

~400+ upgrades across several categories:

| Category | Count | Effect |
|----------|-------|--------|
| Tier upgrades | 15 per building (300 total) | x2 CPS per tier |
| Finger upgrades | 15 | +bonus per non-cursor building to cursors |
| Mouse upgrades | 15 | +1% of CPS added to each click |
| Kitten upgrades | 17 | Multiply CPS by `(1 + milk * factor)` |
| Flavored cookies | ~40 | +1% to +5% CPS each (multiplicative) |
| Grandma types | 18 | Grandma CPS scales with linked building |
| Synergies | 36 | Cross-building +5% / +0.1% bonuses |

### Golden Cookies

```
spawnInterval = random(300, 900) / frequencyMultiplier seconds
```

| Effect | Probability | Duration | Formula |
|--------|-------------|----------|---------|
| Frenzy | 62.1% | 77s | CPS x7 |
| Lucky | 27.6% | instant | `min(bank * 0.15, CPS * 900) + 13` |
| Click Frenzy | 4.4% | 13s | Click x777 |
| Cookie Storm | 1.1% | 7s | Rapid small payouts |
| Building Special | 4.4% | 30s | Random building x10 |
| Blab | 0.4% | — | Nothing |

**Wrath cookies** (during Grandmapocalypse) add: Clot (CPS x0.5), Ruin (lose cookies), Elder Frenzy (CPS x666).

**Optimal bank for Lucky:** `CPS * 6000` (or `CPS * 12000` with Get Lucky).

### Prestige & Ascension

```
prestigeLevel = floor(cbrt(totalCookiesAllTime / 1e12))
```

Each prestige level = +1% CPS (requires "Heavenly Chips" heavenly upgrade). Heavenly chips are spent on permanent upgrades during ascension.

### Achievements & Milk

```
milk = achievementCount * 0.04
```

Milk powers kitten upgrades. Example with 200 achievements (8.0 milk) and first 3 kittens:

```
(1 + 8.0 * 0.1) * (1 + 8.0 * 0.125) * (1 + 8.0 * 0.15) = 1.8 * 2.0 * 2.2 = 7.92x
```

---

## Game Balance

**Early game** — Manual clicking dominates. First Cursors and Grandmas. Finger upgrades make Cursors scale with total buildings.

**Mid game** — Golden cookie combos (Frenzy + Lucky banking) drive progression. Flavored cookie multipliers stack multiplicatively. Each new building tier unlocks at exponentially higher costs but with proportionally higher CPS.

**Late game** — Kitten upgrades scaling with milk (from achievements) become the largest multiplier. Prestige stacking across multiple ascensions compounds with kittens. A single ascension run eventually hits diminishing returns, pushing the player to ascend for +1% per prestige level.

The core loop: `baseCPS * tiers * fingers * synergies * flavored * prestige * kittens * buffs` — each system multiplies the others, creating smooth exponential growth.

---

## Project Structure

```
cookie clicker/
  index.html          Entry point
  css/
    style.css         All styles (~400 lines)
  js/
    format.js         Number formatting
    data.js           Static game data tables
    state.js          Game state object
    buildings.js      Building purchase/sell logic
    upgrades.js       Upgrade definitions and effects
    cps.js            CPS and click value calculation
    clicks.js         Click handling and particles
    golden.js         Golden cookie system
    achievements.js   Achievement checks and milk
    prestige.js       Ascension and heavenly chips
    save.js           Save/load/export/import
    ticker.js         News ticker
    ui.js             DOM rendering
    cursors.js        Cursor orbit animation
    main.js           Game loop and initialization
```

---

## Debug Console

Open your browser console and use:

```js
Game.debug.giveCookies(1e12)       // Add cookies
Game.debug.forceGolden()           // Spawn a golden cookie
Game.debug.setBuilding(0, 100)     // Set Cursor count to 100
Game.debug.logCPS()                // Print CPS breakdown
Game.debug.unlockAll()             // Unlock all upgrades and achievements
```

---

## Running Locally

No build step required. Just serve the files:

```bash
# Option 1: Python
cd "cookie clicker"
python3 -m http.server 8000

# Option 2: Open directly
open index.html
```

---

## Not Implemented

These systems from the original game are outside the current scope:

- Grandmapocalypse (research chain, elder pledge/covenant)
- Wrinklers
- Seasonal events (Christmas, Easter, Halloween, Valentine's, Business Day)
- Sugar lumps and building levels
- Krumblor (dragon)
- Minigames (Pantheon, Grimoire, Garden, Stock Market)
- Fortune upgrades
