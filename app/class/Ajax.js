/* global Promise */

function Ajax(type, url, header, data) {
  Promise.call(this);
  var q = this,
      req = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject('Microsoft.XMLHTTP');


  if (data && typeof data === "object") {
    Object.keys(data).forEach(function (key) {
      req[key] = data[key];
    });
  }

  req.open(type, url, true);

  if (header && typeof header === "object") {
    Object.keys(header).forEach(function (key) {
      req.setRequestHeader(key, header[key]);
    });
  }

  req.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        q.resolve(this);
      } else {
        q.reject(this);
      }
    }
  };

  req.onprogress = function (event) {
    if (q.progressCb instanceof Function) {
      q.progressCb(event);
    }
  };

  req.send(req.body);
  this.req = req;
}

Ajax.prototype = Object.create(Promise.prototype);

Ajax.prototype.onprogress = function(cb) {
  this.progressCb = cb;
  return this;
}

Ajax.prototype.abort = function() {
  this.req.abort();
  return this;
}

Ajax.getContentType = function (req) {
  return req.getAllResponseHeaders().match(/^Content-Type\:\s*(.*?)$/mi)[1];
}

