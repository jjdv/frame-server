'use strict';

const path = require('path')
const fs = require('fs')
const express = require('express')

const { validServerMiddlewareIds } = require('../middlewares/server-middleware.def')
const { ErrorBox, getMiddleware, filePathNotEmpty } = require('./helpers')


module.exports = function processConfigData(config) {
    const { serverRootDir, serverMiddlewares, siteMiddlewaresDir, serveFileDef, staticFileExt, port, view, noHelmet } = config
    const configError = new ErrorBox

    // siteRootDir changed into absolute path and done validity check
    const siteRootDir = config.siteRootDir = path.resolve(serverRootDir, config.siteRootDir)
    if (!fs.existsSync(siteRootDir)) configError.report('Error: Cannot find site root directory:', siteRootDir)
    
    // view check
    if (view) processView(view, serverRootDir, configError)
    
    // noHelmet check
    if (typeof noHelmet !== 'boolean') configError.report("Error: The 'noHelmet' parameter in the server config file is not boolean but:", noHelmet)

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
        config.siteMiddlewares = siteMiddlewares.map(middlewareDef => getSiteMiddleware(middlewareDef, siteMiddlewaresRootDir, configError))
    }

    // serveDynamicFiles check
    let serveDynamicFiles = config.serveDynamicFiles
    if (serveDynamicFiles) {
        if (!Array.isArray(serveDynamicFiles)) serveDynamicFiles = [ serveDynamicFiles ]
        config.serveDynamicFiles = serveDynamicFiles.map(fileDef => getDymamicFileDef(fileDef, siteRootDir, configError))
    }

    // serveStaticFiles check
    let serveStaticFiles = config.serveStaticFiles
    if (serveStaticFiles) {
        if (!Array.isArray(serveStaticFiles)) serveStaticFiles = [ serveStaticFiles ]
        config.serveStaticFiles = serveStaticFiles.map(dirMiddleware => getStaticFileDef(dirMiddleware, serverRootDir, configError))
    }

    // wrongRequestHandler check
    if (config.wrongRequestHandler) config.wrongRequestHandler = getWrongRequestHandler(config.wrongRequestHandler, serverRootDir, configError)
    else config.wrongRequestHandler = (req, res) => res.sendStatus(404)

    // port check
    if (!Number.isInteger(port)) configError.report('Error: Provided port is not an integer. Specified port:', port)

    if (configError.status) process.exit(9)
    return config
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function processView(view, serverRootDir, errorHandler) {
    if (view.constructor !== Object) errorHandler.report('Error: Wrong format of the view definition in the server config file:', view)
    if (view.engine) {
        if (typeof view.engine !== 'string')
            errorHandler.report('Error: view.engine in the server config file must be a string, not: ', view.engine)
    }
    if (view.dir) {
        if (typeof view.dir === 'string') view.dir = filePathNotEmpty(view.dir, serverRootDir, 'view.dir', errorHandler)
        if (Array.isArray(view.dir)) view.dir = view.dir.map(dir => filePathNotEmpty(dir, serverRootDir, 'view.dir', errorHandler))
        else errorHandler.report('Error: view.dir in the server config file must be a string or an array, not: ', view.dir)
    }
}

function getSiteMiddleware(middlewareDef, rootDir, errorHandler) {
    switch (middlewareDef.constructor) {
        case String:
            const mPath = filePathNotEmpty(middlewareDef, rootDir, 'siteMiddlewares', errorHandler)
            if (mPath) return { middleware: require(mPath) }
            return null
        case Function: return { middleware: middlewareDef }
        case Object: return getSiteMiddlewareObject(middlewareDef, rootDir, 'siteMiddlewares', errorHandler)
        default:
            errorHandler.report("Error: Unknown format of 'siteMiddlewares' definition: ", middlewareDef)
            return null
    }
}

function getSiteMiddlewareObject(middlewareDef, rootDir, errorHandler) {
    switch (middlewareDef.middleware.constructor) {
        default:
            errorHandler.report(`Error: Wrong siteMiddlewares.middleware definition: ${middlewareDef.middleware}`)
            return null
        case String:
            const mPath = filePathNotEmpty(middlewareDef.middleware, rootDir, 'siteMiddlewares', errorHandler)
            if (!mPath) return null
            middlewareDef.middleware = require(mPath)
        case Function:
    }

    if (middlewareDef.routePaths && routePathsErr(middlewareDef.routePaths, 'siteMiddlewares.routePaths', errorHandler)) return null

    return middlewareDef
}

function getDymamicFileDef(fileDef, siteRootDir, errorHandler) {
    if (fileDef.constructor !== Object) errorHandler.report('Error: serveDynamicFiles must be an object, not:', fileDef)
    else if (!fileDef.routePaths) errorHandler.report('Error: Missing serveDynamicFiles.routePaths definition.')
    else if (!fileDef.name) errorHandler.report('Error: Missing serveDynamicFiles.name definition.')
    else if (!routePathsErr(fileDef.routePaths, 'serveDynamicFiles.routePaths', errorHandler)) {
        const filePath = filePathNotEmpty(fileDef.name, siteRootDir, 'serveDynamicFiles.name', errorHandler)
        if (filePath) return {routePaths: file.routePaths, handler: fileHandler(filePath), filePath: filePath}
    }
    return null
}

function fileHandler(filePath) {
    return ((req, res) => res.sendFile(filePath))
}

function getStaticFileDef(dirMiddleware, serverRootDir, errorHandler) {
    if (dirMiddleware.constructor !== Object) errorHandler.report('Error: serveStaticFiles must be an object, not:', dirMiddleware)
    else if (!dirMiddleware.dir) errorHandler.report('Error: Missing serveStaticFiles.dir definition.')
    else if (dirMiddleware.options && dirMiddleware.options.constructor !== Object)
        errorHandler.report('Error: Wrong format of serveStaticFiles.options: ', serveStaticFiles.options)
    else if (!dirMiddleware.routePaths || !routePathsErr(dirMiddleware.routePaths, 'serveStaticFiles.routePaths', errorHandler)) {
        return {
            routePaths: dirMiddleware.routePaths,
            middleware: express.static(
                path.resolve(serverRootDir, dirMiddleware.dir),
                dirMiddleware.options ? dirMiddleware.options : {}
            )
        }
    }
    return null
}

function getWrongRequestHandler(wrongRequestHandlerDef, serverRootDir, errorHandler) {
    switch (wrongRequestHandlerDef.constructor) {
        case String:
            const mPath = filePathNotEmpty(wrongRequestHandlerDef, serverRootDir, 'wrongRequestHandler', errorHandler)
            if (mPath) return require(mPath)
            return null
        case Function: return wrongRequestHandlerDef
        default:
            errorHandler.report("Error: Unknown format of 'wrongRequestHandler' definition: ", wrongRequestHandlerDef)
            return null
    }
}
