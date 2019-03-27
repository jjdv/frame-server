/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const configIni = require('../../config/config.ini')
const { expect, sinon, stub1 } = require('../../test/test-env')
// const { lookupConfigPaths, /* cliDir, cliPath, */ localConfigData, returnIniConfigData /* , invalidConfigPaths */ } = require('./data')
const { lookupConfigPaths, localConfigData, returnIniConfigData } = require('./data')
// console.log('localConfigData: ', localConfigData)
const serverConfigAbsPath = require.resolve('../../config/server.config.js')

// prepare stub for require()
const requireStub = stub1

describe('config > server.config.js', function () {
  before(function () {
    process.argv = process.argv.slice(0, 2)
    // flag test which replaces 'require()' in server.config.js with a test-env stub1
    process.env.test = 'server.config'
  })

  after(function () {
    delete process.env.test
    sinon.restore()
  })

  beforeEach(function () {
    requireStub.resetBehavior()
    requireStub.returns(null)
    requireStub.withArgs('path').returns(path)
    requireStub.withArgs('./config.ini').returns(configIni)
  })

  it('provides ini config if no local config is found', function () {
    requireStub.withArgs('fs').returns({
      existsSync: sinon.fake.returns(false)
    })
    delete require.cache[serverConfigAbsPath]
    const returnConfigData = require('../../config/server.config')
    expect(returnConfigData).to.deep.equal(configIni.serverConfig)
  })

  describe('finds config in specified directories', function () {
    let confIndex
    lookupConfigPaths.forEach((configPath, index) => {
      confIndex = index % 2
      it(configPath, function () {
        requireStub.withArgs('fs').returns({
          existsSync: sinon.fake(arg => arg === configPath)
        })
        requireStub.withArgs(configPath).returns(localConfigData[confIndex])

        delete require.cache[serverConfigAbsPath]
        const returnConfigData = require('../../config/server.config')
        const expectedConfigData = Object.assign({}, localConfigData[confIndex], returnIniConfigData[confIndex])
        expect(returnConfigData).to.include(expectedConfigData)
      })
    })
  })

  /* it('finds config specified in cli', function () {
  })

  it('correctly merges ini and local configs', function () {
  }) */
})
