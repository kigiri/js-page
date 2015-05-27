/* global View, Menu, $new, $add */

function App() {
  this.View = new View();
  this.Menu = new Menu();
  this.HTMLElement = $new.div({id: "app"}, this.View.HTMLElement, this.Menu.HTMLElement);
  $add(this.HTMLElement);
}
