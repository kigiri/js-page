/* global App, Story, $add, $state, $stories, $loop */

$add((new App()).HTMLElement);

// Load a story
function loadStory(id, chapter, page) {
  $stories.get(id, function (storyData) {
    var view = $state.View;
    try {
      if (!view.content || view.content.id !== id) {
        var story = new Story(storyData);
        story.setChapter(chapter).chapter.setPage(page);
        view.load("story", story);
        console.log($state);
        setTimeout(function() {
          $loop.resize.request();
        }, 500);
      }
    } catch (e) { console.error(e); }
  });
}

loadStory("all-you-need-is-kill", 8, 0);

$loop.resize.sub(function () {
  $state.eachVisiblePages("update");
});

$loop.downloadUpdate.sub(function () {
  $state.eachVisiblePages("updateDownloadBar");
});


function $main() {}

