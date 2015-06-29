/* global $state, $drag, $loop, $format */
// Watch DOM events, update $state and if needed triggers tasks.

$watchers = {};

function updateWindow() {
  var size = document.getElementById('size');
  $state.height = size.offsetTop;
  $state.width = size.offsetLeft;
  $loop.resize.request();
  _previousCall = null;
  updateWindow = function () {
    var scroll;
    if ($state.height !== size.offsetTop) {
      $state.height = size.offsetTop;
      $loop.resize.request();
    }

    if ($state.width !== size.offsetLeft) {
      $state.width = size.offsetLeft;
      $loop.resize.request();
    }
    _previousCall = null;
    updateScroll();
  }
}

var _previousCall = null;
function callUpdate() {
  if (_previousCall === null) {
    _previousCall = requestAnimationFrame(updateWindow);
  }
}

function updateScroll() {
  var v = $state.View;
  if (!v || !v.content) { return; }
  var scroll = Math.max(v.content.HTMLElement.offsetHeight - $state.height, 0);
  if ($state.maxScroll !== scroll) {
    $state.maxScroll = scroll;
    $loop.updateScroll.request();
  }
}

callUpdate();
$watchers.callUpdate = callUpdate;

window.onscroll = function (event) {
  window.onscroll = (event.pageY !== undefined)
  ? function (event) { $state.scrollTop = event.pageY; }
  : function (event) { $state.scrollTop = document.body.scrollTop; }
  window.onscroll(event);
};

window.onmouseup = $drag.stop;

window.onmousemove = function (event) {
  $state.y = event.clientY;
  if (event.which !== 1) {
    $drag.stop();
  }
};

window.onkeydown = (function () {
  var handlers = {
    27: function escape() {
      if ($state.modal) {
        $state.modal.hide();
      }
    }
  };
  function fallback() { }

  return function (event) {
    (handlers[event.which] || fallback)(event);
  };
})();

window.addEventListener("orientationchange", callUpdate, false);
window.addEventListener("resize", callUpdate, false);
window.addEventListener('contextmenu', function (e) {
  $state.inContextMenu = true;
}, false);

window.onblur = function () { 
  $state.inContextMenu = false;
  $state.isActive = false; 
};

// window.addEventListener("touchstart", touchStart, false);
// window.addEventListener("touchend", touchEnd, false);
// window.addEventListener("touchleave", touchEnd, false);
// window.addEventListener("touchcancel", touchEnd, false);
