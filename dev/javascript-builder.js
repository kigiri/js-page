var
  fs = require('fs'),
  minify = require('uglify-js').minify,
  APP_DIR = require('path').dirname(require.main.filename),
  __ = { updateCallback: function () {} };

function formatArg(d) { return d ? "__."+ d : d; }
function formatName(d) {
  return ((d[0] === d[0].toUpperCase()) ?  d : '$'+ d);
}

var _id = 1,
  _dep = { "__": { id: 0, value: 'var __ = {};\n'} },
  uglifyConfig = {
    mangle: false,
    fromString: true
  };

function tryMinify(jsCode) {
  var ret;
  try {
    ret = minify(jsCode, uglifyConfig);
    return ret.code;
  } catch (err) {
    console.log( err.message +'\n'
      + err.filename.slice(APP_DIR.length) +':'+ err.line +':'+ err.col);
  }
}

function dependency(path, type, name, exportName) {
  var filename = APP_DIR + path +'/'+ name +'.js',
      exportName = exportName || formatName(name),
      id = Object.keys(_dep).length;

  function generate() {
    var jsCode = fs.readFileSync(filename, { encoding: "utf-8" }),
        globals = jsCode.match(/^\/\* global (.+) \*\//);

    globals = globals ? globals[1] : '';
    console.log(globals.split(', ').map(formatArg).join(', '));
    return '// #'+ id +' - '+ type +': '+ name +'\n'
      +'__.'+ exportName +' = (function ('+ globals +') { "use_strict"; '
      + tryMinify(jsCode) +' return '+ exportName +';})('
      + globals.split(', ').map(formatArg).join(', ') +');\n';
  }

  _dep[exportName] = {
    id: id,
    value: generate()
  };

  fs.watchFile(filename, function () {
    var newValue = generate();
    if (_dep[exportName].value !== newValue) {
      _dep[exportName].value = newValue;
      __.updateCallback();
    }
  });
}

["element", "module", "library", "class"].forEach(function (key) {
  this[key] = function (a, b) {
    return this('/app/'+ key, key, a, b);
  }.bind(this);
}.bind(dependency));

// Public Libraries
// dependency.import("q", "bluebird"); (https://cdn.jsdelivr.net/bluebird/latest/bluebird.min.js 72k)
// dependency.import("_", "lodash"); (https://raw.githubusercontent.com/lodash/lodash/3.9.0/lodash.min.js 50k)
// dependency.import("async"); (http://cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.min.js 12k)


// My Libraries
dependency.library("add");
dependency.library("new");
dependency.library("ez");

// Generic Classes
dependency.class("Average");
dependency.class("DownloadManager");

// Modules
dependency.module("config");
dependency.module("state");

// App Elements
dependency.element("Page");
dependency.element("Chapter");
dependency.element("Story");
dependency.element("View");
dependency.element("Input");
dependency.element("Form");
dependency.element("Menu");
dependency.element("App");

// Main
dependency('/app', 'init', "main");

module.exports = {
  setCallback: function (cb) {
    __.updateCallback = cb;
  },
  compile: function () {
    return Object.keys(_dep)
      .map(function (key) { return _dep[key]; })
      .sort(function (a, b) { return a.id - b.id; })
      .map(function (dep) { return dep.value; })
      .join('\n');
  }
};
