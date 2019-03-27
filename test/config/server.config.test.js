/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const configIni = require('../../config/config.ini')
const { expect, sinon, stub1 } = require('../../test/test-env')
const requireStub = stub1 // use more meaningful name
// const { lookupConfigPaths, /* cliDir, cliPath, */ localConfigData, returnIniConfigData /* , invalidConfigPaths */ } = require('./data')
const { lookupConfigPaths, localConfigData, returnIniConfigData } = require('./data')
// console.log('localConfigData: ', localConfigData)
const serverConfigPath = path.resolve(__dirname, '../../config/server.config.js')
// console.log('serverConfigPath:', serverConfigPath)

describe('server.config.js', function () {
  before(function () {
    process.argv = process.argv.slice(0, 2)
    // flag test which replaces 'require()' in server.config.js with a test-env stub1
    process.env.test = 'server.config'
  })

  after(function () {
    delete process.env.test
    sinon.restore()
  })

  it('finds config in specified directories', function () {
    let confIndex
    lookupConfigPaths.forEach((configPath, index) => {
      requireStub.reset()
      requireStub.withArgs('path').returns(path)
      requireStub.withArgs('./config.ini').returns(configIni)
      confIndex = index % 2
      requireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === configPath)
      })
      requireStub.withArgs(configPath).returns(localConfigData[confIndex])
      requireStub.returns(null)

      // console.log('require.cache: ', require.cache[serverConfigPath])
      delete require.cache[serverConfigPath]
      // console.log('require.cache: ', require.cache[serverConfigPath])
      const returnConfigData = require('../../config/server.config')
      console.log('index: ', index, 'returnConfigData: ', returnConfigData)
      const expectedConfigData = Object.assign({}, localConfigData[confIndex], returnIniConfigData[confIndex])
      // console.log('confIndex: ', confIndex)
      // console.log('expectedConfigData: ', expectedConfigData)
      expect(returnConfigData).to.include(expectedConfigData)
    })
  })

  /* it('finds config specified in cli', function () {
  })

  it('correctly merges ini and local configs', function () {
  }) */
})
