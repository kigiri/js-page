/* global $new */

var _style = {
  selector: {},
  cursor: {},
  cursorPointer: {},
  start: {},
  end: {},
  bar: {}
};

function ChapterSelector() {
  this.progress = $new.div();
  this.bar = $new.div({
    style: _style.bar,
    onclick: function () {
      
    }.bind(this)
  }, this.progress);

  this.cursor = $new.div({ style: _style.cursor },
    $new.div({ style: _style.cursorPointer }));

  this.HTMLElement = $new.div({
    style: _style.selector
  },
  $new.div([
    $new.div({
      style: _style.start,
      onclick: this.selectFirst.bind(this)
    }, "START"),
    this.bar,
    $new.div({
      style: _style.end,
      onclick: this.selectLast.bind(this)
    }, "END"),
  ]), this.cursor);
}

ChapterSelector.prototype.select = function (index) {
  // do something
  console.log("Selecting", this.chapters[index]);
  this.selectedChapter = this.chapters[index];
  this.index = index;
  return this;
};


ChapterSelector.prototype.selectFirst = function () {
  return this.select(0);
};

ChapterSelector.prototype.selectLast = function () {
  return this.select(this.chapters.length - 1);
};


ChapterSelector.prototype.load = function (chapterArray) {
  console.log("Loading", chapterArray.length, "chapters");

  this.chapters = chapterArray;
  return this.selectFirst();
};
