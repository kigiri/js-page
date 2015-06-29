/* global StoryThumbnail, StoryModal, $new, $state, $stories */

function Home() {
  this.HTMLElement = $new.div({
    id: "home",
    style: {
      margin: "3rem auto",
    }
  });
  this.update();
  $state.View.HTMLElement.backgroundColor = "#F1F1F1";
  var modal = new StoryModal();
  $stories.each(function (storyData) {
    this.HTMLElement.appendChild((new StoryThumbnail(storyData, modal)).HTMLElement);
  }.bind(this));
  window.addEventListener("resize", this.update.bind(this), false);
}

Home.prototype.update = function () {
  this.HTMLElement.style.width = Math.max(~~(($state.width - 60) / 106), 1) * 106 + 'px';
}

Home.prototype.unload = function () {
  // this.HTMLElement.remove();
};

