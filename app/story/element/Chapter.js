/* global Page, $new, $state, $format, $config */

function Chapter(story, chapterInfo) {
  var i = -1, id, page;
  this.story = story;
  this.index = chapterInfo.index;
  this.id = story.id +'-chapter-'+ this.index;
  this.path = chapterInfo.path;
  this.HTMLElement = $new.div({
    id: this.id,
    className: "chapter"
  });
  this.pageArray = chapterInfo.data.sort(function (a, b) {
    return parseInt(a.name) - parseInt(b.name);
  }).map(function (page, index) {
    return new Page(this, page, index);
  }.bind(this));

  id = 0;
  this.isAttached = false;
  this.HTMLElement.instance = this;
  this.pageCount = this.pageArray.length;
  while (++i < this.pageCount) {
    page = this.pageArray[i];
    page.id = id;
    id += page.isWide ? 2 : 1;
  }
  
  if (id % 2) {
    page = new Page(this, {
      name: "filler",
      height: 0,
      width: 0
    }, this.pageCount);
    page.id = id + 1;
    this.pageArray.push(page);
    this.pageCount++;
  }
}

Chapter.prototype.getPage = function (idx, callback) {
  if (idx < 0) {
    this.previous(function (chapter) {
      if (!chapter) { return; }
      chapter.getPage(chapter.pageCount + idx, callback);
    });
  } else if (idx >= this.pageCount) {
    this.next(function (chapter) {
      if (!chapter) { return; }
      chapter.getPage(idx - this.pageCount, callback);
    }.bind(this));
  } else {
    callback(this.pageArray[idx]);
  }
  return this;
};

Chapter.prototype.eachPage = function (fn) {
  var
    i = -1,
    len = this.pageArray.length;

  switch (typeof fn) {
    case "string":
      while (++i < len) {
        this.pageArray[i][fn]();
      } break;
    case "function":
      while (++i < len) {
        fn(this.pageArray[i], i, this.pageArray);
      } break;
    default: break;
  }
  return this;
};

Chapter.prototype.previous = function (cb) {
  return this.story.getChapter(this.index - 1, cb);
};

Chapter.prototype.next = function (cb) {
  return this.story.getChapter(this.index + 1, cb);
};

Chapter.prototype.setPage = function (pageIndex) {
  var loadCallback;

  if ($state.page && $state.page.chapter !== this) {
    $state.page.chapter.detatch();
  }
  if (pageIndex === "last") {
    pageIndex = this.pageCount - 1;
    loadCallback = function (page) {
      setTimeout(function () {
        window.scrollTo(0, $state.maxScroll);
      }, 100);
      $format.load(page);
    }
  } else {
    loadCallback = function (page) {
      setTimeout(page.scrollTo.bind(page), 100);
      $format.load(page);
    }
  }
  this.getPage(pageIndex, loadCallback);

  return this.attach();
};

Chapter.prototype.detatch = function () {
  this.isAttached = false;
  this.eachPage("detatch");
  this.HTMLElement.remove();
  return this;
};

Chapter.prototype.attach = function () {
  if (this.isAttached) { return this; }
  this.isAttached = true;
  if ($config.readingMode === "strip") {
    this.eachPage("attach");
  }
  this.story.attach(this.HTMLElement);
  return this;
};
