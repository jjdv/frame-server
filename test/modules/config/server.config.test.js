/* eslint-env mocha */

const path = require('path')

// test environment
const { expect, sinon } = require('../../test-env')
const {
  fakeFs,
  resetFakePaths,
  addFakeDirPaths,
  addFakeFilePaths
} = require('../../../modules/helpers/fake-fs')
const {
  lookupConfigPaths,
  cliTest,
  localConfigData,
  finalConfigData
} = require('./test-support/data')

// absolute paths for cache cleanup of the node's require function
const helpersBasicAbsPath = require.resolve('../../../modules/helpers/basic')
const validatorsAbsPath = require.resolve('../../../modules/helpers/validators')
const serverConfigAbsPath = require.resolve(
  '../../../modules/config/server.config'
)
// cached 'config.ini' required value
const configIni = require('../../../modules/config/server.config.ini')

const basicRequireStub = sinon.stub()
const serverConfigRequireStub = sinon.stub()

function setStubIniConfig () {
  basicRequireStub.resetBehavior()
  basicRequireStub.callsFake(pathVal => require(pathVal))
  serverConfigRequireStub.resetBehavior()
  serverConfigRequireStub.returns(null)
}

describe('config > server.config.js', function () {
  let argv

  before(function () {
    // save argv
    argv = process.argv
    // flag test scope being executed
    global.testReplace = {
      'basic.js': {
        require: basicRequireStub
      },
      'server.config.js': {
        require: serverConfigRequireStub
      }
    }
  })

  after(function () {
    delete global.testReplace
    process.argv = argv
  })

  beforeEach(function () {
    // process.argv cleanup to avoid interferences
    process.argv = argv.slice(0, 2)
    setStubIniConfig()
  })

  it('provides ini config if no local config is found', function () {
    basicRequireStub.withArgs('fs').returns({
      existsSync: () => false
    })
    const returnedConfigData = require('../../../modules/config/server.config')
    expect(returnedConfigData).to.deep.equal(configIni)
  })

  it("finds local config in any default directory specified in '(config>config.ini.js).configDirs' and correctly merges ini and local configs", function () {
    let confIndex
    lookupConfigPaths.forEach((configPath, index) => {
      confIndex = index % 2
      const localConfig = localConfigData[confIndex]
      const expectedConfigData = { ...configIni, ...localConfig }

      setStubIniConfig()
      resetFakePaths()
      const siteRootDirAbsPath = path.resolve(
        expectedConfigData.rootDir,
        expectedConfigData.siteRootDir
      )
      addFakeFilePaths(configPath)
      addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
      basicRequireStub.withArgs('fs').returns(fakeFs)
      serverConfigRequireStub.withArgs(configPath).returns(localConfig)

      delete require.cache[helpersBasicAbsPath]
      delete require.cache[validatorsAbsPath]
      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('finds local config specified in cli and correctly merges ini and local configs', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.validTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      basicRequireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === cliTest.absPath)
      })
      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(localConfigData[confIndex])
      process.argv = argvIni.concat(cliTestArgv)

      delete require.cache[helpersBasicAbsPath]
      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.include(finalConfigData[confIndex])
    })
  })

  it('returns null and logs error when invalid config specified in cli', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.invalidTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      basicRequireStub.withArgs('fs').returns({
        existsSync: sinon.fake.returns(false)
      })
      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(localConfigData[confIndex])
      process.argv = argvIni.concat(cliTestArgv)
      sinon.stub(console, 'error')

      delete require.cache[helpersBasicAbsPath]
      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      expect(console.error.getCall(0).args[0]).to.include(
        `Server config file '${cliTestArgv[cliTestArgv.length - 1]}' not found.`
      )
      console.error.restore()
    })
  })

  it('returns null and logs error when invalid format of local config data', function () {
    const argvIni = process.argv
    let confIndex
    cliTest.validTestArgvIndexes.forEach((testArgvIndex, index) => {
      confIndex = index % 2
      const cliTestArgv = cliTest.argv[testArgvIndex]
      basicRequireStub.withArgs('fs').returns({
        existsSync: sinon.fake(arg => arg === cliTest.absPath)
      })
      serverConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns([null, () => {}][confIndex])
      process.argv = argvIni.concat(cliTestArgv)
      sinon.stub(console, 'error')

      delete require.cache[helpersBasicAbsPath]
      delete require.cache[serverConfigAbsPath]
      const returnedConfigData = require('../../../modules/config/server.config')
      expect(returnedConfigData).to.be.null()
      expect(console.error.getCall(0).args[0]).to.include(
        'Error: The local server configuration data is not an object but: '
      )
      console.error.restore()
    })
  })
})
