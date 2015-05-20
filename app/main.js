
var firstChap = new Chapter("img/lastmant1ip001p216fr{page}hdelitoon72dpi.jpg", 4, 21);
// var ptest =  $add(new Page("img/heavy.png", 0).load());
$add(firstChap.HTMLElement);
$state.init(firstChap);

window.onscroll = function (event) {
  $state.setScroll(document.body.scrollTop);
}

window.onmousemove = function (e) {
  $state.setMouse(e.clientX, e.clientY, e.buttons);
};


function main() { }
