const cheerio = require('cheerio'),
      fs = require('fs'),
      path = require("path"),
      _ = require("lodash"),
      request = require("request"),
      mkdirp = require("bluebird").promisify(require("mkdirp"));

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

function markAsDone(dirpath) {
  return fs.writeFileAsync(dirpath + '.done', '')
  .bind(console).catch(console.error);
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
      saveImage(imageArray[i], chapterPath).on('close', recur);
    }
  }
  mkdirp(chapterPath).then(recur)
}

module.exports = {
  saveImage,
  markAsDone,
  saveAllImages,
  getChapterMaker,
  toId,
  getHTML,
  mkdirp
};
