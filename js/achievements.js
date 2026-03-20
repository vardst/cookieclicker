var Game = Game || {};

(function() {
  'use strict';

  Game.getMilk = function() {
    return Game.state.achievements.length * 0.04;
  };

  Game.getMilkPercent = function() {
    return Game.state.achievements.length * 4;
  };

  Game.hasAchievement = function(id) {
    return Game.state.achievementsSet[id] === true;
  };

  Game.earnAchievement = function(id) {
    if (Game.hasAchievement(id)) return;
    Game.state.achievements.push(id);
    Game.state.achievementsSet[id] = true;

    var ach = Game.AchievementData[id];
    if (ach) {
      Game.showNotification('Achievement unlocked!', ach.icon + ' ' + ach.name, 'achievement');
    }

    Game.recalculate();
  };

  var lastAchievementCheck = 0;
  Game.checkAchievements = function(now) {
    // Throttle to 2x per second
    if (now - lastAchievementCheck < 500) return;
    lastAchievementCheck = now;

    var state = Game.state;
    for (var i = 0; i < Game.AchievementData.length; i++) {
      var ach = Game.AchievementData[i];
      if (state.achievementsSet[ach.id]) continue;
      if (ach.condition && ach.condition(state)) {
        Game.earnAchievement(ach.id);
      }
    }
  };

  // ===== CLOSEST ACHIEVEMENT TRACKER =====
  function getProgress(ach, state) {
    if (!ach.threshold) return -1; // misc achievements can't be tracked
    var current = 0;
    switch (ach.type) {
      case 'building': current = state.buildings[ach.buildingId].count; break;
      case 'baking':   current = state.cookiesBakedAllTime; break;
      case 'cps':      current = state.cps; break;
      case 'click':    current = state.clickCount; break;
      case 'golden':   current = state.goldenClickCount; break;
      case 'prestige': current = state.prestigeLevel; break;
      default: return -1;
    }
    return Math.min(current / ach.threshold, 1);
  }

  Game.getClosestAchievement = function() {
    var state = Game.state;
    var best = null;
    var bestProgress = -1;

    for (var i = 0; i < Game.AchievementData.length; i++) {
      var ach = Game.AchievementData[i];
      if (state.achievementsSet[ach.id]) continue;

      var progress = getProgress(ach, state);
      if (progress < 0) continue; // not trackable
      if (progress >= 1) continue; // about to be earned, skip

      if (progress > bestProgress) {
        bestProgress = progress;
        best = ach;
      }
    }

    return best ? { achievement: best, progress: bestProgress } : null;
  };
})();
