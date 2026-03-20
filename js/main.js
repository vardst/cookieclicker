var Game = Game || {};

(function() {
  'use strict';

  var TICK_RATE = 1000 / 30; // ~33.33ms per tick
  var lastTime = 0;
  var accumulator = 0;
  var lastUnlockCheck = 0;

  function update(dt) {
    var now = performance.now();
    var state = Game.state;

    // 1. Update buff timers
    Game.updateBuffs(dt);

    // 2-3. Calculate CPS (full pipeline)
    Game.calculateCPS();
    Game.calculateClickValue();

    // 4. Earn cookies
    var earned = state.cps * dt;
    state.cookies += earned;
    state.cookiesBaked += earned;
    state.cookiesBakedAllTime += earned;

    // 5. Golden cookie timer
    Game.updateGoldenCookieTimer(dt);

    // 5b. Update orbit cursors
    if (Game.updateOrbitCursors) Game.updateOrbitCursors(dt);

    // 6. Check unlocks (throttled)
    if (now - lastUnlockCheck > 500) {
      lastUnlockCheck = now;
      Game.checkUpgradeUnlocks();
      Game.checkAchievements(now);
    }

    // 7. Update ticker
    Game.updateTicker(now);
  }

  function gameLoop(now) {
    if (!lastTime) lastTime = now;
    var delta = now - lastTime;
    lastTime = now;
    accumulator += delta;

    // Cap accumulator to prevent spiral of death
    if (accumulator > 1000) accumulator = 1000;

    while (accumulator >= TICK_RATE) {
      update(TICK_RATE / 1000);
      accumulator -= TICK_RATE;
    }

    // Render
    Game.renderFrame(delta / 1000);
    Game.renderSlow(now);

    requestAnimationFrame(gameLoop);
  }

  Game.init = function() {
    // Try to load saved game
    var loaded = Game.load();

    // Initialize UI systems
    Game.initParticles();
    Game.initTooltips();
    Game.initBigCookie();
    Game.initBuildingPanel();
    Game.initUpgradePanel();
    Game.initBuyMode();
    Game.initOptions();
    Game.initPrestigeButton();
    Game.initTabs();
    Game.initGoldenCookie();
    if (Game.initOrbitCursors) Game.initOrbitCursors();

    // Initial calculation
    Game.recalculate();

    // Initial render
    Game.renderAll();

    // Show offline message if any
    if (Game.pendingOfflineMessage) {
      setTimeout(function() {
        Game.showNotification('Welcome back!', Game.pendingOfflineMessage, 'info');
        Game.pendingOfflineMessage = null;
      }, 500);
    }

    if (!loaded) {
      Game.showNotification('Welcome!', 'Click the big cookie to start!', 'info');
    }

    // Auto-save every 60 seconds
    setInterval(function() {
      Game.save();
    }, 60000);

    // Start game loop
    requestAnimationFrame(gameLoop);
  };

  // ===== DEBUG HELPERS =====
  Game.debug = {
    giveCookies: function(n) {
      n = n || 1e12;
      Game.state.cookies += n;
      Game.state.cookiesBaked += n;
      Game.state.cookiesBakedAllTime += n;
      Game.recalculate();
      console.log('Gave ' + Game.formatNumber(n) + ' cookies');
    },
    forceGolden: function() {
      Game.spawnGoldenCookie();
      console.log('Golden cookie spawned');
    },
    setBuilding: function(id, count) {
      Game.state.buildings[id].count = count;
      Game.state.buildings[id].totalBuilt = Math.max(Game.state.buildings[id].totalBuilt, count);
      Game.recalculate();
      console.log('Set ' + Game.BuildingData[id].name + ' to ' + count);
    },
    logCPS: function() {
      console.log('CPS: ' + Game.formatNumber(Game.state.cps));
      console.log('CPC: ' + Game.formatNumber(Game.state.cpc));
      if (Game.state.buildingCPS) {
        for (var i = 0; i < 20; i++) {
          if (Game.state.buildingCPS[i] > 0) {
            console.log('  ' + Game.BuildingData[i].name + ': ' + Game.formatNumber(Game.state.buildingCPS[i]));
          }
        }
      }
    },
    unlockAll: function() {
      for (var i = 0; i < 20; i++) {
        Game.state.buildings[i].count = 100;
        Game.state.buildings[i].totalBuilt = 100;
      }
      Game.recalculate();
      Game.checkUpgradeUnlocks();
      console.log('All buildings set to 100');
    }
  };

  // Boot
  document.addEventListener('DOMContentLoaded', Game.init);
})();
