/* global $config, $state, $url */

function handlePageLoad(page) {
  $url.set({page: page.index});
  $state.dl.load(page);
}

var _readingModes = {};

var
strip = {
  load: function () {
    $state.page.scrollTo();
    handlePageLoad($state.page);
  },
  click: function (page, event) {
    if (event.y > $state.height / 2) {
      $state.page = page.next();
    } else {
      $state.page = page.previous();
    }
    _readingModes.strip.load();
  },
  resize: function (style, w, h, sW, sH) {
    style.height = ($config.fit ? ~~(sW / w * h) : h) +'px';
    style.width = '100%';
    style.backgroundPosition = 'center';
  },
},
single = {
  load: function () {
    $state.eachVisiblePages("detatch");
    $state.pagesInView.length = 0;
    $state.pagesInView.push($state.page);
    $state.page.attach();
    handlePageLoad($state.page);
  },
  click: function (page, event) {
    var isNext = (event.x > $state.width / 2);
    if ($config.invertPageOrder) {
      isNext = !isNext;
    }
    if (isNext) {
      $state.page = page.next();
    } else {
      $state.page = page.previous();
    }
    _readingModes.single.load();
  },
  resize: function (style, w, h, sW, sH) {
    if ($config.fit) {
      style.height = sH +'px';
    } else {
      style.height = ~~((sW / w) * h) +'px';
    }
    style.width = '100%';
    style.backgroundPosition = 'center';
  }
},
double = {
  load: function () {
    console.log('page choosen:', $state.page.index, "wide?", $state.page.isWide);
    $state.eachVisiblePages("detatch");
    $state.pagesInView.length = 0;
    $state.pagesInView.push($state.page);
    if (!$state.page.isWide) {
      $state.pagesInView.push($state.page.next());
    }
    $state.eachVisiblePages("attach");
    handlePageLoad($state.page);
  },
  next: function () {

  },
  previous: function () {

  },
  click: function (page, event) {
    var isNext;
    if (page.isWide) {
      isNext = (event.x > $state.width / 2);
      if ($config.invertPageOrder) {
        isNext = !isNext;
      }
    } else {
      isNext = page.isPair();
    }
    if (isNext) {
      page = page.next();
    } else {
      page = page.previous();
      if (!page.isWide) {
        page = page.previous();
      }
    }
    $state.page = page;
    _readingModes.double.load();
  },
  resize: function (style, w, h, sW, sH) {
    if ($config.fit) {
      style.height = sH +'px';
    } else {
      style.height = ~~(((sW / 2) / w) * h) +'px';
    }
    style.width = '50%';
    if (this.isWide) {
      style.width = '100%';
      style.backgroundPosition = 'center';
      style.float = 'right';
    } else if (this.isPair()) {
      style.float = 'left';
      style.backgroundPosition = 'right';
    } else {
      style.float = 'right';
      style.backgroundPosition = 'left';
    }
  },
};

_readingModes.double = double;
_readingModes.single = single;
_readingModes.strip = strip;

var $format = {
  load: function () {
    _readingModes[$config.readingMode].load();
  },
  click: function (event) {
    try {
      _readingModes[$config.readingMode].click(this, event);
    } catch (err) { console.warn(err); }
  },
  resize: function (style, w, h, sW, sH) {
    _readingModes[$config.readingMode].resize.call(this, style, w, h, sW, sH);
  },
}

