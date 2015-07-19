
function _load(element) {
  if (element.index !== this.current.index) {
    this.stop();
    this.current = element;
  }
  this.start();
}

function DownloadManager(element, range, pagesInView) {
  element = element || { index: -1 };
  this.current = element;
  this.range = range || Infinity;
  this.lastRequestedId = element.index;
  this.timeout = null;
  this.pagesInView = pagesInView;
}

DownloadManager.prototype.stop = function () {
  if (this.current !== null && typeof this.current.cancel === "function") {
    this.current.cancel();
  }
  return this;
};

DownloadManager.prototype.start = function (recur) {
  var
    count = 0,
    start = this.pagesInView[0],
    manager = this;

  if (!recur && this.lastStartingPoint === start) {
    return this;
  }

  function findNext(element) {
    if ((!element || element === this)
      || (element.index === this.index || count > manager.range)) { return; }

    count++;
    if (element.isComplete) {
      element.next(findNext.bind(element));
    } else {
      if (element === manager.current) {
        if (!element.isLoading) {
          element.load().then(function () {
            manager.start(true);
          });
        }
      } else {
        manager.stop();
        manager.current = element;
        element.load().then(function () {
          manager.start(true);
        });
      }
    }
  }

  this.lastStartingPoint = start;
  findNext(start);

  return this;
};
