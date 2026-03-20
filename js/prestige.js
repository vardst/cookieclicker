var Game = Game || {};

(function() {
  'use strict';

  Game.getPrestigeLevel = function(totalCookies) {
    if (totalCookies < 1e12) return 0;
    return Math.floor(Math.cbrt(totalCookies / 1e12));
  };

  Game.getCookiesForPrestigeLevel = function(level) {
    return 1e12 * level * level * level;
  };

  Game.getPotentialPrestigeGain = function() {
    var totalBaked = Game.state.cookiesBakedAllTime;
    var newLevel = Game.getPrestigeLevel(totalBaked);
    return Math.max(0, newLevel - Game.state.prestigeLevel);
  };

  Game.getNewPrestigeLevel = function() {
    return Game.getPrestigeLevel(Game.state.cookiesBakedAllTime);
  };

  Game.canAscend = function() {
    return Game.getPotentialPrestigeGain() >= 1;
  };

  Game.ascend = function() {
    if (!Game.canAscend()) return false;

    var gain = Game.getPotentialPrestigeGain();
    var newLevel = Game.getNewPrestigeLevel();

    Game.state.prestigeLevel = newLevel;
    Game.state.heavenlyChips += gain;

    // Show ascension screen
    Game.showAscensionScreen();
    return true;
  };

  Game.reincarnate = function() {
    Game.resetForAscension();
    Game.hideAscensionScreen();
    Game.recalculate();
    Game.checkUpgradeUnlocks();
    Game.save();
    if (Game.renderAll) Game.renderAll();
  };

  Game.buyHeavenlyUpgrade = function(index) {
    var upgrade = Game.HeavenlyUpgradeData[index];
    if (!upgrade) return false;

    var availableChips = Game.state.heavenlyChips - Game.state.heavenlyChipsSpent;
    if (availableChips < upgrade.cost) return false;
    if (Game.hasHeavenlyUpgrade(upgrade.id)) return false;

    // Check prereqs
    if (upgrade.prereqs && upgrade.prereqs.length > 0) {
      for (var i = 0; i < upgrade.prereqs.length; i++) {
        var prereqName = upgrade.prereqs[i];
        var found = false;
        for (var j = 0; j < Game.HeavenlyUpgradeData.length; j++) {
          if (Game.HeavenlyUpgradeData[j].name === prereqName) {
            if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[j].id)) {
              found = true;
            }
            break;
          }
        }
        if (!found) return false;
      }
    }

    Game.state.heavenlyChipsSpent += upgrade.cost;
    Game.state.heavenlyUpgrades.push(upgrade.id);
    Game.state.heavenlyUpgradesSet[upgrade.id] = true;

    return true;
  };

  Game.showAscensionScreen = function() {
    var screen = document.getElementById('ascension-screen');
    if (screen) screen.classList.add('active');
    Game.renderAscensionScreen();
  };

  Game.hideAscensionScreen = function() {
    var screen = document.getElementById('ascension-screen');
    if (screen) screen.classList.remove('active');
  };

  Game.renderAscensionScreen = function() {
    var container = document.getElementById('heavenly-upgrades');
    if (!container) return;

    var available = Game.state.heavenlyChips - Game.state.heavenlyChipsSpent;

    var html = '<div class="ascension-header">';
    html += '<h2>Ascension</h2>';
    html += '<p>Prestige Level: <b>' + Game.formatNumber(Game.state.prestigeLevel) + '</b></p>';
    html += '<p>Heavenly Chips available: <b>' + Game.formatNumber(available) + '</b></p>';
    html += '</div>';
    html += '<div class="heavenly-grid">';

    for (var i = 0; i < Game.HeavenlyUpgradeData.length; i++) {
      var hu = Game.HeavenlyUpgradeData[i];
      var owned = Game.hasHeavenlyUpgrade(hu.id);
      var canAfford = available >= hu.cost;

      // Check prereqs
      var prereqsMet = true;
      if (hu.prereqs && hu.prereqs.length > 0) {
        for (var p = 0; p < hu.prereqs.length; p++) {
          var found = false;
          for (var j = 0; j < Game.HeavenlyUpgradeData.length; j++) {
            if (Game.HeavenlyUpgradeData[j].name === hu.prereqs[p] && Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[j].id)) {
              found = true;
              break;
            }
          }
          if (!found) { prereqsMet = false; break; }
        }
      }

      var cls = 'heavenly-upgrade';
      if (owned) cls += ' owned';
      else if (!canAfford || !prereqsMet) cls += ' locked';

      html += '<div class="' + cls + '" data-index="' + i + '" title="' + hu.name + '\n' + hu.desc + '\nCost: ' + Game.formatNumber(hu.cost) + ' HC">';
      html += '<span class="hu-icon">' + hu.icon + '</span>';
      html += '<span class="hu-name">' + hu.name + '</span>';
      html += '<span class="hu-cost">' + Game.formatNumber(hu.cost) + ' HC</span>';
      html += '</div>';
    }

    html += '</div>';
    html += '<button id="reincarnate-btn" class="btn-reincarnate">Reincarnate</button>';
    container.innerHTML = html;

    // Wire up handlers
    var upgrades = container.querySelectorAll('.heavenly-upgrade:not(.owned):not(.locked)');
    for (var u = 0; u < upgrades.length; u++) {
      upgrades[u].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-index'));
        if (Game.buyHeavenlyUpgrade(idx)) {
          Game.renderAscensionScreen();
        }
      });
    }

    var reinBtn = document.getElementById('reincarnate-btn');
    if (reinBtn) {
      reinBtn.addEventListener('click', function() {
        Game.reincarnate();
      });
    }
  };
})();
