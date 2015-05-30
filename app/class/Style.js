/* skip */

function  Style(style, data) {
  var keys = Object.keys(data);
  this.list = {};
  this.keys = keys;
  this.count = keys.length;
  keys.forEach(function (key) {
    style[key] = data[key];
    this[key] = false;
  }.bind(this.list));
  this.data = data;
  this.style = style;
  this.noChanges = true;
}

Style.prototype.add = function (key, value) {
  this.keys.push(key);
  this.count = this.keys.length;
  this.list[key] = true;
  this.data[key] = key;
  return this;
};

Style.prototype.set = function (key, value) {
  switch (this.data[key]) {
    case undefined:
      this.add(key, value);
      this.noChanges = false;
    return true;
    case value:
      this.data[key] = value;
      this.list[key] = true;
      this.noChanges = false;
    return true;
    default: return false;
  }
};

Style.prototype.apply = function () {
  if (this.noChanges) { return this; }
  var i = -1, key;
  while (++i < this.count) {
    key = this.keys[i];
    if (this.list[key] === true) {
      this.style[key] = this.data[key];
      this.list[key] = false;
    }
  }
  return this;
};

Style.prototype.gen = function () {
  return { style: this.data };
};
