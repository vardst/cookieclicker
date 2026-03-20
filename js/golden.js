var Game = Game || {};

(function() {
  'use strict';

  Game.goldenCookieActive = false;
  Game.goldenCookieElement = null;

  Game.initGoldenCookie = function() {
    Game.resetGoldenCookieTimer();
  };

  Game.resetGoldenCookieTimer = function() {
    // Base interval: 5-15 minutes (300-900 seconds)
    var base = 300 + Math.random() * 600;

    // Frequency multipliers from heavenly upgrades
    var freqMult = 1;
    // Heavenly luck: +5%
    if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[7].id)) {
      freqMult *= 1.05;
    }

    Game.state.goldenCookieInterval = base / freqMult;
    Game.state.goldenCookieTimer = Game.state.goldenCookieInterval;
  };

  Game.updateGoldenCookieTimer = function(dt) {
    if (Game.goldenCookieActive) return;

    Game.state.goldenCookieTimer -= dt;
    if (Game.state.goldenCookieTimer <= 0) {
      Game.spawnGoldenCookie();
    }
  };

  Game.spawnGoldenCookie = function() {
    if (Game.goldenCookieActive) return;
    Game.goldenCookieActive = true;

    var cookieArea = document.getElementById('cookie-area');
    if (!cookieArea) return;

    var el = document.createElement('div');
    el.className = 'golden-cookie';
    el.textContent = '🍪';
    el.title = 'Click me!';

    // Random position within cookie area
    var areaRect = cookieArea.getBoundingClientRect();
    var x = 30 + Math.random() * (areaRect.width - 90);
    var y = 80 + Math.random() * (areaRect.height - 160);
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    el.addEventListener('click', function(e) {
      e.stopPropagation();
      Game.clickGoldenCookie();
    });

    cookieArea.appendChild(el);
    Game.goldenCookieElement = el;

    // Auto-expire after 13 seconds
    Game.goldenCookieExpireTimer = setTimeout(function() {
      Game.dismissGoldenCookie();
    }, 13000);
  };

  Game.dismissGoldenCookie = function() {
    if (Game.goldenCookieElement && Game.goldenCookieElement.parentNode) {
      Game.goldenCookieElement.classList.add('golden-cookie-fade');
      var el = Game.goldenCookieElement;
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 500);
    }
    Game.goldenCookieElement = null;
    Game.goldenCookieActive = false;
    if (Game.goldenCookieExpireTimer) {
      clearTimeout(Game.goldenCookieExpireTimer);
    }
    Game.resetGoldenCookieTimer();
  };

  Game.clickGoldenCookie = function() {
    if (!Game.goldenCookieActive) return;

    Game.state.goldenClickCount++;

    // Pick effect
    var roll = Math.random();
    var effect;

    if (roll < 0.621) {
      effect = 'frenzy';
    } else if (roll < 0.897) {
      effect = 'lucky';
    } else if (roll < 0.941) {
      effect = 'clickFrenzy';
    } else if (roll < 0.985) {
      effect = 'buildingSpecial';
    } else if (roll < 0.996) {
      effect = 'cookieStorm';
    } else {
      effect = 'blab';
    }

    Game.applyGoldenEffect(effect);
    Game.dismissGoldenCookie();
  };

  Game.applyGoldenEffect = function(effect) {
    var state = Game.state;

    // Duration multiplier from heavenly upgrades
    var durationMult = 1;
    if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[8].id)) {
      durationMult *= 1.1; // Lasting fortune: +10%
    }
    if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[9].id)) {
      durationMult *= 2; // Get lucky: x2
    }

    switch (effect) {
      case 'frenzy':
        Game.addBuff({
          type: 'frenzy',
          name: 'Frenzy',
          desc: 'Cookie production x7 for ' + Math.round(77 * durationMult) + ' seconds!',
          multiplier: 7,
          duration: 77 * durationMult,
          remaining: 77 * durationMult
        });
        Game.showNotification('Frenzy!', 'Cookie production x7!', 'golden');
        break;

      case 'lucky':
        var payout = Math.min(state.cookies * 0.15, state.cps * 900) + 13;
        if (Game.hasHeavenlyUpgrade(Game.HeavenlyUpgradeData[9].id)) {
          payout = Math.min(state.cookies * 0.15, state.cps * 1800) + 13;
        }
        state.cookies += payout;
        state.cookiesBaked += payout;
        state.cookiesBakedAllTime += payout;
        Game.showNotification('Lucky!', '+' + Game.formatNumber(payout) + ' cookies!', 'golden');
        break;

      case 'clickFrenzy':
        Game.addBuff({
          type: 'clickFrenzy',
          name: 'Click Frenzy',
          desc: 'Clicking power x777 for ' + Math.round(13 * durationMult) + ' seconds!',
          multiplier: 777,
          duration: 13 * durationMult,
          remaining: 13 * durationMult
        });
        Game.showNotification('Click Frenzy!', 'Clicking power x777!', 'golden');
        break;

      case 'buildingSpecial':
        // Pick a random building that the player owns
        var ownedBuildings = [];
        for (var i = 0; i < 20; i++) {
          if (state.buildings[i].count > 0) ownedBuildings.push(i);
        }
        if (ownedBuildings.length > 0) {
          var chosen = ownedBuildings[Math.floor(Math.random() * ownedBuildings.length)];
          Game.addBuff({
            type: 'buildingSpecial',
            name: Game.BuildingData[chosen].name + ' boost',
            desc: Game.BuildingData[chosen].name + ' production x10!',
            multiplier: 10,
            buildingId: chosen,
            duration: 30 * durationMult,
            remaining: 30 * durationMult
          });
          Game.showNotification('Building Special!', Game.BuildingData[chosen].name + ' production x10!', 'golden');
        }
        break;

      case 'cookieStorm':
        // Spawn 7 mini golden cookies with small payouts
        for (var j = 0; j < 7; j++) {
          (function(delay) {
            setTimeout(function() {
              var payout = Math.max(state.cookies * 0.02, state.cps * 60) / 20;
              state.cookies += payout;
              state.cookiesBaked += payout;
              state.cookiesBakedAllTime += payout;
              if (Game.spawnMiniGolden) Game.spawnMiniGolden();
            }, delay * 300);
          })(j);
        }
        Game.showNotification('Cookie Storm!', 'Raining cookies!', 'golden');
        break;

      case 'blab':
        var blabs = [
          'Cookie production has not been affected.',
          'You feel like making cookies. But you already are.',
          'The news ticker just got a little bit more interesting.',
          'Your cookies shimmer briefly then return to normal.'
        ];
        Game.showNotification('Wut?', blabs[Math.floor(Math.random() * blabs.length)], 'golden');
        break;
    }

    Game.recalculate();
  };

  Game.addBuff = function(buff) {
    // Remove existing buff of same type
    for (var i = Game.state.buffs.length - 1; i >= 0; i--) {
      if (Game.state.buffs[i].type === buff.type) {
        Game.state.buffs.splice(i, 1);
      }
    }
    Game.state.buffs.push(buff);
  };

  Game.updateBuffs = function(dt) {
    var changed = false;
    for (var i = Game.state.buffs.length - 1; i >= 0; i--) {
      Game.state.buffs[i].remaining -= dt;
      if (Game.state.buffs[i].remaining <= 0) {
        Game.state.buffs.splice(i, 1);
        changed = true;
      }
    }
    if (changed) {
      Game.recalculate();
    }
  };

  Game.getActiveBuffNames = function() {
    var names = [];
    for (var i = 0; i < Game.state.buffs.length; i++) {
      names.push(Game.state.buffs[i].name + ' (' + Math.ceil(Game.state.buffs[i].remaining) + 's)');
    }
    return names;
  };
})();
