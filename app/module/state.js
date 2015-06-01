/* global DownloadManager, $config */

var _pagesInView = [];
var $state = {
  y: 0,
  x: 0,
  height: 0,
  width: 0,
  maxScroll: 0,
  scrollTop: 0,
  dl: new DownloadManager(null, $config.pageBuffer),
  View: null,
  Menu: null,
  pagesInView: _pagesInView,
  pageClick: function (event) {
    if ($config.readingMode === "strip") {
    } else if ($config.readingMode === "single") {
    } else {
      if (this.isPair()) {
      } else {
      }
      $state.eachVisiblePages("detatch");
    }
  }
};

$state.eachVisiblePages = function (key) {
  var i = -1;
  while (++i < _pagesInView.length) {
    _pagesInView[i][key]();
  }
}



