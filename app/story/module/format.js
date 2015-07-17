/* global $config, $state, $url */

function handlePageLoad(page) {
  $url.setStoryIndexes(page.index, page.chapter.index);
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
    if (!page) { return; }
    if ($state.page && $state.page.chapter !== page.chapter) {
      $state.page = page;
      $state.Story.loadChapter(page.chapter.index, page.index);
    } else {
      $state.page = page;
      handlePageLoad(page.scrollTo());
    }
  },
  next: function () {
    var page = $state.page;
    console.log("next")

    page.next(_strip.load);
  },
  previous: function () {
    var page = $state.page;
    console.log("previous")
    page.previous(_strip.load);
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
      ? Math.min($state.width / this.width * this.height, this.height * $config.maxZoom)
      : this.height)
    +'px';

    if (this.isWide) {
      this.HTMLElement.style.backgroundSize = 'contain';
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
   try {
    $state.page = page;
    $state.eachVisiblePages("detatch");
    $state.pagesInView.length = 1;
    $state.pagesInView[0] = page;
    page.attach();
    handlePageLoad(page);
   } catch (err) { console.error(err) }
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

    page.next(function skipFiller(page) {
      if (page && page.url === "filler") {
        page.next(skipFiller);
      } else {
        _single.load(page);
      }
    });
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

    page.previous(function skipFiller(page) {
      if (page && page.url === "filler") {
        page.previous(skipFiller);
      } else {
        _single.load(page);
      }
    });
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
      $state.pagesInView[0] = page;
    } else {
      if (page.isPair()) {
        page.previous(function (page) {
          $state.pagesInView[0] = page;
        });
        $state.pagesInView[1] = page;
      } else {
        page.next(function (page) {
          $state.pagesInView[1] = page;
        });
        $state.pagesInView[0] = page;
      }
      $state.pagesInView.length = 2;
    }
    $state.eachVisiblePages("attach");
    handlePageLoad(page);
  },
  next: function () {
    $state.pagesInView[$state.pagesInView.length - 1].next(_double.load);
  },
  previous: function () {
    $state.pagesInView[0].previous(function (page) {
      if (page === null) { return; }
      if (!page.isWide) {
        page.previous(function (page) {
          _double.load(page);
        });
      } else {
        _double.load(page);
      }
    });
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
      page.next(_double.load);
    } else {
      page.previous(function (page) {
        if (!page.isWide) {
          page.previous(_double.load);
        } else {
          _double.load(page);
        }
      });
    }
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
  handlePageLoad: handlePageLoad,
}

