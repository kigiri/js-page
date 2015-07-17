/* global $new, $state, $loop */

var _style = {
  main: {
    width: "10rem",
    height: "15rem",
    // borderRadius: ".3rem",
    margin: ".0rem .3rem .3rem .3rem",
    background: "#bada55",
    display: "inline-block",
  },
  border: {
    border: ".2rem solid",
    borderColor:  "transparent",
    height: "100%",
    // borderRadius: ".3rem",
  }
};
var idGen = 0;
function StoryThumbnail(storyData, storyDetails, storySelector) {
  this.border = $new.div({ id: "jeanmi-"+ idGen++, style: _style.border});
  this.data = storyData;
  this.selector = storySelector;
  this.storyDetails = storyDetails;
  this.HTMLElement = $new.div({
    id: storyData.path,
    style: _style.main,
    className: "thumbnail",
    onmousedown: function (event) {
      if ((event.which && event.which === 1) || event.button === 1) {
        this.clicked = true;
        this.mark();
        $loop.leftClickUp.sub(function () {
          this.clicked = false;
          this.unmark();
        }.bind(this));
      }
    }.bind(this),
    onmouseout: function () {
      if (this.clicked) {
        this.unmark();
      }
    }.bind(this),
    onmouseover: function () {
      if (this.clicked) {
        this.mark();
      }
    }.bind(this),
    onclick: function () {
      storySelector.select(this);
    }.bind(this)
  }, this.border);
}

StoryThumbnail.prototype.unmark = function () {
  if (this.isSelected) {
    this.HTMLElement.style.boxShadow = "rgba(0, 0, 0, 0.5) 0 0 0 .2rem";
  } else if (this.clicked) {
    this.HTMLElement.style.boxShadow = "rgba(0, 0, 0, 0.2) 0 0 0 .2rem";
  } else {
    this.HTMLElement.style.boxShadow = "transparent 0 0 0 .2rem";
  }
};

StoryThumbnail.prototype.mark = function () {
  if (this.isSelected) {
    this.HTMLElement.style.boxShadow = "rgba(0, 0, 0, 0.8) 0 0 0 .2rem";
  } else {
    this.HTMLElement.style.boxShadow = "rgba(0, 0, 0, 0.3) 0 0 0 .2rem";
  }
};

StoryThumbnail.prototype.unselect = function () {
  this.HTMLElement.style.boxShadow = "";
  this.border.style.borderColor = "transparent";
  this.isSelected = false;
  return this;
};

var _previousSelection = null;
StoryThumbnail.prototype.select = function (dir) {

  if (_previousSelection === this) { return this; }
  this.HTMLElement.style.boxShadow = "rgba(0, 0, 0, 0.5) 0 0 0 .2rem";
  this.border.style.borderColor = "rgba(255, 255, 255, 0.5)";
  if (_previousSelection) {
    _previousSelection.unselect();
  }

  this.storyDetails.load(this.data);
  _previousSelection = this;
  this.isSelected = true;
  return this;
};

