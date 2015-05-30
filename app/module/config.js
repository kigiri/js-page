/* global Task */

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
  if (t instanceof Task) {
    t.request();
  }
}

$config.set = function (key, value) {
  if ($config[key] !== value) {
    $config[key] = value;
    callTask(_tasks[key]);
  }
};
