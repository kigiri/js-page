/* global $loop */

// All task that are used in multiple modules / elements should be declared here

var $tasks = {};

$tasks.init = function () {
  [
    "backgroundChange",
    "nextPage",
    "previousPage",
    "translate",
    "storyLoad",
    "resize",
  ].forEach(function (key, priority) {
    $tasks[key] = $loop.get(key).setPriority(priority);
  });
};


