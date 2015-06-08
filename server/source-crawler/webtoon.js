const core = require("./core");

const _baseUrl = "http://www.webtoons.com/_/_/_/";

function generateChapter(webtoonId, chapterId) {
  return {
    title: "Ep. " + chapterId,
    index: chapterId,
    href: _baseUrl +"_/viewer?title_no="+ webtoonId +"&episode_no="+ chapterId,
    lang: "english",
    team: "webtoons",
  };
}

function getChapter(chapterInfo) {
  const done = this.done;
  core.getHTML(chapterInfo.href).then($ => {
    const srcs = $("._images").map((_, i) => i.attribs["data-url"]).get();
    return core.saveAllImages(srcs, chapterInfo.path, done);
  });
}

function parseChapterList($) {
  const id = $('#_listUl')[0].children.filter(c => c.type !== "text")[0].attribs.id.split('_')[1],
        title = $('.detail_header').find('.subj')[0].children[0].data.trim(),
        pathMaker = core.getChapterMaker(title),
        lastChapter = parseInt(id);

  let i = 0, chapterList = [];
  while (++i <= lastChapter) {
    let c = generateChapter(this.webtoonId, i);
    c.path = pathMaker(c);
    chapterList.push(c);
  }
  return chapterList;
}

module.exports = function (webtoonId, opts, cb) {
  console.log("loading webtoon", webtoonId);
  const url = _baseUrl +"list?title_no="+ webtoonId;
  core.getHTML(url).bind({webtoonId}).then(parseChapterList)
  .then(chapterList => core.loadAllChapters(chapterList, getChapter, _ => {
    console.log("webtoon", webtoonId, "completed");
    cb();
  }));
}

