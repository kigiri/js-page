/* global Form, $new, $config */
// https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input
var _style = {
  input: {
    borderRadius: "4px",
    border: "1px solid #D2D2D2",
    textAlign: "center",
    backgroundColor: "#EAEAEA",
  },
  form: {
    padding: "1.5rem",
    backgroundColor: "#8A8A8A",
    color: "#8A8A8A",
    borderRadius: "0.5rem",
    fontSize: "1.3rem",
    width: "43rem",
    margin: "15rem auto"
  },
  menu: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    transform: "translate(0, 0)",
    position: "absolute",
    display: "none",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0
  }
};

function applyToConfig() {
  $config.set(this.name, this.type === "checkbox" ? this.checked : this.value);
}

function Menu() {
  this.config = new Form({
    name: "config",
    style: _style.form
  }, {
    background: {
      type: "color",
      value: $config.background,
      style: _style.input,
      onchange: applyToConfig,
    },
    fit: {
      type: "checkbox",
      value: $config.fit,
      style: _style.input,
      onchange: applyToConfig,
    },
    invertPageOrder: {
      type: "checkbox",
      value: $config.invertPageOrder,
      style: _style.input,
      onchange: applyToConfig,
    },
    pageBuffer: {
      type: "number",
      value: $config.pageBuffer,
      min: 2,
      max: 40,
      style: _style.input,
      onchange: applyToConfig,
    },
    lang: {
      type: "select",
      value: $config.lang,
      options: [ "en", "fr"],
      style: _style.input,
      onchange: applyToConfig,
    },
    readingMode: {
      type: "select",
      value: $config.readingMode,
      options: [ "strip", "single", "double" ],
      style: _style.input,
      onchange: applyToConfig,
    }
  });
  this.HTMLElement = $new.div({
    id: "menu",
    style: _style.menu
  }, this.config.HTMLElement);
}

Menu.prototype.show = function () {
  this.HTMLElement.style.display = '';
};

Menu.prototype.hide = function () {
  this.HTMLElement.style.display = 'none';
};


Menu.prototype.update = function () {
};


