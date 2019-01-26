'use strict';

const path = require('path')
const fs = require('fs')

const exit = exports.exit = function (errMsg) {
    console.error(errMsg)
    process.exit(9)
}

exports.getConfPath = function (rootDir, confDirs, confFileName) {
    let confPath
    
    if (process.argv.length > 2) {
        // confPath provided as cli argument

        const confDir = process.argv[2]
        confPath = path.resolve(rootDir, confDir, confFileName)
        if (!fs.existsSync(confPath)) exit( dirErrMsg(confDirs, confFileName, confPath) )

        return confPath
    } else {
        // conf file to be found in default directories

        let notFound = true
        for (let i=0; i<confDirs.length; i++) {
            confPath = path.resolve(rootDir, confDirs[i], confFileName)
            if (fs.existsSync(confPath)) {
                notFound = false
                break
            }
        }
        return notFound ? null : confPath
    }
}

exports.getLocalMiddleware = function (siteMiddleware) {
    const middleware = require(siteMiddleware)
    if (!middleware) exit('Error: siteMiddleware specified but not found in the given file.')
    if (typeof middleware !== 'function') exit('Error: Middleware definition is not a function.')

    console.log('Site middleware installed.')
    return middleware
}

//-------------------------------------------------------------------------------
// supporting functions 

function dirErrMsg(confDirs, confFileName, confPath = null) {
    const searchedDirs = confPath ? ("the dir: '" + confPath + "'") : ("any of the dirs: '" + confDirs.join("', '") + "'")
    return `Error: No server config file '${confFileName}' found in ${searchedDirs}.`
}
