'use strict'

const path = require('path')

exports.falsy = [ false, null, undefined, '' ]
exports.validDirName = __dirname
exports.invalidDirName = path.join(exports.validDirName, 'aaa')
exports.validFileName = path.basename(__filename)
exports.invalidFileName = path.join(exports.validFileName, 'aaa')
