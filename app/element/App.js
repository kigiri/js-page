/* global View, Menu, $new, $state, $url, $loop, $background, $tasks, $i18n, $config */

function App() {
  this.View = $state.View = new View();
  this.Menu = $state.Menu = new Menu();
  this.HTMLElement = $new.div({
    id: "app"
  }, this.View.HTMLElement, this.Menu.HTMLElement);
  $tasks.init();
  $url.init();
  $background();
  $loop.start();
  $i18n.init($loop);
  $config.init($i18n, $background);
}
