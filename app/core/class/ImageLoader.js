/* global Ajax */

function ImageLoader(url) {
  var _blob,
      _p = new Ajax("GET", url, null, {
    responseType: 'arraybuffer'
  }).then(function (req) {
    _blob = URL.createObjectURL(new Blob([req.response]), {
      type: Ajax.getContentType(req) || 'image/png'
    })
    return _p.resolve(_blob);
  });
  _p.free = function () { window.URL.revokeObjectURL(_blob); };
  return _p;
}

