/* global $config, $state, $url */

function handlePageLoad(page) {
  $url.set({page: page.index, chapter: page.chapter.index});
  $state.dl.load(page);
}

var _readingModes = {};

var
_strip = {
  style: {

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

    this.HTMLElement.style.width = '100%';
    this.HTMLElement.style.backgroundPosition = 'center';
    this.chapter.story.HTMLElement.style.height = '100%';
  },
},
_single = {
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
    var page = $state.page.next();
    while (page && page.url === "filler") {
      page = page.next();
    }
    _single.load(page);
  },
  previous: function () {
    var page = $state.page.previous();
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
    var style = this.HTMLElement.style;
    if ($config.fit) {
      style.height = $state.height +'px';
    } else {
      style.height = ~~(($state.width / this.width) * this.height) +'px';
    }
    style.width = '100%';
    style.backgroundPosition = 'center';
    this.chapter.story.HTMLElement.style.height = this.HTMLElement.style.height;
  }
},
_double = {
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

