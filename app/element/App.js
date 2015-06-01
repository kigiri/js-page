/* global View, Menu, $new, $state, $url, $loop, $background, $i18n, $config */

function App() {
  this.View = $state.View = new View();
  this.Menu = $state.Menu = new Menu();
  this.HTMLElement = $new.div({
    id: "app",
    style: {
      position: "fixed",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0
    }
  }, this.View.HTMLElement, this.Menu.HTMLElement);
  $url.init();
  $background();
  $loop.start();
  $i18n.init($loop);
  $config.init($i18n, $background);
}
