// init config update tasks

var $config = {
  invertPageOrder: false,
  readingMode: "strip", // single, double or strip
  background: "black",
  pageBuffer: 20, // amount of page to precache ahead
  lang: 'fr',
  fit: true
};

var _tasks = {};

function callTask(t) {
  if (!t) { return; }
  if (typeof t === "function") {
    t();
  } else if (typeof t.request === "function") {
    t.request();
  }
}

$config.set = function (key, value) {
  if ($config[key] !== value) {
    $config[key] = value;
    callTask(_tasks[key]);
  }
};

$config.init = function (i18n, bg) {
  _tasks.lang = function () {
    i18n.set($config.lang);
  };
  _tasks.background = bg;
}


