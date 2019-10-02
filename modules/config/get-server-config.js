'use strict'

const path = require('path')

const {
  Status,
  basicFunctions: { isFile, argValue, findFileInDirs },
  statusFunctions: { validatedDirectory }
} = require('node-basic-helpers')

const { configFileName, configDirs } = require('./data/config-base-data')
const serverConfigIni = require('./data/server.config.ini')

// -----------------------------------------------------------------------------------------
// --- start of test purpose code ---
const replace = global.testReplace && global.testReplace['server.config.js']
// eslint-disable-next-line no-global-assign
if (replace.require) require = replace.require
// --- end of test purpose code ---
// -----------------------------------------------------------------------------------------

function getServerConfig () {
  // get and validate the path of the local configuration file
  const localConfPath = getConfPath(serverConfigIni.rootDir)
  if (!localConfPath) return serverConfigIni
  if (localConfPath === 'error') return null

  const locaServerConfig = require(localConfPath)

  // check if format of localSerrverConfig is acceptable
  if (
    !locaServerConfig ||
    typeof locaServerConfig !== 'object' ||
    locaServerConfig.constructor !== Object
  ) {
    console.error(
      'Error: The local server configuration data is not an object but: ',
      locaServerConfig
    )
    return null
  }

  // get the final server config
  const serverConfig = { ...serverConfigIni, ...locaServerConfig }
  const status = new Status()

  // rootDir check and registration if valid
  if (validatedDirectory(serverConfig.rootDir, 'rootDir', null, status)) {
    process.env.APP_ROOT_DIR = serverConfig.rootDir
  } else return null

  // siteRootDir validity check & change into absolute path
  // registration if valid
  const siteRootDir = validatedDirectory(
    serverConfig.siteRootDir,
    'siteRootDir',
    serverConfig.rootDir,
    status
  )
  if (siteRootDir) process.env.SITE_ROOT_DIR = siteRootDir

  // port check
  if (!Number.isInteger(serverConfig.port) || serverConfig.port < 1) {
    status.reportErr(
      'Provided port must be an integer above 0 but it is: ',
      serverConfig.port
    )
  }

  return status.error ? null : serverConfig
}

module.exports = getServerConfig

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

// getConfPath makes sure to provide valid path or null
function getConfPath (rootDir) {
  const confPath = argValue('--conf', '-c')
  if (confPath) {
    // confPath provided as cli argument
    const absConfPath = path.resolve(rootDir, confPath)
    if (isFile(absConfPath)) return absConfPath

    // incorrect confPath provided as cli argument
    console.error(
      `Error: Server config file '${confPath}' not found. Resolved as "${absConfPath}".`
    )
    return 'error'
  } else {
    // conf file to be found in default directories
    return findFileInDirs(rootDir, configDirs, configFileName)
  }
}
