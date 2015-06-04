/* global JSONLoader, Ajax */

var _store = {}, err = console.error.bind(console);

function load(id, callback) {
  var p = JSONLoader("/assets/"+ id +"/data.json").then(function (data) {
    _store[id] = data;
    if (typeof callback === "function") {
      callback(data);
    }
    this.resolve();
  }).catch(err);
  _store[id] = p;
  return p;
}

var $stories = {
  set: function (data) {
    if (_store[data.path] instanceof Ajax) {
      _store[data.path].abort().resolve(data);
    }
    _store[data.path] = data;
  },
  prepare: function (id) {
    if (!_store[id]) {
      load(id);
    }
  },
  get: function (id, callback) {
    if (_store[id] instanceof Ajax) {
      _store[id].then(callback);
    } else if (!_store[id]) {
      return load(id, callback);
    }
    return callback(_store[id]);
  }
};







