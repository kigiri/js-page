var q = require('bluebird');
["fs"].forEach(lib => q.promisifyAll(require(lib)));
"use strict";


require('./dev/production-builder');
require('./server/image-processor/core.js');
