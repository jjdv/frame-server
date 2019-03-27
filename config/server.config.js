'use strict'

// eslint-disable-next-line no-global-assign
if (process.env.test === 'server.config') require = require('../test/test-env').stub1

const path = require('path')
const fs = require('fs')

let { configFileName, configDirs, serverConfig } = require('./config.ini')
const serverRootDir = serverConfig.serverRootDir

// getConfPath makes sure to provide valid path or null
const localConfPath = getConfPath(configDirs, configFileName)
console.log('in server.config, localConfPath: ', localConfPath)

// merge default ini config with local server config
if (localConfPath) {
  if (localConfPath !== 'error') {
    const localConfig = require(localConfPath)
    if (typeof localConfig === 'object' && localConfig.constructor === Object) {
      serverConfig = { ...serverConfig, ...localConfig }
    } else {
      console.error('Error: The local server configuration data is not an object but: ', localConfig)
      serverConfig = null
    }
  } else serverConfig = null
}

module.exports = serverConfig

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

function getConfPath (confDirs, confFileName) {
  let confPath = confPathFromArgs()

  if (confPath) {
    // confPath provided as cli argument

    confPath = path.resolve(serverRootDir, confPath)
    if (fs.existsSync(confPath)) return confPath
    console.error(dirErrMsg(confDirs, confFileName, confPath))
    return 'error'
  } else {
    // conf file to be found in default directories

    for (let confDir of confDirs) {
      confPath = path.resolve(serverRootDir, confDir, confFileName)
      if (fs.existsSync(confPath)) return confPath
    }
    return null
  }
}

function confPathFromArgs () {
  if (process.argv.length < 4) return false

  // confPath provided as cli argument
  let argIndex = process.argv.indexOf('--conf', 2)
  if (argIndex === -1) argIndex = process.argv.indexOf('-c', 2)
  return process.argv.length > ++argIndex && process.argv[argIndex]
}

function dirErrMsg (confDirs, confFileName, confPath = null) {
  const searchedDirs = confPath ? ("the dir: '" + confPath + "'") : ("any of the dirs: '" + confDirs.join("', '") + "'")
  return `Error: No server config file '${confFileName}' found in ${searchedDirs}.`
}
