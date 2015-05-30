var $ez = {
  // Sorts generator
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
  })()
};

// pre-builded sorts :
$ez.byScore = $ez.by("score");
$ez.byIndex = $ez.by("index");
$ez.byPriority = $ez.by("priority");
