/* global $new, $state, $ez */

function Modal() {
  this.HTMLElement = $new.div({
    id: "modal",
    style: {
      background: "hsla(0, 0%, 25%, 0.9)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: "100%",
      width: "100%",
      padding: "3rem",
      display: "none"
    },
    onclick: function (event) {
      if (event.target === this.HTMLElement) {
        this.hide();
      }
    }.bind(this)
  });
  this.visible = false;
  $state.modal = this;
  document.body.appendChild(this.HTMLElement);
}

Modal.prototype.load = function (HTMLElement) {
  if (HTMLElement === this.firstChild) { return this; }
  $ez.dropChildrens(this.HTMLElement).appendChild(HTMLElement);
  return this;
};

Modal.prototype.show = function () {
  this.visible = true;
  this.HTMLElement.style.display = "initial";
  this.HTMLElement.focus();
  return this;
};

Modal.prototype.hide = function () {
  this.visible = false;
  this.HTMLElement.style.display = "none";
  return this;
};

Modal.prototype.toggle = function () {
  return this.visible ? this.hide() : this.show();
};

// new Modal(); // save modal in state
