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
  _db = { chapters: {}, stories: {}, all: {} };


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

const saveChapterData = (() => {
  const keys = [ "height", "width", "name", "id" ];
  return (dataPath, pages) => 
    fs.writeFileAsync(dataPath, JSON.stringify(pages, keys))
    .catch(console.error);
})();

const saveStoryData = (() => {
  const keys = [
    "files",
    "readingMode"
  ];
  return story => {
    const picked = _.pick(story, keys);

    _db.all[story.name] = picked;
    fs.writeFileAsync(joinPath(_assetsPath, story.name, "data.json"),
      JSON.stringify(picked));
  }
})();

function detectType(chapterInfo) {
  console.log(chapterInfo);
}

function getMedianScore(base, arr) {
  return _.reduce(arr, (score, value) => score + Math.abs(base - value));
}

function getMax(arr, key) {
  return _.reduce(arr, (a, b) => a < b[key] ? b[key] : a, -Infinity);
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

  // console.log("values", values);
  // console.log("array", arr);

  return {
    median: _.reduce(scores, (res, a) => a.score > res.score ? res : a).value,
    regularityScore: avgScore / avegrage - 1
  };
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

  i = fillerInsert.length;
  while (--i >= 0) {
    let idx = fillerInsert[i];
    pages.splice(idx, 0, makeFiller(pages[idx]));
  }

  if ((count + fillerInsert.length) % 2) {
    if (nextFiller) {
      pages.push(makeFiller(pages[pages.length - 1]));
    } else {
      pages.unshift(makeFiller(pages[0]));
    }
  }

  pages.forEach((p, i) => p.id = i);

  return (!nextFiller);
}

function generateImageData(pages) {
  return _.serial(pages, getImageDetails);
}

function getPageSizes(pages, dataPath, cb) {
  fs.readFileAsync(dataPath)
  .then(JSON.parse)
  .then(data => data.forEach(d => pages.forEach(p => {
    if (p.name === d.name) {
      _.assign(p, d);
    }
  })))
  .then(cb)
  .catch(err => {
    if (err.code === 'ENOENT') {
      generateImageData(pages).then(cb);
    } else {
      console.warn(err, "JSON file", dataPath);
      console.warn(err.stack);
      cb();
    }
  });
}

function cleanupFillers(page) {
  return (page.name !== "filler" && page.width);
}

function byParsedName(a, b) {
  const
    parsedA = parseInt(a.name),
    parsedB = parseInt(b.name);

  if (parsedA !== parsedB) { return parsedA - parsedB; }
  if (a.name === b.name) { return 0; }
  return (a.name > b.name) ? -1 : 1;
}

let nospam = {};

function collectChapterData(pages, chapterPath) {
  if (!pages || !pages.length) { return this.next(); }

  if (pages.length === 1) {
    console.log(pages);
  }

  const
    dataPath = joinPath(path.dirname(pages[0].path), "data.json"),
    next = this.next;

  getPageSizes(pages, dataPath, () => {
    pages = pages.filter(cleanupFillers).sort(byParsedName);
    pages.forEach(calculateRatio);

    if (!pages.length) {
      console.log("Wrong data for", dataPath);
      return next();
    }

    const
      pathInfo = pages[0].path.slice(_assetsPath.length).split('/'),
      w = getMedian(pages, "normalizedWidth"),
      h = getMedian(pages, "height"),
      r = getMedian(pages, "ratio"),
      webtoon = isStrip(w.regularityScore, h.regularityScore, r.median) || /.+webtoons.+/ig.test(chapterPath);

    function testPageRegularity(page) {
      let score = Math.abs(page.normalizedWidth - w.median);

      if (webtoon) { return score < 100; }
      score += Math.abs(page.height - h.median);
      return (score < 250 && Math.abs(page.ratio - r.median) > 0.1);
    }


    pages.filter(testPageRegularity);

    if (!webtoon && insertFillers(pages) && !nospam[pathInfo[0]]) {
      nospam[pathInfo[0]] = true;
      console.log("https://page.cdenis.net/#/"+ pathInfo[0] +"?chapter=1&page=1");
    }
    saveChapterData(dataPath, pages);

    _db.chapters[chapterPath] = {
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
    next();
  });
}

// story infos :
// type: (strip / auto)

const getSubfileStats = path => fs.readdirAsync(path)
  .map(file =>
    fs.statAsync(joinPath(path, file)).then(stat => ({ path, file, stat })));

const getSubDir = path => getSubfileStats(path).filter(f => f.stat.isDirectory());

const imageFilter = filename => /\.(jpe?g|png|gif|webp)$/.test(filename);
function getAllImages(files, chapterPath) {
  let pages = files.filter(imageFilter);
  if (!pages || !pages.length) { return; }
  return _db.chapters[chapterPath] = pages.map(name => ({
    path: joinPath(chapterPath, name),
    name
  }));
}

function openChapter(chapter) {
  const chapterPath = joinPath(chapter.path, chapter.file);
  return fs.readdirAsync(chapterPath).then(files => getAllImages(files, chapterPath));
};

function linkChapterToStory(chapter) {
  if (!_db.stories[chapter.story]) {
    _db.stories[chapter.story] = {
      name: chapter.story,
      chapters: []
    };
  }
  _db.stories[chapter.story].chapters.push(chapter);
}

function storeChapterInFile(src, lang, team, index) {
  if (!(lang in src)) {
    src[lang] = {};
  }

  if (team in src[lang]) {
    return src[lang][team].push(index);
  }
  return src[lang][team] = [ index ];
}

const isStrip = (w, h, r) => (w < 2 && h > 1.5) || r > 1.75;
const fromWebtoon = chapters => {
  var i = -1;
  while (++i < chapters.length) {
    if (/.+webtoons.+/.test(chapters[i].path)) {
      return true;
    }
  }
  return false;
}


function collectStoryData(story) {
  const
    chapters = story.chapters,
    ratio = getMedian(chapters, "ratio").median,
    widthRegularityScore = getMedian(chapters, "widthRegularityScore").median,
    heightRegularityScore = getMedian(chapters, "heightRegularityScore").median;

  console.log("collecting", story.name);

  if (isStrip(widthRegularityScore, heightRegularityScore, ratio) && fromWebtoon(chapters)) {
    story.readingMode = "strip";
  }

  story.files = {};

  _.each(chapters, c => {
    storeChapterInFile(story.files, c.language, c.team, c.name);
  });
  saveStoryData(story);
}

const subDir = cb => (info => getSubDir(joinPath(info.path, info.file)).map(cb));

function start() {
  //       public/assets/     story/ language/ team/ -> chapter :D
  getSubDir(_assetsPath).each(subDir(subDir(subDir(openChapter))))
  .then(() => _.serial(_db.chapters, collectChapterData))
  .then(() => _.each(_db.chapters, linkChapterToStory))
  .then(() => _.each(_db.stories, collectStoryData))
  .then(() => fs.writeFileAsync(joinPath(_assetsPath, "all-data.json"),
    JSON.stringify(_db.all)))
  // .then(() => console.log(_db))
  .catch(console.error);
}

module.exports = {
  getAllImages,
  generateImageData,
  start,
}
