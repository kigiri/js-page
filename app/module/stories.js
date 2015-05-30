/* global JSONLoader, Ajax */

var _store = {};

var $stories = {
  set: function (data) {
    if (_store[data.path] instanceof Ajax) {
      _store[data.path].abort().resolve(data);
    }
    _store[data.path] = data;
  },
  get: function (id, callback) {
    if (_store[id] instanceof Ajax) {
      console.warn("story", id, "is currently loading");
    } else if (!_store[id]) {
      var p = JSONLoader("/assets/"+ id +"/data.json").then(function (data) {
        _store[id] = data;
        callback(data);
      }).catch(console.error.bind(console));
      _store[id] = p;
      return p;
    }
    return callback(_store[id]);
  }
};







