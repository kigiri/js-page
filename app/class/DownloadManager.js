function DownloadManager(element, range) {
  element = element || { index: -1 };
  this.current = element;
  this.range = range || Infinity;
  this.lastRequestedId = element.index;
}

DownloadManager.prototype.load = function (element) {
  this.lastRequestedId = element.index;
  if (element.isComplete) { return this; }
  if (element.index === this.current.index) { return this.start(); }
  this.current.cancel();
  this.current = element;
  this.start();
};

DownloadManager.prototype.stop = function () {
  this.current.cancel();
};

DownloadManager.prototype.start = function () {
  var next, max = this.lastRequestedId + this.range;

  while (this.current.isComplete) {
    next = this.current.next();
    if (next.index === this.current.index || next.index > max) { return; }
    this.current = next;
  }

  requestAnimationFrame(function () {
    this.current.load().then(this.start.bind(this));
  }.bind(this));
  return this;
};
