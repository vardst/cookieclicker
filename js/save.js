var Game = Game || {};

(function() {
  'use strict';

  var SAVE_KEY = 'cookieClickerSave';
  var SAVE_VERSION = 1;

  Game.save = function() {
    Game.state.lastSaveTime = Date.now();
    try {
      var data = {
        version: SAVE_VERSION,
        state: {
          cookies: Game.state.cookies,
          cookiesBaked: Game.state.cookiesBaked,
          cookiesBakedAllTime: Game.state.cookiesBakedAllTime,
          cookiesReset: Game.state.cookiesReset,
          clickCount: Game.state.clickCount,
          goldenClickCount: Game.state.goldenClickCount,
          buildings: Game.state.buildings,
          ownedUpgrades: Game.state.ownedUpgrades,
          achievements: Game.state.achievements,
          prestigeLevel: Game.state.prestigeLevel,
          heavenlyChips: Game.state.heavenlyChips,
          heavenlyChipsSpent: Game.state.heavenlyChipsSpent,
          heavenlyUpgrades: Game.state.heavenlyUpgrades,
          buyMode: Game.state.buyMode,
          startDate: Game.state.startDate,
          lastSaveTime: Game.state.lastSaveTime,
          ascensionCount: Game.state.ascensionCount
        }
      };
      var json = JSON.stringify(data);
      var encoded = btoa(unescape(encodeURIComponent(json)));
      localStorage.setItem(SAVE_KEY, encoded);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  };

  Game.load = function() {
    try {
      var encoded = localStorage.getItem(SAVE_KEY);
      if (!encoded) return false;

      var json = decodeURIComponent(escape(atob(encoded)));
      var data = JSON.parse(json);

      if (!data || !data.state) return false;

      var s = data.state;
      var state = Game.state;

      state.cookies = s.cookies || 0;
      state.cookiesBaked = s.cookiesBaked || 0;
      state.cookiesBakedAllTime = s.cookiesBakedAllTime || 0;
      state.cookiesReset = s.cookiesReset || 0;
      state.clickCount = s.clickCount || 0;
      state.goldenClickCount = s.goldenClickCount || 0;
      state.buyMode = s.buyMode || 1;
      state.startDate = s.startDate || Date.now();
      state.lastSaveTime = s.lastSaveTime || Date.now();
      state.ascensionCount = s.ascensionCount || 0;

      // Buildings
      if (s.buildings) {
        for (var i = 0; i < 20; i++) {
          if (s.buildings[i]) {
            state.buildings[i].count = s.buildings[i].count || 0;
            state.buildings[i].totalBuilt = s.buildings[i].totalBuilt || 0;
          }
        }
      }

      // Upgrades
      state.ownedUpgrades = s.ownedUpgrades || [];
      state.ownedUpgradesSet = {};
      for (var u = 0; u < state.ownedUpgrades.length; u++) {
        state.ownedUpgradesSet[state.ownedUpgrades[u]] = true;
      }

      // Achievements
      state.achievements = s.achievements || [];
      state.achievementsSet = {};
      for (var a = 0; a < state.achievements.length; a++) {
        state.achievementsSet[state.achievements[a]] = true;
      }

      // Prestige
      state.prestigeLevel = s.prestigeLevel || 0;
      state.heavenlyChips = s.heavenlyChips || 0;
      state.heavenlyChipsSpent = s.heavenlyChipsSpent || 0;
      state.heavenlyUpgrades = s.heavenlyUpgrades || [];
      state.heavenlyUpgradesSet = {};
      for (var h = 0; h < state.heavenlyUpgrades.length; h++) {
        state.heavenlyUpgradesSet[state.heavenlyUpgrades[h]] = true;
      }

      // Offline production
      var elapsed = (Date.now() - state.lastSaveTime) / 1000;
      if (elapsed > 5) {
        Game.recalculate();
        var offlineEarnings = state.cps * elapsed * 0.05;
        if (offlineEarnings > 0) {
          state.cookies += offlineEarnings;
          state.cookiesBaked += offlineEarnings;
          state.cookiesBakedAllTime += offlineEarnings;
          Game.pendingOfflineMessage = 'Welcome back! You earned ' + Game.formatNumber(offlineEarnings) + ' cookies while you were away (' + Game.formatTime(elapsed) + ').';
        }
      }

      Game.recalculate();
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  };

  Game.exportSave = function() {
    Game.save();
    var encoded = localStorage.getItem(SAVE_KEY);
    if (!encoded) return;

    try {
      navigator.clipboard.writeText(encoded).then(function() {
        Game.showNotification('Save exported!', 'Copied to clipboard.', 'info');
      });
    } catch (e) {
      // Fallback
      var textarea = document.createElement('textarea');
      textarea.value = encoded;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      Game.showNotification('Save exported!', 'Copied to clipboard.', 'info');
    }
  };

  Game.importSave = function(str) {
    if (!str) {
      str = prompt('Paste your save data:');
    }
    if (!str) return false;
    str = str.trim();

    try {
      var json = decodeURIComponent(escape(atob(str)));
      var data = JSON.parse(json);
      if (!data || !data.state) {
        alert('Invalid save data!');
        return false;
      }
      localStorage.setItem(SAVE_KEY, str);
      Game.state = Game.getDefaultState();
      Game.load();
      if (Game.renderAll) Game.renderAll();
      Game.showNotification('Save imported!', 'Game loaded successfully.', 'info');
      return true;
    } catch (e) {
      alert('Invalid save data!');
      return false;
    }
  };

  Game.wipeSave = function() {
    if (!confirm('Are you sure you want to wipe your save? This cannot be undone!')) return;
    if (!confirm('Really? ALL progress will be lost!')) return;
    localStorage.removeItem(SAVE_KEY);
    Game.state = Game.getDefaultState();
    Game.recalculate();
    if (Game.renderAll) Game.renderAll();
    Game.showNotification('Save wiped!', 'Starting fresh.', 'info');
  };
})();
