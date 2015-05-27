/* global Chapter, $state, $new */

function Story() {
  var firstChap = new Chapter("img/lastmant1ip001p216fr{page}hdelitoon72dpi.jpg", 4, 21);
  $state.init(firstChap);
  this.HTMLElement = $new.div({
    id: "story"
  }, firstChap.HTMLElement, $new.div({style: { clear: "both" }}));
}
