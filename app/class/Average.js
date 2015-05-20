function Average(arrayLength) {
  this.arrayLength = (arrayLength || 0)
  this.valueArray = new Array(this.arrayLength);
  this.idx = 0;
  this.max = -Infinity;
  this.min = Infinity;
}

Average.prototype.add = function (value) {
  if (value > this.max) { this.max = value; }
  if (value < this.min) { this.min = value; }
  this.valueArray[this.idx] = value;
  this.idx++;
  if (this.arrayLength && this.idx > this.arrayLength) {
    this.idx = 0;
  }
};

Average.prototype.get = function () {
  var value, i = -1, total = 0;

  while ((value = this.valueArray[++i]) !== undefined) {
    total += value;
  }
  return ((total && i) ? total / i : 0);
};
