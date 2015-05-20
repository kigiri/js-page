function Chapter(url, pageStart, pageEnd) {
  var
    page,
    i = -1,
    pageCount = pageEnd - pageStart;

  this.currentPage = 0;
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
    page = new Page(url.replace(/{page}/, page), i);
    this.HTMLElement.appendChild(page.HTMLElement);
    this.pageArray[i] = page;
  }
}

Chapter.prototype.loadPage = function (idx) {
  idx = Math.max(Math.min(this.pageArray.length - 1, idx), 0);
  this.currentPage = idx;
  this.pageArray[idx].load().then(function () {
    if (++idx < this.pageArray.length) {
      $state.queuePage(idx);
    }
  }.bind(this))
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

Chapter.prototype.getPrevious = function () {
  return this;
}

Chapter.prototype.getNext = function () {
  return this;
};
