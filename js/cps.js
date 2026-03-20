var Game = Game || {};

(function() {
  'use strict';

  Game.calculateCPS = function() {
    var state = Game.state;
    var buildingCPS = new Array(20);

    // Step 1: Base CPS per building
    for (var i = 0; i < 20; i++) {
      buildingCPS[i] = Game.BuildingData[i].baseCPS * state.buildings[i].count;
    }

    // Step 2: Apply tier multipliers (x2 per owned tier)
    for (var b = 0; b < 20; b++) {
      var tiers = Game.getOwnedTiersForBuilding(b);
      if (tiers > 0) {
        buildingCPS[b] *= Math.pow(2, tiers);
      }
    }

    // Step 3: Cursor finger bonus
    var fingerIdx = Game.getHighestFingerUpgrade();
    if (fingerIdx >= 0) {
      var fingerValue = Game.UpgradeData[Game.fingerUpgradeStartId + fingerIdx].fingerValue;
      var nonCursorCount = Game.getNonCursorBuildings();
      buildingCPS[0] += fingerValue * nonCursorCount * state.buildings[0].count;
    }

    // Step 4: Grandma type bonuses
    var grandmaUpgrades = Game.getUpgradesByType('grandmaType');
    for (var g = 0; g < grandmaUpgrades.length; g++) {
      var gu = grandmaUpgrades[g];
      var linkedCount = state.buildings[gu.linkedBuilding].count;
      // Each grandma type: grandma CPS += grandmaCount * baseCPS * linkedCount * 0.01
      buildingCPS[1] += state.buildings[1].count * Game.BuildingData[1].baseCPS * linkedCount * 0.01;
    }

    // Step 5: Synergy bonuses
    var synergyUpgrades = Game.getUpgradesByType('synergy');
    for (var s = 0; s < synergyUpgrades.length; s++) {
      var su = synergyUpgrades[s];
      var sourceCount = state.buildings[su.countSource].count;
      buildingCPS[su.boostTarget] *= (1 + su.boostPercent * sourceCount);
    }

    // Sum all building CPS
    var totalCPS = 0;
    for (var t = 0; t < 20; t++) {
      totalCPS += buildingCPS[t];
    }

    // Step 6: Flavored cookie multiplier (multiplicative)
    var flavoredUpgrades = Game.getUpgradesByType('flavored');
    var flavoredMult = 1;
    for (var f = 0; f < flavoredUpgrades.length; f++) {
      flavoredMult *= (1 + flavoredUpgrades[f].bonus);
    }
    totalCPS *= flavoredMult;

    // Step 7: Century egg (skip - garden not in scope)

    // Step 8: Prestige multiplier
    if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[0].id) &&
        Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[14].id)) {
      // "Legacy" + "Heavenly chip secret" enables prestige bonus
      var prestigeMult = 1 + state.prestigeLevel * 0.01;
      totalCPS *= prestigeMult;
    }

    // Step 8b: Heavenly cookie upgrades flat bonuses
    for (var h = 0; h < Game.HeavenlyUpgradeData.length; h++) {
      var hu = Game.HeavenlyUpgradeData[h];
      if (hu.bonus && Game.hasHeavenlyUpgrade(hu.id)) {
        totalCPS *= (1 + hu.bonus);
      }
    }

    // Step 9: Kitten multiplier
    var milk = Game.getMilk ? Game.getMilk() : 0;
    var kittenUpgrades = Game.getUpgradesByType('kitten');
    var kittenMult = 1;
    for (var k = 0; k < kittenUpgrades.length; k++) {
      kittenMult *= (1 + milk * kittenUpgrades[k].kittenFactor);
    }
    totalCPS *= kittenMult;

    // Step 10-12: Dragon, building levels, pantheon (skip)

    // Step 13: Golden cookie buff multipliers
    var cpsBuffMult = 1;
    for (var bf = 0; bf < state.buffs.length; bf++) {
      var buff = state.buffs[bf];
      if (buff.type === 'frenzy' || buff.type === 'elderFrenzy' || buff.type === 'buildingSpecial' || buff.type === 'clot') {
        cpsBuffMult *= buff.multiplier;
      }
    }
    totalCPS *= cpsBuffMult;

    // Step 14-20: Santa, Easter, loans, wrinklers, debuffs, golden switch, veil (skip or handled in buffs above)

    state.cps = totalCPS;
    state.buildingCPS = buildingCPS;
    return totalCPS;
  };

  Game.recalculate = function() {
    Game.calculateCPS();
    Game.calculateClickValue();
  };
})();
