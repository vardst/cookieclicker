var Game = Game || {};

(function() {
  'use strict';

  Game.getDefaultState = function() {
    var buildings = [];
    for (var i = 0; i < 20; i++) {
      buildings.push({ count: 0, totalBuilt: 0 });
    }

    return {
      cookies: 0,
      cookiesBaked: 0,
      cookiesBakedAllTime: 0,
      cookiesReset: 0,
      cps: 0,
      cpc: 1,
      clickCount: 0,
      goldenClickCount: 0,
      buildings: buildings,
      ownedUpgrades: [],
      ownedUpgradesSet: {},
      unlockedUpgrades: {},
      achievements: [],
      achievementsSet: {},
      prestigeLevel: 0,
      heavenlyChips: 0,
      heavenlyChipsSpent: 0,
      heavenlyUpgrades: [],
      heavenlyUpgradesSet: {},
      buffs: [],
      goldenCookieTimer: 0,
      goldenCookieInterval: 0,
      startDate: Date.now(),
      lastSaveTime: Date.now(),
      buyMode: 1,
      ascensionCount: 0
    };
  };

  Game.state = Game.getDefaultState();

  Game.resetForAscension = function() {
    var old = Game.state;
    var newState = Game.getDefaultState();

    // Preserve cross-ascension data
    newState.cookiesBakedAllTime = old.cookiesBakedAllTime;
    newState.cookiesReset = old.cookiesReset + old.cookiesBaked;
    newState.prestigeLevel = old.prestigeLevel;
    newState.heavenlyChips = old.heavenlyChips;
    newState.heavenlyChipsSpent = old.heavenlyChipsSpent;
    newState.heavenlyUpgrades = old.heavenlyUpgrades.slice();
    newState.heavenlyUpgradesSet = {};
    for (var i = 0; i < old.heavenlyUpgrades.length; i++) {
      newState.heavenlyUpgradesSet[old.heavenlyUpgrades[i]] = true;
    }
    newState.achievements = old.achievements.slice();
    newState.achievementsSet = {};
    for (var j = 0; j < old.achievements.length; j++) {
      newState.achievementsSet[old.achievements[j]] = true;
    }
    newState.startDate = Date.now();
    newState.lastSaveTime = Date.now();
    newState.ascensionCount = old.ascensionCount + 1;

    // Apply starter kit effects
    if (newState.heavenlyUpgradesSet[Game.HeavenlyUpgradeData[5].id]) {
      // Starter kit: 10 free cursors
      newState.buildings[0].count = 10;
      newState.buildings[0].totalBuilt = 10;
    }
    if (newState.heavenlyUpgradesSet[Game.HeavenlyUpgradeData[6].id]) {
      // Starter kitchen: 10 free grandmas
      newState.buildings[1].count = 10;
      newState.buildings[1].totalBuilt = 10;
    }

    Game.state = newState;
  };

  Game.getTotalBuildings = function() {
    var total = 0;
    for (var i = 0; i < 20; i++) {
      total += Game.state.buildings[i].count;
    }
    return total;
  };

  Game.getNonCursorBuildings = function() {
    var total = 0;
    for (var i = 1; i < 20; i++) {
      total += Game.state.buildings[i].count;
    }
    return total;
  };
})();
