/* global $state, $drag, $loop */

// Watch DOM events, update $state and if needed triggers tasks.

$watchers = {};

var _sizeDiv = document.getElementById('size');
function updateWindow() {
  if ($state.height !== _sizeDiv.offsetTop) {
    $state.height = _sizeDiv.offsetTop;
    $loop.resize.request();
  }

  if ($state.width !== _sizeDiv.offsetLeft) {
    $state.width = _sizeDiv.offsetLeft;
    $loop.resize.request();
  }
  var offsetHeight;
  try {
    offsetHeight = $state.View.content.HTMLElement.offsetHeight;
  } catch (err) {
    offsetHeight = 0;
  }
  var newMaxScroll = Math.max(offsetHeight - $state.height, 0);
  if ($state.maxScroll !== newMaxScroll) {
    $state.maxScroll = newMaxScroll;
    $loop.resize.request();
  }
  _previousCall = null;
}

var _previousCall = null;
function callUpdate() {
  if (_previousCall === null) {
    _previousCall = requestAnimationFrame(updateWindow);
  }
}

callUpdate();
$watchers.mouseDown = function (event) {
  callUpdate();
  $state.x = event.clientX;
  $state.y = event.clientY;
  $drag.start();
  return false;
};

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

window.addEventListener("orientationchange", callUpdate, false);
window.addEventListener("resize", callUpdate, false);
// window.addEventListener("touchstart", touchStart, false);
// window.addEventListener("touchend", touchEnd, false);
// window.addEventListener("touchleave", touchEnd, false);
// window.addEventListener("touchcancel", touchEnd, false);
