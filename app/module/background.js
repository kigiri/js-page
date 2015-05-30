/* global $config, $loop */

function $background() {
  var task = $loop.backgroundChange.sub(function () {
    document.body.style.backgroundColor = $config.background;
    this.cancel();
  });
  $background = task.request.bind(task);
  $background();
}

