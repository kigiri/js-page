/* global $loop, $state */

var _task,
    _inertia = 0,
    _previousY = 0,
    _scrollStart = null;


function reach(positionModifier, diff) {
  var newScroll = $state.scrollTop + positionModifier;
  if (newScroll < 0) {
    window.scrollTo(0, 0);
    // if (diff) {
      // console.log(newScroll / diff);
    // }
  } else if ($state.maxScroll < newScroll) {
    window.scrollTo(0, $state.maxScroll);
    // if (diff) {
      // console.log(((newScroll - _maxScroll) / diff));
    // }
  } else {
    window.scrollTo(0, newScroll);
  }
  _inertia = positionModifier;
}

var $scroll = {
  stop: function () {
   _scrollStart = false; 
  },
  freeze: function () {
    _scrollStart = false;
    _inertia = 0;
  }
};

$scroll.start = function () {
  if ($config.readingMode !== "strip") { return; }
  $loop.get().sub(function (e) {
    if (_scrollStart) {
      reach(_previousY - $state.y, e.diff);
      _previousY = $state.y;
    } else if (_inertia) {
      if (_inertia > 0) {
        reach(Math.max(0, _inertia - e.diff / 10));
      } else {
        reach(Math.min(0, _inertia + e.diff / 10));
      }
    }
  });
  $scroll.start = function () {
    if ($config.readingMode !== "strip") { return; }
    _previousY = $state.y;
    _scrollStart = true;
  }
  $scroll.start();
};
