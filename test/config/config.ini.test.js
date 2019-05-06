/* eslint-env mocha */
'use strict'

const path = require('path')

// test environment
const { expect, vars } = require('../test-env')
const { __dirnameIndex } = require('./data')

const serverRootDir = path.resolve(__dirname, '../../..')
const configIniAbsPath = require.resolve('../../config/config.ini.js')

describe('config > config.ini.js', function () {
  before(function () {
    // flag test which replaces '__dirname' in 'config.ini.js' with a test-env stub1
    process.env.test = 'config.ini'
  })

  after(function () {
    delete process.env.test
  })

  it("provides correct 'serverConfig.serverRootDir' if package located directly in the server root directory", () => {
    // set __dirname in 'config > config.ini.js'
    vars[__dirnameIndex] = path.resolve(serverRootDir, 'frame-server', 'config')

    delete require.cache[configIniAbsPath]
    const returnedServerRootDir = require('../../config/config.ini').serverConfig.serverRootDir
    expect(returnedServerRootDir).to.equal(serverRootDir)
  })

  it("provides correct 'serverConfig.serverRootDir' if package located in 'node_modules' in the server root directory", () => {
    // set __dirname in 'config > config.ini.js'
    vars[__dirnameIndex] = path.resolve(serverRootDir, 'node_modules', 'frame-server', 'config')

    delete require.cache[configIniAbsPath]
    const returnedServerRootDir = require('../../config/config.ini').serverConfig.serverRootDir
    expect(returnedServerRootDir).to.equal(serverRootDir)
  })
})
