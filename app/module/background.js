/* global $config, $loop */

function $background() {
  $background = function () {
    document.body.style.backgroundColor = $config.background;
  }
  $loop.backgroundChange.sub($background);
  $background();
}

