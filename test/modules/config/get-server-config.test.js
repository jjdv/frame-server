/* eslint-env mocha */

const path = require('path')

// test environment
const { expect, sinon } = require('../../test-env')
const FakeFs = require('../../../modules/helpers/fake-fs')
const {
  lookupConfigPaths,
  cliTest,
  correctLocalConfigData,
  incorrectLocalConfigData
} = require('./test-support/test-data')

// absolute paths for cache cleanup of the node's require function
const helpersBasicAbsPath = require.resolve('../../../modules/helpers/basic')
const helpersNodeAbsPath = require.resolve('../../../modules/helpers/node')
const errorReportersAbsPath = require.resolve(
  '../../../modules/helpers/error-reporters'
)
const getServerConfigAbsPath = require.resolve(
  '../../../modules/config/get-server-config'
)
// cached 'config.ini' required value
const configIni = require('../../../modules/config/data/server.config.ini')
const helpersBasicRequireStub = sinon.stub()
const getServerConfigRequireStub = sinon.stub()
let argvOriginal, consoleErrStub

function setTestEnv () {
  sinon.reset()
  helpersBasicRequireStub.callsFake(require)
  getServerConfigRequireStub.returns(null)
  delete require.cache[helpersBasicAbsPath]
  delete require.cache[helpersNodeAbsPath]
  delete require.cache[errorReportersAbsPath]
  delete require.cache[getServerConfigAbsPath]
}

describe('config > server.config.js', function () {
  before(function () {
    argvOriginal = process.argv
    consoleErrStub = sinon.stub(console, 'error')
    global.testReplace = {
      'basic.js': {
        require: helpersBasicRequireStub
      },
      'server.config.js': {
        require: getServerConfigRequireStub
      }
    }
  })

  after(function () {
    delete global.testReplace
    process.argv = argvOriginal
    sinon.restore()
  })

  beforeEach(function () {
    process.argv = argvOriginal.slice(0, 2)
    setTestEnv()
  })

  it('provides ini config if no local config is found', function () {
    helpersBasicRequireStub.withArgs('fs').returns({
      existsSync: () => false
    })
    const getServerConfig = require('../../../modules/config/get-server-config')
    const returnedConfigData = getServerConfig()
    expect(returnedConfigData).to.deep.equal(configIni)
  })

  it('finds local config in any default directory', function () {
    const localConfig = correctLocalConfigData[0]
    const expectedConfigData = { ...configIni, ...localConfig }
    const siteRootDirAbsPath = path.resolve(
      expectedConfigData.rootDir,
      expectedConfigData.siteRootDir
    )
    const fakeFs = new FakeFs()
    fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
    helpersBasicRequireStub.withArgs('fs').returns(fakeFs)

    lookupConfigPaths.forEach(configPath => {
      fakeFs.resetFakeFilePaths()
      fakeFs.addFakeFilePaths(configPath)
      getServerConfigRequireStub.resetBehavior()
      getServerConfigRequireStub.returns(null)
      getServerConfigRequireStub.withArgs(configPath).returns(localConfig)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('finds local config specified in cli', function () {
    const localConfig = correctLocalConfigData[0]
    const expectedConfigData = { ...configIni, ...localConfig }
    const siteRootDirAbsPath = path.resolve(
      expectedConfigData.rootDir,
      expectedConfigData.siteRootDir
    )
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
    helpersBasicRequireStub.withArgs('fs').returns(fakeFs)
    getServerConfigRequireStub.withArgs(cliTest.absPath).returns(localConfig)

    cliTest.correctConfArgv.forEach(confArgv => {
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('correctly merges ini and local configs', function () {
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    helpersBasicRequireStub.withArgs('fs').returns(fakeFs)

    let confIndex
    cliTest.correctConfArgv.forEach((confArgv, index) => {
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)
      confIndex = index % 2
      const localConfig = correctLocalConfigData[confIndex]
      const expectedConfigData = { ...configIni, ...localConfig }

      const siteRootDirAbsPath = path.resolve(
        expectedConfigData.rootDir,
        expectedConfigData.siteRootDir
      )
      fakeFs.addFakeDirPaths([expectedConfigData.rootDir, siteRootDirAbsPath])
      getServerConfigRequireStub.resetBehavior()
      getServerConfigRequireStub.returns(null)
      getServerConfigRequireStub.withArgs(cliTest.absPath).returns(localConfig)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.deep.equal(expectedConfigData)
    })
  })

  it('returns null and logs error when non-existing config specified in cli', function () {
    cliTest.incorrectConfArgv.forEach(confArgv => {
      consoleErrStub.resetHistory()
      process.argv = argvOriginal.slice(0, 2).concat(confArgv)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        `Error: Server config file '${cliTest.cliConfigFile +
          cliTest.postfix}' not found. Resolved as "${cliTest.absPath +
          cliTest.postfix}".`
      )
    })
  })

  it('returns null and logs error when the format of local config object is invalid', function () {
    const confArgv = ['aaa', '--conf', 'testdir/server.config.js']
    process.argv = process.argv.concat(confArgv)
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    helpersBasicRequireStub.withArgs('fs').returns(fakeFs)
    const wrongLocalConfigs = [null, () => {}, []]

    wrongLocalConfigs.forEach(wrongLocalConfig => {
      consoleErrStub.resetHistory()
      getServerConfigRequireStub.resetBehavior()
      getServerConfigRequireStub.returns(null)
      getServerConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(wrongLocalConfig)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        'Error: The local server configuration data is not an object but: ',
        wrongLocalConfig
      )
    })
  })

  it('returns null and logs error when rootDir, siteRootDir or port is invalid', function () {
    const confArgv = cliTest.correctConfArgv[0]
    process.argv = process.argv.concat(confArgv)
    const rootDir = configIni.rootDir
    const siteRootDir = path.resolve(configIni.rootDir, configIni.siteRootDir)
    const fakeFs = new FakeFs()
    fakeFs.addFakeFilePaths(cliTest.absPath)
    fakeFs.addFakeDirPaths([rootDir, siteRootDir])
    helpersBasicRequireStub.withArgs('fs').returns(fakeFs)

    incorrectLocalConfigData.forEach(incorrectLCofData => {
      consoleErrStub.resetHistory()
      getServerConfigRequireStub.resetBehavior()
      getServerConfigRequireStub.returns(null)
      getServerConfigRequireStub
        .withArgs(cliTest.absPath)
        .returns(incorrectLCofData.conf)

      const getServerConfig = require('../../../modules/config/get-server-config')
      const returnedConfigData = getServerConfig()
      expect(returnedConfigData).to.be.null()
      consoleErrStub.should.have.been.calledOnceWithExactly(
        ...incorrectLCofData.errArgs
      )
    })
  })
})
