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

const
  handleError = err =>
    console.error(err),

  get = url =>
    request.getAsync({url, headers}).get(1).catch(handleError),

  tryToCall = fn =>
    typeof fn === "function" ? fn() : undefined,

  getXML = url =>
    get(url).then(parseXML),

  getRSS = url =>
    getXML(url).then(xml => xml.rss.channel[0]),

  getHTML = url =>
    get(url).then(cheerio.load),

  getExt = filename =>
    filename.split(/(\.[^.]+)$/)[1],

  urlBasename = url =>
    path.basename(url).split(/[?&]/)[0],

  ifErrorNoEnt = (resolve, reject) =>
    err => err.code === "ENOENT" ? resolve() : reject(handleError(err)),

  getNameFromOpts = opts =>
    path.join(opts.path, opts.index + getExt(urlBasename(opts.url)));

function saveImage(reqOpts, cb) {
  if (!reqOpts.url || reqOpts.url === "undefined") { return handleError(reqOpts); }

  console.log("saving", reqOpts.url);

  let fileStream = fs.createWriteStream(getNameFromOpts(reqOpts)),
      requestStream = request(reqOpts);

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
  .then(pages => collect.generateImageData(pages, path.join(dirpath, 'data.json')))
  .catch(handleError);
  return fs.writeFileAsync(path.join(dirpath, '.done'), '').catch(handleError);
}

function parseChapterIndex(index) {
  if (typeof index === "number") {
    return index.toString();
  }

  index = index.replace(/^0+/, '');
  if (!index) {
    index = '0';
  }
  return index;
}

function getChapterMaker(title) {
  const _basePath = 'public/assets/'+ toId(title) +'/';
  return chapter => 
    path.join(_basePath, chapter.lang, chapter.team,
      parseChapterIndex(chapter.index));
}

function saveAllImages(imageArray, chapterInfo, cb) {
  let i = -1;
  const
    _headers = _.assign({ Referer: chapterInfo.href }, headers),
    _path = chapterInfo.path;

  console.log("loading all images from", chapterInfo.href);
  function recur() {
    if (++i >= imageArray.length) {
      markAsDone(_path).then(cb);
    } else {
      const
        url = imageArray[i],
        oldImagePath = path.join(_path, urlBasename(url)),
        imagePath = path.join(_path, i + getExt(oldImagePath)),
        apply = () => saveImage({
          url,
          path: _path,
          headers: _headers,
          index: i
        }, recur);

      fs.statAsync(oldImagePath).then(stats => {
        if (stats.size > 4096) {
          console.log("rename:", imagePath);
          return fs.renameAsync(oldImagePath, imagePath).then(recur);
        } else {
          apply();
        }
      }).catch(ifErrorNoEnt(() => {
        fs.statAsync(imagePath).then(recur).catch(ifErrorNoEnt(apply, recur))
      }, recur));
    }
  }
  mkdirp(_path).then(recur);
}

// fn is called with chapterinfo, invoke this.done() to start the next chapter
function loadAllChapters(chapterList, fn, cb) {
  const max = chapterList.length;

  function tryChapter(i) {
    const done = () => tryChapter(i + 1);
    if (i >= max) { return tryToCall(cb); }
    let chapter = chapterList[i];
    if (!chapter.loading) {
      chapter.loading = true;
      fs.statAsync(chapter.path)
      .then(stats => {
        return fs.statAsync(path.join(chapter.path, '.done')).then(done)
      })
      .catch(ifErrorNoEnt(() => fn.call({ done }, chapter), done));
    } else {
      done();
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
