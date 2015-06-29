/* global JSONLoader, Ajax, $config, $ez */

var _store = {},
    err = console.error.bind(console),
    _keys = [];

function load(story, chapter, callback) {
  var p = JSONLoader("/assets/"+ story +"/"+ chapter +"/data.json")
  .then(function (data) {
    _store[id] = data;
    if (typeof callback === "function") {
      callback(data);
    }
    this.resolve();
  }).catch(err);
  _store[id] = p;
  return p;
}

function getChapter(chapters, name) {
  var i = -1;
  while (++i < chapters.length) {
    if (chapters[i].name === name) { return i; }
  }
  return -1;
}
function generateChapterList(story, files) {
  var chapters = [],
      basePath = "/assets/"+ story +"/";

  Object.keys(files).forEach(function (lang) {
    Object.keys(files[lang]).forEach(function (team) {
      files[lang][team].forEach(function (name) {
        var originalName = name;
        var chapter = {
          path: basePath + lang +"/"+ team +"/"+ name +"/data.json",
          team: team,
          lang: lang
        };

        if (/v\.?\d/i.test(name)) {
          name = name.split(/(^.*)(v\.?\d)/i)[1];
        }

        var baseName = name.split(/(^\d+)/)[1];
        if (baseName) {
          name = $ez.repeat('0', 4 - baseName.length) + name;
        }

        var index = getChapter(chapters, name);
        if (index === -1) {
          chapters.push({
            name: name,
            originalName: originalName,
            files: [ chapter ]
          });
        } else {
          chapters[index].files.push(chapter);
        }
      });
    });
  });
  chapters.sort($ez.byName);
  return chapters;
}

var $stories = {
  init: function (store) {
    _keys = Object.keys(store);
    _keys.forEach(function (key) {
      store[key].path = key; // should be name instead of path I think
      store[key].chapters = generateChapterList(key,  store[key].files);
    });
    _store = store;
  },

  load: function (id, index) {
    var p = JSONLoader("/assets/"+ id +"/data.json").then(function (data) {});

  },

  each: function (fn) {
    var i = -1;
    while (++i < _keys.length) {
      var key = _keys[i];
      fn(_store[key], key, _store);
    }
  },

  set: function (data) {
    if (_store[data.path] instanceof Ajax) {
      _store[data.path].abort().resolve(data);
    }
    _store[data.path] = data;
  },
  prepare: function (id) {
    if (!_store[id]) {
      load(id);
    }
  },
  get: function (story, chapter, callback) {
    if (_store[id] instanceof Ajax) {
      _store[id].then(callback);
    } else if (!_store[id]) {
      return load(id, callback);
    }
    return callback(_store[id]);
  }
};

$stories.init(__loadStories__);
console.log(__loadStories__);




