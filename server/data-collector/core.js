"use strict";

const
  fs = require('fs'),
  path = require("path"),
  joinPath = path.join,
  q = require("bluebird"),
  gm = require("gm"),
  _ = require("lodash"),
  _assetsPath = 'public/assets/';
var
  _db = { chapters: {}, stories: {} };


function calculateRatio(page) {
  if (page.height < page.width) {
    page.normalizedWidth = page.width / 2;
    page.isWide = true;
  } else {
    page.normalizedWidth = page.width;
    page.isWide = false;
  }
  page.ratio = page.height / page.normalizedWidth;
}

function getImageDetails(page) {
  const next = this.next;
  gm(page.path).size((err, f) => {
    _.assign(page, f);
    next();
  });
}
const keys = [ "height", "width", "name" ];
function saveChapterData(dataPath, pages) {
  fs.writeFileAsync(dataPath, JSON.stringify(pages, keys)).catch(console.error);
}

function detectType(chapterInfo) {
  console.log(chapterInfo);
}

function getMedianScore(base, arr) {
  return _.reduce(arr, (score, value) => score + Math.abs(base - value));
}

function getMedian(arr, key) {
  const
    values = _.chain(arr).pairs().map(a => _.last(a)[key]).value(),
    avegrage = _.reduce(arr, (res, a) => a[key] + res, 0) / arr.length,
    scores = _.chain(arr).map(a => ({
      score: getMedianScore(a[key], values),
      value: a[key]
    })).value(),
    avgScore = _.reduce(scores, (res, a) => a.score + res, 0) / scores.length;

  return {
    median: _.reduce(scores, (res, a) => a.score > res.score ? res : a).value,
    regularityScore: avgScore / avegrage - 1
  };
}

function moveBonus(pages) {
  
}

function makeFiller(page) {
  return {
    name: "filler",
    width: page.width,
    height: page.height
  };
}

function insertFillers(pages) {
  let
    i = -1,
    fillerInsert = [],
    nextFiller = 0,
    space = 0,
    count = 0;

  while (++i < pages.length) {
    space++;
    count++;
    if (pages[i].isWide) {
      if (space % 2 === 0) {
        fillerInsert.push(nextFiller);
      }
      space = 0;
      nextFiller = i + 1;
      count++;
    }
  }

  fillerInsert.forEach(idx => pages.splice(idx, 0, makeFiller(pages[idx])));

  if ((count + fillerInsert.length) % 2) {
    if (nextFiller) {
      pages.push(makeFiller(pages[pages.length - 1]));
    } else {
      pages.unshift(makeFiller(pages[0]));
      console.log("unsafe filler in the start of:", chapterInfo.path);
    }
  }
}

function getPageSizes(pages, dataPath, cb) {
  fs.readFileAsync(dataPath)
  .then(JSON.parse)
  .then(data => data.forEach((p, i) => _.assign(pages[i], p)))
  .then(cb)
  .catch(err => {
    if (err.code === 'ENOENT') {
      _.serial(pages, getImageDetails)
      .then(() => saveChapterData(dataPath, pages))
      .then(cb);
    } else {
      console.warn(err);
    }
  });
}

function collectChapterData(pages, chapterPath) {
  console.log(chapterPath);
  if (!pages || !pages.length) { return this.next(); }
  const
    dataPath = joinPath(path.dirname(pages[0].path), "data.json"),
    next = this.next;

  getPageSizes(pages, dataPath, () => {
    pages.forEach(calculateRatio);
    const
      pathInfo = pages[0].path.slice(_assetsPath.length).split('/'),
      w = getMedian(pages, "normalizedWidth"),
      h = getMedian(pages, "height"),
      r = getMedian(pages, "ratio");

    let chapterInfo = {
      ratio: r.median,
      width: w.median,
      height: h.median,
      ratioRegularityScore: r.regularityScore,
      widthRegularityScore: w.regularityScore,
      heightRegularityScore: h.regularityScore,
      path: chapterPath,
      story: pathInfo[0],
      language: pathInfo[1],
      team: pathInfo[2],
      name: pathInfo[3],
      pages: pages,
    };
    _db.chapters[chapterPath] = chapterInfo;
    next();
  });
}

// story infos :
// type: (strip / auto)

const getSubfileStats = path => fs.readdirAsync(path)
  .map(file => fs.statAsync(joinPath(path, file)).then(stat => ({ path, file, stat })));

const getSubDir = path => getSubfileStats(path).filter(f => f.stat.isDirectory());

const imageFilter = filename => /\.(jpe?g|png|gif|webp)$/.test(filename);
function getAllImages(files, chapterPath) {
  if (!files || !files.length) { return; }
  _db.chapters[chapterPath] = files.filter(imageFilter)
  .map(name => ({ path: joinPath(chapterPath, name), name }));
}

function openChapter(chapter) {
  const chapterPath = joinPath(chapter.path, chapter.file);
  return fs.readdirAsync(chapterPath).then(files => getAllImages(files, chapterPath));
};

const subDir = cb => (info => getSubDir(joinPath(info.path, info.file)).map(cb));

//       public/assets/     story/ language/ team/ -> chapter :D
getSubDir(_assetsPath).each(subDir(subDir(subDir(openChapter))))
.then(() => _.serial(_db.chapters, collectChapterData));
