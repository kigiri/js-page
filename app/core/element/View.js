/* global Story, $new, $stories, $config, $url, $ez */

function View() {
  this.y = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "view",
    style: {
      overflowY: "scroll"
    }
  });
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

