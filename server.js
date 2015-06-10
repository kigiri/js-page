"use strict";

const q = require('bluebird');
[
  "xml2js",
  "gm",
  "request",
  "fs",
  "mkdirp",
  "path"
].forEach(lib => q.promisifyAll(require(lib)));

const fs = require("fs");

// expand lodash !
function serialClassic(collection, cb) {
  return new q((resolve, reject) => {
    const max = collection.length;
    let
      i = -1,
      returnValues = new Array(max);

    function next() {
      if (++i >= max) {
        resolve(returnValues);
        return false;
      }
      try {
        returnValues[i] = cb.call({next}, collection[i], i, collection);
      } catch (err) { reject(err) }
      return true;
    }
    next();
  });
};

function serialObject(obj, cb) {
  return new q((resolve, reject) => {
    const
      keys = Object.keys(obj),
      max = keys.length;
    let
      i = -1,
      returnValues = new Array(max);

    function next() {
      if (++i >= max) {
        resolve(returnValues);
        return false;
      }
      let key = keys[i];
      try {
        returnValues[i] = cb.call({next}, obj[key], key, obj);
      } catch (err) { reject(err) }
      return true;
    }
    next();
  })
};

let _ = require("lodash");
_.serial = function (collection, cb) {
  const type = typeof collection;
  if (type === "string" || Array.isArray(collection)) {
    return serialClassic(collection, cb);
  }
  if (type === "object") {
    return serialObject(collection, cb);
  }
  throw "Unexpected collection type";
};

_.noExists = function(filepath) {
  return new q((resolve, reject) => {
    fs.accessAsync(filepath).then(reject).catch(err => {
      if (err.code === "ENOENT") {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

