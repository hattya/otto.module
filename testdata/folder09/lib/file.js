module.exports = require('../../file04');
for (var i = 1; i < 9; i++) {
  Array.prototype.push.apply(module.exports, require('../../folder0' + i));
}
module.exports.push('folder09/lib/file.js');
