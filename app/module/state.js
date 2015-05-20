
var _mode = 'single',
    _loadedChapter,
    _nextPageInQueue = 0,
    // _x = 0,
    _y = 0,
    _scrollStart = false,
    // _xStart = 0,
    _yStart = 0,
    _lastUpdate = window.performance.now(),
    _scrollTop = 0;

function update() {
  var start = window.performance.now(),
      diff = start - _lastUpdate,
      pageInView = ~~((_scrollTop) / 1153),
      rest = _scrollTop + window.innerHeight - (pageInView + 1) * 1153;

  if (rest > 50) {
   _loadedChapter.pageArray[pageInView+1].load();
    _loadedChapter.pageArray[pageInView+1].update();
  }
  _loadedChapter.pageArray[pageInView].load();
  _loadedChapter.pageArray[pageInView].update();

  // Scroll me baby
  if (_scrollStart) {
    var newScroll = _scrollTop + (_yStart - _y),
        maxScroll = document.body.offsetHeight - window.innerHeight;
    if (newScroll < 0) {
      window.scrollTo(0, 0);
      console.log(newScroll / diff)
    } else if (maxScroll < newScroll) {
      window.scrollTo(0, maxScroll);
      console.log(((newScroll - maxScroll) / diff))
    } else {
      window.scrollTo(0, newScroll);
    }
    _yStart = _y;
  }

  if (window.performance.now() - start > 7) {
    console.warn('UPDATE is too slow ! :', (window.performance.now() - start).toFixed(1) + 'ms');
  }
  _lastUpdate = start;
  requestAnimationFrame(update);
}

var state = {
  pageLoadTime: new Average(),
  watchMouse: function () {
    // _xStart = _x;
    _yStart = _y;
    _scrollStart = true;
    return false;
  },
  setMouse: function (x, y, buttons) {
    // _x = x;
    _y = y;
    if (!buttons || buttons === 2) {
      _scrollStart = false;
    }
  },
  setScroll: function (value) {
    _scrollTop = value;
  },
  queuePage: function (idx) {
    _nextPageInQueue = idx
  },
  init: function (chapter) {
    _loadedChapter = chapter;
    requestAnimationFrame(update);
  }
}
