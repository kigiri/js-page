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
  fill: (function () {
    var _svg = (new DOMParser()).parseFromString('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="300" height="841" viewBox="0 0 595 841"><path d="M518.361,595.748l-65.415-65.415l0.002,0.001c21.903-30.928,34.775-68.704,34.775-109.487 c0-104.744-84.911-189.655-189.655-189.655c-40.782,0-78.559,12.873-109.487,34.776l0.001,0.001l-65.258-65.259h395.037V595.748z"/><path d="M77.637,246.398l65.315,65.315l-0.011-0.001c-21.752,30.863-34.528,68.507-34.528,109.135 c0,104.744,84.911,189.655,189.654,189.655c40.63,0,78.275-12.775,109.139-34.529l-0.002-0.007l65.469,65.47H77.637V246.398z"/><text transform="matrix(1 0 0 1 193 495)" style="font-family: Impact; font-size: 200px">99</text></svg>', "image/svg+xml").firstChild;
    return function (text) {
      var copiedSvg = _svg.cloneNode(true);
      copiedSvg.getElementsByTagName('text')[0].textContent = text;
      return copiedSvg;
    }
  })(),

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
