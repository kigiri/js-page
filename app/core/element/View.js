/* global Story, $new, $stories, $config, $url, $ez, $state */

function View() {
  this.y = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "view",
    style: {
      overflowY: "scroll",
      width: "100%",
      height: "100%"
    }
  });
  this.HTMLElement.setAttribute('allowFullScreen', '');
  $state.View = this;
}

View.prototype.load = function (type, content) {
  this.type = type;
  $url.setView(type, content.id);
  if (this.content) {
    this.content.unload();
  }
  this.content = content;
  this.HTMLElement.appendChild(this.content.HTMLElement);
};

View.prototype.fullscreen = function () {
  $ez.fullscreen(this.HTMLElement);
  return this;
};
