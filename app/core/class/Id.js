function Id(start) {
  this.previousId = (typeof start === "number") ? start : -1;
}

Id.prototype.new = function() {
  return ++this.previousId;
};
