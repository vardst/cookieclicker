var Game = Game || {};

(function() {
  'use strict';

  Game.calculateClickValue = function() {
    var state = Game.state;

    // Step 1: Base click value
    var value = 1;

    // Step 2-4: Flat clicking upgrades (from tier 0 cursor upgrades)
    // The first 3 cursor tiers act as +1 each to click base
    // (Reinforced index finger, Carpal tunnel, Ambidextrous)
    // These are already cursor tiers; we give a small flat bonus per cursor tier
    var cursorTiers = Game.getOwnedTiersForBuilding(0);
    value += Math.min(cursorTiers, 3); // +1 per first 3 cursor tiers

    // Step 5: Finger bonus applied to clicks
    var fingerIdx = Game.getHighestFingerUpgrade();
    if (fingerIdx >= 0) {
      var fingerValue = Game.UpgradeData[Game.fingerUpgradeStartId + fingerIdx].fingerValue;
      var nonCursorCount = Game.getNonCursorBuildings();
      value += fingerValue * nonCursorCount;
    }

    // Step 6: Mouse upgrades: +1% of CPS per mouse upgrade
    var mouseCount = Game.getMouseUpgradeCount();
    if (mouseCount > 0) {
      value += state.cps * 0.01 * mouseCount;
    }

    // Step 7: Click buff multiplier
    var clickBuffMult = 1;
    for (var i = 0; i < state.buffs.length; i++) {
      var buff = state.buffs[i];
      if (buff.type === 'clickFrenzy') {
        clickBuffMult *= buff.multiplier;
      }
    }
    value *= clickBuffMult;

    // Step 8-12: Cursed finger, dragon, pantheon, prestige clicking (skip)

    state.cpc = Math.max(value, 1);
    return state.cpc;
  };

  Game.handleClick = function() {
    var value = Game.calculateClickValue();
    Game.state.cookies += value;
    Game.state.cookiesBaked += value;
    Game.state.cookiesBakedAllTime += value;
    Game.state.clickCount++;

    if (Game.spawnClickParticle) {
      Game.spawnClickParticle(value);
    }
  };
})();
