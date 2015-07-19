/* global JSONLoader, Ajax, $config, $ez */

var _store = {},
    err = console.error.bind(console),
    _keys = [];

function load(chapter, callback) {
  chapter.data = JSONLoader(chapter.path + "data.json").then(function (data) {
    chapter.data = data;
    if (typeof callback === "function") {
      callback(chapter);
    }
    this.resolve();
  }).catch(err);
  return chapter.data;
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
          path: basePath + lang +"/"+ team +"/"+ name +"/",
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
  chapters.forEach(function (chapter, index) {
    chapter.files.forEach(function (file) {
      file.index = index;
    });
  });
  return chapters;
}

var $stories = {
  init: function (store) {
    _keys = Object.keys(store);
    _keys.forEach(function (key) {
      store[key].path = key; // should be name instead of path I think
      store[key].chapters = generateChapterList(key,  store[key].files);
    });
    $stories.store = _store = store;
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
      // load(id);
    }
  },
  get: function (id, chapter, callback) {
    try {
      chapter = _store[id].chapters[chapter].files[0];
    } catch (err) { return; }

    if (chapter.data instanceof Ajax) {
      return chapter.data.then(callback);
    } else if (!chapter.data) {
      return load(chapter, callback);
    }
    return callback(chapter);
  }
};

$stories.init(__loadStories__);
