/* global $state, $loop */

var _task,
    _inertia = 0,
    _previousY = 0,
    _dragStart = null;


function reach(positionModifier, diff) {
  var newScroll = $state.scrollTop + positionModifier;
  if (newScroll < 0) {
    window.scrollTo(0, 0);
    if (diff) {
      $state.View.drag(0, newScroll / diff);
    }
  } else if ($state.maxScroll < newScroll) {
    window.scrollTo(0, $state.maxScroll);
    if (diff) {
      $state.View.drag(0, (newScroll - $state.maxScroll) / diff)
    }
  } else {
    window.scrollTo(0, newScroll);
  }
  _inertia = positionModifier;
}

var $drag = {
  stop: function () {
   _dragStart = false;
   $state.View.release();
  },
  freeze: function () {
    _dragStart = false;
    _inertia = 0;
  }
};

function canDrag() { return $state.View.type === "story"; }

$drag.start = function () {
  if (!canDrag()) { return; }
  _task = $loop.drag.sub(function (e) {
    if (_dragStart) {
      reach(_previousY - $state.y, e.diff);
      _previousY = $state.y;
    } else if (_inertia) {
      if (_inertia > 0) {
        reach(Math.max(0, _inertia - e.diff / 10));
      } else {
        reach(Math.min(0, _inertia + e.diff / 10));
      }
    }
  }).repeat().request();
  $drag.start = function () {
    if (canDrag()) {
      _previousY = $state.y;
      _dragStart = true;
    }
  };
  $drag.start();
};

