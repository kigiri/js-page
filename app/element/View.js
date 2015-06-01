/* global Story, $new, $stories, $config, $url */

function View() {
  this.y = 0;
  this.x = 0;
  this.HTMLElement = $new.div({
    id: "view",
    style: {
      transform: "translate(0, 0)",
      position: "absolute",
      transitionProperty: 'none',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      top: 0,
      bottom: 0,
      right: "-16px", // hide the scroll bar ? should find a better way to calc the value
      left: 0,
      overflow: "auto"
    }
  });
}

View.prototype.release = function (xMod, yMod) {
  this.HTMLElement.style.transitionProperty = 'transform';
  this.y = 0;
  this.x = 0;
  this.HTMLElement.style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};

View.prototype.drag = function (xMod, yMod) {
  this.y -= yMod;
  this.x -= xMod;
  var style = this.HTMLElement.style;
  style.transitionProperty = 'none';
  style.transform = "translate("+ this.x +"px,"+ this.y +"px)";
};

View.prototype.load = function (type, content) {
  this.type = type;
  $url.setView("story", content.id);
  if (this.content && this.content.HTMLElement) {
    this.content.HTMLElement.remove();
  }
  this.content = content;
  this.HTMLElement.appendChild(this.content.HTMLElement);
};

