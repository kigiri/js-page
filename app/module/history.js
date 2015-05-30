/* global $state */

var _h = window.history

window.onpopstate = function(event) {
  console.log("location: " + document.location + ", state: ", event.state);
};

var $history = {
  go: _h.go.bind(_h),
  add: _h.pushState.bind(_h),
  set: _h.replaceState.bind(_h)
};

