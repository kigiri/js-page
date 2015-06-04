/* global View, $new, $state, $url, $loop, $background, $i18n, $config */

function App() {
  this.View = $state.View = new View();
  this.HTMLElement = document.body;
  this.HTMLElement.appendChild(this.View.HTMLElement);
  $url.init();
  $background();
  $loop.start();
  $i18n.init($loop);
  $config.init($i18n, $background);
}
