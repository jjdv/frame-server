'use strict'

const fs = require('fs')

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
  return fsStatMethodResult('isDirectory', filePath)
}

function isFile (filePath) {
  return fsStatMethodResult('isFile', filePath)
}

module.exports = {
  isEmpty,
  isDirectory,
  isFile
}

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function fsStatSyncResult (filePath) {
  if (!fs.existsSync(filePath)) return false
  return fs.statSync(filePath)
}

function fsStatMethodResult (method, filePath) {
  const stat = fsStatSyncResult(filePath)
  return stat ? stat[method]() : false
}
