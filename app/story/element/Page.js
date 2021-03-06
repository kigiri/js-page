/* global Average, ImageLoader, $new, $state, $config, $add, $format, $loop, $watchers, $drag, $ez */

var _style = {
  filler: {
    position: "relative",
    overflow: "hidden",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100%"
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
    transitionDuration: '100ms',
    transitionTimingFunction: 'cubic-bezier(0.75, 0, 0.5, 0.5)'
  },

  bar: {
    height: "100%",
    margin: "auto",
    background: "hsl(0, 0%, 30%)",
    outline: "0.2rem solid rgba(255, 255, 255, 0.2)",
    outlineOffset: "-0.1rem",
    transform: "translateY(0%)",
    transitionProperty: 'transform',
    transitionDuration: '2s',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0, 1)'
  },
};

function Progress() {
  this.isAttached = false;
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
  this.bar.style.background = 'hsl(0, 0%, '+ Math.max(dlState.loadRate, 30) +'%)';
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
    if (typeof page.thenCallback === "function") {
      page.thenCallback.call(page);
    }
  });
}

// You have to manualy define the page id AND index !
// it's done by calling generate ID and filler method from the chapter
function Page(chapter, pageInfo) {
  this.chapter = chapter;
  this.isLoading = false;
  this.width = pageInfo.width;
  this.height = pageInfo.height;
  this.isWide = (pageInfo.width > pageInfo.height);
  this.HTMLElement = $new.div({
    className: "page",
    style: $format.getStyle.call(this),
    onmousedown: mouseDown.bind(this),
  });
  this.HTMLElement.instance = this;
  if (pageInfo.name === "filler") {
    this.url = 'filler';
    this.isWide = false;
    this.isComplete = true;
    this.progress = null;
    this.HTMLElement.style.backgroundImage = $ez.fill(pageInfo.width, pageInfo.height);
    this.isFiller = true;
  } else {
    this.url = chapter.path + pageInfo.name;
    this.isComplete = false;
    this.initRequestData();
    this.progress = new Progress();
  }
}

Page.prototype.initRequestData = function () {
  this.lastByteRate = new Average(8);
  this.loaded = 0;
  this.total = Infinity;
  this.elapsedTime = 0;
  return this;
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

Page.prototype.updateDownloadBar = function () {
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

Page.prototype.remove = function () {
  this.chapter.removePage(this.detatch());
  return this;
};

Page.prototype.insert = function () {
  var newFiller = new Page(this.chapter, {
    name: "filler",
    height: this.height,
    width: ~~(this.width / (this.isWide + 1))
  });
  this.chapter.pageArray.splice(this.index, 0, newFiller);
  this.chapter.refreshPageList();  
  return this;
};

Page.prototype.resize = function () {
  $format.resize.call(this);
  return this;
};

Page.prototype.showProgressBar = function () {
  if (!this.isComplete && !this.progress.isAttached) {
    this.HTMLElement.appendChild(this.progress.HTMLElement);
    this.progress.isAttached = true;
  }
  return this;
};

Page.prototype.reload = function () {
  return this.update();
};

Page.prototype.setIndex = function (index, id) {
  this.index = index;
  this.id = id;
  this.HTMLElement.id = this.chapter.id + "-page-"+ index;
  return this;
};

Page.prototype.update = function () {
  return this.resize().updateDownloadBar();
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
    $state.pagesToCleanup.push(this);
    this.isAttached = false;
    if (this.resizeTask) {
      $loop.resize.unsub(this.resizeTask);
    }
  }
  return this;
};

Page.prototype.attach = function () {
  if (!this.isAttached) {
    this.update();
    this.chapter.HTMLElement.appendChild(this.HTMLElement);
    this.chapter.attach();
    this.isAttached = true;

    if ($config.readingMode === "strip") {
      if (!this.resizeTask) {
        var resize = this.resize.bind(this);
        this.resizeTask = function () { resize(); };
      }

      $loop.resize.sub(this.resizeTask);
    } else {
      this.showProgressBar();
    }

    $loop.newPage.request(2);
  }

  return this; 
};

Page.prototype.isPair = function () {
  return this.isWide || (this.id % 2);
};

Page.prototype.previous = function (callback) {
  return this.chapter.getPage(this.index - 1, callback);
};

Page.prototype.next = function (callback) {
  return this.chapter.getPage(this.index + 1, callback);
};

Page.prototype.scrollTo = function () {
  this.HTMLElement.scrollIntoView();
  return this;
};

Page.prototype.release = function () {
  if (!this.start) { return this; }
  if (Math.abs($ez.dist(this.start, $state)) < 20) {
    $format.click.call(this, $state);
  }
  return this;
};


// Handle user actions
function mouseDown(event) {
  this.start = null;
  if (event.altKey) {
    if (event.which === 1) {
      console.log("adding a page after", this.HTMLElement.id);
      this.insert();
    } else {
      console.log("deleting page", this.HTMLElement.id);
      this.remove();
    }
    return false;
  }
  if (!$state.isActive) {
    $state.isActive = true;
    return false;
  }
  if ($state.inContextMenu) {
    $state.inContextMenu = false;
    return false;
  }

  if (event.which !== 1) { return; }
  $state.x = event.clientX;
  $state.y = event.clientY;
  this.start = { x: $state.x, y: $state.y };
  $drag.start(this);
  return false;
};

$loop.newPage.sub(function () {
  var i = -1;
  while (++i < $state.pagesToCleanup.length) {
    if (!$state.pagesToCleanup[i].isAttached) {
      $state.pagesToCleanup[i].HTMLElement.remove();
    }
  }
  $state.pagesToCleanup.length = 0;
});
