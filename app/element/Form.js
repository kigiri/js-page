/* global Input, $i18n, $new */

var _style = {
  padding: "0.4rem",
  border: "1px solid #DDD",
  borderBottom: "1px solid #DADADA",
  borderTop: "1px solid white",
  backgroundColor: "#F3F3F3"
};

function Form(attrs, inputs) {
  var i18nBase = "FORM_"+ attrs.name.toUpperCase();

  this.inputs = {};
  var formContent = Object.keys(inputs).map(function (key) {
    var input = new Input(key, $i18n.build(i18nBase +"_"+ key.toUpperCase()), inputs[key]);
    this.inputs[key] = input;
    return $new.div({style: _style}, input.label, input.HTMLElement);
  }.bind(this));
  this.HTMLElement = $new.form(attrs, formContent);
}

