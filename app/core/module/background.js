/* global $config, $loop, $state */

function $background() {
  var _style = $state.View.HTMLElement.style;
  var task = $loop.backgroundChange.sub(function () {
    _style.backgroundColor = $config.background;
    this.cancel();
  });
  $background = task.request.bind(task);
  $background();
}

