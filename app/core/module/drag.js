/* global $state, $loop */

var _task,
    _page = null,
    _inertia = 0,
    _previousY = 0,
    _dragStart = null;

function reach(yMod, xMod, diff) {
  var newScroll = $state.scrollTop + yMod;
  if ($state.Story.isDragged) {
    // cancel drag
    if ($state.Story.isDragged > 0) {
      $state.Story.drag(0, (newScroll - $state.maxScroll))
    } else {
      $state.Story.drag(0, newScroll);
    }
  } else if (newScroll < 0) {
    // top reached
    window.scrollTo(0, 0);
    if (diff) {
      $state.Story.drag(0, newScroll);
    }
  } else if ($state.maxScroll < newScroll) {
    // bottom reached
    window.scrollTo(0, $state.maxScroll);
    if (diff) {
      $state.Story.drag(0, (newScroll - $state.maxScroll))
    }
  } else {
    // normal
    window.scrollTo(0, newScroll);
  }
  _inertia = yMod;
}

var $drag = {
  stop: function () {
    if (_dragStart) {
      _dragStart = false;
      $loop.stopDrag.request();
      if (_page) {
        _page.release();
        _page = null;
      }
    }
  },
  freeze: function () {
    $drag.stop();
    _inertia = 0;
  }
};

$drag.start = function () {
  _task = $loop.drag.repeat().sub(function (e) {
    if (_dragStart) {
      reach(_previousY - $state.y, _previousX - $state.x, e.diff);
      _previousY = $state.y;
      _previousX = $state.x;
    } else if (_inertia) {
      if (_inertia > 0) {
        reach(Math.max(0, _inertia - e.diff / 10));
      } else {
        reach(Math.min(0, _inertia + e.diff / 10));
      }
    }
  }).repeat().request();
  $drag.start = function (page) {
    _previousX = $state.x;
    _previousY = $state.y;
    _dragStart = true;
    _page = page;
  };
  $drag.start();
};

