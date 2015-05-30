var root = this, skip = function () {};

function Promise(thisArg) {
  this.tasks = [];
  this.catchCallback = skip;
  this.thisArg = thisArg || root;
}

Promise.prototype.resolve = function () {
  if (!this.tasks.length) { return; }
  try {
    this.tasks.shift().apply(this.thisArg, arguments);
  } catch (err) {
    this.catchCallback.apply(this.thisArg, err);
  }
};

Promise.prototype.reject = function () {
  this.catchCallback.apply(this.thisArg, arguments);
};

Promise.prototype.bind = function (thisArg) {
  this.thisArg = thisArg;
  return this;
};

Promise.prototype.catch = function (fn) {
  this.catchCallback = fn;
  return this;
};

Promise.prototype.then = function (fn) {
  this.tasks.push(fn);
  return this;
};
