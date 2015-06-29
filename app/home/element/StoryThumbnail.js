/* global $new */
var _style = {
  width: "10rem",
  height: "15rem",
  borderRadius: ".3rem",
  margin: ".0rem .3rem .3rem .3rem",
  background: "#bada55",
  display: "inline-block",
};

function StoryThumbnail(storyData, modal) {
  this.HTMLElement = $new.div({
    id: storyData.path,
    style: _style,
    className: "thumbnail",
    onclick: function () {
      modal.load(storyData);
    }
  })
}

