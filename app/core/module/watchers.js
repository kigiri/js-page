/* global $state, $drag, $loop, $format */
// Watch DOM events, update $state and if needed triggers tasks.

$watchers = {};

function updateWindow() {
  var size = document.getElementById('size');
  $state.height = size.offsetTop;
  $state.width = size.offsetLeft;
  $loop.resize.request();

  return function () {
    var scroll, resized = false;

    if ($state.height !== size.offsetTop) {
      $state.height = size.offsetTop;
      resized = true;
    }

    if ($state.width !== size.offsetLeft) {
      $state.width = size.offsetLeft;
      resized = true;
    }

    updateScroll();
    if (resized) {
      $loop.resize.request();
    }
  }
}

function updateScroll() {
  var v = $state.View;
  if (!v || !v.content) { return; }
  var scroll = Math.max(v.content.HTMLElement.offsetHeight - $state.height, 0);
  if ($state.maxScroll !== scroll) {
    $state.maxScroll = scroll;
    if (!$state.scrollBarWidth) {
      $state.scrollBarWidth
    }
    $loop.updateScroll.request();
  }
}

$loop.loop.sub(updateWindow());

window.onscroll = function (event) {
  window.onscroll = (event.pageY !== undefined)
  ? function (event) { $state.scrollTop = event.pageY; }
  : function (event) { $state.scrollTop = document.body.scrollTop; }
  window.onscroll(event);
};

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

// (function () {
//   var keys = {37: 1, 38: 1, 39: 1, 40: 1};

// function preventDefault(event) {
//   event.preventDefault();
// }

// function preventDefaultForScrollKeys(event) {
//   if (event.which) {
//   } else {

//   }
// }

// })();


// window.onwheel = preventDefault; // modern standard
// window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
// window.ontouchmove  = preventDefault; // mobile
// document.onkeydown  = preventDefaultForScrollKeys;

window.addEventListener('contextmenu', function () {
  $state.inContextMenu = true;
}, false);

window.onblur = function () { 
  $state.inContextMenu = false;
  $state.isActive = false; 
};

window.addEventListener("mouseup", function (event) {
  $state.lastClickedElement = event.target;
  switch (event.which) {
    case 1: $loop.leftClickUp.request();   break;
    case 2: $loop.middleClickUp.request(); break;
    case 3: $loop.rightClickUp.request();  break;
    default: switch (event.button) {
      case 1: $loop.leftClickUp.request();   break;
      case 4: $loop.middleClickUp.request(); break;
      case 2: $loop.rightClickUp.request();  break;
      default: break;
    } break;
  }
}, false);

window.addEventListener("mousedown", function (event) {
  switch (event.which) {
    case 1: $loop.leftClickDown.request();   break;
    case 2: $loop.middleClickDown.request(); break;
    case 3: $loop.rightClickDown.request();  break;
    default: switch (event.button) {
      case 1: $loop.leftClickDown.request();   break;
      case 4: $loop.middleClickDown.request(); break;
      case 2: $loop.rightClickDown.request();  break;
      default: break;
    } break;
  }
}, false);

// window.addEventListener("touchend", touchEnd, false);
// window.addEventListener("touchleave", touchEnd, false);
// window.addEventListener("touchcancel", touchEnd, false);

$loop.leftClickUp.sub($drag.stop);

// [
//   "leftClickDown",
//   "leftClickUp",
//   "rightClickDown",
//   "rightClickUp",
//   "middleClickDown",
//   "middleClickUp",
// ].forEach(function (key) {
//   $loop[key].sub(function () { console.log(key); });
// });
