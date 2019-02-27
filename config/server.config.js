'use strict';

const path = require('path')
const fs = require('fs')

let { fileName, dirs, serverConfig } = require('./config.ini')
const serverRootDir = serverConfig.serverRootDir

// getConfPath makes sure to provide valid path or null
const localConfPath = getConfPath(dirs, fileName)

// merge default ini config with local server config
if (localConfPath) serverConfig = { ...serverConfig, ...require(localConfPath) }

module.exports = serverConfig


//-------------------------------------------------------------------------------
// supporting functions 
//-------------------------------------------------------------------------------

function getConfPath(confDirs, confFileName) {
    let confPath = confPathFromArgs()
    
    if (confPath) {
        // confPath provided as cli argument

        confPath = path.resolve(serverRootDir, confPath)
        if (fs.existsSync(confPath)) return confPath
        exit( dirErrMsg(confDirs, confFileName, confPath) )
    } else {
        // conf file to be found in default directories

        let notFound = true
        for (let i=0; i<confDirs.length; i++) {
            confPath = path.resolve(serverRootDir, confDirs[i], confFileName)
            if (fs.existsSync(confPath)) { notFound = false; break }
        }
        return notFound ? null : confPath
    }
}

function confPathFromArgs() {
    if (process.argv.length < 4) return false

    // confPath provided as cli argument
    let argIndex = process.argv.indexOf('--conf', 2)
    if (argIndex == -1) argIndex = process.argv.indexOf('-c', 2)
    return process.argv.length > ++argIndex && process.argv[argIndex]
}

function dirErrMsg(confDirs, confFileName, confPath = null) {
    const searchedDirs = confPath ? ("the dir: '" + confPath + "'") : ("any of the dirs: '" + confDirs.join("', '") + "'")
    return `Error: No server config file '${confFileName}' found in ${searchedDirs}.`
}
