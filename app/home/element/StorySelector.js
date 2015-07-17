/* global StoryThumbnail, $new, $state, $stories, $ez */

var shortcuts = {
  33: function (event) { this.select("pgup")   },
  34: function (event) { this.select("pgdown") },
  35: function (event) { this.select("end")    },
  36: function (event) { this.select("home")   },
  37: function (event) { this.select("left")   },
  38: function (event) { this.select("up")     },
  39: function (event) { this.select("right")  },
  40: function (event) { this.select("down")   },
};

function StorySelector(details) {
  var content = $new.div({
    id: "story-selector",
    tabIndex: 0,
    className: "ui",
    onfocus: function () { content.style.opacity = 1; },
    onblur: function () { content.style.opacity = 0.8; },
    onkeydown: function (event) {
      var fn = shortcuts[event.which];
      if (fn) {
        fn.call(this, event);
        event.preventDefault();
      }
    }.bind(this),
    style: {
      margin: "3rem auto",
      outline: "none",
      opacity: 0.8,
    }
  });
  this.HTMLElement = content;

  this.update();

  this.thumbnailArray = [];

  $stories.each(function (storyData) {
    var thumbnail = new StoryThumbnail(storyData, details, this);
    this.HTMLElement.appendChild(thumbnail.HTMLElement);
    this.thumbnailArray.push(thumbnail);
  }.bind(this));

  this.select(0);
}

StorySelector.prototype.update = function () {
  this.lineLength = Math.max(~~(($state.width - 60) / 106), 1);
  this.HTMLElement.style.width = this.lineLength * 106 + 'px';

  return this;
};

StorySelector.prototype.getThumbnailIndex = function (thumbnail) {
  var i = -1;
  while (++i < this.thumbnailArray.length) {
    if (this.thumbnailArray[i] === thumbnail) { return i; }
  }
  return -1;
};

StorySelector.prototype.select = function (index) {
  var len = this.lineLength, idx = this.currentIndex;
  if (typeof index === "string") {
    switch (index) {
      case "up":     index = idx - len; break;
      case "down":   index = idx + len; break;
      case "left":   index = idx - 1; break;
      case "right":  index = idx + 1; break;
      case "pgup":   index = idx ; break;
      case "pgdown": index = idx ; break;
      case "end":    index = ~~(idx / len) * len + (len - 1); break;
      case "home":   index = ~~(idx / len) * len; break;
      default:       index = idx; break;
    }
  } else if (typeof index === "object") {
    index = this.getThumbnailIndex(index);
  }

  if (index < 0 || index >= this.thumbnailArray.length) { return this; }

  var newSelection = this.thumbnailArray[index];
  if (newSelection === this.previousSelection) { return this; }
  if (this.previousSelection) {
    this.previousSelection.unselect();
  }
  this.previousSelection = newSelection.select();
  this.currentIndex = index;
  return this;
};

// StorySelector.prototype.select = function (index) {};
// StorySelector.prototype.select = function (index) {};
// StorySelector.prototype.select = function (index) {};
