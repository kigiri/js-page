const fs = require('fs'),
      _ = require("lodash"),
      core = require("./core");

const _sourceURL = "http://bato.to/comic/_/comics/",
      _srcValidity = /^http:\/\/img\.bato\.to\/comics\/.+img[0-9]{6}\.([a-z]+)$/;

function processTitle(el) {
  var s = el.title.split(' | Sort: ');
  return { title: s[0].trim(), index: parseFloat(s[1]), href: el.href};
}

function parseChapterList($) {
  let parsedChapters = [], _cachedOpts = this;
  $('.chapter_row').each((i, e) => {
    let c = e.children.filter(e => e.type !== "text")
      .map(e => e.children.filter(e => e.type !== "text"))
      .filter(e => !!e.length)
      .map(e => e[0]),
      ret  = processTitle(c[0].attribs);
    ret.lang = core.toId(c[1].attribs.title.trim());
    ret.team = core.toId(c[2].children[0].data.trim());
    if ((_cachedOpts.bannedTeams.indexOf(ret.team) === -1)
      && (_cachedOpts.languages.indexOf(ret.lang) !== -1)) {
      parsedChapters.push(ret);
    }
  });
  return parsedChapters;
}

function getImageLink($) {
  return $('#comic_page')[0].attribs.src;
}

function expandChapter(chapterInfo, chapterIndex, cb) {
  core.getHTML(chapterInfo.href).bind(chapterInfo).then($ => {
    const selector = $('#page_select')[0];
    if (!selector) {
      if ($('title').text() === "Error") {
        return console.log("Error loading", this.href);
      }
      // strip mode
      let srcs = $('img').map((i, e) => e.attribs.src).get();
      srcs = _.uniq(srcs.filter(src => _srcValidity.test(src)));
      core.saveAllImages(srcs, chapterInfo.path, _ => cb(chapterIndex + 1));
      return;
    }
    // page per page mode
    let opts = selector.children.filter(e => {
      if (e.type === "text") { return false; }
      return !(e.attribs.selected);
    }), url = $('#comic_page')[0].attribs.src, i = -1;

    function loadNext() {
      if (++i >= opts.length) {
        core.markAsDone(chapterInfo.path).then(_ => cb(chapterIndex + 1));
      } else {
        core.getHTML(opts[i].attribs.value).then(getImageLink).then(src =>
          core.saveImage(src, chapterInfo.path).on('close', loadNext));
      }
    }

    core.mkdirp(chapterInfo.path).then(_ =>
      core.saveImage(url, chapterInfo.path).on('close', loadNext));
    return;
  });
}

module.exports = function (batotoUrl, opts, cb) {
  const title = batotoUrl.split(/-([^-]+$)/)[0],
        makeChapterPath = core.getChapterMaker(title);
  core.getHTML(_sourceURL + batotoUrl)
  .bind(opts).then(parseChapterList).then(chapterList => {
    chapterList.forEach(c => c.path = makeChapterPath(c));
    function tryChapter(i) {
      if (i >= chapterList.length) {
        console.log(title, "is done !");
        return cb();
      }
      let chapterInfo = chapterList[i];
      if (!chapterInfo.loading) {
        chapterInfo.loading = true;
        fs.statAsync(chapterInfo.path).then(stats => {
          // check if dir, then open it, then should try open .done
          tryChapter(i + 1);
        }).catch(err => {
          if (err.code === "ENOENT") {
            expandChapter(chapterInfo, i, tryChapter);
          } else {
            console.error(err);
          }
        })
      } else {
        tryChapter(i + 1);
      }
    }
    tryChapter(0);
  });
}

