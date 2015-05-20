var
  fs = require('fs'),
  path = require('path'),
  minify = require('uglify-js').minify;
  APP_DIR = path.dirname(require.main.filename),
  __ = { updateCallback: function () {} };

function formatPassedArguments(d) { return "__."+d; }
function formatArgumentsName(d) {
  return ((d[0] === d[0].toUpperCase()) ?  d : '$'+ d);
}

var _id = 1,
  _dep = { "__": { id: 0, value: 'var __ = {};\n'} },
  uglifyConfig = {
    mangle: false
  };

function dependency(path, type, name, depArray, exportName) {
  if (_dep[name] !== undefined) { throw "dependency "+ name +" already exists" }
  var filename = APP_DIR + path +'/'+ name +'.js',
      depArray = Array.isArray(depArray) ? depArray : [],
      exportName = exportName || name,
      id = Object.keys(_dep).length;

  function generate() {
    return '// #'+ id +' - '+ type +': '+ name +'\n'
      +'__.'+ name +' = (function ('
      + depArray.map(formatArgumentsName).join(', ')
      +') { '+ minify(filename, uglifyConfig).code + ' return '+ exportName +';})('
      + depArray.map(formatPassedArguments).join(', ') +');\n';
  }

  _dep[name] = {
    id: id,
    value: generate()
  };

  fs.watchFile(filename, function () {
    var newValue = generate();
    if (_dep[name].value !== newValue) {
      _dep[name].value = newValue;
      __.updateCallback();
    }
  });
}

dependency.import = function (a, b) {
  return this("/app/import", "import", a, [], b)
}.bind(dependency);

["element", "module", "library", "class"].forEach(function (key) {
  this[key] = function (a, b, c) {
    return this('/app/'+ key, key, a, b, c);
  }.bind(this);
}.bind(dependency));

// Public Libraries
// dependency.import("q", "bluebird"); (https://cdn.jsdelivr.net/bluebird/latest/bluebird.min.js 72k)
// dependency.import("_", "lodash"); (https://raw.githubusercontent.com/lodash/lodash/3.9.0/lodash.min.js 50k)
// dependency.import("async"); (http://cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.min.js 12k)


// My Libraries
dependency.library("add");
dependency.library("new", ["add"], "$new");
dependency.library("ez");

// Generic Classes
dependency.class("Average");
dependency.class("DownloadManager");

// Modules
dependency.module("state", ["Average", "DownloadManager",]);

// App Elements
dependency.element("Page", ["Average", "state", "add", "new"]);
dependency.element("Chapter", ["Page", "new"]);
dependency.element("Story", ["Chapter"])
dependency.element("View", ["Story", "new"]);
dependency.element("App", ["View", "add", "new"]);

// Main
dependency('/app', 'init', "main", ["Chapter", "add", "state"]);

module.exports = {
  setCallback: function (cb) {
    __.updateCallback = cb;
    console.log("call back set !", cb.toString());
  },
  compile: function () {
    return Object.keys(_dep)
      .map(function (key) { return _dep[key]; })
      .sort(function (a, b) { return a.id - b.id; })
      .map(function (dep) { return dep.value; })
      .join('\n');
  }
};
