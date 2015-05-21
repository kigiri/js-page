function DownloadManager(element, range) {
  this.current = element;
  this.range = range || Infinity;
  this.lastRequestedId = element.id;
}

DownloadManager.prototype.load = function (element) {
  this.lastRequestedId = element.id;
  if (element.isComplete) { return this; }
  if (element.id === this.current.id) { return this.start(); }
  this.current.cancel();
  this.current = element;
  this.start();
}

DownloadManager.prototype.stop = function () {
  this.current.cancel();
}

DownloadManager.prototype.start = function () {
  var next, max = this.lastRequestedId + this.range;

  while (this.current.isComplete) {
    next = this.current.next();
    if (next.id === this.current.id || next.id > max) { return; }
    this.current = next;
  }

  requestAnimationFrame(function () {
    this.current.load().then(this.start.bind(this));
  }.bind(this));
  return this;
};
