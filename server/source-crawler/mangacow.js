"use strict";

const core = require("./core");

const _baseUrl = "http://mangacow.co/";

function generateChapter(index, mangacowKey) {
  const numericalIndex = parseFloat(index);

  return {
    href: _baseUrl + mangacowKey +'/'+ index,
    index: isNaN(numericalIndex) ? index : numericalIndex,
    lang: "english",
    team: "mangacow"
  };
}

function extractLinks(rawHTML) {
  return rawHTML.split(/arr_img\.push\("([^"]+)"\)/).filter(src => /^http/.test(src));
}

function getChapter(chapterInfo) {
  const done = this.done;
  core.get(chapterInfo.href).then(extractLinks).then(srcs =>
    core.saveAllImages(srcs, chapterInfo, done));
}

function parseChapterList($) {
  const key = this.mangacowKey,
        pathMaker = core.getChapterMaker(key);
  return $('.cbo_wpm_chp')[0].children.map(el => {
    el = generateChapter(el.attribs.value, key);
    el.path = pathMaker(el);
    return el;
  });
}

const getLastChapterLink = rss => core.getHTML(rss.item[0].link[0]);

module.exports = function (mangacowKey, opts, cb) {
  console.log("loading mangacow", mangacowKey);
  const url = _baseUrl +'manga-rss/'+ mangacowKey;
  core.getRSS(url).then(getLastChapterLink)
  .bind({mangacowKey}).then(parseChapterList).catch(err => console.log(err))
  .then(chapterList => core.loadAllChapters(chapterList, getChapter, _ => {
    console.log("mangacow", mangacowKey, "completed");
    cb();
  }));
}

