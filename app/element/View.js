/* global Story, $new */

function View() {
  this.Story = new Story();
  this.HTMLElement = $new.div({
    id: "view",
    style: {
    }
  }, this.Story.HTMLElement);
}


