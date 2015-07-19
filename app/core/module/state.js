/* global DownloadManager, $config */

var _pagesInView = [],
    _pagesToCleanup = [],
    $state = {
  y: 0,
  x: 0,
  height: 0,
  width: 0,
  maxScroll: 0,
  scrollTop: 0,
  dl: null,
  page: null,
  View: null,
  isActive: true,
  inContextMenu: false,
  pagesInView: _pagesInView,
  pagesToCleanup: _pagesToCleanup
};

$state.eachVisiblePages = function (key) {
  var i = -1;
  while (++i < _pagesInView.length) {
    _pagesInView[i][key]();
  }
}

$state.initDl = function () {
  var buff = $config.pageBuffer * (($config.readingMode === "double") ? 2 : 1);
  if ($state.dl) {
    $state.dl.range = buff;
  } else {
    $state.dl = new DownloadManager($state.page, buff, _pagesInView);
  }
}

$state.initDl();
