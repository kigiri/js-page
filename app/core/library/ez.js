function prefixKey(prefix, key) {
  if (!prefix) { return key; }
  return prefix + key[0].toUpperCase() + key.slice(1);
}

var SVGNS = "http://www.w3.org/2000/svg";

var $ez = {
  // Tools
  dist: function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  },

  // Generate SVG for image placeholders
  fill: function (w, h) {
    var dim = ' width="'+ w +'" height="'+ h +'"';
    return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"'
      + dim +'><rect fill="white"'+ dim +"></rect></svg>')";
  },

  // Sorts generator
  prefix: prefixKey,
  by: function (key, reverse) {
    reverse = reverse ? -1 : 1;
    return function (a, b) {
      a = a[key];
      b = b[key];
      if (a === b) { return 0; }
      if (a > b) { return reverse; }
      return -reverse;
    }
  },

  // Filters
  all: function (key, value) {
    return function (a) {
      return a[key] === value;
    }
  },
  none: function (key, value) {
    return function (a) {
      return a[key] !== value;
    }
  },
  removeEmpty: function (e) {
    return !(!e || !e.length);
  },

  // Shims
  now: (function () {
    return window.performance
      ? window.performance.now.bind(window.performance)
      : Date.now.bind(Date);
  })(),
  fullscreen: function (el) {
    var _key;
    [
      "requestFullscreen",
      "webkitRequestFullscreen",
      "mozRequestFullScreen",
      "msRequestFullscreen"
    ].some(function (key) {
      if (document.body[key]) {
        _key = key;
        el[key]();
        return true;
      }
    });
    $ez.fullscreen = function (el) { el[_key](); };
  }
};

// pre-builded sorts :
$ez.byScore = $ez.by("score");
$ez.byIndex = $ez.by("index");
$ez.byPriority = $ez.by("priority");
