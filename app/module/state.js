/* global DownloadManager, $config */

var
  _mode = 'single',
  _loadedChapter,
  _nextPageInQueue = 0,
  // _x = 0,
  _y = 0,
  _scrollStart = false,
  // _xStart = 0,
  _yStart = 0,
  _lastUpdate = window.performance.now(),
  _scrollTop = 0,
  _dl,
  _innerHeight = 0,
  _maxScroll = 0,
  _inertia = 0;

function reach(positionModifier, diff) {
  var newScroll = _scrollTop + positionModifier;
  if (newScroll < 0) {
    window.scrollTo(0, 0);
    if (diff) {
      console.log(newScroll / diff);
    }
  } else if (_maxScroll < newScroll) {
    window.scrollTo(0, _maxScroll);
    if (diff) {
      console.log(((newScroll - maxScroll) / diff));
    }
  } else {
    window.scrollTo(0, newScroll);
  }
  _inertia = positionModifier;
}

function update() {
  _loadedChapter.eachPage('update');
  var start = window.performance.now(),
      diff = start - _lastUpdate,
      pageInView = ~~((_innerHeight / 2 + _scrollTop) / 1153),
      currentPage = _loadedChapter.getPage(pageInView),
      previousPage;

  if (currentPage.isComplete && pageInView !== ~~(_scrollTop / 1153)) {
    previousPage = currentPage.previous();
    if (!previousPage.isComplete && !previousPage.isLoading) {
      _dl.load(previousPage);
    }
  } else {
    _dl.load(currentPage);
  }

  // Scroll me baby
  if (_scrollStart) {
    reach(_yStart - _y, diff);
    _yStart = _y;
  } else if (_inertia) {
    if (_inertia > 0) {
      reach(Math.max(0, _inertia - diff / 10));
    } else {
      reach(Math.min(0, _inertia + diff / 10));
    }
  }

  if (window.performance.now() - start > 7) {
    console.warn('UPDATE is too slow ! :', (window.performance.now() - start).toFixed(1) + 'ms');
  }
  _lastUpdate = start;
  requestAnimationFrame(update);
}

function updateWindow(event) {
  _innerHeight = window.innerHeight;
  _maxScroll = document.body.offsetHeight - _innerHeight;
}

var state = {
  pageLoadTime: new Average(),
  updateWindow: updateWindow,
  stopScroll: function (argument) {
    _inertia = 0;
    _scrollStart = false;
  },
  watchMouse: function (event) {
    updateWindow();
    // _xStart = _x;
    // _x = event.clientX;
    _y = event.clientY;
    _yStart = _y;
    _scrollStart = true;
    return false;
  },
  mouseRelease: function () {
    _scrollStart = false;
  },
  setMouse: function (event) {
    // _x = event.clientX;
    _y = event.clientY;
    if (event.which !== 1) {
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
    this.updateWindow();
    _dl = new DownloadManager(chapter.getPage(0), $config.pageBuffer);
    requestAnimationFrame(update);
  }
}
