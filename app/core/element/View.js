/* global ScriptLoader, $new, $stories, $config, $ez, $state */

function View() {
  this.y = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "view",
    style: {
      overflowY: "hidden",
      width: "100%",
      height: "100%",
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
  function applyView() {
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
  };

  if (!__[view]) {
    ScriptLoader('/'+ view.toLowerCase() +'.js', true).then(applyView);
  } else {
    applyView();
  }
  return this;
};

View.prototype.fullscreen = function () {
  $ez.fullscreen(document.documentElement);
  return this;
};
