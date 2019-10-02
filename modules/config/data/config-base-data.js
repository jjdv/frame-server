'use strict'
const path = require('path')

const appRootDirArr = path.resolve(__dirname, '../../../..').split(path.sep)
if (appRootDirArr[appRootDirArr.length - 1] === 'node_modules')
  appRootDirArr.pop()
const appRootDir = appRootDirArr.join(path.sep)

const configFileName = 'server.config.js'

const configDirs = ['server', 'config', 'server/config', 'config/server', '.']

module.exports = { appRootDir, configFileName, configDirs }
