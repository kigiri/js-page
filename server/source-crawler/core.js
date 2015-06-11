"use strict";

const cheerio = require('cheerio'),
      parseXML = require('xml2js').parseStringAsync,
      fs = require('fs'),
      path = require("path"),
      _ = require("lodash"),
      request = require("request"),
      collect = require("../data-collector/core"),
      mkdirp = require("bluebird").promisify(require("mkdirp"));

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2420.0 Safari/537.36',
  'Accept': '*/*'
};

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
  return path.basename(url.url || url).split(/[?&]/)[0];
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
  fs.readdirAsync(dirpath)
  .then(files => collect.getAllImages(files, dirpath))
  .then(pages => collect.generateImageData(pages, dirpath + 'data.json')).catch(handleError);
  return fs.writeFileAsync(dirpath + '.done', '').catch(handleError);
}

function parseChapterIndex(index) {
  index = index.replace(/^0+/, '');
  if (!index) {
    index = '0';
  }
  return index;
}

function getChapterMaker(title) {
  const _basePath = 'public/assets/'+ toId(title) +'/';
  return function (chapterInfo) {
    return _basePath + chapterInfo.lang +'/'+ chapterInfo.team +'/'
    + chapterInfo.index +'/';
  }
}

function saveAllImages(imageArray, chapterInfo, cb) {
  let i = -1;
  const _headers = _.assign({ Referer: chapterInfo.href }, headers);
  console.log("loading all images from", chapterInfo.href);
  function recur() {
    if (++i >= imageArray.length) {
      markAsDone(chapterInfo.path).then(cb);
    } else {
      saveImage({ url: imageArray[i], headers: _headers}, chapterInfo.path, recur);
    }
  }
  mkdirp(chapterInfo.path).then(recur);
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
          // fn.call({ done: () => { tryChapter(i + 1); } }, chapterInfo);
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
  parseChapterIndex,
  toId,
  get: get,
  getHTML,
  getXML,
  getRSS,
  mkdirp
};
