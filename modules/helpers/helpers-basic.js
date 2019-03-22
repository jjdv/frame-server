'use strict'

const path = require('path')
const fs = require('fs')

const Status = require('../classes/class-status')

function filePath (pathDef, rootDir, varName, status) {
  if (!pathDef) return null
  if (typeof pathDef !== 'string') {
    status.reportErr(`Error: Wrong file path format of ${varName}.`)
    return null
  }

  const filePath = exports.filePath = path.resolve(rootDir, pathDef)
  if (!fs.existsSync(filePath)) {
    status.reportErr(`Error: Cannot find "${filePath}" specified by the ${varName} as "${pathDef}"`)
    return null
  }
  return filePath
}

function filePathNotEmpty (pathDef, rootDir, varName, status) {
  if (pathDef) return filePath(pathDef, rootDir, varName, status)

  status.reportErr(`Error: The specification of the file path in the ${varName} cannot be an empty string.`)
  return null
}

function routePathsErr (paths, varName, status) {
  const intStatus = new Status()
  if (Array.isArray(paths)) {
    for (let path of paths) routePathErr(path, varName, intStatus)
    return false
  } else routePathErr(paths, varName, intStatus)

  if (intStatus.error) status.reportErr()
  return intStatus.error
}

function checkName (name, varName, varValue, statusPar) {
  const status = statusPar || new Status()

  if (!name) status.reportErr(`Error: Missing name of the ${varName}: `, varValue)
  else if (typeof name !== 'string') { status.reportErr(`Error: The name of the ${varName} must be a string and not: `, varName) }

  return status.error
}

function isEmpty (val) {
  if (typeof val === 'object') return !Object.keys(val).length
  if (Array.isArray(val)) return !val.length
  return !val
}

module.exports = { filePath, filePathNotEmpty, routePathsErr, checkName, isEmpty }

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function routePathErr (path, varName, status) {
  if (typeof path === 'string') {
    if (!path) status.reportErr(`Error: The specification of the path in ${varName} cannot be an empty string.`)
    else if (path[0] !== '/') status.reportErr(`Error: Route paths in ${varName} should be absolute, i.e. start with: '/' but is defined as: ${path}`)
  } else if (!isRegExp(path)) status.reportErr(`Wrong path format in ${varName}.`)
}

const isRegExp = val => typeof val === 'object' && val.constructor === RegExp
