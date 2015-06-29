var fs = require("fs"),
  APP_DIR = require('path').dirname(require.main.filename),
  zlib = require("zlib"),
  title = "Popopooo",
  jsBuilder = require('./javascript-builder');

function sizeOf(bytes) {
  if (!bytes) { return { ammount: '--', unit: '  ' }; }
  var e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes/Math.pow(1024, e)).toFixed(2) + ' KMGTP'.charAt(e||0)+'B';
}

function renderCss() {
  return fs.readFileSync(APP_DIR +'/app/core/main.css');
}

function renderJs() {
  return jsBuilder.compile();
}

function buildCore(jsCode) {
  var htmlText = [
    '<!DOCTYPE html><html><head>',
    '<title>'+ title +'</title>',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
    '<link rel="shortcut icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAADAFBMVEUAAABGCKkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6cq4bAAABAHRSTlMA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXgXLUgAAARtJREFUeNoBEAHv/gABAQAAAAAAAAAAAAAAAAEBAAEBAAAAAAAAAAAAAAAAAQEAAAAAAAAAAQEBAQAAAAAAAAAAAAAAAAABAQEBAAAAAAAAAAEBAAAAAAAAAAAAAAAAAQEAAQEAAAAAAAAAAAAAAAABAQAAAAAAAQEAAAAAAQEAAAAAAAAAAAABAQAAAAABAQAAAAAAAAAAAAEBAAAAAAEBAAAAAAAAAAAAAQEAAAAAAQEAAAAAAAAAAQEAAAEBAQEAAAEBAAAAAAABAQAAAQEBAQAAAQEAAAAAAAEBAQEAAAAAAQEBAQAAAAAAAQEBAQAAAAABAQEBAAAAAAAAAAAAAQEBAQAAAAAAAAAAAAAAAAABAQEBAAAAAAAAJ1AAUeGoJb0AAAAASUVORK5CYII=">',
    '<style type="text/css">'+ renderCss() +'</style>',
    '</head><body onload="__init__()"><div id="size" style="visibility:hidden; position:fixed; right:0; bottom:0"></div>',
    '<script type="text/javascript">',
    'var __loadStories__ = '+ fs.readFileSync(APP_DIR +'/public/assets/all-data.json') +';',
    'var __ = {}; function __init__() {',
    jsCode,
    '};',
    '</script>',
    '</body></html>'
  ].join('\n');

  var size = zlib.gzipSync(htmlText).length;
  var originalSize = Buffer.byteLength(htmlText);
  var compression = Math.round((originalSize / size) * 100) + '%';
  console.log("original size: "+ sizeOf(originalSize) +" final size: "+ sizeOf(size)
    +" so ~"+ (size > 14000
      ? sizeOf(size - 14000) +" over 14 kb, try reduce it !"
      : sizeOf(14000 - size) +" left under 14 kb, great job."),
    "("+ compression +" compression rate)");
  fs.writeFileAsync(APP_DIR +'/public/index.html', htmlText);
}

function buildPage() {
  var js = renderJs();
  buildCore(js.core);
  Object.keys(js).filter(key => key !== "core").forEach(key => {
    fs.writeFileAsync(APP_DIR +'/public/'+ key +'.js', js[key]);
  });
}

jsBuilder.setCallback(buildPage);

buildPage();
