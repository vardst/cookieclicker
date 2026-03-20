var Game = Game || {};

(function() {
  'use strict';

  Game.hasUpgrade = function(id) {
    return Game.state.ownedUpgradesSet[id] === true;
  };

  Game.hasHeavenlyUpgrade = function(id) {
    return Game.state.heavenlyUpgradesSet[id] === true;
  };

  Game.buyUpgrade = function(id) {
    var upgrade = Game.UpgradeData[id];
    if (!upgrade) return false;
    if (Game.state.cookies < upgrade.cost) return false;
    if (Game.hasUpgrade(id)) return false;

    Game.state.cookies -= upgrade.cost;
    Game.state.ownedUpgrades.push(id);
    Game.state.ownedUpgradesSet[id] = true;
    delete Game.state.unlockedUpgrades[id];

    Game.recalculate();
    if (Game.renderAll) Game.renderAll();
    return true;
  };

  Game.checkUpgradeUnlocks = function() {
    var state = Game.state;
    var data = Game.UpgradeData;

    for (var i = 0; i < data.length; i++) {
      var u = data[i];
      if (state.ownedUpgradesSet[u.id] || state.unlockedUpgrades[u.id]) continue;

      // Don't check heavenly upgrades here (they're handled in ascension screen)
      if (u.id >= Game.heavenlyUpgradeStartId && u.id < Game.heavenlyUpgradeEndId) continue;

      var unlocked = false;

      if (u.type === 'tier') {
        // Need to own threshold of building, and all previous tiers
        if (state.buildings[u.buildingId].count >= u.unlockAt) {
          // Check previous tiers are owned
          var prevOwned = true;
          if (u.tier > 0) {
            var prevId = u.id - 1; // tiers are sequential per building
            if (!state.ownedUpgradesSet[prevId]) prevOwned = false;
          }
          if (prevOwned) unlocked = true;
        }
      } else if (u.type === 'finger') {
        unlocked = state.buildings[0].count >= u.unlockCursors;
        // Need previous finger upgrade
        if (u.fingerIndex > 0) {
          var prevFingerId = Game.fingerUpgradeStartId + u.fingerIndex - 1;
          if (!state.ownedUpgradesSet[prevFingerId]) unlocked = false;
        }
      } else if (u.type === 'mouse') {
        // Unlock based on total clicks
        var clickThresholds = [0, 1000, 5000, 15000, 50000, 100000, 200000, 400000, 800000, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7];
        unlocked = state.clickCount >= (clickThresholds[u.mouseIndex] || 0);
        // Also require enough cookies baked
        unlocked = unlocked && state.cookiesBaked >= u.cost * 0.5;
      } else if (u.type === 'kitten') {
        // Unlock by achievements count
        var kittenAchReqs = [25, 50, 100, 150, 200, 250, 300, 350, 400, 425, 450, 475, 500, 525, 550, 575, 600];
        unlocked = state.achievements.length >= (kittenAchReqs[u.kittenIndex] || 25);
      } else if (u.type === 'grandmaType') {
        unlocked = state.buildings[1].count >= u.unlockGrandmas && state.buildings[u.linkedBuilding].count >= u.unlockLinked;
      } else if (u.type === 'synergy') {
        var countA = state.buildings[u.boostTarget].count;
        var countB = state.buildings[u.countSource].count;
        unlocked = countA >= u.unlockA && countB >= u.unlockB;
      } else if (u.type === 'flavored') {
        // Unlock when you can roughly afford them (baked enough)
        unlocked = state.cookiesBaked >= u.cost * 0.25;
      }

      if (unlocked) {
        state.unlockedUpgrades[u.id] = true;
      }
    }
  };

  Game.getUpgradesByType = function(type) {
    var result = [];
    var owned = Game.state.ownedUpgrades;
    for (var i = 0; i < owned.length; i++) {
      var u = Game.UpgradeData[owned[i]];
      if (u && u.type === type) result.push(u);
    }
    return result;
  };

  Game.getOwnedTiersForBuilding = function(buildingId) {
    var count = 0;
    var startId = buildingId * 15; // tiers are first 300 IDs, 15 per building
    for (var t = 0; t < 15; t++) {
      if (Game.state.ownedUpgradesSet[startId + t]) count++;
    }
    return count;
  };

  Game.getHighestFingerUpgrade = function() {
    var highest = -1;
    for (var f = 0; f < 15; f++) {
      if (Game.hasUpgrade(Game.fingerUpgradeStartId + f)) {
        highest = f;
      }
    }
    return highest;
  };

  Game.getMouseUpgradeCount = function() {
    var count = 0;
    for (var m = 0; m < 15; m++) {
      if (Game.hasUpgrade(Game.mouseUpgradeStartId + m)) count++;
    }
    return count;
  };
})();
