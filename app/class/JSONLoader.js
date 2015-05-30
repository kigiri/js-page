/* global Ajax */

function JSONLoader(url) {
  var p = new Ajax("GET", url).then(function (req) {
    try {
      p.resolve(JSON.parse(req.responseText), req);
    } catch (err) {
      p.reject(err);
    }
  })
  return p;
}
