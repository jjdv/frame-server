'use strict'

const path = require('path')

const { isFile, argValue, findFileInDirs } = require('../helpers/basic')
const { configFileName, configDirs } = require('./config.data')
const { validatedDirectory } = require('../helpers/error-reporters')
const Status = require('../classes/status')
const serverConfigIni = require('./server.config.ini')

// --- start of test purpose code ---
if (global.testReplace && global.testReplace['server.config.js']) {
  const replace = global.testReplace['server.config.js']
  /* eslint-disable no-global-assign */
  if (replace.__dirname) __dirname = replace.__dirname
  if (replace.require) require = replace.require
  /* eslint-enable no-global-assign */
}
// --- end of test purpose code ---

function getServerConfig () {
  // get and validate the path of the local configuration file
  const localConfPath = getConfPath(serverConfigIni.rootDir)
  if (localConfPath === 'error') return null
  if (!localConfPath) return serverConfigIni

  const locaServerlConfig = require(localConfPath)

  // check if format of localSerrverConfig is acceptable
  if (
    !locaServerlConfig ||
    typeof locaServerlConfig !== 'object' ||
    locaServerlConfig.constructor !== Object
  ) {
    console.error(
      'Error: The local server configuration data is not an object but: ',
      locaServerlConfig
    )
    return null
  }

  // get the final server config
  const serverConfig = { ...serverConfigIni, ...locaServerlConfig }
  const status = new Status()

  // rootDir check and registration if valid
  if (validatedDirectory('rootDir', serverConfig.rootDir, null, status)) {
    process.env.APP_ROOT_DIR = serverConfig.rootDir
  } else return null

  // siteRootDir validity check & change into absolute path
  // registration if valid
  const siteRootDir = validatedDirectory(
    'siteRootDir',
    serverConfig.siteRootDir,
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

const serverConfig = getServerConfig()

module.exports = serverConfig

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
