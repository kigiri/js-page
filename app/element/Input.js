/* global $new, $state */

/* generic attributes :
 * disabled
 * readonly
 */

var _style = {
  label: {
    width: "50%",
    display: "inline-block",
    textAlign: "right",
    paddingRight: "0.8rem",
  }
};

function hasInput(type, testValue) {
  var input = $new.input({type: type});
  return (input.value !== testValue);
}

var generator = {
  email: function (i18n, data) {

  },
  text: function (i18n, data) {
  },
  textarea: function (i18n, data) {
    // cols, 
  },
  number: function (i18n, data) {
    var attrs = {
      style: data.style,
      type: 'number',
      value: data.value
    };

    if (data.min !== undefined) { attrs.min = data.min; }
    if (data.max !== undefined) { attrs.max = data.max; }

    return $new.input(attrs);
  },
  select: function (i18n, data) {
    return $new.select({
      style: data.style
    }, data.options.map(function (optsValue) {
      return $new.option(({
        value: optsValue,
        selected: data.value === optsValue
      }), i18n("_OPTS_"+ optsValue.toUpperCase()));
    }));
  },
  date: (hasInput('date', 'invalidDate')
  ? function (i18n, data) {

  }
  : function (i18n, data) {

  }),
  color: (hasInput('color', 'invalidColor')
  ? function (i18n, data) {
    return $new.input({
      type: 'color',
      style: data.style,
      value: data.value
    });
  }
  : function (i18n, data) {
    return $new.input({
      type: 'text',
      style: data.style,
      value: data.value || '#000000',
      pattern: /^#([A-F0-9]{6}|[A-F0-9]{3})$/i
    });
  }),
  checkbox: function (i18n, data) {
    return $new.input({
      type: 'checkbox',
      style: data.style,
      checked: !!data.value
    });
  },
  file: function (i18n, data) {

  },
  radio: function (i18n, data) {

  }
};

function Input(name, i18n, data) {
  var el;

  data = data || {};
  this.label = $new.label({ style: _style.label, htmlFor: name }, i18n("_NAME"));
  el = generator[data.type || "string"](i18n, data);
  el.name = name;
  el.id = name;
  el.title = i18n("_DESC");
  el.disabled = !!data.disabled;
  el.readonly = !!data.readonly;
  if (data.onchange instanceof Function) {
    console.log('adding', el.name);
    switch (data.type) {
      case 'textarea':
      case 'text':
      case 'number':
      case 'date':
      case 'email': watch(el, data.onchange); break;
      default: el.onchange = data.onchange.bind(el); break;
    }
  }
  this.HTMLElement = el;
}

var _len = 0, _watchedInputs = [];
function watch(HTMLInput, onchange) {
  var i = -1;
  while (++i < _len) {
    if (_watchedInputs[i].HTMLInput === HTMLInput) {
      return;
    }
  }
  _watchedInputs.push({
    HTMLInput: HTMLInput,
    value: HTMLInput.value,
    onchange: onchange
  });
  _len++;
}

function updateInputs() {
  var i = -1, inputInfo;
  while (++i < _len) {
    inputInfo = _watchedInputs[i];
    if (inputInfo.value !== inputInfo.HTMLInput.value) {
      console.log(inputInfo.value, '->', inputInfo.HTMLInput.value);
      inputInfo.value = inputInfo.HTMLInput.value;
      inputInfo.onchange.call(inputInfo.HTMLInput);
    }
  }
}

$state.addToUpdate(updateInputs);
