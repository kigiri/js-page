/* global Chapter, $state, $new, $url */

//
/* global Chapter, $state, $new, $url, $config */

function Story(storyInfo) {
  var firstChap = new Chapter(this, storyInfo.teams[this.team][0]);
  this.dl = new DownloadManager(firstChap, $config.pageBuffer);
  this.id = storyInfo.path;
  this.availableTeams = Object.keys(storyInfo.teams);
  this.HTMLElement = $new.div({
    id: "story"
  }, firstChap.HTMLElement, $new.div({style: { clear: "both" }}));
}

Story.prototype.openPage = function (chapterIndex, pageIndex) {
  $url.set({story: this.id, chapter: chapterIndex, page: pageIndex});
};

