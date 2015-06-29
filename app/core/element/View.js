/* global ScriptLoader, $new, $stories, $config, $url, $ez, $state */

function View() {
  this.y = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "view",
    style: {
      overflowY: "auto",
      width: "100%",
      height: "100%"
    }
  });
  this.HTMLElement.setAttribute('allowFullScreen', '');
  $state.View = this;
}

View.instances = {};

View.prototype.set = function (type, content) {
  this.type = type = type.toLowerCase();
  if (this.content) {
    this.content.unload();
  }
  this.content = content;
  this.HTMLElement.appendChild(this.content.HTMLElement);
};

View.prototype.load = function (view, callback) {
  console.log("loading", view);
  if (!__[view]) {
    return ScriptLoader('/'+ view.toLowerCase() +'.js', true).then(function () {
      if (!View.instances[view]) {
        try {
          View.instances[view] = new __[view]();
        } catch (e) {
          console.error(e);
        }
      }

      $state.View.set(view, View.instances[view]);
      if (typeof callback === 'function') {
        callback(View.instances[view]);
      }
    });
  }
  callback(__[view].instance);
  return null;
};

View.prototype.fullscreen = function () {
  $ez.fullscreen(this.HTMLElement);
  return this;
};

function loadStory(opts) {
  var q = $state.View.load("Story", function (story) {
    $state.storyId = opts.name;
    $stories.get(opts.name, function (storyData) {
      story.load(instance);
      $state.View.set("story", story);
      // story.setTeam(opts.team).getChapter(opts.chapter).setPage(opts.page);
    });
  });

  if (q) {
    $stories.prepare(opts.id);
  }
}
