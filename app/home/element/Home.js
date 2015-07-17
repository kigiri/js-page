/* global StoryDetails, StoryModal, StorySelector, $new, $loop */

function Home() {
  this.details = new StoryDetails();
  this.selector = new StorySelector(this.details);
  this.HTMLElement = $new.div({
    id: "home",
    style: {
      backgroundColor: "#F1F1F1",
      height: "100%"
    }
  }, this.details.HTMLElement, this.selector.HTMLElement);
  $loop.resize.sub(this.update.bind(this));  
}

Home.prototype.unload = function () {
  this.HTMLElement.remove();
};

Home.prototype.update = function () {
  this.selector.update();
  this.details.update();
};
