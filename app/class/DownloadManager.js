function DownloadManager(idx) {
  this.currentPageIdx = idx || 0;
}

DownloadManager.prototype.findNextPage = function () {

};

DownloadManager.prototype.start = function () {
  this.findNextPage().load().then(this.start.bind(this));
  return this;
};
