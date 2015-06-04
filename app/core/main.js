/* global App, ScriptLoader, $state, $stories, $loop */

new App();

// Load a story
function loadStory(id, chapter, page, loading) {
  $state.storyId = id;
  if (!__.Story && !loading) {
    $stories.prepare(id);
    ScriptLoader('/story.js', true).then(function () {
      loadStory(id, chapter, page, true);
    });
    return;
  }
  $stories.get(id, function (storyData) {
    var view = $state.View;
    try {
      if (!view.content || view.content.id !== id) {
        var story = new __.Story(storyData);
        view.load("story", story);
        story.setTeam("MTO").getChapter(chapter).setPage(page);
      }
    } catch (e) { console.error(e); }
  });
}

loadStory("all-you-need-is-kill", 0, 0);

function $main() {}
$main.loadStory = loadStory;

