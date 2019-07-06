/* eslint-env mocha */
'use strict'

const path = require('path')

// test environment
const { expect } = require('../test-env')

// some root directory of a project where 'frame-server' is used
const serverRootDir = path.resolve(__dirname, '../../..')
// absolute path of 'config.ini.js' for cache cleanup of the node's require function
const configIniAbsPath = require.resolve('../../config/config.ini.js')

describe('config > config.ini.js', function () {
  before(function () {
    // flag test scope being executed
    process.env.testScope = 'config.ini'
  })

  after(function () {
    delete process.env.testScope
    delete process.env.test__dirname
  })

  it("provides correct 'serverConfig.serverRootDir' if package located directly in the server root directory", function () {
    // set __dirname in 'config > config.ini.js'
    process.env.test__dirname = path.resolve(
      serverRootDir,
      'frame-server',
      'config'
    )

    delete require.cache[configIniAbsPath]
    const returnedServerRootDir = require('../../config/config.ini')
      .serverConfig.serverRootDir
    expect(returnedServerRootDir).to.equal(serverRootDir)
  })

  it("provides correct 'serverConfig.serverRootDir' if package located in 'node_modules' in the server root directory", function () {
    // set __dirname in 'config > config.ini.js'
    process.env.test__dirname = path.resolve(
      serverRootDir,
      'node_modules',
      'frame-server',
      'config'
    )

    delete require.cache[configIniAbsPath]
    const returnedServerRootDir = require('../../config/config.ini')
      .serverConfig.serverRootDir
    expect(returnedServerRootDir).to.equal(serverRootDir)
  })
})
