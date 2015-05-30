const _ = require("lodash"),
      $sizeOf = require('bluebird').promisify(require('image-size')),
      $path = require('path'),
      $fs = require('fs'),
      $readDir = $fs.readdirAsync,
      $readFile = $fs.readFileAsync,
      $write = $fs.writeFileAsync,
      APP_DIR = $path.dirname(require.main.filename),
      IMG_DIR = $path.join(APP_DIR, 'public/assets');

function getTeamChapters(storypath, teampath) {
  let dirpath = $path.join(storypath, teampath);

  return $readDir(dirpath)
  .map((chapterpath, index) => {
    const joinedPath = $path.join(dirpath, chapterpath);
    return $readDir(joinedPath).map((filename, index) => {
      return $sizeOf($path.join(joinedPath, filename)).then(d => ({
        index,
        path: filename,
        height: d.height,
        width: d.width
      }));
    }).then(pages => {
      let p, i = -1, isOdd = false;

      while (++i < pages.length) {
        p = pages[i];
        if (p.width > p.height) {
          isOdd = (p.index % 2 !== 0);
          break;
        }
      }
      return { isOdd, path: chapterpath, pages };
    });
  })
  .then(chapterArray => {
    chapterArray.sort((a, b) => {
      const aInt = parseInt(a.path),
            bInt = parseInt(b.path);

      if (aInt < bInt) { return -1; }
      if (aInt > bInt) { return  1; }
      return a.path < b.path ? -1 : 1;
    }).forEach((e, i) => e.index = i)
    return chapterArray;
  });
}

function openStory(story) {
  let basepath = $path.join(IMG_DIR, story.path);
  $readDir(basepath)
  .filter(filename => !/\.(json|html)$/i.test(filename))
  .each(subdir => {
    return getTeamChapters(basepath, subdir)
    .then(chapters => {
      story.teams[subdir] = { chapters };
    });
  }).then(() => {
    story = JSON.stringify(story);
    // $readFile(APP_DIR +'/public/index.html', {encoding: "utf-8"})
    // .then(txt => {
    //   let s = story.replace(/"([a-z0-9]+)":/ig, '$1:');
    //   txt = txt.replace('/\* __\$\$__ \*/', `\n__.$stories.set(${s});`);
    //   $write($path.join(basepath, "index.html"), txt);
    // });
    $write($path.join(basepath, "data.json"), story);
  })
  .catch(console.error.bind(console));
}


// "all-you-need-is-kill/01/01.jpg"
  // -> "story.json"
openStory({
  title: "All You Need Is Kill", // String
  path: _.deburr(_.kebabCase("All You Need Is Kill")), // String
  type: "manga", // StoryType ["manga", "manhua", "manwa", "manfra", "comic", "graphicnovel", "lightnovel"]
  ongoing: false, // Boolean
  description: "",
  genre: [
    "Action",
    "Mature",
    "Mecha",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-fi",
    "Seinen",
    "Tragedy"
  ],
  year: 2014,
  rating: 8.5,
  tags: [
    { score:  1, name: "Antihero / Heroine" },
    { score:  1, name: "Award-Nominated Work" },
    { score:  1, name: "Blood and Gore" },
    { score:  1, name: "Death of Loved One/s" },
    { score:  1, name: "Future" },
    { score:  1, name: "Japan" },
    { score:  1, name: "Older Male Younger Female" },
    { score:  1, name: "Strategic Minds" },
    { score:  1, name: "Strong Male Lead" },
    { score:  1, name: "Young Male Lead "},
    { score:  2, name: "Death" },
    { score:  2, name: "Strong Female Lead" },
    { score:  2, name: "Survival" },
    { score:  2, name: "Violence" },
    { score:  2, name: "War/s" },
    { score:  2, name: "Warriors" },
    { score:  8, name: "Flashbacks" },
    { score:  9, name: "Adapted to Live Action" },
    { score: 10, name: "Sacrifice/s" },
    { score: 10, name: "Suicide/s" },
    { score: 11, name: "Kill or Be Killed Situation" },
    { score: 13, name: "Godly Powers" },
    { score: 16, name: "Immortality" },
    { score: 16, name: "Romantic Subplot" },
    { score: 16, name: "Trainer-Trainee Relationship" },
    { score: 18, name: "Cool Female Lead" },
    { score: 19, name: "Dark Ambience" },
    { score: 21, name: "Adapted to Movie" },
    { score: 22, name: "Beautiful Female Lead" },
    { score: 22, name: "Determined Protagonist" },
    { score: 22, name: "Gun/s" },
    { score: 23, name: "Saving the World" },
    { score: 25, name: "Time Loop" },
    { score: 26, name: "Invaders" },
    { score: 26, name: "Invasion/s" },
    { score: 26, name: "Training" },
    { score: 27, name: "Resurrection" },
    { score: 27, name: "Soldier/s" },
    { score: 28, name: "Female Fighter/s" },
    { score: 29, name: "Power Suit" },
    { score: 29, name: "Weak to Strong" },
    { score: 30, name: "Alien/s" },
    { score: 30, name: "Based on a Novel" },
    { score: 31, name: "Military" },
    { score: 31, name: "Second Chances" }
  ],
  teams: {}
});
