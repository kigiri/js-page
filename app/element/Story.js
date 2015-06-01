/* global Chapter, $state, $new, $url, $config, $add */

function Story(storyInfo) {
  console.log('new Story', arguments);
  this.id = storyInfo.path;
  this.teamsData = storyInfo.teams;
  this.availableTeams = Object.keys(this.teamsData);
  this.team = this.availableTeams[0];
  this.chapterCache = [];
  this.HTMLElement = $new.div({ id: "story" });
  $url.set({story: this.id, team: this.team});
}

Story.prototype.setTeam = function (team) {
  if (this.availableTeams.indexOf(team) === -1) {
    this.team = this.team || this.availableTeams[0];
  } else if (this.team !== team) {
    this.team = team;
    this.chapterArray = [];
    $url.set({team: team});
    // should change selected chapter page
  }
  return this;
}

var _separator = $new.div({style: { clear: "both" }});

Story.prototype.getChapter = function (chapterIndex) {
  if (!this.chapterCache[chapterIndex]) {
    this.chapterCache[chapterIndex] = new Chapter(this,
      this.teamsData[this.team].chapters, chapterIndex);
  }
  return this.chapterCache[chapterIndex];
};

Story.prototype.setChapter = function (chapterIndex) {
  this.chapter = this.getChapter(chapterIndex);
  $add(this.chapter.HTMLElement, this.HTMLElement);
  $add(_separator, this.HTMLElement);
  return this;
};
