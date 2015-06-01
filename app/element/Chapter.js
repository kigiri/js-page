/* global Page, $new, $url, $state, $format */

function Chapter(story, chapterArray, index) {
  console.log(story, chapterArray, index);
  var chapterInfo = chapterArray[index], i = -1, id, page;
  if (!chapterInfo) {
    chapterInfo = chapterArray[0];
    index = 0;
  }
  $url.set({chapter: index});
  this.story = story;
  this.chapterArray = chapterArray;
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
  while (++i < this.pageArray.length) {
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
  if (idx < 0) {
    return this.pageArray[0]; // should load previous chapter
  }
  if (idx >= this.pageCount) {
    return this.pageArray[this.pageCount-1]; // should load next chapter
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
  return this.chapterArray[Math.max(this.index - 1, 0)];
};

Chapter.prototype.next = function () {
  if (this.index + 1 < this.chapterArray.length) {
    return this.chapterArray[this.index + 1];
  }
  return this;
};

Chapter.prototype.setPage = function (pageIndex) {
  $state.page = this.getPage(pageIndex);
  $format.load();
  return this;
};
