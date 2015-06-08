const cheerio = require('cheerio'),
      parseXML = require('xml2js').parseStringAsync,
      fs = require('fs'),
      path = require("path"),
      _ = require("lodash"),
      request = require("request"),
      mkdirp = require("bluebird").promisify(require("mkdirp"));

const headers = { 'User-Agent': 'request', 'Accept': '*/*' };

function handleError(err) { console.error(err); }

function get(url) {
  return request.getAsync({url, headers}).get(1).catch(handleError);
}

function getXML(url) {
  return get(url).then(parseXML);
}

function getRSS(url) {
  return getXML(url).then(xml => xml.rss.channel[0]);
}

function getHTML(url) {
  return get(url).then(cheerio.load);
}

function urlBaseName(url) {
  return path.basename(url).split(/[?&]/)[0];
}

function saveImage(url, localpath, cb) {
  let fileStream = fs.createWriteStream(localpath + urlBaseName(url)),
      requestStream = request(url);

  requestStream.pipe(fileStream);
  fileStream.on('close', () => {
    requestStream.abort();
    cb();
  });
}

function toId(str) {
  return _.deburr(_.kebabCase(str));
}

function markAsDone(dirpath) {
  return fs.writeFileAsync(dirpath + '.done', '').catch(handleError);
}

function getChapterMaker(title) {
  const _basePath = 'public/assets/'+ toId(title) +'/';
  return function (chapterInfo) {
    return _basePath + chapterInfo.lang +'/'+ chapterInfo.team +'/'
    + ("0000" + chapterInfo.index.toFixed(3).replace('.', '')).slice(-8) +'/';
  }
}

function saveAllImages(imageArray, chapterPath, cb) {
  let i = -1;
  function recur() {
    if (++i >= imageArray.length) {
      markAsDone(chapterPath).then(cb);
    } else {
      saveImage(imageArray[i], chapterPath, recur);
    }
  }
  mkdirp(chapterPath).then(recur)
}

// fn is called with chapterinfo, invoke this.done() to start the next chapter
function loadAllChapters(chapterList, fn, cb) {
  const max = chapterList.length;
  function tryChapter(i) {
    if (i >= max) { return (cb || ()=>{})(); }
    let chapterInfo = chapterList[i];
    if (!chapterInfo.loading) {
      chapterInfo.loading = true;
      fs.statAsync(chapterInfo.path).then(stats => {
        // check if dir, then open it, then should try open .done
        tryChapter(i + 1);
      }).catch(err => {
        if (err.code === "ENOENT") {
          fn.call({ done: () => { tryChapter(i + 1); } }, chapterInfo);
        } else {
          console.error(err);
        }
      })
    } else {
      tryChapter(i + 1);
    }
  }
  tryChapter(0);
}


const opts = {
  bannedTeams: [],
  languages: ["french", "english"],
};

function loadAllList(list, fn) {
  let i = -1, start = Date.now();
  function recur() {
    if (++i < list.length) {
      fn(list[i], opts, recur);
    } else {
      const now = Date.now(),
            diff = now - start;
      console.log("List completed in", (diff / 1000).toFixed(1) +"sec");
      i = -1;
      start = now;
      setTimeout(recur, 3600000 - diff);
    }
  }
  console.log("List started");
  recur();
}

module.exports = {
  saveImage,
  markAsDone,
  saveAllImages,
  loadAllChapters,
  loadAllList,
  getChapterMaker,
  toId,
  get: get,
  getHTML,
  getXML,
  getRSS,
  mkdirp
};
