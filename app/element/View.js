/* global Story, $new, $stories */

function View() {
  this.load("story", "all-you-need-is-kill");
  this.HTMLElement = $new.div({
    id: "view",
    style: {}
  });
}

View.prototype.load = function(type, param) {
  switch (type) {
    case "story": $stories.get(param, function (data) {
      this.updateWith(new Story(data));
    })
  }
};

View.prototype.updateWith = function(content) {
  if (this.loadedContent && this.loadedContent.HTMLElement) {
    this.loadedContent.HTMLElement.remove();
  }
  this.loadedContent = content;
  this.HTMLElement.appendChild(this.loadedContent.HTMLElement);
};

