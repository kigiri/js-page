/* global ChapterSelector, $new, $ez, $state */

var _style = {
  img: {
    width: "20rem",
    height: "30rem",
    margin: "0 auto",
    backgroundColor: "grey"
  },
  info: {
  },
  title: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "3.5rem",
    textAlign: "center",
    color: "#BCBCBC",
    fontVariant: "small-caps",
    position: "absolute",
    width: "100%",
    bottom: "-3.4rem",
    right: 0,
    textShadow: "-0.3rem -0.3rem #464646"
  },
  description: {

  },
  content: {
    backgroundColor: "#464646",
    padding: "1rem",
    outline: "none",
    opacity: 1,
    maxHeight: "100%",
    borderBottom: "0.8rem solid #BCBCBC",
    color: "white",
    boxShadow: "0 0 0 0.1rem #A8A8A8",
    height: "33rem",
    position: "relative"
  },
  chapterContainer: {
    maxHeight: "35rem",
    overflow: "auto"
  },
  chapter: {
  },
};


function StoryDetails() {
  this.selector = new ChapterSelector();

  this.img = $new.div({
    style: _style.img,
    onclick: function () {
      $state.View.fullscreen();
      $state.View.load("Story", function (Story) {
        Story.load(this.data).loadChapter(this.selector.index, 0);
      }.bind(this));
    }.bind(this)
  });

  this.title = $new.h1({ style: _style.title });

  this.description = {
    content: $new.p({ style: _style.description }),
    placeholder: $new.p("NO_DESCRIPTION")
  };

  this.chapters = $new.div({
    style: _style.chapterContainer
  });

  this.HTMLElement = $new.div({
    id: "story-details",
    tabIndex: 0,
    style: _style.content,
  }, this.img, $new.div({
    style: _style.info
  }/*, this.description.placeholder, this.description.content*/),
    this.title, this.chapters);
}

StoryDetails.prototype.load = function (data) {
  this.data = data;
  if (data.description) {
    this.description.content.textContent = data.description;
    this.description.placeholder.style.display = 'none';
    this.description.content.style.display = '';
  } else {
    this.description.placeholder.style.display = '';
    this.description.content.style.display = 'none';
  }

  this.title.textContent = data.title || data.path;

  this.selector.load(data.chapters);
  return this;
};


StoryDetails.prototype.update = function () {
  return this;
};

