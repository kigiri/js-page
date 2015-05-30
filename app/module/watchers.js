/* global $state, $drag, $task */

// Watch DOM events, update $state and if needed triggers tasks.

$watchers = {};

var _sizeDiv = document.getElementById('size');
function updateWindow() {
  if ($state.height !== _sizeDiv.offsetTop) {
    $state.height = _sizeDiv.offsetTop;
    $tasks.layout.enable();
  }

  if ($state.width !== _sizeDiv.offsetLeft) {
    $state.width = _sizeDiv.offsetLeft;
    $tasks.layout.enable();
  }

  var newMaxScroll = document.body.offsetHeight - $state.height;
  if ($state.maxScroll !== newMaxScroll) {
    $state.maxScroll = newMaxScroll;
    $tasks.layout.enable();
  }
}

$watchers.mouseDown = function (event) {
  updateWindow();
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

window.addEventListener("orientationchange", updateWindow, false);
window.addEventListener("resize", updateWindow, false);
// window.addEventListener("touchstart", touchStart, false);
// window.addEventListener("touchend", touchEnd, false);
// window.addEventListener("touchleave", touchEnd, false);
// window.addEventListener("touchcancel", touchEnd, false);
