
function _load(element) {
  this.stop();
  this.current = element;
  this.start();
}

function DownloadManager(element, range) {
  element = element || { index: -1 };
  this.current = element;
  this.range = range || Infinity;
  this.lastRequestedId = element.index;
  this.timeout = null;
}

DownloadManager.prototype.load = function (element) {
  if (!element === null) { return this; }
  this.lastRequestedId = element.index;
  if ((this.current === null || element.index !== this.current.index)
    && !element.isLoading) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function() {
      _load.call(this, element);
    }.bind(this), 100);
  } else if (!element.isLoading) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.start.bind(this), 100);
  }
  return this;
};

DownloadManager.prototype.stop = function () {
  if (this.current !== null && typeof this.current.cancel === "function") {
    this.current.cancel();
  }
  return this;
};

DownloadManager.prototype.start = function () {
  var next, max = this.lastRequestedId + this.range;

  while (this.current.isComplete) {
    next = this.current.next();
    if ((next === null)
      || (next.index === this.current.index || next.index > max)) { return this; }
    this.current = next;
  }

  this.current.load().then(this.start.bind(this));
  return this;
};
