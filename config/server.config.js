'use strict'

// eslint-disable-next-line no-global-assign
if (process.env.test === 'server.config') require = require('../test/test-env').stub1

const path = require('path')
const fs = require('fs')

let { configFileName, configDirs, serverConfig } = require('./config.ini')
const serverRootDir = serverConfig.serverRootDir

// getConfPath makes sure to provide valid path or null
const localConfPath = getConfPath(configDirs, configFileName)

// merge default ini config with local server config
if (localConfPath) {
  if (localConfPath !== 'error') {
    const localConfig = require(localConfPath)
    if (typeof localConfig === 'object' && localConfig instanceof Object) {
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

    const absConfPath = path.resolve(serverRootDir, confPath)
    if (fs.existsSync(absConfPath)) return absConfPath
    console.error(`Error: Server config file '${confPath}' not found. Resolved as "${absConfPath}".`)
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
  // console.log('process.argv: ', process.argv)
  if (process.argv.length < 4) return false

  // confPath provided as cli argument
  let argIndex = process.argv.indexOf('--conf', 2)
  if (argIndex === -1) argIndex = process.argv.indexOf('-c', 2)
  // console.log('argIndex results: ', argIndex, process.argv.length, process.argv[argIndex + 1])
  return ++argIndex && process.argv.length > argIndex && process.argv[argIndex]
}
