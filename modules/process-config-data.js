'use strict';

const path = require('path')
const fs = require('fs')

const { validServerMiddlewareIds } = require('../middlewares/server-middleware.def')
const { ErrorBox } = require('./helpers')


module.exports = function processConfigData(config) {
    //let configWrong = false
    const { serverRootDir, serverMiddlewares, siteMiddlewaresDir, serveFileDef, staticFileExt, port, view, noHelmet } = config
    const configError = new ErrorBox

    /*function reportError(...errMsg) {
        console.error(...errMsg)
        configWrong = true
    }*/

    // siteRootDir changed into absolute path and done validity check
    const siteRootDir = config.siteRootDir = path.resolve(serverRootDir, config.siteRootDir)
    if (!fs.existsSync(siteRootDir)) configError.report('Error: Cannot find site root directory:', siteRootDir)

    // serverMiddlewares check
    if (!Array.isArray(serverMiddlewares)) configError.report("Error: The value of 'serverMiddlewares' is not an array: ", serverMiddlewares)
    const invalidServerMiddlewareIds = serverMiddlewares.filter(mId => {
        !validServerMiddlewareIds.includes(typeof mId === 'object' ? mId.name : mId)
    })
    if (invalidServerMiddlewareIds.length) invalidServerMiddlewareIds.forEach(mId => {
        configError.report('Error: Invalid server middleware identifier:', mId)
    })

    // siteMiddlewares check
    let siteMiddlewares = config.siteMiddlewares
    if (siteMiddlewares) {
        if (!Array.isArray(siteMiddlewares)) siteMiddlewares = [ siteMiddlewares ]
        const siteMiddlewaresRootDir = siteMiddlewaresDir ? path.resolve(serverRootDir, siteMiddlewaresDir) : serverRootDir
        config.siteMiddlewares = siteMiddlewares.map(middlewareDef => getMiddleware(middlewareDef, siteMiddlewaresRootDir, 'siteMiddlewares', configError))
    }

    // serveFileDef check. errors, if any, are reported by isServeFileDefWrong()
    if (config.serveFileDef) config.serveFileDef = getServeFileDef(config.serveFileDef, siteRootDir, configError)
    

    // staticFileExt check and, if correct, RegExp for file extensions (extRgx) is generated
    if (Array.isArray(staticFileExt)) 
        if (staticFileExt.find(ext => typeof ext !== 'string') || staticFileExt.find(ext => !ext)) configError.report("Error: Wrong format of the 'staticFileExt':", staticFileExt)
        else config.extRgx = RegExp( staticFileExt.map(ext => `\\.${ext}$`).join('|') )
    else if (!staticFileExt) config.extRgx = null
    else configError.report("Error: Wrong format of the 'staticFileExt':", staticFileExt)
    if (typeof serveFileDef === 'string' && !config.extRgx) configError.report("Error: Missing proper definition of the static file extensions. Required when serveFileDef defines only the file to be served.")
    
    // port check
    if (!Number.isInteger(port)) configError.report('Error: Provided port is not an integer. Specified port:', port)
    
    // view check
    if (view) {
        if (
            view.constructor !== Object || !view.engine || !view.dir ||
            typeof view.engine !== 'string' || (typeof view.dir !== 'string' && !Array.isArray(view.dir))
        ) configError.report('Error: Wrong format of the view definition in the serverr config file:', view)

        if (typeof view.dir === 'string') view.dir = filePath(view.dir, serverRootDir, 'view.dir', configError)
        else view.dir = view.dir.map(dir => filePath(dir, serverRootDir, 'view.dir', configError))
    }
    
    // noHelmet check
    if (typeof noHelmet !== 'boolean') configError.report("Error: Wrong format of the 'noHelmet' parameter in the server config file:", noHelmet)

    if (configError.status) process.exit(9)
    return config
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function getMiddleware(middlewareDef, rootDir, varName, errorHandler) {
    switch (middlewareDef.constructor) {
        case String:
            const mPath = filePath(middlewareDef, rootDir, varName, errorHandler)
            if (mPath) return { middleware: require(mPath) }
            return null
        case Function: return { middleware: middlewareDef }
        case Object: return getMiddlewareObject(middlewareDef, rootDir, varName, errorHandler)
        default:
            errorHandler.report(`Error: Unknown format of ${varName} definition: `, middlewareDef)
            return null
    }
}

function filePath(pathDef, rootDir, varName, errorHandler) {
    if (typeof pathDef !== 'string') errorHandler.report(`Error: Wrong format of ${varName}.`)
    if (!pathDef) errorHandler.report(`Error: The specification of the ${varName} cannot be an empty string.`)

    const filePath = path.resolve(rootDir, pathDef)
    if (!fs.existsSync(filePath)) {
        errorHandler.report(`Error: Cannot find the file "${filePath}" specified by the ${varName} as "${pathDef}"`)
        return null
    }
    return filePath
}

function getMiddlewareObject(middlewareDef, rootDir, varName, errorHandler) {
    switch (middlewareDef.middleware.constructor) {
        default:
            errorHandler.report(`Error: Wrong ${varName}.middleware definition: ${middlewareDef.middleware}`)
            return null
        case String:
            const mPath = filePath(middlewareDef.middleware, rootDir, varName, errorHandler)
            if (!mPath) return null
            middlewareDef.middleware = require(mPath)
        case Function:
    }

    if (middlewareDef.paths && rootPathsErr(middlewareDef.paths, `${varName}.paths`, errorHandler)) return null

    return middlewareDef
}

const isRgx = val => val.constructor === RegExp

function rootPathsErr(paths, varName, errorHandler) {
    if (Array.isArray(paths)) {
        for (let path of paths) if (rootPathErr(path, varName, errorHandler)) return true
        return false
    } else return rootPathErr(paths, varName, errorHandler)
}

function rootPathErr(path, varName, errorHandler) {
    let error = false
    if (typeof path === 'string') {
        if (!path) {
            errorHandler.report(`Error: The specification of the path in ${varName} cannot be an empty string.`)
            error = true
        } else if (path[0] != '/') {
            errorHandler.report(`Error: Route path in ${varName} should be absolute, i.e. start with: '/' but defined as: ${path}`)
            error = true
        }
    } else if (!isRgx(path)) {
        errorHandler.report(`Wrong path format in ${varName}.`)
        error = true
    }
    return error
}

function getServeFileDef(serveFileDef, siteRootDir, errorHandler) {
    if (typeof serveFileDef === 'string') {
        const fPath = filePath(serveFileDef, siteRootDir, 'serveFileDef', errorHandler)
        if (fPath) return { file: fPath }
        else return null
    } else if (serveFileDef.constructor !== Object || !serveFileDef.file) {
        errorHandler.report("Error: Wrong format of serveFileDef: ", serveFileDef)
        return null
    }

    // file def has to be non-empty string
    const fPath = filePath(serveFileDef.file, siteRootDir, 'serveFileDef.file', errorHandler)
    if (fPath) serveFileDef.file = fPath
    else return null

    if (serveFileDef.paths && rootPathsErr(serveFileDef.paths, 'serveFileDef.paths', errorHandler)) return null

    return serveFileDef
}
