"use strict";

const core = require("./core"),
      q = require("bluebird");

const _baseUrl = "http://mangastream.com/manga/";

function generateChapter(href, title) {
  const index = parseInt(href.split(/readms\.com\/r\/[^\/]+\/([0-9]+)\//)[1]);
  return {
    title,
    index,
    href,
    lang: "english",
    team: "mangastream",
  };
}

function getChapter(chapterInfo) {
  const done = this.done;  
  core.getHTML(chapterInfo.href).then($ => {
    let hrefParts = $('a').filter(i => {
      if (!this.children) { return false; }
      return (/Last Page/.test(this.children[0].data));
    }).map(i => this.attribs.href).get()[0].split(/([0-9]+)$/);
    let max = parseInt(hrefParts[1]),
        base = hrefParts[0],
        i = 0,
        list = [];

    while (++i <= max) {
      list.push(core.getHTML(base + i));
    }
    q.settle(list).map(result => result._settledValue('#manga-page')[0].attribs.src)
    .then(srcs => core.saveAllImages(srcs, chapterInfo, done));
  });
}

function parseChapterList($) {
  const pathMaker = core.getChapterMaker(this.mangastreamKey);
  return $('td').filter(i => this.children[0].type !== 'text').map(i => {
    let a = this.children[0];
    return {
      href: a.attribs.href,
      title: a.children[0].data
    };
  }).get().map(c => {
    c = generateChapter(c.href, c.title);
    c.path = pathMaker(c);
    return c;
  });
}

module.exports = function (mangastreamKey, opts, cb) {
  console.log("loading mangastream", mangastreamKey);
  const url = _baseUrl + mangastreamKey;
  core.getHTML(url).bind({mangastreamKey}).then(parseChapterList)
  .then(chapterList => core.loadAllChapters(chapterList, getChapter, _ => {
    console.log("mangastream", mangastreamKey, "completed");
    cb();
  }));
}

