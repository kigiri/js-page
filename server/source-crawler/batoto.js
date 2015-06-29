"use strict";

const
  fs = require('fs'),   
  _ = require("lodash"),
  imgmin = require("imagemin"),
  core = require("./core"),
  _sourceURL = "http://bato.to/comic/_/comics/",
  _srcValidity = /^http:\/\/img\.bato\.to\/comics\/.+img[0-9]{6}\.([a-z]+)$/;

function processTitle(el) {
  return {
    index: el.title.split(/Ch\.([^: ]+)/)[1],
    href: el.href
  };
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

function expandChapter(chapterInfo) {
  const done = this.done;
  core.getHTML(chapterInfo.href).then($ => {
    const selector = $('#page_select')[0];
    if (!selector) {
      if ($('title').text() === "Error") {
        console.warn("Error loading", this.href);
        return done();
      }
      // strip mode
      let srcs = $('img').map((i, e) => e.attribs.src).get();
      srcs = _.uniq(srcs.filter(src => _srcValidity.test(src)));
      return core.saveAllImages(srcs, chapterInfo, done);
    }
    // page per page mode
    let opts = selector.children.filter(e => {
        if (e.type === "text") { return false; }
        return !(e.attribs.selected);
      }),
      url = $('#comic_page')[0].attribs.src, i = -1,
      srcs = [ url ];

    function loadNext() {
      if (++i >= opts.length) {
        core.saveAllImages(srcs, chapterInfo, done);
      } else {
        core.getHTML(opts[i].attribs.value).then(getImageLink).then(src =>
          loadNext(srcs.push(src)));
      }
    }

    core.mkdirp(chapterInfo.path).then(loadNext);
  });
}

module.exports = function (batotoUrl, opts, cb) {
  console.log("getting:", batotoUrl);
  core.getHTML(_sourceURL + batotoUrl)
  .bind(opts).then(parseChapterList).then(chapterList => {
    const makePath = core.getChapterMaker(batotoUrl.split(/-([^-]+$)/)[0]);
    chapterList.forEach(c => c.path = makePath(c));
    core.loadAllChapters(chapterList, expandChapter, _ => {
      console.log(batotoUrl, "all done");
      cb();
    });
  });
}

