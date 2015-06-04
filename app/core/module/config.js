// init config update tasks

var $config = {
  invertPageOrder: true,
  readingMode: "single", // single, double or strip
  background: "black",
  pageBuffer: 50, // amount of page to precache ahead
  lang: 'fr',
  fit: true
};

// Restore variables from local storage
Object.keys($config).forEach(function (key) {
  var val = localStorage[key];
  var type = typeof $config[key];
  if (val) {
    if (type === "boolean") {
      val = (val === "true");
    } else if (type === "number") {
      val = parseInt(val);
      if (isNaN(val)) { return; }
    } else if (type !== "string") {
      try { val = JSON.stringify(val); }
      catch (e) { return; }
    }
    $config[key] = val;
  }
});

var _tasks = {};

function callTask(t) {
  if (!t) { return; }
  if (typeof t === "function") {
    t();
  } else if (typeof t.request === "function") {
    t.request();
  }
}

$config.set = function (key, val) {
  if ($config[key] !== val) {
    $config[key] = val;
    localStorage[key] = (typeof val === "string") ? val : JSON.stringify(val);
    callTask(_tasks[key]);
  }
};

$config.init = function (i18n, bg) {
  _tasks.lang = function () {
    i18n.set($config.lang);
  };
  _tasks.background = bg;
}


