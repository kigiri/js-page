var q = require('bluebird');
["fs"].forEach(lib => q.promisifyAll(require(lib)));


require('./dev/production-builder');
require('./server/image-processor/core.js');
