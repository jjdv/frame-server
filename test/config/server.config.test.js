/* eslint-env mocha */
'use strict'

const path = require('path')

// test environment
const { expect, sinon } = require('../../test/test-env')
const { lookupConfigPaths, cliTest, localConfigData, returnIniConfigData } = require('./test-support/data')

// absolute path of 'config.ini.js' for cache cleanup of the node's require function
const serverConfigAbsPath = require.resolve('../../config/server.config.js')
// cached 'config.ini' required value
const configIni = require('../../config/config.ini')
// friendly name for require() stub
const requireStub = sinon.stub()

describe('config > server.config.js', function () {
  let argv

  before(function () {
    // save argv
    argv = process.argv
    // flag test scope being executed
    process.env.testScope = 'server.config'
    global.requireStub = requireStub
  })

  after(function () {
    delete process.env.testScope
    delete global.requireStub
    sinon.restore()
    process.argv = argv
  })

  beforeEach(function () {
    // process.argv cleanup to avoid interferences
    process.argv = argv.slice(0, 2)

    // requireStub initial setup
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
    const returnedConfigData = require('../../config/server.config')
    expect(returnedConfigData).to.deep.equal(configIni.serverConfig)
  })

  it("finds local config in any default directory specified in '(config>config.ini.js).configDirs' and correctly merges ini and local configs", function () {
    let confIndex
    lookupConfigPaths.forEach((configPath, index) => {
      confIndex = index % 2
      requireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === configPath)
      })
      requireStub.withArgs(configPath).returns(localConfigData[confIndex])

      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../config/server.config')
      const expectedConfigData = Object.assign({}, localConfigData[confIndex], returnIniConfigData[confIndex])
      expect(returnedConfigData).to.include(expectedConfigData)
    })
  })

  it('finds local config specified in cli and correctly merges ini and local configs', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.validTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      requireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === cliTest.absPath)
      })
      requireStub.withArgs(cliTest.absPath).returns(localConfigData[confIndex])
      process.argv = argvIni.concat(cliTestArgv)

      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../config/server.config')
      const expectedConfigData = Object.assign({}, localConfigData[confIndex], returnIniConfigData[confIndex])
      expect(returnedConfigData).to.include(expectedConfigData)
    })
  })

  it('returns null and logs error when invalid config specified in cli', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.invalidTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      requireStub.withArgs('fs').returns({
        existsSync: sinon.fake.returns(false)
      })
      requireStub.withArgs(cliTest.absPath).returns(localConfigData[confIndex])
      process.argv = argvIni.concat(cliTestArgv)
      sinon.stub(console, 'error')

      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../config/server.config')
      expect(returnedConfigData).to.be.null()
      expect(console.error.getCall(0).args[0]).to.include(`Error: Server config file '${cliTestArgv[cliTestArgv.length - 1]}' not found.`)
      console.error.restore()
    })
  })

  it('returns null and logs error when invalid format of local config data', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.validTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      requireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === cliTest.absPath)
      })
      requireStub.withArgs(cliTest.absPath).returns([null, () => {}][confIndex])
      process.argv = argvIni.concat(cliTestArgv)
      sinon.stub(console, 'error')

      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../config/server.config')
      expect(returnedConfigData).to.be.null()
      expect(console.error.getCall(0).args[0]).to.include('Error: The local server configuration data is not an object but: ')
      console.error.restore()
    })
  })
})
