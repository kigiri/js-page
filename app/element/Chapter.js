/* global Page, $new */

function Chapter(url, pageStart, pageEnd) {
  var
    page,
    i = -1,
    pageCount = pageEnd - pageStart;

  this.pageCount = pageCount;
  this.pageArray = new Array(pageCount);
  this.HTMLElement = $new.div({id: 'chapter'});
  while (++i < pageCount) {
    page = i + pageStart + 1;
    if (page < 10) {
      page = '00'+ page;
    } else if (page < 100) {
      page = '0'+ page;
    }
    page = new Page(url.replace(/{page}/, page), i, this, 800, 1153);
    this.HTMLElement.appendChild(page.HTMLElement);
    this.pageArray[i] = page;
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
        fn(this.pageArray[i]);
      } break;
    default: break;
  }
  return this;
};

Chapter.prototype.previous = function () {
  return this;
};

Chapter.prototype.next = function () {
  return this;
};
