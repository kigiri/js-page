/* global Chapter, $state, $new, $url, $config, $add, $format, $stories, $loop, $ez, $drag */
var _keyToCopy = [
  "title",
  "chapters",
  "files",
  "readingMode",
  "path",
  "type",
  "ongoing",
  "readingTo",
  "description",
  "genre",
  "year",
  "rating",
  "tags"
];

function Story() {
  $state.Story = this;
  this.y = 0;
  this.travelY = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "story",
    tabIndex: 1,
    onkeydown: function (event) {
      var handler = _keyHandlers[event.keyCode];
      if (handler) {
        handler(event);
      } else {
        console.log(event.keyCode);
      }
    },
    style: {
      transform: "translate(0, 0)",
      transitionProperty: 'none',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      overflow: "hidden"
    }
  });
}

Story.prototype.load = function (storyInfo) {
  $url.loadStory(storyInfo.path);

  initWatchers(this);

  this.HTMLElement.focus();

  this.id = storyInfo.path;
  $ez.copyKeys(_keyToCopy, storyInfo, this);

  // temp fix :
  if (this.readingMode === "strip") {
    this.readingTo = "bottom";
  } else {
    this.readingTo = "right"; // should get this from story defined data
  }
  $config.loadStory(this);

  $config.updateReadingMode($state);
  return this;
};
var _separator = $new.div({
  id: "separator",
  style: {
    clear: "both",
    height: "0px",
    width: "100%"
  }
});

Story.prototype.getChapter = function (i, callback) {
  $stories.get(this.id, i, function (chapter) {
    if (!chapter.instance) {
      chapter.instance = new Chapter(this, chapter);
    }
    callback(chapter.instance);
  }.bind(this));
  return this;
};

Story.prototype.attach = function (HTMLElement) {
  this.HTMLElement.appendChild(HTMLElement);
  this.HTMLElement.appendChild(_separator);
};

Story.prototype.loadChapter = function (chapterIndex, pageIndex) {
  detatchAllChapters();
  return this.getChapter(chapterIndex, function (chapter) {
    chapter.setPage(pageIndex);
  }.bind(this));
};

function loadChapterCallback(chapter) { if (chapter) { chapter.setPage(0); } }
Story.prototype.release = function (xMod, yMod) {
  if (Math.abs(this.y) / ($state.height / 5) > 1) {
    if (this.isDragged < 0) {
      $state.page.chapter.previous(function (chapter) {
        chapter.setPage("last");
      });
    } else {
      $state.page.chapter.next(function (chapter) {
        chapter.setPage(0);
      });
    }
    $drag.freeze();
  } else {
    this.HTMLElement.style.transitionProperty = 'transform';
  }
  this.y = 0;
  this.x = 0;
  this.travelY = 0;
  this.isDragged = 0;
  this.HTMLElement.style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};

Story.prototype.drag = function (xMod, yMod) {
  var half = $state.height / 2;

  if (!this.isDragged) {
    this.isDragged = yMod;
  }
  this.travelY += yMod;
  this.y -= Math.max(Math.max(half - Math.abs(this.travelY), 0) / half, 0.05) * yMod;
  this.x -= xMod;
  this.HTMLElement.style.transitionProperty = 'none';
  this.HTMLElement.style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};

function wheelWatcher(event) {
  if (event.ctrlKey) {
    if ($config.readingMode === "strip") {
      if (event.deltaY > 0) {
        // zoom $config.maxZoom
      } else {
        // unzoom $config.maxZoom
      }
    }
    return;
  }
  if ($config.readingMode === "strip") { return }
  if (event.deltaY > 0) {
    $format.previous();
  } else {
    $format.next();
  }
}

var _keyHandlers = {
  39: $format.previous,
  78: $format.previous,
  65: $format.previous,
  72: $format.previous,
  37: $format.next,
  68: $format.next,
  76: $format.next,
  69: $format.next,
  82: function () {
    $config.invertPageOrder = !$config.invertPageOrder;
    $loop.resize.request();
  },
  27: function () {
    $state.inContextMenu = false;
  },
  13: function (e) {
    if (e.altKey) {
      $state.View.fullscreen();
    }
  },
  70: function () {
    $state.page.chapter.fixPageOrder();
  }
};

function handleRelease() { }

function getAllAttachedPages() {
  return document.getElementsByClassName("page");
}

function getAllAttachedChapters() {
  return document.getElementsByClassName("chapter");
}

function detatchAllChapters() {
  var attachedChapterArray = getAllAttachedChapters();
  var i = -1;
  while (++i < attachedChapterArray.length) {
    attachedChapterArray[i].instance.detatch();
  }
}

function deepEqual(a, b) {
  var i = -1;
  if (a.length !== b.length) { return false; }
  while (++i < a.length) {
    if (a[i] !== b[i]) { return false; }
  }
  return true;
}

function updatePagesInView() {
  var
    i = -1,
    pages = getAllAttachedPages(),
    pagesInView = [],
    pos, page;

  while (++i < pages.length) {
    page = pages[i];
    pos = page.getBoundingClientRect();

    if (pos.bottom < 1 || pos.top > $state.height) {
      if (pagesInView.length) { break; }
    } else {
      pagesInView.push(page.instance.updateDownloadBar());
    }
  }

  if (!deepEqual(pagesInView, $state.pagesInView)) {
    $state.pagesInView.length = 0;
    i = -1;
    if (pagesInView.length) {
      $format.handlePageLoad(pagesInView[0]);
    }
    while (++i < pagesInView.length) {
      $state.pagesInView[i] = pagesInView[i];
    }
  }
}

function loop() {
  // update pages visible
  if ($config.readingMode === "strip") {
    updatePagesInView();
    $state.eachVisiblePages("showProgressBar");
  } else {
    $state.eachVisiblePages("updateDownloadBar");
  }
  $state.dl.start();
}

function handleResize() {
  var oldRm = $config.readingMode, newRm;
  $config.updateReadingMode($state);
  newRm = $config.readingMode;
  if (oldRm !== newRm) {
    if (newRm === "double") {
      $format.load($state.page);
    } else if (newRm === "single") {
      if ($state.page.url === "filler") {
        if ($state.page.isPair()) {
          $format.load($state.page.previous());
        } else {
          $format.load($state.page.next());
        }
      } else {
        $format.load($state.page);
      }
    }
  }
  $state.eachVisiblePages("update");
}

function initWatchers(story) {
  window.addEventListener("wheel", wheelWatcher);

  handleRelease = function () {
    story.release();
  };
  $loop.stopDrag.sub(handleRelease);
  $loop.resize.sub(handleResize);
  $loop.loop.sub(loop);
}

Story.prototype.unload = function () {
  window.removeEventListener("wheel", wheelWatcher);
  detatchAllChapters();
  this.HTMLElement.remove();
  $state.page = null;
  $state.pagesInView.length = 0;
  $state.pagesToCleanup.length = 0;
  $loop.stopDrag.unsub(handleRelease);
  $loop.resize.unsub(handleResize);
  $loop.loop.unsub(loop);
};
