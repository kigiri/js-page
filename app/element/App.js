/* global View, Menu, $new, $state, $url, $loop, $background, $tasks */

function App() {
  this.View = $state.View = new View();
  this.Menu = $state.Menu = new Menu();
  this.HTMLElement = $new.div({
    id: "app"
  }, this.View.HTMLElement, this.Menu.HTMLElement);
  $tasks.init();
  $url.init();
  console.log($background);
  $background();
  $loop.start();
}
