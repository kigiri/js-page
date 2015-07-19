/* global Task, $ez */

var _run = false,
    _taskArray = [],
    _event = {},
    _reqId;

var updateEvent = (function () {
  var prev = $ez.now();
  _event.timestamp = prev;
  _event.diff = 16;
  updateEvent = function () {
    var now = $ez.now();
    _event.timestamp = now;
    _event.diff = now - prev;
    prev = now;
  };
});

function loop() {
  var i = -1, elapsed, cleanup = [];

  updateEvent();
  while (++i < _taskArray.length) {
    if (_taskArray[i].exec(_event).purge === true) {
      cleanup.push(i);
    }
    if ($ez.now() - _event.timestamp > 9) {
      break;
    }
  }

  if (cleanup.length) {
    i = cleanup.length;
    while (--i >= 0) {
      _taskArray.splice(cleanup[i], 1);
    }
  }

  if (_run) {
    _reqId = requestAnimationFrame(loop);
  }
}

var $loop = {
  start: function () {
    if (_run) { return; }
    _run = true;
    requestAnimationFrame(loop);
  },
  stop: (function () {
    if (window.cancelAnimationFrame) {
      return function () {
        window.cancelAnimationFrame(_reqId);
        _run = false;
      }
    }
    return function () { _run = false; }
  })(),
  get: function (key) {
    var t;
    if (!key) { // no key, creating unreferenced task
      t = new Task();
      _taskArray.push(t);
      return t;
    } else if (!$loop.hasOwnProperty(key)) { // creating referenced task
      t = new Task(key);
      _taskArray.push(t);
      $loop[key] = t;
    } // return referenced task
    return $loop[key];
  },
  del: function (id) {
    _taskArray = _taskArray.filter($ez.none("id", id));
  },
  clear: function () {
    _taskArray = [];
  }
};

[
  "loop",
  "newPage",
  "backgroundChange",
  "translate",
  "urlChange",
  "storyLoad",
  "resize",
  "updateScroll",
  "drag",
  "stopDrag",
  "leftClickDown",
  "leftClickUp",
  "rightClickDown",
  "rightClickUp",
  "middleClickDown",
  "middleClickUp",
].forEach(function (key, priority) {
  $loop.get(key).setPriority(priority);
});

$loop.loop.repeat().request();
