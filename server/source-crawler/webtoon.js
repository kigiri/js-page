"use strict";

const core = require("./core");

const _baseUrl = "http://www.webtoons.com/_/";

function generateChapter(webtoon, chapterId) {
  return {
    title: "Ep. " + chapterId,
    index: chapterId,
    href: webtoon.url +"_/viewer?title_no="+ webtoon.id +"&episode_no="+ chapterId,
    lang: "english",
    team: "webtoons",
  };
}

function getChapter(chapterInfo) {
  const done = this.done;
  core.getHTML(chapterInfo.href).then($ => {
    const srcs = $("._images").map((_, i) => i.attribs["data-url"]).get();
    return core.saveAllImages(srcs, chapterInfo, done);
  });
}

function parseChapterList($) {
  const id = $('#_listUl')[0].children.filter(c => c.type !== "text")[0].attribs.id.split('_')[1],
        title = $('.detail_header').find('.subj')[0].children[0].data.trim(),
        pathMaker = core.getChapterMaker(title),
        lastChapter = parseInt(id);

  console.log("loading webtoon", title);
  let i = 0, chapterList = [];
  while (++i <= lastChapter) {
    let c = generateChapter(this, i);
    c.path = pathMaker(c);
    chapterList.push(c);
  }
  return chapterList;
}

module.exports = function (webtoon, opts, cb) {
  const url = _baseUrl + (webtoon.challenge ? 'challenge/_/' : '_/_/');

  webtoon.url = url;
  core.getHTML(url +"list?title_no="+ webtoon.id)
  .bind(webtoon).then(parseChapterList)
  .then(chapterList => core.loadAllChapters(chapterList, getChapter, _ => {
    console.log("webtoon", webtoon.id, "completed");
    cb();
  }));
};

