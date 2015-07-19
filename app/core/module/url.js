/* global $state, $stories */

var _url = {};

function parseHash() {
  var
    hashPart = window.location.hash.slice(2).split("?"),
    args = {
      story: hashPart[0],
      hash: "/"+ window.location.hash
    };

  if (args.story && hashPart[1]) {
    hashPart[1].split("&").forEach(function (keyValueString) {
      var
        keyValueArray = keyValueString.split("="),
        key = keyValueArray[0],
        value = keyValueArray[1],
        parsedValue = parseInt(value);

      args[key] = isNaN(parsedValue) ? value : parsedValue - 1;
    });
  }
  return args;
};

function parseIndex(value) {
  return (!value || isNaN(value) || value < 0) ? 0 : value;
}

function generateHash() {
  return _url.story
    ? "/#/"+ _url.story +'?chapter='+ (_url.chapter + 1) +'&page='+ (_url.page + 1)
    : "/#/";
}

function loadStoryView(storyId, path, chapter, page) {
  if (storyId === _url.story) { return; }
  _url.story = storyId;
  _url.chapter = parseIndex(chapter);
  _url.page = parseIndex(page);
  window.document.title = "Reading "+ storyId;

  $state.View.load("Story", function (Story) {
    Story.load($stories.store[storyId]).loadChapter(_url.chapter, _url.page);
  });
};

function setStoryUrlData(storyId, chapter, page) {
  _url.story = storyId || "";
  _url.chapter = chapter || 0;
  _url.page = page || 0;
}

function loadHomeView() {
  window.document.title = "Home";
  $state.View.load("Home");
  setStoryUrlData();
}

function loadUrl() {
  var parsedData = parseHash();
  if (parsedData.story && $stories.store[parsedData.story]) {
    loadStoryView(parsedData.story, parsedData.hash, parsedData.chapter, parsedData.page);
  } else {
    $url.set('/#/');
    loadHomeView();
  }
}

var $url = {
  // go:  function () { window.history.go(null, ) },
  init: function () {
    setStoryUrlData();
    loadUrl();
    return $url;
  },

  add: function (path) {
    console.log("adding", path, "to history");
    window.history.pushState(null, window.document.title, path);
    return $url;
  },

  set: function (path) {
    window.history.replaceState(null, window.document.title, path);
    return $url;
  },

  setStoryIndexes: function (page, chapter, callback) {
    var changes = false, hash;

    if (page !== _url.page) {
      _url.page = page;
      changes = true;
    }

    if (chapter !== _url.chapter) {
      _url.chapter = chapter;
      changes = true;
    }

    if (changes) {
      hash = generateHash();
      $url.set(hash);

      if (typeof callback === "function") {
        callback(hash);
      }
    }
    return $url;
  },

  loadStory: function (storyId, chapter, page) {
    if (storyId === _url.story) { return $url; }
    setStoryUrlData(storyId, chapter, page);
    var hash = generateHash();
    $url.add(hash);
    loadStoryView(storyId, hash, chapter, page);
    return $url;
  },

  goHome: function () {
    $url.add("/#/");
    loadHomeView();
    return $url;
  }
};

window.onpopstate = loadUrl;

window.onhashchange = function () {
  var parsedData = parseHash();
  if (parsedData.story) {
    if (parsedData.story === _url.story) {
      $url.setStoryIndexes(parsedData.page, parsedData.chapter, function (hash) {
        $state.Story.loadChapter(parsedData.chapter, parsedData.page);
      });
    } else if ($stories.store[parsedData.story]) {
      loadStoryView(parsedData.story, parsedData.hash, parsedData.chapter, parsedData.page);
    } else {
      $url.set('/#/');
      loadHomeView();
    }
  }
};
