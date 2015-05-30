var
  fs = require('fs'),
  minify = require('uglify-js').minify,
  path = require('path'),
  APP_DIR = path.dirname(require.main.filename) +"/app";

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

function maxify(jsCode) {
  return jsCode; //.split('\n').map((l, i) => '/* '+ i +' */'+ l).join('\n');
}

function tryMinify(jsCode) {
  var ret;
  try {
    return maxify(jsCode);
    ret = minify(jsCode, uglifyConfig);
    return ret.code;
  } catch (err) {
    console.error( err.message +'\n'
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

function dependency(path) {
  var name = formatName(path),
      fileInfo = parseFile(path);

  function generate(fileInfo) {
    if (fileInfo.code.indexOf("/* skip */") !== -1) { return '';  }
    var g = fileInfo.globals ? fileInfo.globals : [];
    return '// '+ path.slice(APP_DIR.length + 1, -3).replace('/', ' - ') +'\n'
      +'__.'+ name +' = (function ('+ g.join(', ') +') {'
      +' "use_strict"; '+ tryMinify(fileInfo.code) +' return '+ name
      +'})('+ g.map(formatArg).join(', ') +');\n';
  }

  _dep[name] = {
    name: name,
    path: path.slice(APP_DIR.length, -3),
    score: 0,
    globals: fileInfo.globals,
    code: generate(fileInfo)
  };

  fs.watchFile(path, function () {
    var fileInfo = parseFile(path);
    _dep[name].globals = fileInfo.globals;
    _dep[name].code = generate(fileInfo);
    updateCallback();
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

watchFolder(APP_DIR);

function getIndex(name, nameArray, start) {
  var i = start;
  if (!nameArray) { return i; }
  while (++i < nameArray.length) {
    if (name === nameArray[i].name) {
      return i;
    }
  }
  return -1;
}

function solveDependencies(dep) {
  var i = -1, d, ins = -1, g;

  while (++i < dep.length) {
    d = dep[i];
    if (!d.globals) { continue; }
    d.globals.forEach(g => ins = Math.max(getIndex(g, dep, i), ins));
    if (ins !== -1) {
      g = dep[ins].globals;
      if (g !== null && g.indexOf(d.name) !== -1) {
        console.warn("Unresolved cycle dependency for",
          d.name, "and", dep[ins].name);
        ins = -1;
      } else {
        dep.splice(i, 1);
        dep.splice(ins, 0, d);
        i = ins = -1;
      }
    }
  }
  return dep;
}

module.exports = {
  setCallback: cb => {
    updateCallback = cb;
  },
  compile: () => {
    var tmp = Object.keys(_dep).map(key => _dep[key]).filter(d => !!d.code);
    return 'var __ = {};\n'+ solveDependencies(tmp).map(d => d.code).join('\n');
  }
};
