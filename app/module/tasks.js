/* global $loop */

// All task that are used in multiple modules / elements should be declared here

var $tasks = {};

$tasks.init = function () {
  [
/* 0 */ "backgroundChange",
/* 1 */ "nextPage",
/* 2 */ "previousPage",
/* 3 */ "translate",
/* 4 */ "urlChange",
/* 5 */ "storyLoad",
/* 6 */ "resize",
  ].forEach(function (key, priority) {
    $tasks[key] = $loop.get(key).setPriority(priority);
  });
};


