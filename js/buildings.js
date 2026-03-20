var Game = Game || {};

(function() {
  'use strict';

  Game.getBuildingCost = function(id, count) {
    var data = Game.BuildingData[id];
    var owned = Game.state.buildings[id].count;
    if (!count || count === 1) {
      return Math.ceil(data.baseCost * Math.pow(1.15, owned));
    }
    // Bulk buy: geometric series sum
    return Math.ceil(data.baseCost * Math.pow(1.15, owned) * (Math.pow(1.15, count) - 1) / 0.15);
  };

  Game.getSellPrice = function(id) {
    var data = Game.BuildingData[id];
    var owned = Game.state.buildings[id].count;
    if (owned <= 0) return 0;
    return Math.ceil(data.baseCost * Math.pow(1.15, owned - 1)) * 0.25;
  };

  Game.canAffordBuilding = function(id, count) {
    return Game.state.cookies >= Game.getBuildingCost(id, count || Game.state.buyMode);
  };

  Game.buyBuilding = function(id, count) {
    count = count || Game.state.buyMode;
    var cost = Game.getBuildingCost(id, count);
    if (Game.state.cookies < cost) return false;

    Game.state.cookies -= cost;
    Game.state.buildings[id].count += count;
    Game.state.buildings[id].totalBuilt += count;

    Game.recalculate();
    if (Game.renderAll) Game.renderAll();
    return true;
  };

  Game.sellBuilding = function(id, count) {
    count = count || 1;
    var owned = Game.state.buildings[id].count;
    if (owned <= 0) return false;
    count = Math.min(count, owned);

    var refund = 0;
    for (var i = 0; i < count; i++) {
      var currentOwned = Game.state.buildings[id].count;
      refund += Math.ceil(Game.BuildingData[id].baseCost * Math.pow(1.15, currentOwned - 1)) * 0.25;
      Game.state.buildings[id].count--;
    }

    Game.state.cookies += refund;
    Game.recalculate();
    if (Game.renderAll) Game.renderAll();
    return true;
  };

  Game.getBuildingCPSBase = function(id) {
    return Game.BuildingData[id].baseCPS * Game.state.buildings[id].count;
  };
})();
