/* global Menu, Chapter, $state, $new, $url, $config, $add, $format, $loop, $ez */
var _keyToCopy = [
  "title",
  "path",
  "type",
  "ongoing",
  "readingTo",
  "description",
  "genre",
  "year",
  "rating",
  "tags"
];

function Story() {
  $state.Story = this;
  this.HTMLElement = $new.div({
    id: "story",
    style: {
      transform: "translate(0, 0)",
      transitionProperty: 'none',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      overflow: "hidden"
    }
  }, this.Menu.HTMLElement);
  initWatchers(this);
}

Story.prototype.load = function (storyInfo) {
  this.id = storyInfo.path;
  $ez.copyKeys(_keyToCopy, storyInfo, this);

  $config.loadStory(this);
  $config.updateReadingMode($state);

  this.teamsData = storyInfo.teams;
  this.availableTeams = Object.keys(this.teamsData);
  this.team = this.availableTeams[0];
  this.Menu = $state.Menu = new Menu();
  this.chapterCache = [];
  this.lastChapterIndex = this.teamsData[this.team].chapters.length - 1;
};

Story.prototype.setTeam = function (team) {
  if (this.availableTeams.indexOf(team) === -1) {
    this.team = this.team || this.availableTeams[0];
  } else if (this.team !== team) {
    this.team = team;
    this.chapterArray = [];
    $url.setView("story", this.id).set({team: team});
    // should change selected chapter page
  }
  return this;
};

var _separator = $new.div({
  id: "separator",
  style: {
    clear: "both",
    height: "0px",
    width: "100%"
  }
});

Story.prototype.getChapter = function (i) {
  var c;
  if (i < 0 || i > this.lastChapterIndex) { return null; }
  if (!this.chapterCache[i]) {
    c = new Chapter(this, this.teamsData[this.team].chapters[i]);
    $add(c.HTMLElement, this.HTMLElement);
    $add(_separator, this.HTMLElement);
    this.chapterCache[i] = c;
  }
  return this.chapterCache[i];
};

Story.prototype.setChapter = function (chapterIndex) {
  this.chapter = this.getChapter(chapterIndex);
  $add(this.chapter.HTMLElement, this.HTMLElement);
  $add(_separator, this.HTMLElement);
  return this;
};

Story.prototype.release = function (xMod, yMod) {
  this.HTMLElement.style.transitionProperty = 'transform';
  this.y = 0;
  this.x = 0;
  this.HTMLElement.style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};

Story.prototype.drag = function (xMod, yMod) {
  this.y -= yMod;
  this.x -= xMod;
  this.HTMLElement.style.transitionProperty = 'none';
  this.HTMLElement.style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};


function wheelWatcher(event) {
  if (event.ctrlKey) { return; }
  if (event.deltaY > 0) {
    $format.previous();
  } else {
    $format.next();
  }
}

var _keyHandlers = {
  39: function () { $format.previous(); },
  37: function () { $format.next(); },
  27: function () {
    $state.inContextMenu = false;
  },
  13: function (e) {
    if (e.altKey) {
      $state.View.fullscreen();
    }
  }
};

function handleRelease() { }
function loop() {
  $state.eachVisiblePages("updateDownloadBar");
}
function handleResize() {
  var oldRm = $config.readingMode, newRm;
  $config.updateReadingMode($state);
  newRm = $config.readingMode;
  if (oldRm !== newRm) {
    if (newRm === "double") {
      $format.load($state.page);
    } else if (newRm === "single") {
      if ($state.page.url === "filler") {
        if ($state.page.isPair()) {
          $format.load($state.page.previous());
        } else {
          $format.load($state.page.next());
        }
      } else {
        $format.load($state.page);
      }
    }
  }
  $state.eachVisiblePages("update");
}

function initWatchers(story) {
  window.onkeydown = function (event) {
    var handler = _keyHandlers[event.keyCode];
    if (handler) {
      handler(event);
    } else {
      console.log(event.keyCode);
    }
  };

  window.addEventListener("wheel", wheelWatcher);

  handleRelease = function () {
    story.release();
  };
  $loop.stopDrag.sub(handleRelease);
  $loop.resize.sub(handleResize);
  $loop.loop.sub(loop);
}

Story.prototype.unload = function () {
  window.removeEventListener("wheel", wheelWatcher);
  this.HTMLElement.remove();
  $state.page = null;
  $state.pagesInView.length = 0;
  $state.pagesToCleanup.length = 0;
  $loop.stopDrag.unsub(handleRelease);
  $loop.resize.unsub(handleResize);
  $loop.loop.unsub(loop);
};
