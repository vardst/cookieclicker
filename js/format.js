var Game = Game || {};

(function() {
  'use strict';

  var SUFFIXES = [
    'million', 'billion', 'trillion', 'quadrillion', 'quintillion',
    'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
    'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
    'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion',
    'novemdecillion', 'vigintillion'
  ];

  Game.formatNumber = function(n) {
    if (!isFinite(n)) return 'Infinity';
    if (n < 0) return '-' + Game.formatNumber(-n);
    if (n < 1e6) {
      if (n === Math.floor(n)) return n.toLocaleString('en-US');
      return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    if (n >= 1e66) return n.toExponential(3);
    var suffixIndex = Math.floor(Math.log10(n) / 3) - 2;
    if (suffixIndex < 0) suffixIndex = 0;
    if (suffixIndex >= SUFFIXES.length) return n.toExponential(3);
    var divisor = Math.pow(10, (suffixIndex + 2) * 3);
    return (n / divisor).toFixed(3) + ' ' + SUFFIXES[suffixIndex];
  };

  Game.formatShort = function(n) {
    if (!isFinite(n)) return 'Inf';
    if (n < 0) return '-' + Game.formatShort(-n);
    if (n < 1000) {
      if (n === Math.floor(n)) return String(n);
      return n.toFixed(1);
    }
    if (n < 1e6) return (n / 1000).toFixed(1) + 'K';
    if (n >= 1e66) return n.toExponential(2);
    var suffixIndex = Math.floor(Math.log10(n) / 3) - 2;
    if (suffixIndex < 0) suffixIndex = 0;
    if (suffixIndex >= SUFFIXES.length) return n.toExponential(2);
    var divisor = Math.pow(10, (suffixIndex + 2) * 3);
    return (n / divisor).toFixed(3) + ' ' + SUFFIXES[suffixIndex];
  };

  Game.formatTime = function(seconds) {
    if (seconds < 60) return Math.floor(seconds) + ' seconds';
    if (seconds < 3600) {
      var m = Math.floor(seconds / 60);
      var s = Math.floor(seconds % 60);
      return m + ' minute' + (m !== 1 ? 's' : '') + (s > 0 ? ', ' + s + ' second' + (s !== 1 ? 's' : '') : '');
    }
    var h = Math.floor(seconds / 3600);
    var min = Math.floor((seconds % 3600) / 60);
    return h + ' hour' + (h !== 1 ? 's' : '') + (min > 0 ? ', ' + min + ' minute' + (min !== 1 ? 's' : '') : '');
  };
})();
