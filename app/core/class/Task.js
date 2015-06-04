/* global Id */

_id = new Id();

function Task(name) {
  this.id = _id.new();
  this.enabled = true;
  this.name = name;
  this.execCountDown = 0;
  this.fnArray = [];
  this.priority = 0;
  this.executeOnce = true;
  this.purge = false;
}

Task.prototype.repeat = function () {
  this.executeOnce = false;
  return this;
}

Task.prototype.delete = function () {
  this.purge = true;
  return this;
}

Task.prototype.norepeat = function () {
  this.executeOnce = true;
  return this;
}

Task.prototype.exec = function() {
  if (this.execCountDown > 0) {
    this.execCountDown--;
    return this;
  }
  var i = -1;
  if (this.enabled) {
    // console.log('task', this.id, this.name);
    while (++i < this.fnArray.length) {
      if (this.fnArray[i].apply(this, arguments) === false) {
        break;
      }
    }
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

Task.prototype.request = function (count) {
  if (typeof count === "number") {
    this.execCountDown = count;
  }
  this.enabled = true;
  return this;
};
