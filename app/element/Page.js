/* global Average, ImageLoader, $new, $state, $config, $add, $mousedown */

var _style = {
  page: {
    position: "relative",
    overflow: "hidden",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  },

  percentage: {
    fontSize: "30rem",
    opacity: 0,
    fontWeight: 700,
    transitionProperty: 'opacity',
    transitionDuration: '2.5s',
    transitionTimingFunction: 'cubic-bezier(1, 0, 0.5, 0)'
  },

  details: {
    fontSize: "5rem",
    marginBottom: "-6rem",
    paddingRight: "5rem",
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '1s',
    transitionTimingFunction: 'cubic-bezier(0.75, 0, 0.5, 0.5)',
    float: 'right'
  },

  progressText: {
    position: "absolute",
    bottom: "-8rem",
    left: "-2rem",
    color: 'black',
    transform: "rotate(-5deg)",
  },

  progress: {
    width: "100%",
    height: "100%",
    position: "absolute",
    background: 'black',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0.75, 0, 0.5, 0.5)'
  },

  bar: {
    height: "100%",
    margin: "auto",
    background: "hsl(0, 0%, 0%)",
    outline: "0.2rem solid rgba(255, 255, 255, 0.2)",
    outlineOffset: "-0.1rem",
    transform: "translateY(0%)",
    transitionProperty: 'transform',
    transitionDuration: '2s',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0, 1)'
  },
};

function Progress() {
  this.percentage = $new.div({ style: _style.percentage });
  this.details = $new.div({ style: _style.details });
  this.bar = $new.div({ style: _style.bar },
    $new.div({ style: _style.progressText }, this.details, this.percentage));
  this.HTMLElement = $new.div({ style: _style.progress }, this.bar);
  // generate an svg with same proportions as the image and use it as background
  // cover to have a nice placeholder for the picture.
}

Progress.prototype.remove = function () {
  this.HTMLElement.style.opacity = 0;
  this.HTMLElement.addEventListener('transitionend', function () {
    this.HTMLElement.remove();
  }.bind(this));
};

Progress.prototype.update = function (dlState, elapsedTime) {
  dlState.loadRate = dlState.loadRate * 100;
  if (elapsedTime > 500) {
    this.percentage.style.opacity = 1;
    this.percentage.textContent = (dlState.loadRate < 10
      ? '0' + ~~(dlState.loadRate)
      : ~~(dlState.loadRate)) +'%';
    if (elapsedTime > 3000) {
      if (dlState.secondsLeft > 1) {
        this.details.style.opacity = 1;
        this.details.textContent = Math.round(dlState.secondsLeft) +' secondes';
      } else {
        this.details.style.opacity = 0;
      }
    }
  }
  this.bar.style.transform = 'translateY(-'+ dlState.loadRate +'%)';
  this.bar.style.background = 'hsl(0, 0%, '+ dlState.loadRate +'%)';
};

function generatePageLoader(page) {
  var _lastNow = Date.now(),
      _startLoad = _lastNow;

  page.isLoading = true;

  return ImageLoader(page.url).onprogress(function (event) {
    var now = Date.now(), loadRate;

    page.total = event.total;
    page.elapsedTime = now - _startLoad;
    page.lastByteRate.add((now - _lastNow) / (event.loaded - page.loaded));
    _lastNow = now;
    page.loaded = event.loaded;
    loadRate = event.loaded / event.total;
    page.estimatedEnd = now + ((((1 / loadRate - loadRate) * page.elapsedTime)
      + ((event.total - event.loaded) * page.lastByteRate.get())) / 2);
  })
  .then(function (objectURL) {
    page.HTMLElement.style.backgroundImage = 'url("'+ objectURL +'")';
    page.isLoading = false;
    page.isComplete = true;
    if (page.thenCallback instanceof Function) {
      page.thenCallback.call(page);
    }
  });
}

function Page(chapter, pageInfo) {
  this.index = pageInfo.index;
  this.url = chapter.path +'/'+ pageInfo.path;
  this.width = pageInfo.width;
  this.height = pageInfo.height;
  this.isWide = (pageInfo.width > pageInfo.height);
  this.chapter = chapter;
  this.isLoading = false;
  this.isComplete = false;
  this.initRequestData();
  this.progress = new Progress();
  this.HTMLElement = $new.div({
    id: "page-"+ this.index,
    className: "page",
    style: _style.page,
    onmousedown: $watchers.mouseDown,
    onclick: $state.handlePageClick
  }, this.progress.HTMLElement);
}

Page.prototype.initRequestData = function () {
  this.lastByteRate = new Average(8);
  this.loaded = 0;
  this.total = Infinity;
  this.elapsedTime = 0;
};

Page.prototype.downloadComplete = function () {
  return this.loaded === this.total;
};

Page.prototype.cancel = function () {
  var dlState = this.getDownloadState();
  if (this.isLoading && (dlState.secondsLeft > 2 || dlState.loadRate < 0.75)) {
    this.imageLoader.abort();
    this.initRequestData();
  }
  this.isLoading = false;
  return this;
};

Page.prototype.getDownloadState = function () {
  return {
    loadRate: this.loaded / this.total,
    secondsLeft: (this.loaded === 0) ? Infinity
      : Math.max(Math.round((this.estimatedEnd - Date.now()) / 1000), 0)
  };
};

Page.prototype.update = function () {
  if (this.progress !== null) {
    if (this.isLoading) {
      this.progress.update(this.getDownloadState(), this.elapsedTime);
    } else if (this.isComplete) {
      this.progress.remove();
      this.progress = null;
    }
  }
  return this;
};

Page.prototype.load = function (debuged) {
  if (!this.isLoading && !this.isComplete) {
    this.imageLoader = generatePageLoader(this, debuged);
  }
  return this;
};

// Function called after the document loading
Page.prototype.then = function (callback) {
  if (this.isComplete) {
    callback();
  } else {
    this.thenCallback = callback;
  }
  return this;
};

Page.prototype.detatch = function () {
  if (this.isAttached) {
    this.HTMLElement.remove();
    this.isAttached = false;
  }
  return this;
};

Page.prototype.attach = function () {
  if (!this.isAttached) {
    $add(this.HTMLElement, this.chapter.HTMLElement);
    this.isAttached = true;
  }
  return this; 
};

Page.prototype.isPair = function () {
  return ((this.index % 2 ? true : false) !== $config.invertPageOrder);
};

Page.prototype.refresh = function () {
  var style = this.HTMLElement.style,
      w = this.width,
      h = this.height,
      sW = $state.width,
      sH = $state.height;

  // strip
  switch ($config.readingMode) {
  case "strip":
    style.height = ($config.fit ? ~~(sW / w * h) : h) +'px';
    style.width = '100%';
    style.backgroundPosition = 'center';
  break;
  case "single":
    if ($config.fit) {
      style.height = sH +'px';
    } else {
      style.height = ~~((sW / w) * h) +'px';
    }
    style.width = '100%';
    style.backgroundPosition = 'center';
  break;
  case "double":
    if ($config.fit) {
      style.height = sH +'px';
    } else {
      style.height = ~~(((sW / 2) / w) * h) +'px';
    }
    if (this.isPair()) {
      style.float = 'right';
      style.backgroundPosition = 'left';
    } else {
      style.float = 'left';
      style.backgroundPosition = 'right';
    }
    style.width = '50%';
  break;
  default: break;
  }
};

Page.prototype.previous = function () {
  return this.chapter.getPage(this.index - 1);
};

Page.prototype.next = function () {
  return this.chapter.getPage(this.index + 1);
};

