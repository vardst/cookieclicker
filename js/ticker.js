var Game = Game || {};

(function() {
  'use strict';

  var defaultMessages = [
    'Cookie production is on the rise!',
    'The cookies are multiplying!',
    'Your bakery is the talk of the town.',
    'Scientists say cookies are good for you.',
    'Local cookie monster spotted near bakery.',
    'Cookie stocks hit record highs!',
    'Breaking: Cookies declared world\'s favorite snack.',
    'Experts warn of possible cookie shortage.',
    'Cookie-flavored toothpaste sales skyrocket.',
    'Studies show cookie consumption boosts happiness by 300%.',
    'Archaeologists discover ancient cookie recipe.',
    'World leaders meet for cookie summit.',
    'Space agency to launch cookie into orbit.',
    'New cookie species discovered in chocolate forest.',
    'Cookie museum opens to rave reviews.',
    'Underground cookie black market uncovered.',
    '"I can\'t stop baking," says local cookie enthusiast.',
    'Cookie-based economy proposed by think tank.',
    'Time traveler claims cookies taste better in the future.',
    'Cookie-powered vehicles could be the future of transport.'
  ];

  var buildingMessages = {
    0: ['Your cursors are clicking away.', 'Click, click, click, go the cursors.', 'The cursors tap in perfect rhythm.'],
    1: ['Your grandmas are baking up a storm.', 'Grandma says hi and sends cookies.', 'The grandmas have organized a baking competition.'],
    2: ['The cookie farms are thriving.', 'A bumper crop of cookies is expected.', 'Cookie plants growing nicely this season.'],
    3: ['Rich cookie ore deposits found!', 'The mines are deeper than ever.', 'Miners report a vein of pure chocolate.'],
    4: ['Factory output exceeds expectations.', 'New conveyor belt installed in the factory.', 'Factory workers demand more cookie breaks.'],
    5: ['Bank interest rates looking sweet.', 'Your cookie fortune grows with interest.', 'Banks report record cookie deposits.'],
    6: ['Ancient cookie wisdom revealed at the temple.', 'Monks meditate on the nature of cookies.', 'Temple offerings include chocolate chips.'],
    7: ['Wizard tower crackling with cookie magic.', 'A spell of deliciousness is cast!', 'Wizard accidentally turns self into cookie; fixed.'],
    8: ['Shipment of cookies from planet Cookiton arrives.', 'Space cookies have arrived!', 'Intergalactic cookie trade booming.'],
    9: ['Alchemy lab produces golden cookie dust.', 'Lead successfully transmuted into cookies!', 'Alchemists debate the cookie philosopher\'s stone.'],
    10: ['Portal to cookieverse stabilized.', 'Strange cookie creatures emerge from portal.', 'Interdimensional cookie treaty signed.'],
    11: ['Time machine retrieves pre-historic cookies.', 'Cookies from the year 3000 taste amazing.', 'Temporal cookie paradox resolved.'],
    12: ['Antimatter cookies are surprisingly tasty.', 'Condenser running at full capacity.', 'Antimatter cookie explosion averted.'],
    13: ['Prisms refracting pure cookie light.', 'A rainbow of cookie flavors!', 'Light-speed cookie production achieved.'],
    14: ['Fortune smiles on your cookie production.', 'Chance favors the prepared baker.', 'Lucky cookie events occurring frequently.'],
    15: ['Fractal cookies: infinite detail, infinite flavor.', 'Each fractal cookie contains smaller cookies.', 'Recursive baking process initiated.'],
    16: ['console.log("Cookies baked successfully");', 'JavaScript runtime optimized for cookies.', 'No bugs in the cookie code today.'],
    17: ['Idle universes put to work baking cookies.', 'Parallel universe cookie imports increasing.', 'The idleverse provides an endless cookie supply.'],
    18: ['Cortex bakers thinking delicious thoughts.', 'Brain cookies are the future of snacking.', 'Neural cookie pathways strengthened.'],
    19: ['You are one with the cookies.', 'You have become the ultimate cookie.', 'The cookies flow through you.']
  };

  var milestoneMessages = [];
  var lastTickerUpdate = 0;
  var tickerInterval = 10000; // 10 seconds

  Game.addTickerMessage = function(msg) {
    milestoneMessages.push(msg);
  };

  Game.getTickerMessage = function() {
    // Priority: milestone messages first
    if (milestoneMessages.length > 0) {
      return milestoneMessages.shift();
    }

    var pool = defaultMessages.slice();

    // Add building-specific messages for owned buildings
    for (var i = 0; i < 20; i++) {
      if (Game.state.buildings[i].count > 0 && buildingMessages[i]) {
        pool = pool.concat(buildingMessages[i]);
      }
    }

    return pool[Math.floor(Math.random() * pool.length)];
  };

  Game.updateTicker = function(now) {
    if (now - lastTickerUpdate < tickerInterval) return;
    lastTickerUpdate = now;

    var ticker = document.getElementById('ticker');
    if (!ticker) return;

    var msg = Game.getTickerMessage();
    ticker.classList.add('ticker-fade');
    setTimeout(function() {
      ticker.textContent = msg;
      ticker.classList.remove('ticker-fade');
    }, 300);
  };
})();
