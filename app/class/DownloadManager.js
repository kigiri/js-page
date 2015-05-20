function DownloadManager(element) {
  this.current = element;
}

DownloadManager.prototype.load = function (element) {
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
  var next;

  while (this.current.isComplete) {
    next = this.current.next();
    if (next.id === this.current.id) { return; }
    this.current = next;
  }

  requestAnimationFrame(function () {
    this.current.load().then(this.start.bind(this));
  }.bind(this));
  return this;
};
