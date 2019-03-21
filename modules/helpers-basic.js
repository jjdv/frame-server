'use strict';

const path = require('path')
const fs = require('fs')

const Status = require('./class-status')

const filePath = exports.filePath = function(pathDef, rootDir, varName, status) {
    if (!pathDef) return null
    if (typeof pathDef !== 'string') {
        status.report(`Error: Wrong file path format of ${varName}.`)
        return null
    }

    const filePath = path.resolve(rootDir, pathDef)
    if (!fs.existsSync(filePath)) {
        status.report(`Error: Cannot find "${filePath}" specified by the ${varName} as "${pathDef}"`)
        return null
    }
    return filePath
}

exports.filePathNotEmpty = function(pathDef, rootDir, varName, status) {
    if (pathDef) return filePath(pathDef, rootDir, varName, status)

    status.report(`Error: The specification of the file path in the ${varName} cannot be an empty string.`)
    return null
}

exports.routePathsErr = function(paths, varName, status) {
    const intStatus = new Status
    if (Array.isArray(paths)) {
        for (let path of paths) routePathErr(path, varName, intStatus)
        return false
    } else routePathErr(paths, varName, intStatus)

    if (intStatus.error) status.reportErr()
    return intStatus.error
}
/*
exports.applyMiddleware = function(middlewareDef, app) {
    if (middlewareDef.routePaths) app.use(middlewareDef.routePaths, middlewareDef.middleware)
    else app.use(middlewareDef.middleware)
}*/

exports.checkName  = function(name, varName, varValue, statusPar) {
    const status = statusPar ? statusPar : new Status
    
    if (!name) status.reportErr(`Error: Missing name of the ${varName}: `, varValue)
    else if (typeof name !== 'string')
        status.reportErr(`Error: The name of the ${varName} must be a string and not: `, varName)
    
    return status.error
}

exports.isEmpty = function(val) {
    if (typeof val === 'object') return !!Object.keys(val).length
    if (Array.isArray(val)) return !!val.length
    return !!val
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function routePathErr(path, varName, status) {
    if (typeof path === 'string') {
        if (!path) intStatus.report(`Error: The specification of the path in ${varName} cannot be an empty string.`)
        else if (path[0] != '/') intStatus.report(`Error: Route paths in ${varName} should be absolute, i.e. start with: '/' but is defined as: ${path}`)
    } else if (!isRegExp(path)) intStatus.report(`Wrong path format in ${varName}.`)
}

const isRegExp = val => val.constructor === RegExp
