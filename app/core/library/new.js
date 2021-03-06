/* global $add */

function __generate_new__() {
  var
    elem = document.createElement(this.key),
    firstArgument = arguments[0],
    argc = arguments.length,
    i = 0;

  if (firstArgument && typeof firstArgument === "object") {
    Object.keys(firstArgument).forEach(function (key) {
      if (key === "style") {
        Object.keys(this[key]).forEach(function (styleKey) {
          elem.style[styleKey] = this[styleKey];
        }.bind(this.style));
      } else {
        elem[key] = this[key];
      }
    }, firstArgument);
  } else {
    $add(firstArgument, elem);
  }

  while (++i < argc) {
    $add(arguments[i], elem);
  }

  return elem;
}

function $new(key) {
  __generate_new__.bind({key: key || "div"});
}

[
  "b",
  "i",
  "s",
  "p",
  "h1",
  "div",
  "img",
  "span",
  "input",
  "label",
  "color",
  "legend",
  "option",
  "select",
  "fieldset",
  "datalist",
  "textarea",
  "form"
].forEach(function (key) { $new[key] = __generate_new__.bind({key: key}); });

