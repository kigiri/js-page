/* global Modal, $state, $new, $ez */

var _style = {
  img: {

  },
  title: {

  },
  description: {

  },
  content: {
    backgroundColor: "#E5E5E5",
    borderRadius: "10px",
    padding: "10px",
    boxShadow: "#3D3D3D 0 0 30px 30px",
    border: "1px solid white",
  },
  chapterContainer: {

  },
  chapter: {
  },
};

function ChapterLink(chapter) {
  this.HTMLElement = $new.div({
    style: _style.chapter,
    onclick: function () {
      console.log(chapter.files[0].path);
    }
  });
  this.HTMLElement.Element = this;
  this.load(chapter);
}

ChapterLink.prototype.load = function (chapter) {
  $ez.copy(chapter, this);
  this.HTMLElement.textContent = chapter.originalName;
};

function StoryModal() {
  this.modal = $state.modal;
  this.img = $new.img({ style: _style.img });
  this.title = $new.h1({ style: _style.title });
  this.description = {
    content: $new.p({ style: _style.description }),
    placeholder: $new.p("STORY_MODAL_NO_DESCRIPTION")
  }
  this.chapters = $new.div({ style: _style.chapterContainer });
  this.HTMLElement = $new.div({
    id: "story-modal-content",
    style: _style.content,
  }, this.img, this.title, this.description.placeholder, this.description.content, this.chapters);
}

// Somewhat inheritance :)
Object.keys(Modal.prototype).forEach(function (key) {
  StoryModal.prototype[key] = function () {
    this.modal[key]();
    return this;
  };
});

StoryModal.prototype.load = function (data) {
  if (data.description) {
    this.description.content.textContent = data.description;
    this.description.placeholder.style.display = 'none';
    this.description.content.style.display = '';
  } else {
    this.description.placeholder.style.display = '';
    this.description.content.style.display = 'none';
  }

  this.title.textContent = data.title || data.path;

  var
    i = -1, chapter, el,
    childArray = this.chapters.childNodes || [],
    max = Math.max(childArray.length, data.chapters.length);

  while (++i < max) {
    chapter = data.chapters[i];
    el = childArray[i];

    if (!chapter) {
      el.style.display = 'none';
    } else if (!el) {
      this.chapters.appendChild((new ChapterLink(chapter)).HTMLElement);
    } else {
      el.style.display = '';
      el.Element.load(chapter);
    }
  }

  this.modal.load(this.HTMLElement);
  return this.show();
};
