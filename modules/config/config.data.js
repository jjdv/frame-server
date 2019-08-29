'use strict'

const path = require('path')

const rootDir = getServerRootDir()
const configFileName = 'server.config.js'
const configDirs = ['server', 'config', 'server/config', 'config/server', '.']

module.exports = { rootDir, configFileName, configDirs, getServerRootDir }

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

function getServerRootDir () {
  const serverDirs = path.resolve(__dirname, '../../..').split(path.sep)
  if (serverDirs[serverDirs.length - 1] === 'node_modules') serverDirs.pop()
  return serverDirs.join(path.sep)
}
