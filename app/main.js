/* global App, $state */

new App();

// var ptest =  $add(new Page("img/heavy.png", 0).load());
window.onscroll = function (event) {
  $state.setScroll((event.pageY !== undefined)
    ? event.pageY
    : document.body.scrollTop);
};

window.onmouseup = $state.mouseRelease;

window.onmousemove = function (event) {
  $state.setMouse(event);
};

window.addEventListener("orientationchange", $state.updateWindow, false);
window.addEventListener("resize", $state.updateWindow, false);
// window.addEventListener("touchstart", $state.touchStart, false);
// window.addEventListener("touchend", $state.touchEnd, false);
// window.addEventListener("touchleave", $state.touchEnd, false);
// window.addEventListener("touchcancel", $state.touchEnd, false);
function $main() {}

