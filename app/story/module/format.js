/* global $config, $state, $url */

function handlePageLoad(page) {
  $url.set({page: page.index, chapter: page.chapter.index});
  $state.dl.load(page);
}

var _readingModes = {};
function getSharedStyle() {
  return {
    position: "relative",
    overflow: "hidden",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 50%",
  };
}

function applyWideSplit(style) {
  if (style.backgroundPosition !== '0% 50%'
    && style.backgroundPosition !== '100% 50%') {
    style.backgroundPosition = $config.invertPageOrder ? '100% 50%' : '0% 50%';
  }
}

var
_strip = {
  getStyle: function () {
    var s = getSharedStyle();
    return s;
  },
  load: function (page) {
    if (page === null) { return; }
    $state.page = page;
    page.scrollTo();
    handlePageLoad(page);
  },
  next: function (page) {
    _strip.load(page.next());
  },
  previous: function (page) {
    _strip.load(page.previous());
  },
  click: function (page, event) {
    if (event.y > $state.height / 2) {
      _strip.next(page);
    } else {
      _strip.previous(page);
    }
  },
  resize: function () {
    this.HTMLElement.style.height = ($config.fit
      ? ~~($state.width / this.width * this.height)
      : this.height)
    +'px';

    if (this.isWide) {
      style.backgroundSize = 'contain';
    }
    this.HTMLElement.style.width = '100%';
    this.HTMLElement.style.backgroundPosition = '50% 50%';
    this.chapter.story.HTMLElement.style.height = '100%';
  },
},
_single = {
  getStyle: function () {
    var s = getSharedStyle();
    if (this.isWide) {
      s.backgroundSize = 'cover';
      s.backgroundPosition = ($config.invertPageOrder) ? '100% 50%' : '0% 50%';
    }
    return s;
  },
  load: function (page) {
    if (page === null) { return; }
    $state.page = page;
    $state.eachVisiblePages("detatch");
    $state.pagesInView.length = 1;
    $state.pagesInView[0] = page;
    page.attach();
    handlePageLoad(page);
  },
  next: function () {
    var page = $state.page;

    if (page.isWide) {
      if ($config.invertPageOrder) {
        if (page.HTMLElement.style.backgroundPosition === '100% 50%') {
          page.HTMLElement.style.backgroundPosition = '0% 50%';
          return;
        }
      } else {
        if (page.HTMLElement.style.backgroundPosition === '0% 50%') {
          page.HTMLElement.style.backgroundPosition = '100% 50%';
          return;
        }
      }
    }

    page = page.next();
    while (page && page.url === "filler") {
      page = page.next();
    }
    _single.load(page);
  },
  previous: function () {
    var page = $state.page;

    if (page.isWide) {
      if ($config.invertPageOrder) {
        if (page.HTMLElement.style.backgroundPosition === '0% 50%') {
          page.HTMLElement.style.backgroundPosition = '100% 50%';
          return;
        }
      } else {
        if (page.HTMLElement.style.backgroundPosition === '100% 50%') {
          page.HTMLElement.style.backgroundPosition = '0% 50%';
          return;
        }
      }
    }

    page = page.previous();
    while (page && page.url === "filler") {
      page = page.previous();
    }
    _single.load(page);
  },
  click: function (page, event) {
    var isNext = (event.x > $state.width / 2);
    if ($config.invertPageOrder) {
      isNext = !isNext;
    }
    if (isNext) {
      _single.next(page);
    } else {
      _single.previous(page);
    }
  },
  resize: function () {
    var style = this.HTMLElement.style,
        height = $config.fit
          ? $state.height
          : ~~(($state.width / this.width) * this.height);

    style.height = height +'px';
    style.width = '100%';
    if (this.isWide) {
      var stateRatio = $state.width / $state.height;
      if ((this.width / 2) / this.height > stateRatio) {
        // 0.01 is a forced margin to be sure we don't miss part of the picture
        var ratio = $state.width / (this.width / 2) - 0.01;
        style.backgroundSize = ~~(ratio * this.width) +'px '
        + ~~(ratio * this.height) +'px';
        applyWideSplit(style);
      } else if (this.width / this.height < stateRatio) {
        style.backgroundSize = 'contain';
        style.backgroundPosition = '50% 50%';
      } else {
        style.backgroundSize = 'cover';
        applyWideSplit(style);
      }
    } else {
      style.backgroundPosition = '50% 50%';
    }
    this.chapter.story.HTMLElement.style.height = this.HTMLElement.style.height;
  }
},
_double = {
  getStyle: function () {
    var s = getSharedStyle();
    return s;
  },
  load: function (page) {
    if (page === null) { return; }
    $state.page = page;
    $state.eachVisiblePages("detatch");
    if (page.isWide) {
      $state.pagesInView.length = 1;
    } else {
      $state.pagesInView.length = 2;
      $state.pagesInView[1] = page.next();
    }
    $state.pagesInView[0] = page;
    $state.eachVisiblePages("attach");
    handlePageLoad(page);
  },
  next: function () {
    _double.load($state.pagesInView[$state.pagesInView.length - 1].next());
  },
  previous: function () {
    var page = $state.pagesInView[0].previous();
    if (page === null) { return; }
    if (!page.isWide) {
      page = page.previous();
    }
    _double.load(page);
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
    _double.load(page);
  },
  resize: function () {
    var style = this.HTMLElement.style;
    if ($config.fit) {
      style.height = $state.height +'px';
    } else {
      style.height = ~~((($state.width / 2) / this.width) * this.height) +'px';
    }
    style.width = '50%';
    style.float = 'right';
    if (this.isWide) {
      style.backgroundSize = 'contain';
      style.width = '100%';
      style.backgroundPosition = '50% 50%';
    } else if (this.isPair()) {
      style.backgroundPosition = '100% 50%';
    } else {
      style.backgroundPosition = '-1px 50%';
    }
    this.chapter.story.HTMLElement.style.height = this.HTMLElement.style.height;
  },
};

_readingModes.double = _double;
_readingModes.single = _single;
_readingModes.strip = _strip;

var $format = {
  getStyle: function () {
    return _readingModes[$config.readingMode].getStyle.call(this);
  },
  previous: function () {
    _readingModes[$config.readingMode].previous();
  },
  next: function () {
    _readingModes[$config.readingMode].next();
  },
  load: function (page) {
    _readingModes[$config.readingMode].load(page);
  },
  click: function (event) {
    try {
      _readingModes[$config.readingMode].click(this, event);
    } catch (err) { console.warn(err); }
  },
  resize: function () {
    _readingModes[$config.readingMode].resize.call(this);
  },
}

