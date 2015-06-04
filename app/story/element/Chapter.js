/* global Page, $new, $url, $state, $format */

function Chapter(story, chapterInfo) {
  console.log("new Chapter(", chapterInfo, ")");
  var i = -1, id, page;
  this.story = story;
  this.index = chapterInfo.index;
  this.id = chapterInfo.path;
  this.path = '/assets/'+ story.id +'/'+ story.team +'/'+ chapterInfo.path;
  this.HTMLElement = $new.div({ id: 'chapter-'+ this.index });
  this.pageArray = chapterInfo.pages.sort(function (a, b) {
    return a.index - b.index;
  }).map(function (page) {
    return new Page(this, page);
  }.bind(this));

  id = 0;
  this.pageCount = this.pageArray.length;
  while (++i < this.pageCount) {
    page = this.pageArray[i];
    page.id = id;
    id += page.isWide ? 2 : 1;
  }
  
  if (id % 2) {
    console.log('adding filler page for last page');
    page = new Page(this, {
      index: this.pageCount,
      path: "filler",
      height: 0,
      width: 0
    });
    page.id = id + 1;
    this.pageArray.push(page);
    this.pageCount++;
  }

}

Chapter.prototype.getPage = function (idx) {
  var toLoad;
  if (idx < 0) {
    toLoad = this.previous();
    if (toLoad === null) { return null; }
    return toLoad.getPage(toLoad.pageCount + idx);
  }
  if (idx >= this.pageCount) {
    toLoad = this.next();
    if (toLoad === null) { return null; }
    return toLoad.getPage(idx - this.pageCount);
  }
  return this.pageArray[idx];
};

Chapter.prototype.eachPage = function (fn) {
  var i = -1,
      len = this.pageArray.length;

  switch (typeof fn) {
    case "string":
      while (++i < len) {
        this.pageArray[i][fn]();
      } break;
    case "function":
      while (++i < len) {
        fn(this.pageArray[i]);
      } break;
    default: break;
  }
  return this;
};

Chapter.prototype.previous = function () {
  return this.story.getChapter(this.index - 1);
};

Chapter.prototype.next = function () {
  return this.story.getChapter(this.index + 1);
};

Chapter.prototype.setPage = function (pageIndex) {
  $format.load(this.getPage(pageIndex));
  return this;
};
