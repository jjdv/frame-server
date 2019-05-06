/* eslint-env mocha */
'use strict'

// test environment
const path = require('path')
const configIni = require('../../config/config.ini')
const { expect, sinon, stub1 } = require('../../test/test-env')
const { lookupConfigPaths, cliTest, localConfigData, returnIniConfigData } = require('./data')
const serverConfigAbsPath = require.resolve('../../config/server.config.js')

// friendly name for require() stub
const requireStub = stub1

let argv
describe('config > server.config.js', function () {
  before(function () {
    // save argv
    argv = process.argv
    // flag test which replaces 'require()' in 'server.config.js' with a test-env stub1
    process.env.test = 'server.config'
  })

  after(function () {
    process.argv = argv
    delete process.env.test
    sinon.restore()
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
