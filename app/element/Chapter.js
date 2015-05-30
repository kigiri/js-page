/* global Page, $new */

function Chapter(story, team, chapterInfo) {
  this.story = story;
  this.team = team;
  this.pageCount = chapterInfo.pages.length;
  this.index = chapterInfo.index;
  this.path = story.path +'/'+ team +'/'+ chapterInfo.path;
  this.HTMLElement = $new.div({ id: 'chapter-'+ this.index });
  this.pageArray = chapterInfo.pages.sort(function (a, b) {
    return a.index - b.index;
  }).map(function (page) {
    return new new Page(this, page);
  }.bind(this));
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

Chapter.prototype.update = function () {

};

Chapter.prototype.previous = function () {
  return this.story.teams[this.team].chapters[this.id - 1] || this;
};

Chapter.prototype.next = function () {
  return this.story.teams[this.team].chapters[this.id + 1] || this;
};


