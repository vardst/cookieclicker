var Game = Game || {};

(function() {
  'use strict';

  // ===== BUILDING DATA =====
  Game.BuildingData = [
    { id: 0,  name: 'Cursor',              baseCost: 15,              baseCPS: 0.1,            icon: '👆', desc: 'Autoclicks once every 10 seconds.' },
    { id: 1,  name: 'Grandma',             baseCost: 100,             baseCPS: 1,              icon: '👵', desc: 'A nice grandma to bake more cookies.' },
    { id: 2,  name: 'Farm',                baseCost: 1100,            baseCPS: 8,              icon: '🌾', desc: 'Grows cookie plants from cookie seeds.' },
    { id: 3,  name: 'Mine',                baseCost: 12000,           baseCPS: 47,             icon: '⛏️', desc: 'Mines out cookie dough and chocolate chips.' },
    { id: 4,  name: 'Factory',             baseCost: 130000,          baseCPS: 260,            icon: '🏭', desc: 'Produces large quantities of cookies.' },
    { id: 5,  name: 'Bank',                baseCost: 1400000,         baseCPS: 1400,           icon: '🏦', desc: 'Generates cookies from interest.' },
    { id: 6,  name: 'Temple',              baseCost: 20000000,        baseCPS: 7800,           icon: '⛪', desc: 'Full of precious, ancient cookie recipes.' },
    { id: 7,  name: 'Wizard Tower',        baseCost: 330000000,       baseCPS: 44000,          icon: '🧙', desc: 'Summons cookies with magic spells.' },
    { id: 8,  name: 'Shipment',            baseCost: 5100000000,      baseCPS: 260000,         icon: '🚀', desc: 'Brings in fresh cookies from the cookie planet.' },
    { id: 9,  name: 'Alchemy Lab',         baseCost: 75000000000,     baseCPS: 1600000,        icon: '⚗️', desc: 'Turns gold into cookies!' },
    { id: 10, name: 'Portal',              baseCost: 1e12,            baseCPS: 10000000,       icon: '🌀', desc: 'Opens a door to the cookieverse.' },
    { id: 11, name: 'Time Machine',        baseCost: 14e12,           baseCPS: 65000000,       icon: '⏰', desc: 'Brings cookies from the past.' },
    { id: 12, name: 'Antimatter Condenser',baseCost: 170e12,          baseCPS: 430000000,      icon: '⚛️', desc: 'Condenses the antimatter in the universe into cookies.' },
    { id: 13, name: 'Prism',               baseCost: 2100e12,         baseCPS: 2900000000,     icon: '🔺', desc: 'Converts light itself into cookies.' },
    { id: 14, name: 'Chancemaker',         baseCost: 26000e12,        baseCPS: 21000000000,    icon: '🎰', desc: 'Generates cookies out of thin air.' },
    { id: 15, name: 'Fractal Engine',      baseCost: 310000e12,       baseCPS: 150000000000,   icon: '🔄', desc: 'Harnesses the power of fractals.' },
    { id: 16, name: 'Javascript Console',  baseCost: 7100000e12,      baseCPS: 1100000000000,  icon: '💻', desc: 'Creates cookies from code.' },
    { id: 17, name: 'Idleverse',           baseCost: 1.2e20,          baseCPS: 8300000000000,  icon: '🌌', desc: 'Hijacks idle universes to make cookies.' },
    { id: 18, name: 'Cortex Baker',        baseCost: 1.9e21,          baseCPS: 64000000000000, icon: '🧠', desc: 'Uses your brain to think up cookies.' },
    { id: 19, name: 'You',                 baseCost: 5.4e22,          baseCPS: 510000000000000,icon: '🫵', desc: 'You are the cookie.' }
  ];

  // ===== TIER DEFINITIONS =====
  var TIER_THRESHOLDS = [1, 5, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];
  var TIER_COST_MULTIPLIERS = [10, 50, 500, 50000, 5e6, 5e8, 5e10, 5e12, 5e14, 5e16, 5e18, 5e20, 5e22, 5e24, 5e26];
  var TIER_NAMES = ['Plain', 'Bezel', 'Festive', 'Self-referential', 'Turbo', 'Luxurious', 'Magical',
    'Festive II', 'Cyberpunk', 'Fortune', 'Hemmed', 'Steampunk', 'Verdant', 'Otherworldly', 'Ultimate'];

  // Building flavor adjectives for tiered upgrade names
  var BUILDING_ADJECTIVES = [
    ['Reinforced index finger','Carpal tunnel prevention cream','Ambidextrous','Fast clicker','Turbo clicker','Mega clicker','Ultra clicker','Hyper clicker','Quantum clicker','Cosmic clicker','Astral clicker','Ethereal clicker','Divine clicker','Transcendent clicker','Omniscient clicker'],
    ['Forwards from grandma','Steel-plated rolling pins','Lubricated dentures','Prune juice','Double-thick glasses','Aging agents','Xtreme walkers','The Unbridling','Reverse dementia','Timeproof hair dye','Good manners','Generation degeneration','Visits','Kitchen cabinets','Foam-tipped canes'],
    ['Cheap hoes','Fertilizer','Cookie trees','Genetically-modified cookies','Gingerbread scarecrows','Pulsar sprinklers','Fudge fungus','Wheat triffids','Humane pesticides','Barnstormer','Irrigated troughs','Enriched soil','Total automation','Cookie mulch','Neverending field'],
    ['Sugar gas','Megadrill','Ultradrill','Ultimadrill','H-bomb mining','Coreforge','Planetsplitters','Canola oil wells','Mole people','Mine canaries','Bore again','Oil cookies','Dwarven workforce','Seismic upgrade','Tectonic leverage'],
    ['Sturdier conveyor belts','Child labor','Sweatshop','Radium reactors','Recombobulators','Deep-bake process','Cyborg workforce','78-hour days','Machine learning','Brownie point system','Cookie plastics','Automation revolution','The Oven Eternal','Protein bars','Quality assurance'],
    ['Taller tellers','Scissor-resistant credit cards','Acid-proof vaults','Chocolate coins','Exponential interest rates','Financial zen','Way of the wallet','The stuff rationale','Edible money','Grand supercycles','Rules of acquisition','Compound yeast','Cookie bonds','Reverse alchemy','Savings accounts'],
    ['Golden idols','Sacrificial rolling pins','Blessed cookie cutters','Mystical flour','Sacred chocolate fountains','Revered ovens','Fortune cookies','Demeter\'s cornucopia','Spiritual guidance','Unholy bakers','Mana cookies','Divine pastry arts','Ancient recipes','Zen baking','Celestial dough'],
    ['Pointier hats','Beardlier beards','Ancient grimoires','Kitchen curses','School of sorcery','Dark formulas','Cookiemancy','Rabbit trick','Counterspell','Summon bakers','Magic oven mitts','Spell cakes','Astral bake','Arcane sugar','Mystic flour'],
    ['Vanilla nebulae','Wormholes','Frequent flyer','Warp drive','Chocolate monoliths','Generation ship','Dyson sphere','The final frontier','Autopilot','Restaurants at the end of the universe','Starcrunch','Cookie comets','Edge of the universe','Hyperbolic space','Interstellar ovens'],
    ['Antimony','Essence of dough','True chocolate','Ambrosia','Aqua crustulae','Origin crucible','Theory of atomic flavor','Beige goo','The advent of chemistry','Dimensional alchemy','Gold cookies','Philosopher cookies','Molecular gastronomy','Sugar transmutation','Cookie philosopher stone'],
    ['Ancient tablet','Insane oatling workers','Soul bond','Sanity dance','Brane transplant','Deity-sized portals','End of the tunnel','Portal guns','911-bake','Five-dimensional oven','Portal to the cookieverse','Quantum baking','Warp cookies','Reality distortion','Nether cookies'],
    ['Flux capacitors','Time paradox resolver','Quantum conundrum','Causality enforcer','Yestermorrow comparators','Far future enactment','Great loop hypothesis','Cookietopian moments','Tick-tock cookie clock','Cookie time travel','Time cookies','Chronobaking','Temporal dough','Past-future blend','Timeless recipes'],
    ['Sugar bosons','String theory','Large macaron collider','Big bang bake','Reverse cyclotrons','Nanocosmics','The Pulse','Some other super particle','Cookie quarks','Antimatter baking','Quantum cookies','Particle pastry','Atomic oven','Fusion baking','Subatomic sweets'],
    ['Gem polish','9th color','Chocolate light','Grainbow','Pure cosmic light','Glow-in-the-dark','Lux sanctorum','Reverse spectrum','Light speed baking','Prismatic cookies','Rainbow dough','Light cookies','Chromatic sugar','Spectral flour','Luminous treats'],
    ['Your lucky cookie','All-seeing eye','Rabbit\'s paw','Loaded dice','Chaos theory','Gold four-leaf clover','Fortuna cookies','Lucky charms','Serendipity engine','Probability storm','Lucky cookies','Chance pastry','Fortune dough','Luck enhancement','Destiny cookies'],
    ['Metabakeries','Mandelbrot oven','Fractally nested','Recursive recipes','Infinitesimal baking','Endless iteration','The Bakerst identity','Fractal cookies','Self-similar dough','Infinite loops','Fractal flour','Pattern pastry','Recursive sugar','Iteration baking','Convergent cookies'],
    ['The JavaScript','Hardtack','64bit arrays','Stack overflow','Script injection','console.log','Garbage collection','Code cookies','Variable dough','Function flour','Debugging sugar','Runtime baking','Compiled cookies','Kernel cookies','Server-side baking'],
    ['Idle universe','Clickless clicker','Virtual idling','Idle hands','Universal constants','Parallel baking','Idle cookies','Passive dough','Multiverse flour','AFK cookies','Dimensional idle','Cosmic idling','Quantum idle','Idle dimensions','Universe cookies'],
    ['Cortical expansion','Neural clusters','Brain cookies','Synaptic sugar','Thought dough','Mind baking','Cognitive flour','Neural pastry','Brainstorm cookies','Cerebral baking','Mindful dough','Cortex cookies','Thought cookies','Brain expansion','Neural baking'],
    ['Self-actualization','Recursive self','Meta you','You cookies','Personal dough','Self flour','Identity baking','You pastry','Existential cookies','Being cookies','Self sugar','You baking','Me cookies','Us cookies','Transcendent you']
  ];

  // ===== GENERATE ALL UPGRADES =====
  Game.UpgradeData = [];
  var upgradeId = 0;

  // --- Tiered Building Upgrades (20 buildings x 15 tiers = 300 upgrades) ---
  for (var b = 0; b < 20; b++) {
    for (var t = 0; t < 15; t++) {
      var bldg = Game.BuildingData[b];
      Game.UpgradeData.push({
        id: upgradeId++,
        name: BUILDING_ADJECTIVES[b][t],
        desc: bldg.name + ' are <b>twice</b> as efficient.',
        cost: Math.ceil(bldg.baseCost * TIER_COST_MULTIPLIERS[t]),
        type: 'tier',
        buildingId: b,
        tier: t,
        tierName: TIER_NAMES[t],
        unlockAt: TIER_THRESHOLDS[t],
        icon: bldg.icon
      });
    }
  }

  // --- Finger Upgrades (15) ---
  // These are special cursor upgrades handled separately from tiers
  var fingerUpgradeId = upgradeId; // remember start
  var fingerNames = [
    'Thousand fingers', 'Million fingers', 'Billion fingers', 'Trillion fingers',
    'Quadrillion fingers', 'Quintillion fingers', 'Sextillion fingers', 'Septillion fingers',
    'Octillion fingers', 'Nonillion fingers', 'Decillion fingers', 'Undecillion fingers',
    'Duodecillion fingers', 'Tredecillion fingers', 'Quattuordecillion fingers'
  ];
  var fingerCosts = [100000, 10000000, 100000000, 1e9, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10, 1e10];
  var fingerUnlocks = [1, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
  // Multiplier chain: 0.1, then x5=0.5, x10=5, x20=100, then x20 each
  var fingerValues = [0.1];
  fingerValues[1] = 0.5;
  fingerValues[2] = 5;
  for (var i = 3; i < 15; i++) fingerValues[i] = fingerValues[i - 1] * 20;

  for (var f = 0; f < 15; f++) {
    var fingerDesc;
    if (f === 0) {
      fingerDesc = 'Each non-cursor building adds <b>+' + fingerValues[f] + ' CpS</b> per Cursor owned.';
    } else {
      var multiplier = f === 1 ? 5 : f === 2 ? 10 : 20;
      fingerDesc = 'Multiplies the gain from Thousand fingers by <b>' + multiplier + '</b>. Each non-cursor building now adds <b>+' + Game.formatNumber(fingerValues[f]) + ' CpS</b> per Cursor.';
    }
    Game.UpgradeData.push({
      id: upgradeId++,
      name: fingerNames[f],
      desc: fingerDesc,
      cost: fingerCosts[f],
      type: 'finger',
      fingerIndex: f,
      fingerValue: fingerValues[f],
      unlockCursors: fingerUnlocks[f],
      icon: '👆'
    });
  }
  Game.fingerUpgradeStartId = fingerUpgradeId;
  Game.fingerUpgradeEndId = upgradeId;

  // --- Mouse Upgrades (15) ---
  var mouseNames = [
    'Plastic mouse', 'Iron mouse', 'Titanium mouse', 'Adamantium mouse',
    'Unobtainium mouse', 'Eludium mouse', 'Wishalloy mouse', 'Fantasteel mouse',
    'Nevercrack mouse', 'Armythril mouse', 'Technobsidian mouse', 'Plasmarble mouse',
    'Miraculite mouse', 'Aetherice mouse', 'Omnite mouse'
  ];
  var mouseCosts = [50000, 5e6, 5e8, 5e10, 5e12, 5e14, 5e16, 5e18, 5e20, 5e22, 5e24, 5e26, 5e28, 5e30, 5e32];
  var mouseUpgradeStartId = upgradeId;
  for (var m = 0; m < 15; m++) {
    Game.UpgradeData.push({
      id: upgradeId++,
      name: mouseNames[m],
      desc: 'Clicking gains <b>+1% of your CpS</b>.',
      cost: mouseCosts[m],
      type: 'mouse',
      mouseIndex: m,
      icon: '🖱️'
    });
  }
  Game.mouseUpgradeStartId = mouseUpgradeStartId;
  Game.mouseUpgradeEndId = upgradeId;

  // --- Kitten Upgrades (17) ---
  var kittenNames = [
    'Kitten helpers', 'Kitten workers', 'Kitten engineers', 'Kitten overseers',
    'Kitten managers', 'Kitten accountants', 'Kitten specialists', 'Kitten experts',
    'Kitten consultants', 'Kitten assistants to the regional manager', 'Kitten marketeers',
    'Kitten analysts', 'Kitten executives', 'Kitten angels', 'Kitten wages',
    'Kitten dew', 'Kitten admins'
  ];
  var kittenCosts = [9e6, 9e8, 9e12, 9e16, 9e20, 9e24, 9e28, 9e32, 9e36, 9e40, 9e44, 9e48, 9e52, 9e56, 9e60, 9e64, 9e68];
  var kittenFactors = [0.1, 0.125, 0.15, 0.175, 0.2, 0.2, 0.2, 0.2, 0.2, 0.175, 0.15, 0.125, 0.115, 0.11, 0.105, 0.1, 0.1];
  var kittenUpgradeStartId = upgradeId;
  for (var k = 0; k < 17; k++) {
    Game.UpgradeData.push({
      id: upgradeId++,
      name: kittenNames[k],
      desc: 'You gain <b>more CpS</b> the more milk you have.',
      cost: kittenCosts[k],
      type: 'kitten',
      kittenIndex: k,
      kittenFactor: kittenFactors[k],
      icon: '🐱'
    });
  }
  Game.kittenUpgradeStartId = kittenUpgradeStartId;
  Game.kittenUpgradeEndId = upgradeId;

  // --- Grandma Type Upgrades (18) ---
  var grandmaTypes = [
    { name: 'Farmer grandmas',      linkedBuilding: 2,  cost: 55000 },
    { name: 'Miner grandmas',       linkedBuilding: 3,  cost: 600000 },
    { name: 'Worker grandmas',      linkedBuilding: 4,  cost: 6500000 },
    { name: 'Banker grandmas',      linkedBuilding: 5,  cost: 70000000 },
    { name: 'Priestess grandmas',   linkedBuilding: 6,  cost: 1e9 },
    { name: 'Witch grandmas',       linkedBuilding: 7,  cost: 1.65e10 },
    { name: 'Cosmic grandmas',      linkedBuilding: 8,  cost: 2.55e11 },
    { name: 'Transmuted grandmas',  linkedBuilding: 9,  cost: 3.75e12 },
    { name: 'Altered grandmas',     linkedBuilding: 10, cost: 5e13 },
    { name: 'Grandmas\' grandmas',  linkedBuilding: 11, cost: 7e14 },
    { name: 'Antigrandmas',         linkedBuilding: 12, cost: 8.5e15 },
    { name: 'Rainbow grandmas',     linkedBuilding: 13, cost: 1.05e17 },
    { name: 'Lucky grandmas',       linkedBuilding: 14, cost: 1.3e18 },
    { name: 'Metagrandmas',         linkedBuilding: 15, cost: 1.55e19 },
    { name: 'Binary grandmas',      linkedBuilding: 16, cost: 3.55e20 },
    { name: 'Alternate grandmas',   linkedBuilding: 17, cost: 6e21 },
    { name: 'Brainy grandmas',      linkedBuilding: 18, cost: 9.5e22 },
    { name: 'Clone grandmas',       linkedBuilding: 19, cost: 2.7e24 }
  ];
  var grandmaUpgradeStartId = upgradeId;
  for (var g = 0; g < grandmaTypes.length; g++) {
    var gt = grandmaTypes[g];
    var linkedName = Game.BuildingData[gt.linkedBuilding].name;
    Game.UpgradeData.push({
      id: upgradeId++,
      name: gt.name,
      desc: 'Grandmas gain <b>+1% CpS per ' + linkedName + '</b> owned.',
      cost: gt.cost,
      type: 'grandmaType',
      linkedBuilding: gt.linkedBuilding,
      unlockGrandmas: 1,
      unlockLinked: 15,
      icon: '👵'
    });
  }
  Game.grandmaUpgradeStartId = grandmaUpgradeStartId;
  Game.grandmaUpgradeEndId = upgradeId;

  // --- Synergy Upgrades (36) ---
  var synergyPairs = [
    [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
    [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19],
    [2, 5]
  ];
  var synergyUpgradeStartId = upgradeId;
  for (var s = 0; s < synergyPairs.length; s++) {
    var a = synergyPairs[s][0], bId = synergyPairs[s][1];
    var nameA = Game.BuildingData[a].name;
    var nameB = Game.BuildingData[bId].name;
    // A→B synergy: A gets +5% per B
    Game.UpgradeData.push({
      id: upgradeId++,
      name: nameA + ' & ' + nameB + ' synergy I',
      desc: nameA + ' gain <b>+5% CpS per ' + nameB + '</b> owned.',
      cost: Math.max(Game.BuildingData[a].baseCost, Game.BuildingData[bId].baseCost) * 1e7,
      type: 'synergy',
      boostTarget: a,
      countSource: bId,
      boostPercent: 0.05,
      unlockA: 15,
      unlockB: 15,
      icon: '🔗'
    });
    // B→A synergy: B gets +0.1% per A
    Game.UpgradeData.push({
      id: upgradeId++,
      name: nameA + ' & ' + nameB + ' synergy II',
      desc: nameB + ' gain <b>+0.1% CpS per ' + nameA + '</b> owned.',
      cost: Math.max(Game.BuildingData[a].baseCost, Game.BuildingData[bId].baseCost) * 1e7 * 1.5,
      type: 'synergy',
      boostTarget: bId,
      countSource: a,
      boostPercent: 0.001,
      unlockA: 15,
      unlockB: 15,
      icon: '🔗'
    });
  }
  Game.synergyUpgradeStartId = synergyUpgradeStartId;
  Game.synergyUpgradeEndId = upgradeId;

  // --- Flavored Cookie Upgrades (~100) ---
  var flavoredStartId = upgradeId;
  var flavoredCookies = [
    { name: 'Plain cookies',        cost: 999999,     bonus: 0.01 },
    { name: 'Sugar cookies',        cost: 5e6,        bonus: 0.01 },
    { name: 'Oatmeal raisin cookies', cost: 1e7,      bonus: 0.01 },
    { name: 'Peanut butter cookies', cost: 5e7,       bonus: 0.01 },
    { name: 'Coconut cookies',      cost: 1e8,        bonus: 0.02 },
    { name: 'White chocolate cookies', cost: 5e8,     bonus: 0.02 },
    { name: 'Macadamia nut cookies', cost: 1e9,       bonus: 0.02 },
    { name: 'Double-chip cookies',  cost: 5e9,        bonus: 0.02 },
    { name: 'White chocolate macadamia cookies', cost: 1e10, bonus: 0.02 },
    { name: 'All-chocolate cookies', cost: 5e10,      bonus: 0.02 },
    { name: 'Dark chocolate-coated cookies', cost: 1e11, bonus: 0.03 },
    { name: 'White chocolate-coated cookies', cost: 5e11, bonus: 0.03 },
    { name: 'Eclipse cookies',      cost: 1e12,       bonus: 0.02 },
    { name: 'Zebra cookies',        cost: 5e12,       bonus: 0.02 },
    { name: 'Snickerdoodles',       cost: 1e13,       bonus: 0.02 },
    { name: 'Stroopwafels',         cost: 5e13,       bonus: 0.02 },
    { name: 'Macarons',             cost: 1e14,       bonus: 0.02 },
    { name: 'Madeleines',           cost: 5e14,       bonus: 0.02 },
    { name: 'Palmiers',             cost: 1e15,       bonus: 0.02 },
    { name: 'Palets',               cost: 5e15,       bonus: 0.02 },
    { name: 'Sablés',               cost: 1e16,       bonus: 0.02 },
    { name: 'Gingerbread men',      cost: 5e16,       bonus: 0.03 },
    { name: 'Gingerbread trees',    cost: 1e17,       bonus: 0.02 },
    { name: 'Caramel wafers',       cost: 5e17,       bonus: 0.02 },
    { name: 'Butter cookies',       cost: 1e18,       bonus: 0.02 },
    { name: 'Cream cookies',        cost: 5e18,       bonus: 0.02 },
    { name: 'Gingersnaps',          cost: 1e19,       bonus: 0.02 },
    { name: 'Cinnamon cookies',     cost: 5e19,       bonus: 0.02 },
    { name: 'Vanity cookies',       cost: 1e20,       bonus: 0.02 },
    { name: 'Cigars',               cost: 5e20,       bonus: 0.02 },
    { name: 'Pinwheel cookies',     cost: 1e21,       bonus: 0.02 },
    { name: 'Fudge squares',        cost: 5e21,       bonus: 0.02 },
    { name: 'Shortbread biscuits',  cost: 1e22,       bonus: 0.03 },
    { name: 'Millionaire\'s shortbread', cost: 5e22,  bonus: 0.02 },
    { name: 'Caramel cookies',      cost: 1e23,       bonus: 0.02 },
    { name: 'Pecan sandies',        cost: 5e23,       bonus: 0.02 },
    { name: 'Moravian spice cookies', cost: 1e24,     bonus: 0.02 },
    { name: 'Anzac biscuits',       cost: 5e24,       bonus: 0.02 },
    { name: 'Buttercream biscuits', cost: 1e25,       bonus: 0.03 },
    { name: 'Ice cream sandwiches', cost: 5e25,       bonus: 0.02 },
    { name: 'Pink biscuits',        cost: 1e26,       bonus: 0.02 },
    { name: 'Whole-grain cookies',  cost: 5e26,       bonus: 0.02 },
    { name: 'Candy cookies',        cost: 1e27,       bonus: 0.02 },
    { name: 'Big chip cookies',     cost: 5e27,       bonus: 0.02 },
    { name: 'One chip cookies',     cost: 1e28,       bonus: 0.02 },
    { name: 'Sprinkles cookies',    cost: 5e28,       bonus: 0.02 },
    { name: 'Peanut butter blossoms', cost: 1e29,     bonus: 0.02 },
    { name: 'No-bake cookies',      cost: 5e29,       bonus: 0.02 },
    { name: 'Florentines',          cost: 1e30,       bonus: 0.02 },
    { name: 'Chocolate crinkles',   cost: 5e30,       bonus: 0.02 },
    { name: 'Maple cookies',        cost: 1e31,       bonus: 0.03 },
    { name: 'Truffle cookies',      cost: 5e31,       bonus: 0.02 },
    { name: 'Lavender cookies',     cost: 1e32,       bonus: 0.02 },
    { name: 'Biscotti',             cost: 5e32,       bonus: 0.02 },
    { name: 'Waffle cookies',       cost: 1e33,       bonus: 0.02 },
    { name: 'Choco leibniz',        cost: 5e33,       bonus: 0.02 },
    { name: 'Petit fours',          cost: 1e34,       bonus: 0.03 },
    { name: 'Cookie dough',         cost: 5e34,       bonus: 0.02 },
    { name: 'Molasses cookies',     cost: 1e35,       bonus: 0.02 },
    { name: 'Biscuit sticks',       cost: 5e35,       bonus: 0.02 },
    { name: 'Iced shortbread',      cost: 1e36,       bonus: 0.02 },
    { name: 'Crumb cookies',        cost: 5e36,       bonus: 0.02 },
    { name: 'Hermit cookies',       cost: 1e37,       bonus: 0.02 },
    { name: 'Jam-filled cookies',   cost: 5e37,       bonus: 0.02 },
    { name: 'Kolaczki',             cost: 1e38,       bonus: 0.02 },
    { name: 'Rugelach',             cost: 5e38,       bonus: 0.02 },
    { name: 'Alfajores',            cost: 1e39,       bonus: 0.03 },
    { name: 'Polvorones',           cost: 5e39,       bonus: 0.02 },
    { name: 'Rosette cookies',      cost: 1e40,       bonus: 0.02 },
    { name: 'Pfeffernüsse',         cost: 5e40,       bonus: 0.02 },
    { name: 'Springerle',           cost: 1e41,       bonus: 0.02 },
    { name: 'Speculaas',            cost: 5e41,       bonus: 0.02 },
    { name: 'Krumkake',             cost: 1e42,       bonus: 0.02 },
    { name: 'Berger cookies',       cost: 5e42,       bonus: 0.02 },
    { name: 'Danishes',             cost: 1e43,       bonus: 0.03 },
    { name: 'Thumbprint cookies',   cost: 5e43,       bonus: 0.02 },
    { name: 'Ladyfingers',          cost: 1e44,       bonus: 0.02 },
    { name: 'Meringue cookies',     cost: 5e44,       bonus: 0.02 },
    { name: 'Granola cookies',      cost: 1e45,       bonus: 0.02 },
    { name: 'Spice drops',          cost: 5e45,       bonus: 0.02 },
    { name: 'Tea biscuits',         cost: 1e46,       bonus: 0.02 },
    { name: 'Chocolate pretzels',   cost: 5e46,       bonus: 0.02 },
    { name: 'Brownie cookies',      cost: 1e47,       bonus: 0.03 },
    { name: 'Lemon drops',          cost: 5e47,       bonus: 0.02 },
    { name: 'Snowball cookies',     cost: 1e48,       bonus: 0.02 },
    { name: 'Royal icing cookies',  cost: 5e48,       bonus: 0.02 },
    { name: 'Fortune cookies',      cost: 1e49,       bonus: 0.02 },
    { name: 'Monster cookies',      cost: 5e49,       bonus: 0.02 },
    { name: 'Wedding cookies',      cost: 1e50,       bonus: 0.02 },
    { name: 'Chocolate chip cookies', cost: 5e50,     bonus: 0.05 },
    { name: 'Galaxy cookies',       cost: 1e51,       bonus: 0.02 },
    { name: 'Cosmic brownies',      cost: 5e51,       bonus: 0.03 },
    { name: 'Heavenly cookies',     cost: 1e52,       bonus: 0.05 },
    { name: 'Pure chocolate cookies', cost: 5e52,     bonus: 0.05 },
    { name: 'Cookie of the gods',   cost: 1e53,       bonus: 0.05 },
    { name: 'Ethereal cookies',     cost: 5e53,       bonus: 0.03 },
    { name: 'Transcendent cookies', cost: 1e54,       bonus: 0.05 },
    { name: 'Infinity cookies',     cost: 5e54,       bonus: 0.05 },
    { name: 'Ultimate cookies',     cost: 1e55,       bonus: 0.10 },
    { name: 'Eternal cookies',      cost: 5e55,       bonus: 0.10 }
  ];

  for (var fc = 0; fc < flavoredCookies.length; fc++) {
    var fl = flavoredCookies[fc];
    Game.UpgradeData.push({
      id: upgradeId++,
      name: fl.name,
      desc: 'Cookie production multiplier <b>+' + Math.round(fl.bonus * 100) + '%</b>.',
      cost: fl.cost,
      type: 'flavored',
      bonus: fl.bonus,
      icon: '🍪'
    });
  }
  Game.flavoredUpgradeStartId = flavoredStartId;
  Game.flavoredUpgradeEndId = upgradeId;

  // --- Heavenly Upgrades (purchased during ascension) ---
  var heavenlyStartId = upgradeId;
  Game.HeavenlyUpgradeData = [
    { id: upgradeId++, name: 'Legacy',                cost: 1,       desc: 'Unlocks the prestige system. Cookie production +X% per prestige level.', icon: '⭐', prereqs: [] },
    { id: upgradeId++, name: 'Heavenly cookies',      cost: 3,       desc: 'Cookie production <b>+10%</b>.', icon: '🌟', bonus: 0.10, prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Tin of butter cookies',  cost: 25,      desc: 'Cookie production <b>+10%</b>.', icon: '🥫', bonus: 0.10, prereqs: ['Heavenly cookies'] },
    { id: upgradeId++, name: 'Tin of british tea biscuits', cost: 25, desc: 'Cookie production <b>+10%</b>.', icon: '🫖', bonus: 0.10, prereqs: ['Heavenly cookies'] },
    { id: upgradeId++, name: 'Box of brand biscuits', cost: 25,      desc: 'Cookie production <b>+10%</b>.', icon: '📦', bonus: 0.10, prereqs: ['Heavenly cookies'] },
    { id: upgradeId++, name: 'Starter kit',            cost: 50,      desc: 'You start with <b>10 free Cursors</b>.', icon: '🎁', prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Starter kitchen',        cost: 5000,    desc: 'You start with <b>10 free Grandmas</b>.', icon: '🍳', prereqs: ['Starter kit'] },
    { id: upgradeId++, name: 'Heavenly luck',          cost: 77,      desc: 'Golden cookies appear <b>5%</b> more often.', icon: '🍀', prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Lasting fortune',        cost: 777,     desc: 'Golden cookie effects last <b>10%</b> longer.', icon: '✨', prereqs: ['Heavenly luck'] },
    { id: upgradeId++, name: 'Get lucky',              cost: 7777,    desc: 'Golden cookie effects last <b>twice as long</b>.', icon: '🎲', prereqs: ['Lasting fortune'] },
    { id: upgradeId++, name: 'Season switcher',        cost: 1111,    desc: 'Unlocks seasonal event controls.', icon: '📅', prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Permanent upgrade slot I', cost: 100,   desc: 'One upgrade persists through ascension.', icon: '🔒', prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Permanent upgrade slot II', cost: 20000, desc: 'One more upgrade persists.', icon: '🔒', prereqs: ['Permanent upgrade slot I'] },
    { id: upgradeId++, name: 'How to bake your dragon', cost: 9,      desc: 'Unlocks Krumblor, the cookie dragon. (Not implemented)', icon: '🐉', prereqs: ['Legacy'] },
    { id: upgradeId++, name: 'Heavenly chip secret',   cost: 5,       desc: 'Prestige CpS bonus unlocked.', icon: '🔮', prereqs: ['Legacy'] }
  ];
  Game.heavenlyUpgradeStartId = heavenlyStartId;
  Game.heavenlyUpgradeEndId = upgradeId;

  // Store total
  Game.totalUpgradeCount = upgradeId;

  // ===== ACHIEVEMENT DATA =====
  Game.AchievementData = [];
  var achId = 0;

  // --- Building Ownership achievements (20 buildings x 10 milestones) ---
  var buildingMilestones = [1, 5, 25, 50, 100, 150, 200, 250, 300, 350];
  for (var bi = 0; bi < 20; bi++) {
    var bn = Game.BuildingData[bi].name;
    for (var mi = 0; mi < buildingMilestones.length; mi++) {
      var milestone = buildingMilestones[mi];
      Game.AchievementData.push({
        id: achId++,
        name: 'Own ' + milestone + ' ' + bn + (milestone > 1 ? 's' : ''),
        desc: 'Have <b>' + milestone + '</b> ' + bn + (milestone > 1 ? 's' : '') + '.',
        type: 'building',
        buildingId: bi,
        threshold: milestone,
        icon: Game.BuildingData[bi].icon,
        condition: function(bid, thr) { return function(state) { return state.buildings[bid].count >= thr; }; }(bi, milestone)
      });
    }
  }

  // --- Cookie Baking achievements ---
  var bakingMilestones = [
    { name: 'Wake and bake', amount: 1, desc: 'Bake <b>1</b> cookie.' },
    { name: 'Making some dough', amount: 1000, desc: 'Bake <b>1,000</b> cookies.' },
    { name: 'So baked right now', amount: 1e6, desc: 'Bake <b>1 million</b> cookies.' },
    { name: 'Fledgling bakery', amount: 1e7, desc: 'Bake <b>10 million</b> cookies.' },
    { name: 'Affluent bakery', amount: 1e8, desc: 'Bake <b>100 million</b> cookies.' },
    { name: 'World-famous bakery', amount: 1e9, desc: 'Bake <b>1 billion</b> cookies.' },
    { name: 'Cosmic bakery', amount: 1e10, desc: 'Bake <b>10 billion</b> cookies.' },
    { name: 'Galactic bakery', amount: 1e11, desc: 'Bake <b>100 billion</b> cookies.' },
    { name: 'Universal bakery', amount: 1e12, desc: 'Bake <b>1 trillion</b> cookies.' },
    { name: 'Timeless bakery', amount: 1e13, desc: 'Bake <b>10 trillion</b> cookies.' },
    { name: 'Infinite bakery', amount: 1e14, desc: 'Bake <b>100 trillion</b> cookies.' },
    { name: 'Immortal bakery', amount: 1e15, desc: 'Bake <b>1 quadrillion</b> cookies.' },
    { name: 'Don\'t stop me now', amount: 1e16, desc: 'Bake <b>10 quadrillion</b> cookies.' },
    { name: 'You can stop now', amount: 1e17, desc: 'Bake <b>100 quadrillion</b> cookies.' },
    { name: 'Cookies all the way down', amount: 1e18, desc: 'Bake <b>1 quintillion</b> cookies.' },
    { name: 'Overdose', amount: 1e20, desc: 'Bake <b>100 quintillion</b> cookies.' },
    { name: 'The land of milk and cookies', amount: 1e23, desc: 'Bake <b>100 sextillion</b> cookies.' },
    { name: 'He who controls the cookies...', amount: 1e26, desc: 'Bake <b>100 septillion</b> cookies.' },
    { name: 'The real cookie monster', amount: 1e30, desc: 'Bake <b>1 nonillion</b> cookies.' },
    { name: 'Cookie infinity', amount: 1e35, desc: 'Bake <b>100 decillion</b> cookies.' },
    { name: 'Cookie eternity', amount: 1e40, desc: 'Bake <b>10 tredecillion</b> cookies.' },
    { name: 'Cookie oblivion', amount: 1e45, desc: 'Bake <b>1 quattuordecillion</b> cookies.' }
  ];
  for (var bm = 0; bm < bakingMilestones.length; bm++) {
    var bk = bakingMilestones[bm];
    Game.AchievementData.push({
      id: achId++,
      name: bk.name,
      desc: bk.desc,
      type: 'baking',
      threshold: bk.amount,
      icon: '🍪',
      condition: function(thr) { return function(state) { return state.cookiesBakedAllTime >= thr; }; }(bk.amount)
    });
  }

  // --- CPS milestones ---
  var cpsMilestones = [
    { name: 'Casual baking', amount: 1, desc: 'Bake <b>1</b> cookie per second.' },
    { name: 'Hardcore baking', amount: 10, desc: 'Bake <b>10</b> cookies per second.' },
    { name: 'Steady tasty stream', amount: 100, desc: 'Bake <b>100</b> cookies per second.' },
    { name: 'Cookie monster', amount: 1000, desc: 'Bake <b>1,000</b> cookies per second.' },
    { name: 'Mass producer', amount: 1e4, desc: 'Bake <b>10,000</b> cookies per second.' },
    { name: 'Cookie vortex', amount: 1e6, desc: 'Bake <b>1 million</b> cookies per second.' },
    { name: 'Cookie singularity', amount: 1e9, desc: 'Bake <b>1 billion</b> cookies per second.' },
    { name: 'Cookie god', amount: 1e12, desc: 'Bake <b>1 trillion</b> cookies per second.' },
    { name: 'Cookie transcendence', amount: 1e15, desc: 'Bake <b>1 quadrillion</b> cookies per second.' },
    { name: 'Cookie omniscience', amount: 1e20, desc: 'Bake <b>100 quintillion</b> cookies per second.' },
    { name: 'Cookie beyond', amount: 1e25, desc: 'Bake <b>10 septillion</b> cookies per second.' },
    { name: 'Cookie supreme', amount: 1e30, desc: 'Bake <b>1 nonillion</b> cookies per second.' }
  ];
  for (var cm = 0; cm < cpsMilestones.length; cm++) {
    var cp = cpsMilestones[cm];
    Game.AchievementData.push({
      id: achId++,
      name: cp.name,
      desc: cp.desc,
      type: 'cps',
      threshold: cp.amount,
      icon: '⚡',
      condition: function(thr) { return function(state) { return state.cps >= thr; }; }(cp.amount)
    });
  }

  // --- Clicking milestones ---
  var clickMilestones = [
    { name: 'Click', amount: 1, desc: 'Click the big cookie <b>1</b> time.' },
    { name: 'Double-click', amount: 2, desc: 'Click the big cookie <b>2</b> times.' },
    { name: 'Clickathon', amount: 100, desc: 'Click <b>100</b> times.' },
    { name: 'Clickolympics', amount: 1000, desc: 'Click <b>1,000</b> times.' },
    { name: 'Clickorama', amount: 5000, desc: 'Click <b>5,000</b> times.' },
    { name: 'Click delegator', amount: 10000, desc: 'Click <b>10,000</b> times.' },
    { name: 'Finger broken', amount: 25000, desc: 'Click <b>25,000</b> times.' },
    { name: 'Carpal tunnel syndrome', amount: 50000, desc: 'Click <b>50,000</b> times.' },
    { name: 'Neverending clickstory', amount: 100000, desc: 'Click <b>100,000</b> times.' },
    { name: 'Clicktastic', amount: 200000, desc: 'Click <b>200,000</b> times.' },
    { name: 'Clickcataclysm', amount: 500000, desc: 'Click <b>500,000</b> times.' }
  ];
  for (var clm = 0; clm < clickMilestones.length; clm++) {
    var cl = clickMilestones[clm];
    Game.AchievementData.push({
      id: achId++,
      name: cl.name,
      desc: cl.desc,
      type: 'click',
      threshold: cl.amount,
      icon: '👆',
      condition: function(thr) { return function(state) { return state.clickCount >= thr; }; }(cl.amount)
    });
  }

  // --- Golden cookie milestones ---
  var goldenMilestones = [
    { name: 'Golden cookie', amount: 1, desc: 'Click <b>1</b> golden cookie.' },
    { name: 'Lucky cookie', amount: 7, desc: 'Click <b>7</b> golden cookies.' },
    { name: 'A stroke of luck', amount: 27, desc: 'Click <b>27</b> golden cookies.' },
    { name: 'Fortune', amount: 77, desc: 'Click <b>77</b> golden cookies.' },
    { name: 'Leprechaun', amount: 177, desc: 'Click <b>177</b> golden cookies.' },
    { name: 'Black cat\'s paw', amount: 777, desc: 'Click <b>777</b> golden cookies.' },
    { name: 'Seven horseshoes', amount: 2777, desc: 'Click <b>2,777</b> golden cookies.' }
  ];
  for (var gm = 0; gm < goldenMilestones.length; gm++) {
    var gc = goldenMilestones[gm];
    Game.AchievementData.push({
      id: achId++,
      name: gc.name,
      desc: gc.desc,
      type: 'golden',
      threshold: gc.amount,
      icon: '🌟',
      condition: function(thr) { return function(state) { return state.goldenClickCount >= thr; }; }(gc.amount)
    });
  }

  // --- Prestige milestones ---
  var prestigeMilestones = [
    { name: 'Ascend!', amount: 1, desc: 'Reach prestige level <b>1</b>.' },
    { name: 'Reborn', amount: 10, desc: 'Reach prestige level <b>10</b>.' },
    { name: 'Veteran', amount: 100, desc: 'Reach prestige level <b>100</b>.' },
    { name: 'Elder', amount: 1000, desc: 'Reach prestige level <b>1,000</b>.' },
    { name: 'Legend', amount: 10000, desc: 'Reach prestige level <b>10,000</b>.' },
    { name: 'Deity', amount: 100000, desc: 'Reach prestige level <b>100,000</b>.' }
  ];
  for (var pm = 0; pm < prestigeMilestones.length; pm++) {
    var pr = prestigeMilestones[pm];
    Game.AchievementData.push({
      id: achId++,
      name: pr.name,
      desc: pr.desc,
      type: 'prestige',
      threshold: pr.amount,
      icon: '⭐',
      condition: function(thr) { return function(state) { return state.prestigeLevel >= thr; }; }(pr.amount)
    });
  }

  // --- Miscellaneous achievements ---
  Game.AchievementData.push({
    id: achId++,
    name: 'Tiny cookie',
    desc: 'Click the big cookie.',
    type: 'misc',
    icon: '🍪',
    condition: function(state) { return state.clickCount >= 1; }
  });
  Game.AchievementData.push({
    id: achId++,
    name: 'Neverclick',
    desc: 'Make <b>1 million</b> cookies with no more than <b>15</b> clicks.',
    type: 'misc',
    icon: '🚫',
    condition: function(state) { return state.cookiesBaked >= 1e6 && state.clickCount <= 15; }
  });

  Game.totalAchievementCount = achId;
})();
