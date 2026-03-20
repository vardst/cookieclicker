var Game = Game || {};

(function() {
  'use strict';

  // ===== NOTIFICATION SYSTEM =====
  var notificationQueue = [];
  var notificationActive = false;

  Game.showNotification = function(title, text, type) {
    notificationQueue.push({ title: title, text: text, type: type || 'info' });
    if (!notificationActive) showNextNotification();
  };

  function showNextNotification() {
    if (notificationQueue.length === 0) {
      notificationActive = false;
      return;
    }
    notificationActive = true;
    var notif = notificationQueue.shift();
    var container = document.getElementById('notifications');
    if (!container) { notificationActive = false; return; }

    var el = document.createElement('div');
    el.className = 'notification notification-' + notif.type;
    el.innerHTML = '<div class="notif-title">' + notif.title + '</div><div class="notif-text">' + notif.text + '</div>';
    container.appendChild(el);

    requestAnimationFrame(function() {
      el.classList.add('notif-show');
    });

    setTimeout(function() {
      el.classList.remove('notif-show');
      el.classList.add('notif-hide');
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
        showNextNotification();
      }, 400);
    }, 3000);
  }

  // ===== PARTICLE SYSTEM =====
  var particles = [];
  var canvas, ctx;

  Game.initParticles = function() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    Game.particleCanvas = canvas;
    Game.particleCtx = ctx;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  };

  function resizeCanvas() {
    if (!canvas) return;
    var area = document.getElementById('cookie-area');
    if (area) {
      canvas.width = area.offsetWidth;
      canvas.height = area.offsetHeight;
    }
    if (Game.invalidateOrbitCenter) Game.invalidateOrbitCenter();
  }

  Game.spawnClickParticle = function(value) {
    if (!canvas) return;
    var cookie = document.getElementById('big-cookie');
    if (!cookie) return;
    var rect = cookie.getBoundingClientRect();
    var areaRect = canvas.getBoundingClientRect();

    var x = rect.left - areaRect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
    var y = rect.top - areaRect.top + rect.height / 4 + (Math.random() - 0.5) * 30;

    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: -2 - Math.random() * 2,
      life: 1.0,
      text: '+' + Game.formatShort(value)
    });
  };

  Game.spawnMiniGolden = function() {
    if (!canvas) return;
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 3,
      vy: -3 - Math.random() * 2,
      life: 1.0,
      text: '🍪',
      isGolden: true
    });
  };

  Game.renderParticles = function(dt) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Game.renderOrbitCursors) Game.renderOrbitCursors();

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 0.7;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.font = p.isGolden ? '24px sans-serif' : 'bold 16px "Segoe UI", sans-serif';
      ctx.fillStyle = p.isGolden ? '#ffd700' : '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  };

  // ===== TOOLTIP SYSTEM =====
  var tooltipEl = null;

  Game.initTooltips = function() {
    tooltipEl = document.getElementById('tooltip');

    document.addEventListener('mousemove', function(e) {
      if (tooltipEl && tooltipEl.classList.contains('tooltip-show')) {
        var x = e.clientX + 15;
        var y = e.clientY + 15;
        // Keep on screen
        if (x + 300 > window.innerWidth) x = e.clientX - 315;
        if (y + 200 > window.innerHeight) y = e.clientY - 200;
        tooltipEl.style.left = x + 'px';
        tooltipEl.style.top = y + 'px';
      }
    });
  };

  Game.showTooltip = function(html) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = html;
    tooltipEl.classList.add('tooltip-show');
  };

  Game.hideTooltip = function() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('tooltip-show');
  };

  // ===== BUILDING PANEL RENDERING =====
  Game.renderBuildingPanel = function() {
    var panel = document.getElementById('buildings-list');
    if (!panel) return;

    var html = '';
    for (var i = 0; i < 20; i++) {
      var data = Game.BuildingData[i];
      var count = Game.state.buildings[i].count;
      var cost = Game.getBuildingCost(i, Game.state.buyMode);
      var affordable = Game.state.cookies >= cost;

      html += '<div class="building-row' + (affordable ? ' affordable' : '') + '" data-id="' + i + '">';
      html += '<div class="building-icon">' + data.icon + '</div>';
      html += '<div class="building-info">';
      html += '<div class="building-name">' + data.name + '</div>';
      html += '<div class="building-cost">' + Game.formatNumber(cost) + '</div>';
      html += '</div>';
      html += '<div class="building-count">' + (count > 0 ? count : '') + '</div>';
      html += '</div>';
    }
    panel.innerHTML = html;
  };

  Game.initBuildingPanel = function() {
    var panel = document.getElementById('buildings-list');
    if (!panel) return;

    panel.addEventListener('click', function(e) {
      var row = e.target.closest('.building-row');
      if (!row) return;
      var id = parseInt(row.getAttribute('data-id'));
      Game.buyBuilding(id);
    });

    panel.addEventListener('mouseover', function(e) {
      var row = e.target.closest('.building-row');
      if (!row) return;
      var id = parseInt(row.getAttribute('data-id'));
      var data = Game.BuildingData[id];
      var count = Game.state.buildings[id].count;
      var cost = Game.getBuildingCost(id, Game.state.buyMode);
      var bCPS = Game.state.buildingCPS ? Game.state.buildingCPS[id] : data.baseCPS * count;

      var html = '<div class="tooltip-title">' + data.icon + ' ' + data.name + '</div>';
      html += '<div class="tooltip-desc">' + data.desc + '</div>';
      html += '<hr>';
      html += '<div>Owned: <b>' + count + '</b></div>';
      html += '<div>Each produces <b>' + Game.formatNumber(count > 0 ? bCPS / count : data.baseCPS) + '</b> CpS</div>';
      html += '<div>Total: <b>' + Game.formatNumber(bCPS) + '</b> CpS (' + (Game.state.cps > 0 ? (bCPS / Game.state.cps * 100).toFixed(1) : '0') + '%)</div>';
      html += '<hr>';
      html += '<div>Cost: <b>' + Game.formatNumber(cost) + '</b></div>';
      Game.showTooltip(html);
    });

    panel.addEventListener('mouseout', function(e) {
      if (!e.target.closest('.building-row')) return;
      Game.hideTooltip();
    });
  };

  // ===== BUY MODE BUTTONS =====
  Game.initBuyMode = function() {
    var btns = document.querySelectorAll('.buy-mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        Game.state.buyMode = parseInt(this.getAttribute('data-amount'));
        document.querySelectorAll('.buy-mode-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        Game.renderBuildingPanel();
      });
    }
  };

  // ===== UPGRADE PANEL RENDERING =====
  Game.renderUpgradePanel = function() {
    var panel = document.getElementById('upgrades-grid');
    if (!panel) return;

    var unlocked = Game.state.unlockedUpgrades;
    var upgradeIds = Object.keys(unlocked).map(Number).sort(function(a, b) {
      return Game.UpgradeData[a].cost - Game.UpgradeData[b].cost;
    });

    var html = '';
    for (var i = 0; i < upgradeIds.length; i++) {
      var id = upgradeIds[i];
      var u = Game.UpgradeData[id];
      if (!u) continue;
      var affordable = Game.state.cookies >= u.cost;

      html += '<div class="upgrade-row' + (affordable ? ' affordable' : '') + '" data-id="' + id + '">';
      html += '<div class="upgrade-row-icon">' + u.icon + '</div>';
      html += '<div class="upgrade-row-info">';
      html += '<div class="upgrade-row-name">' + u.name + '</div>';
      html += '<div class="upgrade-row-desc">' + u.desc + '</div>';
      html += '<div class="upgrade-row-cost">' + Game.formatNumber(u.cost) + '</div>';
      html += '</div>';
      html += '</div>';
    }

    if (upgradeIds.length === 0) {
      html = '<div class="no-upgrades">No upgrades available yet</div>';
    }

    panel.innerHTML = html;
  };

  Game.initUpgradePanel = function() {
    var panel = document.getElementById('upgrades-grid');
    if (!panel) return;

    panel.addEventListener('click', function(e) {
      var row = e.target.closest('.upgrade-row');
      if (!row) return;
      var id = parseInt(row.getAttribute('data-id'));
      Game.buyUpgrade(id);
    });

    panel.addEventListener('mouseover', function(e) {
      var row = e.target.closest('.upgrade-row');
      if (!row) return;
      var id = parseInt(row.getAttribute('data-id'));
      var u = Game.UpgradeData[id];
      if (!u) return;

      var html = '<div class="tooltip-title">' + u.icon + ' ' + u.name + '</div>';
      html += '<div class="tooltip-desc">' + u.desc + '</div>';
      html += '<hr>';
      html += '<div>Cost: <b>' + Game.formatNumber(u.cost) + '</b></div>';
      if (u.type === 'tier') {
        html += '<div class="tooltip-type">Tier: ' + u.tierName + '</div>';
      }
      Game.showTooltip(html);
    });

    panel.addEventListener('mouseout', function(e) {
      if (!e.target.closest('.upgrade-row')) return;
      Game.hideTooltip();
    });
  };

  // ===== STATS PANEL =====
  Game.renderStats = function() {
    var panel = document.getElementById('stats-content');
    if (!panel) return;

    var state = Game.state;
    var html = '';
    html += '<div class="stat-group"><h3>General</h3>';
    html += '<div class="stat-row">Cookies in bank: <b>' + Game.formatNumber(state.cookies) + '</b></div>';
    html += '<div class="stat-row">Cookies baked (this ascension): <b>' + Game.formatNumber(state.cookiesBaked) + '</b></div>';
    html += '<div class="stat-row">Cookies baked (all time): <b>' + Game.formatNumber(state.cookiesBakedAllTime) + '</b></div>';
    html += '<div class="stat-row">Cookies per second: <b>' + Game.formatNumber(state.cps) + '</b></div>';
    html += '<div class="stat-row">Cookies per click: <b>' + Game.formatNumber(state.cpc) + '</b></div>';
    html += '<div class="stat-row">Cookie clicks: <b>' + Game.formatNumber(state.clickCount) + '</b></div>';
    html += '<div class="stat-row">Golden cookie clicks: <b>' + state.goldenClickCount + '</b></div>';
    html += '<div class="stat-row">Running time: <b>' + Game.formatTime((Date.now() - state.startDate) / 1000) + '</b></div>';
    html += '</div>';

    html += '<div class="stat-group"><h3>Prestige</h3>';
    html += '<div class="stat-row">Prestige level: <b>' + Game.formatNumber(state.prestigeLevel) + '</b></div>';
    html += '<div class="stat-row">Heavenly chips: <b>' + Game.formatNumber(state.heavenlyChips - state.heavenlyChipsSpent) + '</b> (spent: ' + Game.formatNumber(state.heavenlyChipsSpent) + ')</div>';
    html += '<div class="stat-row">Ascensions: <b>' + state.ascensionCount + '</b></div>';
    var gain = Game.getPotentialPrestigeGain();
    if (gain > 0) {
      html += '<div class="stat-row prestige-gain">Ascending now would give: <b>+' + Game.formatNumber(gain) + '</b> prestige levels</div>';
    }
    html += '</div>';

    html += '<div class="stat-group"><h3>Buildings</h3>';
    html += '<div class="stat-row">Total buildings: <b>' + Game.getTotalBuildings() + '</b></div>';
    for (var i = 0; i < 20; i++) {
      if (state.buildings[i].count > 0) {
        html += '<div class="stat-row">' + Game.BuildingData[i].icon + ' ' + Game.BuildingData[i].name + ': <b>' + state.buildings[i].count + '</b></div>';
      }
    }
    html += '</div>';

    html += '<div class="stat-group"><h3>Achievements</h3>';
    html += '<div class="stat-row">Unlocked: <b>' + state.achievements.length + ' / ' + Game.totalAchievementCount + '</b></div>';
    html += '<div class="stat-row">Milk: <b>' + Game.getMilkPercent().toFixed(0) + '%</b></div>';
    html += '</div>';

    html += '<div class="stat-group"><h3>Upgrades</h3>';
    html += '<div class="stat-row">Owned: <b>' + state.ownedUpgrades.length + ' / ' + Game.totalUpgradeCount + '</b></div>';
    html += '</div>';

    panel.innerHTML = html;
  };

  // ===== OPTIONS PANEL =====
  Game.initOptions = function() {
    document.getElementById('btn-save').addEventListener('click', function() {
      Game.save();
      Game.showNotification('Game saved!', 'Progress has been saved.', 'info');
    });
    document.getElementById('btn-export').addEventListener('click', function() {
      Game.exportSave();
    });
    document.getElementById('btn-import').addEventListener('click', function() {
      Game.importSave();
    });
    document.getElementById('btn-wipe').addEventListener('click', function() {
      Game.wipeSave();
    });
  };

  // ===== PRESTIGE BUTTON =====
  Game.renderPrestigeButton = function() {
    var btn = document.getElementById('ascend-btn');
    if (!btn) return;
    var gain = Game.getPotentialPrestigeGain();
    if (gain > 0) {
      btn.style.display = 'block';
      btn.innerHTML = '⭐ Ascend (+' + Game.formatNumber(gain) + ' HC)';
    } else {
      btn.style.display = 'none';
    }
  };

  Game.initPrestigeButton = function() {
    var btn = document.getElementById('ascend-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      if (confirm('Are you sure you want to ascend? You will lose all cookies, buildings, and upgrades, but gain heavenly chips!')) {
        Game.ascend();
      }
    });
  };

  // ===== BUFF BAR =====
  Game.renderBuffBar = function() {
    var bar = document.getElementById('buff-bar');
    if (!bar) return;

    if (Game.state.buffs.length === 0) {
      bar.innerHTML = '';
      return;
    }

    var html = '';
    for (var i = 0; i < Game.state.buffs.length; i++) {
      var buff = Game.state.buffs[i];
      html += '<div class="buff-indicator" title="' + buff.desc + '">';
      html += '<span class="buff-name">' + buff.name + '</span>';
      html += '<span class="buff-time">' + Math.ceil(buff.remaining) + 's</span>';
      html += '</div>';
    }
    bar.innerHTML = html;
  };

  // ===== NEXT ACHIEVEMENT BUBBLE =====
  Game.renderNextAchievement = function() {
    var el = document.getElementById('next-achievement');
    if (!el) return;
    if (!Game.getClosestAchievement) { el.innerHTML = ''; return; }

    var result = Game.getClosestAchievement();
    if (!result) {
      el.innerHTML = '';
      return;
    }

    var ach = result.achievement;
    var pct = Math.floor(result.progress * 100);

    el.innerHTML =
      '<div class="next-ach-label">Next achievement</div>' +
      '<div class="next-ach-name">' + ach.icon + ' ' + ach.name + '</div>' +
      '<div class="next-ach-desc">' + ach.desc + '</div>' +
      '<div class="next-ach-bar"><div class="next-ach-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="next-ach-pct">' + pct + '%</div>';
  };

  // ===== MILK RENDERING =====
  Game.renderMilk = function() {
    var milkEl = document.getElementById('milk');
    if (!milkEl) return;
    var milk = Game.getMilk();
    var height = Math.min(milk * 8, 40); // Cap at 40% of area height
    milkEl.style.height = height + '%';
    milkEl.style.opacity = Math.min(milk * 0.5, 0.9);
  };

  // ===== TAB SWITCHING =====
  Game.initTabs = function() {
    var tabs = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function() {
        var target = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById('tab-' + target);
        if (panel) panel.classList.add('active');

        if (target === 'stats') Game.renderStats();
      });
    }
  };

  // ===== BIG COOKIE =====
  Game.initBigCookie = function() {
    var cookie = document.getElementById('big-cookie');
    if (!cookie) return;

    cookie.addEventListener('click', function(e) {
      e.preventDefault();
      Game.handleClick();
      cookie.classList.add('cookie-clicked');
      setTimeout(function() { cookie.classList.remove('cookie-clicked'); }, 80);
    });

    // Prevent context menu on cookie
    cookie.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  };

  // ===== MAIN DISPLAY UPDATE =====
  Game.renderCookieCount = function() {
    var el = document.getElementById('cookie-count');
    if (el) el.textContent = Game.formatNumber(Math.floor(Game.state.cookies));

    var cpsEl = document.getElementById('cps-display');
    if (cpsEl) cpsEl.textContent = 'per second: ' + Game.formatNumber(Game.state.cps);
  };

  // ===== RENDER ALL =====
  var lastFullRender = 0;
  Game.renderAll = function() {
    Game.renderCookieCount();
    Game.renderBuildingPanel();
    Game.renderUpgradePanel();
    Game.renderBuffBar();
    Game.renderMilk();
    Game.renderPrestigeButton();
  };

  Game.renderFrame = function(dt) {
    Game.renderCookieCount();
    Game.renderParticles(dt);
    Game.renderBuffBar();
  };

  // Slower render for expensive stuff
  Game.renderSlow = function(now) {
    if (now - lastFullRender < 1000) return;
    lastFullRender = now;
    Game.renderBuildingPanel();
    Game.renderUpgradePanel();
    Game.renderMilk();
    Game.renderPrestigeButton();
    Game.renderNextAchievement();
  };
})();
