const cheerio = require('cheerio'),
      fs = require('fs'),
      path = require("path"),
      _ = require("lodash"),
      request = require("request"),
      mkdirp = require("bluebird").promisify(require("mkdirp"));

var _sourceURL = "http://bato.to/comic/_/comics/";
var _title = "onepunch-man";


function get(url) {
  return request.getAsync(url).get(1).catch(err => {
    console.error(err);
  });
}

function getHTML(url) {
  return get(url).then(cheerio.load);
}

function saveImage(url, localpath) {
  console.log("saving", url, "to", localpath);
  let stream = fs.createWriteStream(localpath + path.basename(url));
  request(url).pipe(stream);
  return stream;
}

function toId(str) {
  return _.deburr(_.kebabCase(str));
}

function processTitle(el) {
  var s = el.title.split(' | Sort: ');
  return { title: s[0].trim(), index: parseFloat(s[1]), href: el.href};
}

function parseChapterList($) {
  let parsedChapters = [];
  $('.chapter_row').each((i, e) => {
    let c = e.children.filter(e => e.type !== "text")
      .map(e => e.children.filter(e => e.type !== "text"))
      .filter(e => !!e.length)
      .map(e => e[0]),
      ret  = processTitle(c[0].attribs);
    ret.lang = c[1].attribs.title.trim();
    ret.team = c[2].children[0].data.trim();
    parsedChapters.push(ret);
  });
  return parsedChapters;
}

function getImageLink($) {
  return $('#comic_page')[0].attribs.src;
}

function markAsDone(dirpath) {
  return fs.writeFileAsync(dirpath + '.done', '')
  .bind(console).catch(console.error);
}

function downloadStrip(srcs) {
  let i = 0;
}

const _srcValidity = /^http:\/\/img\.bato\.to\/comics\/.+img[0-9]{6}\.([a-z]+)$/;
function expandChapter(chapterInfo, chapterIndex, cb) {
  getHTML(chapterInfo.href).bind(chapterInfo).then($ => {
    const selector = $('#page_select')[0];
    if (!selector) {
      if ($('title').text() === "Error") {
        return console.log("Error loading", this.href);
      }
      // strip mode
      let srcs = $('img').map((i, e) => e.attribs.src).get(), i = -1;
      srcs = _.uniq(srcs.filter(src => _srcValidity.test(src)));

      function loadNext() {
        if (++i >= srcs.length) {
          markAsDone(chapterInfo.path).then(_ => cb(chapterIndex + 1));
        } else {
          saveImage(srcs[i], chapterInfo.path).on('close', loadNext);
        }
      }

      mkdirp(chapterInfo.path).then(loadNext);

      return;
    }
    // page per page mode
    let opts = selector.children.filter(e => {
      if (e.type === "text") { return false; }
      return !(e.attribs.selected);
    }), url = $('#comic_page')[0].attribs.src, i = -1;

    function loadNext() {
      if (++i >= opts.length) {
        markAsDone(chapterInfo.path).then(_ => cb(chapterIndex + 1));
      } else {
        getHTML(opts[i].attribs.value).then(getImageLink).then(src =>
          saveImage(src, chapterInfo.path).on('close', loadNext));
      }
    }

    mkdirp(chapterInfo.path).then(_ =>
      saveImage(url, chapterInfo.path).on('close', loadNext));
  })
}

function parallel(arr, instanceCount, fn) {
  const step = ~~(arr.length / instanceCount);
  var i = -1;
  while (++i < instanceCount) {
    fn(step * i);
  }
}

module.exports = function (batotoUrl) {
  const title = batotoUrl.split(/-([^-]+$)/)[0];
  const _basePath = 'public/assets/'+ toId(title) +'/'
  function makeChapterPath(chapterInfo) {
    return _basePath
    + toId(chapterInfo.lang) +'/'
    + toId(chapterInfo.team) +'/'
    + ("0000" + chapterInfo.index.toFixed(3).replace('.', '')).slice(-8) +'/';
  }

  getHTML(_sourceURL + batotoUrl).then(parseChapterList).then(chapterList => {
    chapterList.forEach(c => c.path = makeChapterPath(c));
    function tryChapter(i) {
      if (i >= chapterList.length) { return console.log(title, "is done !") ; }
      let chapterInfo = chapterList[i];
      if (!chapterInfo.loading) {
        chapterInfo.loading = true;
        fs.statAsync(chapterInfo.path).then(stats => {
          // check if dir, then open it, then
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

