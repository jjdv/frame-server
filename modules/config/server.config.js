'use strict'

const path = require('path')

const { isFile, argValue, findFileInDirs } = require('../helpers/basic')
const { validatedDirectory } = require('../helpers/validators')
const { rootDir, configFileName, configDirs } = require('./config.data')
const serverConfigIni = require('./server.config.ini')

function getServerConfig () {
  // get and validate the path of the local configuration file
  const localConfPath = getConfPath()
  if (!localConfPath) return serverConfigIni
  if (localConfPath === 'error') return null

  const locaServerlConfig = require(localConfPath)

  // check if format of localSerrverConfig is acceptable
  if (
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

  // rootDir check and registration if valid
  if (validatedDirectory('rootDir', serverConfig.rootDir, null)) {
    process.env.ROOT_DIR = serverConfig.rootDir
  } else return null

  // siteRootDir validity check & change into absolute path
  // registration if valid
  process.env.SITE_ROOT_DIR = validatedDirectory(
    'siteRootDir',
    serverConfig.siteRootDir,
    rootDir
  )
  if (!process.env.SITE_ROOT_DIR) return null

  // port check
  if (!Number.isInteger(serverConfig.port)) {
    console.error(
      'Error: Provided port is not an integer but: ',
      serverConfig.port
    )
    return null
  }

  return serverConfig
}

module.exports = {
  getServerConfig,
  getConfPath // for test purposes
}

//
// -------------------------------------------------------------------------------
// supporting functions
// -------------------------------------------------------------------------------

// getConfPath makes sure to provide valid path or null
function getConfPath () {
  let confPath = argValue('--conf', '-c')
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
