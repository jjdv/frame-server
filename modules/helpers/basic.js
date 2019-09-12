// --- start of test purpose code ---
if (global.testReplace && global.testReplace['basic.js']) {
  const replace = global.testReplace['basic.js']
  /* eslint-disable no-global-assign */
  if (replace.__dirname) __dirname = replace.__dirname
  if (replace.require) require = replace.require
  /* eslint-enable no-global-assign */
}
// --- end of test purpose code ---

const fs = require('fs')
const path = require('path')

/**
 * Gives info if a given value is empty/falsy
 * @param {*} val - value to be exemined if it is empty
 * @returns {boolean} true if value is empty/falsy, false otherwise
 */
function isEmpty (val) {
  if (!val) return true
  if (Array.isArray(val)) return !val.length
  if (typeof val === 'object') return !Object.keys(val).length
  return false
}

function isDirectory (filePath) {
  if (!filePath || typeof filePath !== 'string') return false
  return fsStatMethodResultSync('isDirectory', filePath)
}

function isFile (filePath) {
  if (!filePath || typeof filePath !== 'string') return false
  return fsStatMethodResultSync('isFile', filePath)
}

const appRootDirArr = path.resolve(__dirname, '../../..').split(path.sep)
if (appRootDirArr[appRootDirArr.length - 1] === 'node_modules')
  appRootDirArr.pop()
const appRootDir = appRootDirArr.join(path.sep)

module.exports = {
  isEmpty,
  isDirectory,
  isFile,
  appRootDir
}

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function fsStatResultSync (filePath) {
  if (!fs.existsSync(filePath)) return false
  return fs.statSync(filePath)
}

function fsStatMethodResultSync (method, filePath) {
  const stat = fsStatResultSync(filePath)
  return stat ? stat[method]() : false
}
