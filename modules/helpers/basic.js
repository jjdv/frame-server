'use strict'

const path = require('path')
const fs = require('fs')

const Status = require('../classes/status')

/**
 * Builds an absolute filePath. Reports error of path processing via status argument.
 * @param {string} pathDef - path to the file
 * @param {string} [rootDir] - root directory of the provided path
 * @param {string} [varName] - name of the variable built from the file defined by path
 * @param {Status} [status] - status instance for reporting status of path processing
 * @returns {(string|null)} absolute file path in case of success, null in case of error
 */

function filePath(pathDef, rootDir, varName, status) {
  if (!pathDef) return null
  if (!status) status = new Status()

  if (typeof pathDef !== 'string') {
    status.reportErr(`Wrong file path format of '${varName}':`, pathDef)
    return null
  }

  const filePath = path.resolve(rootDir, pathDef)
  if (!fs.existsSync(filePath)) {
    status.reportErr(
      `Cannot find "${filePath}" specified by the '${varName}' as "${pathDef}"`
    )
    return null
  }
  return filePath
}

/**
 * Like [filePath]{@link filePath} but with pathDef as required argument (error is reported if not defined).
 */

function filePathNotEmpty(pathDef, rootDir, varName, status) {
  if (pathDef) return filePath(pathDef, rootDir, varName, status)

  if (!status) status = new Status()
  status.reportErr(
    `The specification of the file path in the '${varName}' cannot be an empty string.`
  )
  return null
}

/**
 * Check if all route paths are valid, i.e. if each route is a string starting with '/' or RegExp
 * @param {(string|string[])} paths - path or array of paths to be verified
 * @param {string} [varName] - name of the variable built using provided paths
 * @param {Status} [status] - status instance for reporting status of paths processing
 * @returns {boolean} true if error, false in case of all valid route paths
 */

function routePathsErr(paths, varName, status) {
  if (!status) status = new Status()

  if (Array.isArray(paths)) {
    if (!paths.length)
      status.reportErr(
        `Empty array as routePaths in the middleware: '${varName}'.`
      )
    for (const path of paths) routePathErr(path, varName, status)
  } else routePathErr(paths, varName, status)

  return status.error
}

/**
 * Checks if name exists and is a non-empty string
 * @param {string} name - instance name of a variable
 * @param {string} varName - variable name
 * @param {*} varDef - value of a variable instance (for reference purposes only)
 * @param {Status} status - status instance for reporting status of name error check
 * @returns {boolean} true if error, false in case of all valid route paths
 */

function nameErr(name, varName, varDef, status) {
  if (!status) status = new Status()

  if (!name)
    status.reportErr(
      `Missing name of the '${varName}' with definition:`,
      varDef
    )
  else if (typeof name !== 'string') {
    status.reportErr(
      `The name of the '${varName}', with definition:`,
      varDef,
      ' must be a string and not: ',
      name
    )
  }

  return status.error
}

/**
 * Gives info if a given value is empty/falsy
 * @param {*} val - value to be exemined if it is empty
 * @returns {boolean} true if value is empty/falsy, false otherwise
 */
function isEmpty(val) {
  if (!val) return true
  if (Array.isArray(val)) return !val.length
  if (typeof val === 'object') return !Object.keys(val).length
  return false
}

module.exports = { filePath, filePathNotEmpty, routePathsErr, nameErr, isEmpty }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

/**
 * Check if route path is valid, i.e. if it is a string starting with '/' or RegExp
 * @private
 */

function routePathErr(path, varName, status) {
  if (typeof path === 'string') {
    if (!path)
      status.reportErr(
        `The specification of the path in '${varName}' cannot be an empty string.`
      )
    else if (path[0] !== '/')
      status.reportErr(
        `Route paths in '${varName}' should be absolute, i.e. start with: '/' but is defined as: '${path}'.`
      )
  } else if (!isRegExp(path))
    status.reportErr(`Wrong path format in '${varName}'.`)
}

/**
 * Checks if value type is of RegExp
 * @private
 */

const isRegExp = val => typeof val === 'object' && val.constructor === RegExp
