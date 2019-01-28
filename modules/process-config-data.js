'use strict';

const path = require('path')
const fs = require('fs')

const { rootDir } = require('./helpers')

module.exports = function processConfigData(config) {
    let configWrong = false
    const { siteMiddleware, serveFileDef, staticFileExt, port, view, noHelmet } = config

    function reportError(...errMsg) {
        console.error(...errMsg)
        configWrong = true
    }

    // siteRoot changed into absolute path and done validity check
    const siteRoot = config.siteRoot = path.resolve(rootDir, config.siteRoot)
    if (!fs.existsSync(siteRoot)) reportError('Error: Cannot find site root directory:', siteRoot)

    // siteMiddleware check
    if (siteMiddleware && !fs.existsSync(siteMiddleware)) reportError('Error: Site middleware is specified but cannot find its file: ', siteMiddleware)

    // serveFileDef check. errors, if any, are reported by isServeFileDefWrong()
    if (isServeFileDefWrong(serveFileDef)) configWrong = true
    else {
        const serveFile = typeof serveFileDef === 'string' ? serveFileDef : serveFileDef.file
        const  filePath = path.resolve(siteRoot, serveFile)
        if (!fs.existsSync(filePath)) reportError("Error: Defined file in 'serveFileDef' was not found")
        else {
            if (typeof serveFileDef === 'string') config.serveFileDef = filePath
            else config.serveFileDef.file = filePath
        }
    }

    // staticFileExt check and, if correct, RegExp for file extensions (extRgx) is generated
    if (!Array.isArray(staticFileExt) || staticFileExt.find(ext => typeof ext !== 'string')) reportError("Error: Wrong format of the 'staticFileExt'.")
    else config.extRgx = RegExp( staticFileExt.map(ext => `\\.${ext}$`).join('|') )
    if (typeof serveFileDef === 'string' && !config.extRgx) reportError("Error: Missing proper definition of the static file extensions. Required when serveFileDef defines only the file to be served.")
    
    // port check
    if (!Number.isInteger(port)) reportError('Error: Provided port is not an integer. Specified port: ', port)
    
    // view check
    if (view) {
        if (
            view.constructor !== Object || !view.engine || !view.dir ||
            typeof view.engine !== 'string' || typeof view.dir !== 'string'
        ) reportError('Error: Wrong format of the view definition in the serverr config file: ', view)
        const viewDir = path.resolve(siteRoot, view.dir)
        if (!fs.existsSync(viewDir)) reportError('Error: Provided views directory in the serverr config file does not exist: ', view.dir)
    }
    
    // noHelmet check
    if (typeof noHelmet !== 'boolean') reportError(
        "Error: Wrong format of the 'noHelmet' parameter in the server config file: ", noHelmet
    )

    if (configWrong) process.exit(9)
    return config
}


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function isRgx(val) {
    return typeof val === 'object' && typeof val.multiline === 'boolean'
}

function isPathWrong(path) {
    if (typeof path === 'string') {
        if (!path) return {stringEmpty: true}
    } else if (!isRgx(path)) return {pathFormatWrong: true}
    return false
}

function isServeFileDefWrong(serveFileDef) {
    let configWrong = false

    function reportError(errMsg) {
        console.error(errMsg)
        configWrong = true
    }

    if (typeof serveFileDef === 'string') {
        // string is ok but it cannot be empty
        if (!serveFileDef) reportError("Error: The specification of the 'serveFileDef' cannot be an empty string.")
    } else {
        // if not string it has to be object
        if (typeof serveFileDef !== 'object' || serveFileDef.constructor !== Object || typeof serveFileDef.file !== 'string') reportError("Error: Wrong file definition format.")

        // file def has to be non-empty string
        if (typeof serveFileDef.file !== 'string') reportError("Error: Wrong format of serveFileDef.file.")
        if (!serveFileDef.file) reportError("Error: The specification of the 'serveFileDef.file' cannot be an empty string.")

        let err;
        if (Array.isArray(serveFileDef.paths)) {
            // paths definition can be an array of non-empty strings and regexp
            let status = {strEmpty: false, pathFormatWrong: false};
            serveFileDef.paths.forEach(path => {
                err = isPathWrong(path)
                if (err) status = {...status, ...err}
            })
            if (status.strEmpty) reportError("Error: The specification of the path cannot be an empty string.")
            if (status.pathFormatWrong) reportError("Error: Wrong path format'.")
        } else {
            // if not array it has to be non-empty string or regexp
            err = isPathWrong(serveFileDef.paths)
            if (err) {
                if (err.strEmpty) reportError("Error: The specification of the path cannot be an empty string.")
                if (err.pathFormatWrong) reportError("Error: Wrong path format'.")
            }
        }
    }

    return configWrong
}
