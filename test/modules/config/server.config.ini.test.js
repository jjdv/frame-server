/* eslint-env mocha */
'use strict'

const path = require('path')
// test environment
const { expect } = require('../../test-env')

// some root directory of a project where 'frame-server' directory is located
const rootDir = path.resolve(__dirname, '../../../..')
// absolute path of 'config.ini.js' for cache cleanup of the node's require function
const configIniAbsPath = require.resolve(
  '../../../modules/config/server.config.ini'
)
const helpersBasicAbsPath = require.resolve('../../../modules/helpers/basic')

describe('config > config.ini.js', function() {
  before(function() {
    // flag test scope being executed
    process.env.testScope = 'server.config.ini'
  })

  after(function() {
    delete process.env.testScope
    delete process.env.testDirname
  })

  it("provides correct 'rootDir' if package is located directly in the server root directory", function() {
    // set __dirname to test value
    process.env.testDirname = path.resolve(
      rootDir,
      'frame-server/modules/config'
    )

    delete require.cache[configIniAbsPath]
    delete require.cache[helpersBasicAbsPath]
    const returnedServerRootDir = require('../../../modules/config/server.config.ini')
      .rootDir
    expect(returnedServerRootDir).to.equal(rootDir)
  })

  it("provides correct 'rootDir' if package is located in 'node_modules' in the server root directory", function() {
    // set __dirname to test value
    process.env.testDirname = path.resolve(
      rootDir,
      'node_modules/frame-server/modules/config'
    )

    delete require.cache[configIniAbsPath]
    delete require.cache[helpersBasicAbsPath]
    const returnedServerRootDir = require('../../../modules/config/server.config.ini')
      .rootDir
    expect(returnedServerRootDir).to.equal(rootDir)
  })
})
