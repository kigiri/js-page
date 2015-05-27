var
  fs = require('fs'),
  minify = require('uglify-js').minify,
  path = require('path'),
  APP_DIR = path.dirname(require.main.filename);

function updateCallback() {}

function formatArg(d) { return d ? "__."+ d : d; }
function formatName(d) {
  d = path.basename(d).slice(0, -3);
  return ((d[0] === d[0].toUpperCase()) ?  d : '$'+ d);
}

var _id = 0,
  _dep = { },
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

function parseFile(path) {
  var jsCode = fs.readFileSync(path, { encoding: "utf-8" }),
      globals = jsCode.match(/^\/\* global (.+) \*\//);

  return {
    globals: globals ? globals[1].split(', ') : null,
    code: jsCode
  };
}

function updateInfo(dep, fileInfo) {
  dep.code = fileInfo.code;
  dep.globals = fileInfo.globals;
  updateCallback();
}

function dependency(path) {
  var name = formatName(path),
      fileInfo = parseFile(path);

  function generate(fileInfo) {
    if (fileInfo.code.indexOf("/* skip */") !== -1) {
      return '';
    }
    var g = fileInfo.globals ? fileInfo.globals : [];
    return '// '+ path.slice(APP_DIR.length) +'\n'
      +'__.'+ name +' = (function ('+ g.join(', ') +') {'
      +' "use_strict"; '+ tryMinify(fileInfo.code) +' return '+ name
      +'})('+ g.map(formatArg).join(', ') +');\n';
  }

  _dep[name] = {
    name: name,
    path: path.slice(APP_DIR.length, -3),
    globals: fileInfo.globals,
    code: generate(fileInfo)
  };

  fs.watchFile(path, function () {
    var fileInfo = generate(parseFile(path)),
        needChange = false,
        dep = _dep[name], i;

    if (dep.code !== fileInfo.code) {
      return updateInfo(dep, fileInfo);
    }
    if (fileInfo.globals.length !== dep.globals.length) {
      return updateInfo(dep, fileInfo);
    }
    i = -1;
    while (++i < fileInfo.globals.length) {
      if (dep.globals.indexOf(fileInfo.globals[i]) === -1) {
        return updateInfo(dep, fileInfo);
      }
    }
  });
}

function watchFolder(dirname) {
  fs.readdirSync(dirname).forEach(function (file) {
    var filename = dirname +'/'+ file;
    if (fs.statSync(filename).isDirectory()) {
      watchFolder(filename);
    } else if (/\.js$/.test(file)) {
      dependency(filename);
    }
  });
}

watchFolder(APP_DIR +'/app');

function setScore(keys) {
  var i = -1, totalScore = 0, dep;
  while (++i < keys.length) {
    dep = _dep[keys[i]];
    if (!dep.globals || !dep.globals.length) {
      dep.score = 1;
    } else {
      dep.score = setScore(dep.globals);
    }
    totalScore += dep.score;
  }
  return totalScore;
}

module.exports = {
  setCallback: function (cb) {
    updateCallback = cb;
  },
  compile: function () {
    var keys = Object.keys(_dep);
    setScore(keys);
    return 'var __ = {};\n'
    + keys.map(function (key) { return _dep[key]; })
      .sort(function (a, b) {
        if (a.score === b.score) {
          if (a.path === b.path) {
            if (a.name === b.name) {
              return 0;
            }
            if (a.name < b.name) { return -1; }
            return 1;
          }
          if (a.path < b.path) { return -1; }
          return 1;
        }
        if (a.score < b.score) { return -1; }
        return 1;
      })
      .map(function (dep) { return dep.code; })
      .filter(function (code) { return !!code; })
      .join('\n');
  }
};
