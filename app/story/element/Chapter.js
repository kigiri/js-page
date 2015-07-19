/* global Page, $new, $state, $format, $config, $ez, $loop */

function Chapter(story, chapterInfo) {
  this.story = story;
  this.index = chapterInfo.index;
  this.id = story.id +'-chapter-'+ this.index;
  this.path = chapterInfo.path;
  this.HTMLElement = $new.div({
    id: this.id,
    className: "chapter"
  });
  this.pageArray = chapterInfo.data.sort($ez.byId).map(function (page, index) {
    return new Page(this, page, index);
  }.bind(this));

  this.isAttached = false;
  this.HTMLElement.instance = this;
  try {
  this.insertFillers().generateId();
  } catch (err) { console.log(err) }
}


function makeFiller(chapter, page) {
  return new Page(chapter, {
    name: "filler",
    height: page.height,
    width: page.width
  });
}


Chapter.prototype.insertFillers = function () {
  var
    pages = this.pageArray;
    i = -1,
    fillerArray = [],
    nextFiller = 0,
    space = 0,
    count = 0;

  this.pageCount = pages.length;

  while (++i < pages.length) {
    space++;
    count++;
    if (pages[i].isWide) {
      if (space % 2 === 0) {
        fillerArray.push(nextFiller);
      }
      space = 0;
      nextFiller = i + 1;
      count++;
    }
  }

  i = fillerArray.length;
  while (--i >= 0) {
    var idx = fillerArray[i];
    pages.splice(idx, 0, makeFiller(this, pages[idx]));
  }

  if ((count + fillerArray.length) % 2) {
    if (nextFiller) {
      pages.push(makeFiller(this, pages[pages.length - 1]));
    } else {
      pages.unshift(makeFiller(this, pages[0]));
    }
  }

  this.pageCount = pages.length;
  return this;
};

Chapter.prototype.fixPageOrder = function () {
  var pages = this.pageArray;
  pages.push(makeFiller(this, pages[pages.length - 1]));
  pages.unshift(makeFiller(this, pages[0]));
  return this.refreshPageList();
}

Chapter.prototype.removeRedondantFillers = function () {
  var i = -1, wasFiller = false, purge = [];
  while (++i < this.pageArray.length) {
    if (this.pageArray[i].isFiller) {
      if (wasFiller) {
        purge.push(i - 1);
        wasFiller = false;
      }
      wasFiller = true;
    } else {
      wasFiller = false;
    }
  }

  i = purge.length;
  while (--i >= 0) {
    this.pageArray.splice(purge[i], 2);
  }
 
  this.pageCount = this.pageArray.length;
  return this;
};

Chapter.prototype.generateId = function () {
  var
    pagination = 0,
    i = -1;

  while (++i < this.pageCount) {
    pagination += this.pageArray[i].setIndex(i, pagination).isWide ? 2 : 1;
  }

  return this;
};

Chapter.prototype.refreshPageList = function () {
  this.insertFillers().removeRedondantFillers().generateId();

  return this.setPage($state.page.index);
}

Chapter.prototype.removePage = function (page) {
  this.pageArray.splice(page.index, 1);
  return this.refreshPageList();
};

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
