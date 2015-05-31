/* global Id */

_id = new Id();

function Task() {
  this.id = _id.new();
  this.enabled = true;
  this.execCount = 0;
  this.fnArray = [];
  this.priority = 0;
  this.executeOnce = true;
}

Task.prototype.repeat = function () {
  this.executeOnce = false;
}

Task.prototype.norepeat = function () {
  this.executeOnce = true;
}

Task.prototype.exec = function() {
  var i = -1;
  if (this.enabled) {
    console.log("task id", this.id, "enabled");
    while (++i < this.fnArray.length) {
      if (this.fnArray[i].apply(this, arguments) === false) {
        break;
      }
    }
    this.execCount++;
  }
  if (this.executeOnce) {
    this.enabled = false;
  }
  return this;
};

Task.prototype.sub = function (fn) {
  var i = -1;
  while (++i < this.fnArray.length) {
    if (this.fnArray[i] === fn) { return; }
  }
  this.fnArray.push(fn);
  return this;
};

Task.prototype.unsub = function (fn) {
  var i = -1;
  while (++i < this.fnArray.length) {
    if (this.fnArray[i] === fn) {
      this.fnArray.splice(i, 1);
    }
  }
  return this;
};

Task.prototype.setPriority = function (n) {
  this.priority = n;
  return this;
};

Task.prototype.cancel = function () {
  this.enabled = false;
  return this;
};

Task.prototype.request = function () {
  this.enabled = true;
  return this;
};
