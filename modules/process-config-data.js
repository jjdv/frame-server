'use strict';

const path = require('path')
const fs = require('fs')

const { rootDir } = require('./helpers')
const { validServerMiddlewareIds } = require('../middlewares/server-middleware.def')

module.exports = function processConfigData(config) {
    let configWrong = false
    const { serverMiddlewares, siteMiddlewares, serveFileDef, staticFileExt, port, view, noHelmet } = config

    function reportError(...errMsg) {
        console.error(...errMsg)
        configWrong = true
    }

    // siteRoot changed into absolute path and done validity check
    const siteRoot = config.siteRoot = path.resolve(rootDir, config.siteRoot)
    if (!fs.existsSync(siteRoot)) reportError('Error: Cannot find site root directory:', siteRoot)

    // serverMiddlewares check
    if (!Array.isArray(serverMiddlewares)) reportError("Error: The value of 'serverMiddlewares' is not an array: ", serverMiddlewares)
    const invalidServerMiddlewareId = serverMiddlewares.find(mId => !validServerMiddlewareIds.includes(mId))
    if (invalidServerMiddlewareId) reportError('Error: Invalid server middleware identifier:', invalidServerMiddlewareId)

    // siteMiddlewares check
    if (siteMiddlewares) {
        if (!Array.isArray(siteMiddlewares)) siteMiddlewares = [ siteMiddlewares ]
        config.siteMiddlewares = siteMiddlewares.map(middlewareDef => getMiddleware(middlewareDef, 'siteMiddlewares', reportError))
    }

    // serveFileDef check. errors, if any, are reported by isServeFileDefWrong()
    if (config.serveFileDef) config.serveFileDef = getServeFileDef(config.serveFileDef, siteRoot, reportError)
    

    // staticFileExt check and, if correct, RegExp for file extensions (extRgx) is generated
    if (Array.isArray(staticFileExt)) 
        if (staticFileExt.find(ext => typeof ext !== 'string') || staticFileExt.find(ext => !ext)) reportError("Error: Wrong format of the 'staticFileExt':", staticFileExt)
        else config.extRgx = RegExp( staticFileExt.map(ext => `\\.${ext}$`).join('|') )
    else if (!staticFileExt) config.extRgx = null
    else reportError("Error: Wrong format of the 'staticFileExt':", staticFileExt)
    if (typeof serveFileDef === 'string' && !config.extRgx) reportError("Error: Missing proper definition of the static file extensions. Required when serveFileDef defines only the file to be served.")
    
    // port check
    if (!Number.isInteger(port)) reportError('Error: Provided port is not an integer. Specified port:', port)
    
    // view check
    if (view) {
        if (
            view.constructor !== Object || !view.engine || !view.dir ||
            typeof view.engine !== 'string' || (typeof view.dir !== 'string' && !Array.isArray(view.dir))
        ) reportError('Error: Wrong format of the view definition in the serverr config file:', view)

        if (typeof view.dir === 'string') view.dir = filePath(view.dir, rootDir, 'view.dir', reportError)
        else view.dir = view.dir.map(dir => filePath(dir, rootDir, 'view.dir', reportError))
    }
    
    // noHelmet check
    if (typeof noHelmet !== 'boolean') reportError("Error: Wrong format of the 'noHelmet' parameter in the server config file:", noHelmet)

    if (configWrong) process.exit(9)
    return config
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function getMiddleware(middlewareDef, varName, reportError) {
    switch (middlewareDef.constructor) {
        case String:
            const mPath = filePath(middlewareDef, rootDir, varName, reportError)
            if (mPath) return { middleware: require(mPath) }
            return null
        case Function: return { middleware: middlewareDef }
        case Object: return getMiddlewareObject(middlewareDef, varName, reportError)
        default:
            reportError(`Error: Unknown format of ${varName} definition: `, middlewareDef)
            return null
    }
}

function filePath(pathDef, rootDir, varName, reportError) {
    if (typeof pathDef !== 'string') reportError(`Error: Wrong format of ${varName}.`)
    if (!pathDef) reportError(`Error: The specification of the ${varName} cannot be an empty string.`)

    const filePath = path.resolve(rootDir, pathDef)
    if (!fs.existsSync(filePath)) {
        reportError(`Error: Cannot find the file "${filePath}" specified by the ${varName} as "${pathDef}"`)
        return null
    }
    return filePath
}

function getMiddlewareObject(middlewareDef, varName, reportError) {
    switch (middlewareDef.middleware.constructor) {
        default:
            reportError(`Error: Wrong ${varName}.middleware definition: ${middlewareDef.middleware}`)
            return null
        case String:
            const mPath = filePath(middlewareDef.middleware, rootDir, varName, reportError)
            if (!mPath) return null
            middlewareDef.middleware = require(mPath)
        case Function:
    }

    if (middlewareDef.paths && rootPathsErr(middlewareDef.paths, `${varName}.paths`, reportError)) return null

    return middlewareDef
}

const isRgx = val => val.constructor === RegExp

function rootPathsErr(paths, varName, reportError) {
    if (Array.isArray(paths)) {
        for (let path of paths) if (rootPathErr(path, varName, reportError)) return false
        return true
    } else return rootPathErr(paths, varName, reportError)
}

function rootPathErr(path, varName, reportError) {
    let error = false
    if (typeof path === 'string') {
        if (!path) {
            reportError(`Error: The specification of the path in ${varName} cannot be an empty string.`)
            error = true
        } else if (path[0] != '/') {
            reportError(`Error: Route path in ${varName} should be absolute, i.e. start with: '/' but defined as: ${path}`)
            error = true
        }
    } else if (!isRgx(path)) {
        reportError(`Wrong path format in ${varName}.`)
        error = true
    }
    return error
}

function getServeFileDef(serveFileDef, siteRoot, reportError) {
    if (typeof serveFileDef === 'string') {
        const fPath = filePath(serveFileDef, siteRoot, 'serveFileDef', reportError)
        if (fPath) return { file: fPath }
        else return null
    } else if (serveFileDef.constructor !== Object || !serveFileDef.file) {
        reportError("Error: Wrong format of serveFileDef: ", serveFileDef)
        return null
    }

    // file def has to be non-empty string
    const fPath = filePath(serveFileDef.file, siteRoot, 'serveFileDef.file', reportError)
    if (fPath) serveFileDef.file = fPath
    else return null

    if (serveFileDef.paths && rootPathsErr(serveFileDef.paths, 'serveFileDef.paths', reportError)) return null

    return serveFileDef
}
