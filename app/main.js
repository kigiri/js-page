
var firstChap = new Chapter("img/lastmant1ip001p216fr{page}hdelitoon72dpi.jpg", 4, 21);
// var ptest =  $add(new Page("img/heavy.png", 0).load());
$add(firstChap.HTMLElement);
$state.init(firstChap);

window.onscroll = function (event) {
  if (event.pageY) {
    $state.setScroll(event.pageY);
  } else {
    $state.setScroll(document.body.scrollTop);
  }
}

window.onmouseup = $state.mouseRelease;

window.onmousemove = function (event) {
  $state.setMouse(event.clientX, event.clientY, event.buttons);
};

window.addEventListener("orientationchange", $state.updateWindow, false);
window.addEventListener("resize", $state.updateWindow, false);
function main() { }
