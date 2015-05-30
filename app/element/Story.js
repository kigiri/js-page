/* global Chapter, $state, $new, $url */

//

function Story(storyInfo) {
  $url.getPage();
  $url.getTeam();
  $url.getChapter();
  var firstChap = new Chapter(this, storyInfo.teams[this.team][0]);
  this.dl = new DownloadManager(firstChap, $config.pageBuffer);
  this.path = storyInfo.path;
  this.availableTeams = Object.keys(storyInfo.teams);
  this.HTMLElement = $new.div({
    id: "story"
  }, firstChap.HTMLElement, $new.div({style: { clear: "both" }}));
}

Story.prototype.openPage = function (chapterIndex, pageIndex) {

};

