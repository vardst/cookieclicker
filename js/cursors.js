var Game = Game || {};

(function() {
  'use strict';

  // ===== ORBIT CURSOR ANIMATION =====
  // Purely visual — small cursor icons orbit the big cookie

  var orbitCursors = [];
  var lastCursorCount = -1;
  var cachedCenter = null;
  var cachedCookieRadius = 0;

  // Ring configuration: [maxCursors, radiusOffset from cookie edge]
  var RING_CONFIG = [
    { max: 12, offset: 30 },
    { max: 18, offset: 58 },
    { max: 24, offset: 86 },
    { max: 30, offset: 114 },
    { max: 30, offset: 142 }
  ];
  var VISUAL_CAP = 120; // max rendered cursors (sum of all ring maxes is 114, round to 120)
  var BASE_ORBIT_SPEED = 0.3; // radians/sec (~21s per revolution)
  var CLICK_INTERVAL = 10; // seconds between click animations
  var CLICK_DURATION = 0.4; // seconds for the click lunge animation
  var CLICK_INWARD_RATIO = 0.70; // how far toward center the lunge goes
  var FONT_SIZES = [18, 15, 13, 12, 11]; // per ring

  function getCookieCenter() {
    if (cachedCenter) return cachedCenter;

    var canvas = Game.particleCanvas;
    var cookie = document.getElementById('big-cookie');
    if (!canvas || !cookie) return null;

    var cookieRect = cookie.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();

    cachedCenter = {
      x: cookieRect.left - canvasRect.left + cookieRect.width / 2,
      y: cookieRect.top - canvasRect.top + cookieRect.height / 2
    };
    cachedCookieRadius = Math.min(cookieRect.width, cookieRect.height) / 2;
    return cachedCenter;
  }

  Game.invalidateOrbitCenter = function() {
    cachedCenter = null;
  };

  // Distribute N cursors across rings, return array of {ring, index, total}
  function distributeToRings(count) {
    var capped = Math.min(count, VISUAL_CAP);
    var assignments = [];
    var remaining = capped;

    for (var r = 0; r < RING_CONFIG.length && remaining > 0; r++) {
      var inRing = Math.min(remaining, RING_CONFIG[r].max);
      for (var j = 0; j < inRing; j++) {
        assignments.push({ ring: r, index: j, total: inRing });
      }
      remaining -= inRing;
    }
    return assignments;
  }

  Game.syncCursorOrbitCount = function() {
    var count = Game.state.buildings[0].count;
    lastCursorCount = count;

    if (count === 0) {
      orbitCursors = [];
      return;
    }

    var assignments = distributeToRings(count);

    // Preserve existing cursor angles where possible
    var oldByRing = {};
    for (var i = 0; i < orbitCursors.length; i++) {
      var c = orbitCursors[i];
      if (!oldByRing[c.ring]) oldByRing[c.ring] = [];
      oldByRing[c.ring].push(c);
    }

    var newCursors = [];
    for (var i = 0; i < assignments.length; i++) {
      var a = assignments[i];
      var existing = oldByRing[a.ring] && oldByRing[a.ring][a.index];

      if (existing) {
        // Reuse existing cursor, keep its angle and timers
        newCursors.push(existing);
      } else {
        // New cursor: evenly space within ring + small random offset
        var baseAngle = (2 * Math.PI * a.index) / a.total;
        var jitter = (Math.random() - 0.5) * 0.3;
        newCursors.push({
          ring: a.ring,
          angle: baseAngle + jitter,
          clickTimer: Math.random() * CLICK_INTERVAL,
          clickPhase: 0
        });
      }
    }

    orbitCursors = newCursors;
  };

  Game.updateOrbitCursors = function(dt) {
    // Auto-detect count changes
    var currentCount = Game.state.buildings[0].count;
    if (currentCount !== lastCursorCount) {
      Game.syncCursorOrbitCount();
    }

    if (orbitCursors.length === 0) return;

    // CPS-based speed scaling: gentle logarithmic boost, capped at 2x
    var cpsScale = 1 + Math.log10(Math.max(Game.state.cps, 1)) * 0.02;
    if (cpsScale > 2) cpsScale = 2;

    // Overflow bonus: if >120 cursors, orbit faster
    var overflowBonus = currentCount > VISUAL_CAP
      ? 1 + (currentCount - VISUAL_CAP) * 0.005
      : 1;
    if (overflowBonus > 3) overflowBonus = 3;

    for (var i = 0; i < orbitCursors.length; i++) {
      var c = orbitCursors[i];

      // Ring speed: inner rings slightly faster
      var ringFactor = 1 - c.ring * 0.08;
      var speed = BASE_ORBIT_SPEED * ringFactor * cpsScale * overflowBonus;

      // Counter-clockwise: subtract angle
      c.angle -= speed * dt;

      // Keep angle in [0, 2PI) to avoid drift
      if (c.angle < 0) c.angle += 2 * Math.PI;
      if (c.angle >= 2 * Math.PI) c.angle -= 2 * Math.PI;

      // Click animation timers
      if (c.clickPhase > 0) {
        c.clickPhase += dt;
        if (c.clickPhase >= CLICK_DURATION) {
          c.clickPhase = 0;
          c.clickTimer = CLICK_INTERVAL;
        }
      } else {
        c.clickTimer -= dt;
        if (c.clickTimer <= 0) {
          c.clickPhase = 0.001; // start animation
        }
      }
    }
  };

  Game.renderOrbitCursors = function() {
    if (orbitCursors.length === 0) return;

    var ctx = Game.particleCtx;
    var canvas = Game.particleCanvas;
    if (!ctx || !canvas) return;

    var center = getCookieCenter();
    if (!center) return;

    for (var i = 0; i < orbitCursors.length; i++) {
      var c = orbitCursors[i];
      var ringIdx = Math.min(c.ring, RING_CONFIG.length - 1);
      var orbitRadius = cachedCookieRadius + RING_CONFIG[ringIdx].offset;
      var fontSize = FONT_SIZES[ringIdx] || 11;

      // Calculate base orbital position
      var x = center.x + Math.cos(c.angle) * orbitRadius;
      var y = center.y + Math.sin(c.angle) * orbitRadius;

      // Click animation: lunge toward center
      var isClicking = c.clickPhase > 0;
      var lungeT = 0;
      if (isClicking) {
        var t = c.clickPhase / CLICK_DURATION; // 0 to 1
        // sin(t * PI) peaks at t=0.5, returns to 0: smooth lunge and return
        lungeT = Math.sin(t * Math.PI);

        var lungeDistance = orbitRadius * CLICK_INWARD_RATIO * lungeT;
        var dx = center.x - x;
        var dy = center.y - y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          x += (dx / dist) * lungeDistance;
          y += (dy / dist) * lungeDistance;
        }
      }

      // Rotate cursor to point toward cookie center
      var angleToCenter = Math.atan2(center.y - y, center.x - x);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angleToCenter + Math.PI / 2); // point finger toward cookie
      ctx.font = fontSize + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.85;

      // Golden glow during click animation
      if (isClicking) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8 + lungeT * 12;
      }

      ctx.fillText('\u{1F446}', 0, 0); // 👆
      ctx.restore();
    }
  };

  Game.initOrbitCursors = function() {
    Game.syncCursorOrbitCount();
  };

})();
