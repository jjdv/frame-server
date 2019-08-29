'use strict'

if (process.env.testScope === 'server.config.ini') {
  // eslint-disable-next-line no-global-assign
  __dirname = process.env.testDirname
}

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

function argValue (argName, argNameAlt) {
  if (!argName || process.argv.length < 4) return undefined

  let argIndex = process.argv.indexOf(argName, 2)
  if (argIndex === -1 && argNameAlt) {
    argIndex = process.argv.indexOf(argNameAlt, 2)
  }
  const argValue =
    ++argIndex && process.argv.length > argIndex && process.argv[argIndex]

  return argValue || undefined
}

function getServerRootDir () {
  const serverDirs = path.resolve(__dirname, '../../..').split(path.sep)
  if (serverDirs[serverDirs.length - 1] === 'node_modules') serverDirs.pop()
  return serverDirs.join(path.sep)
}

function findFileInDirs (root, dirs, fileName) {
  let confPath
  for (const dir of dirs) {
    confPath = path.resolve(root, dir, fileName)
    if (isFile(confPath)) return confPath
  }
  return undefined
}

module.exports = {
  isEmpty,
  isDirectory,
  isFile,
  argValue,
  getServerRootDir,
  findFileInDirs
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
